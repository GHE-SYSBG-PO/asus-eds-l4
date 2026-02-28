import { loadFragment } from '../fragment/fragment.js';
import {
  getBlockConfigs, getFieldValue,
} from '../../scripts/utils.js';

/**
 * Gets the real base path of the current page, compatible with AEM author environment.
 *
 * - Normal (publish) environment: uses window.location.pathname directly
 * - AEM author environment: pathname is just "/ui", the real page path
 *   is embedded inside the URL hash instead
 *
 * @returns {string} The base path with .html stripped and a trailing slash appended
 */
function getPageBasePath() {
  let { pathname } = window.location;
  const { hash } = window.location;
  if (hash) {
    const match = hash.match(/(\/content\/[^?#]*)/);
    if (match) {
      const [, realPathname] = match;
      pathname = realPathname;
    }
  }
  return `${pathname.replace(/\.html$/, '')}/`;
}

const DEFAULT_CONFIG = {
  titleRichtext: '',
  subtitleRichtext: '',
  infoRichtext: '',
  mediaBlockContent: '',
  titleFontColor: '',
  subtitleFontColor: '',
  infoFontColor: '',
};

const SUBITEM_FIELD_ORDER = [
  'titleRichtext',
  'subItemTitleRichtext',
  'subItemSubtitleRichtext',
  'subItemInfoRichtext',
  'subItemMediaBlockContent',
  'titleFontColor',
  'subItemTitleFontColor',
  'subItemSubtitleFontColor',
  'subItemInfoFontColor',
];

const normalizeColor = (color) => {
  if (!color || typeof color !== 'string') return '';
  const value = color.trim();
  if (!value) return '';
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) return value;
  return /^[0-9a-fA-F]{3,8}$/.test(value) ? `#${value}` : value;
};

const mediaStateByCell = new WeakMap();

const ensureAccordionGroupWrapper = (block) => {
  const container = block.closest('.feature-accordion-item-container');
  if (!container) return null;

  let group = container.querySelector(':scope > .feature-accordion-list-group');
  if (!group) {
    const wrappers = [...container.querySelectorAll(':scope > .feature-accordion-item-wrapper')];
    if (!wrappers.length) return null;
    group = document.createElement('div');
    group.classList.add('feature-accordion-list-group');
    container.insertBefore(group, wrappers[0]);
    group.append(...wrappers);
  }

  let mediaGroup = container.querySelector(':scope > .feature-accordion-media-group');
  if (!mediaGroup) {
    mediaGroup = document.createElement('div');
    mediaGroup.classList.add('feature-accordion-media-group');
    container.append(mediaGroup);
  }

  return { container, group, mediaGroup };
};

// Variant-2 compact markup: top-level model occupies first 7 rows.
const detectSubItemRows = (block) => [...block.children].filter((row, index) => index >= 7 && row.children.length >= 5);

const toFieldValue = (cell) => {
  if (!cell) return { html: '', text: '' };
  return {
    html: cell.innerHTML?.trim() || '',
    text: cell.textContent?.trim() || '',
  };
};

const parseSubItemFromCompactRow = (row) => {
  const cells = [...row.children];
  if (cells.length < 5) return null;
  const config = {};
  SUBITEM_FIELD_ORDER.forEach((field, index) => {
    const value = toFieldValue(cells[index]);
    if (value.html || value.text) {
      config[field] = value;
    }
  });
  return config;
};

const resolveFragmentPath = (fragmentUrl) => {
  let path = fragmentUrl;
  if (!fragmentUrl || fragmentUrl.startsWith('http')) return path;

  if (!fragmentUrl.startsWith('/')) {
    const base = getPageBasePath();
    path = new URL(fragmentUrl, window.location.origin + base).pathname;
  } else {
    const authorPrefix = '/content/asus-l4';
    if (window.location.pathname.startsWith(authorPrefix)) {
      path = authorPrefix + fragmentUrl;
    }
  }
  return path;
};

const makeInteractiveTrigger = (el, onToggle, initialOpen = false) => {
  if (!el) return;
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-expanded', initialOpen ? 'true' : 'false');

  const handler = () => {
    const expanded = el.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    el.setAttribute('aria-expanded', next ? 'true' : 'false');
    onToggle(next);
  };

  el.addEventListener('click', handler);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  });
};

const setRowsOpenState = (rows, open) => {
  rows.forEach((row) => {
    row.hidden = !open;
  });
};

const collapseEntry = (entry, triggerSelector, panelRowSelector) => {
  if (!entry) return;
  const trigger = entry.querySelector(triggerSelector);
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
  }
  const panelRows = entry.querySelectorAll(panelRowSelector);
  panelRows.forEach((row) => {
    row.hidden = true;
  });
};

const reserveMediaSpace = (cell) => {
  if (!cell || cell.style.minHeight) return;
  const width = cell.clientWidth || cell.parentElement?.clientWidth || 0;
  const estimatedHeight = width > 0 ? Math.round(width * 0.5625) : 180;
  cell.style.minHeight = `${Math.max(estimatedHeight, 160)}px`;
};

const renderMediaHtml = (target, html) => {
  if (!target || !html) return;
  target.innerHTML = html;
};

const createLazyMediaLoader = (cell, path, fallbackHtml, getRenderTarget = () => cell) => async () => {
  if (!cell || (!path && !fallbackHtml)) return;

  const state = mediaStateByCell.get(cell) || {};
  mediaStateByCell.set(cell, state);

  const target = getRenderTarget() || cell;
  if (!target) return;

  if (state.html) {
    renderMediaHtml(target, state.html);
    return;
  }

  if (state.loadingPromise) {
    await state.loadingPromise;
    if (state.html) renderMediaHtml(target, state.html);
    return;
  }

  reserveMediaSpace(target);
  target.classList.add('is-media-loading');
  target.setAttribute('aria-busy', 'true');

  try {
    state.loadingPromise = (async () => {
      if (path) {
        const resolvedPath = resolveFragmentPath(path);
        const fragment = await loadFragment(resolvedPath);
        if (fragment?.childNodes?.length) {
          const tmp = document.createElement('div');
          tmp.append(...fragment.childNodes);
          state.html = tmp.innerHTML;
          return;
        }
      }

      if (fallbackHtml) {
        state.html = fallbackHtml;
      }
    })();

    await state.loadingPromise;
    if (state.html) {
      renderMediaHtml(target, state.html);
    }
  } finally {
    state.loadingPromise = null;
    target.classList.remove('is-media-loading');
    target.removeAttribute('aria-busy');
    requestAnimationFrame(() => {
      target.style.minHeight = '';
    });
  }
};

const expandFirstNested = (container) => {
  const firstTrigger = container.querySelector('.feature-accordion-subitem__trigger');
  if (!firstTrigger) return;
  if (firstTrigger.getAttribute('aria-expanded') === 'false') {
    firstTrigger.click();
  }
};

export default async function decorate(block) {
  try {
    const scaffold = ensureAccordionGroupWrapper(block);

    const rows = [...block.children];
    if (!rows.length) return;

    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'feature-accordion-item');
    const v = getFieldValue(config);

    const titleRow = rows[0];
    const titleCell = titleRow?.children?.[0];
    const subtitleCell = rows[1]?.children?.[0];
    const infoCell = rows[2]?.children?.[0];
    const mediaCell = rows[3]?.children?.[0];

    block.classList.add('feature-accordion-item__entry');
    titleCell?.classList.add('feature-accordion-item__trigger');
    mediaCell?.classList.add('feature-accordion-item__media');

    if (v('titleFontColor') && titleCell) titleCell.style.color = normalizeColor(v('titleFontColor'));
    if (v('subtitleFontColor') && subtitleCell) subtitleCell.style.color = normalizeColor(v('subtitleFontColor'));
    if (v('infoFontColor') && infoCell) infoCell.style.color = normalizeColor(v('infoFontColor'));

    const subItemRows = detectSubItemRows(block);
    const isNestedVariant = subItemRows.length > 0;
    const getMediaTarget = (fallbackCell) => scaffold?.mediaGroup || fallbackCell;

    const ensureTopMediaLoaded = createLazyMediaLoader(
      mediaCell,
      v('mediaBlockContent'),
      v('mediaBlockContent', 'html'),
      () => getMediaTarget(mediaCell),
    );

    const topPanelRows = rows.slice(1);
    topPanelRows.forEach((row) => row.classList.add('feature-accordion-item__panel-row'));

    await Promise.all(subItemRows.map(async (subRow) => {
      const subConfig = parseSubItemFromCompactRow(subRow);
      if (!subConfig) return;
      const sv = getFieldValue(subConfig);
      const cells = [...subRow.children];

      const nestedHeaderCell = cells[1] || cells[0];
      const nestedPanelCells = cells.filter((cell, idx) => idx !== 1);
      const nestedSubtitleCell = cells[2];
      const nestedInfoCell = cells[3];
      const nestedMediaCell = cells[4];

      subRow.classList.add('feature-accordion-subitem__entry');
      nestedHeaderCell?.classList.add('feature-accordion-subitem__trigger', 'feature-accordion-subitem__title');
      nestedPanelCells.forEach((cell) => cell.classList.add('feature-accordion-subitem__panel-row'));
      nestedSubtitleCell?.classList.add('feature-accordion-subitem__subtitle');
      nestedInfoCell?.classList.add('feature-accordion-subitem__info');
      nestedMediaCell?.classList.add('feature-accordion-subitem__media');

      if (sv('subItemTitleFontColor') && nestedHeaderCell) nestedHeaderCell.style.color = normalizeColor(sv('subItemTitleFontColor'));
      if (sv('subItemSubtitleFontColor') && nestedSubtitleCell) nestedSubtitleCell.style.color = normalizeColor(sv('subItemSubtitleFontColor'));
      if (sv('subItemInfoFontColor') && nestedInfoCell) nestedInfoCell.style.color = normalizeColor(sv('subItemInfoFontColor'));

      const ensureNestedMediaLoaded = createLazyMediaLoader(
        nestedMediaCell,
        sv('subItemMediaBlockContent'),
        sv('subItemMediaBlockContent', 'html'),
        () => getMediaTarget(nestedMediaCell),
      );

      setRowsOpenState(nestedPanelCells, false);
      makeInteractiveTrigger(nestedHeaderCell, (isOpen) => {
        setRowsOpenState(nestedPanelCells, isOpen);
        if (isOpen) {
          ensureNestedMediaLoaded().catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to load nested accordion media:', error);
          });
          const siblingNestedEntries = [...subRow.parentElement.children]
            .filter((row) => row !== subRow && row.classList.contains('feature-accordion-subitem__entry'));
          siblingNestedEntries.forEach((entry) => {
            collapseEntry(entry, '.feature-accordion-subitem__trigger', '.feature-accordion-subitem__panel-row');
          });
        }
      }, false);
    }));

    const accordionRoot = block.closest('.feature-accordion')
      || block.closest('.section')
      || block.parentElement;

    const itemsInScope = accordionRoot
      ? [...accordionRoot.querySelectorAll('.feature-accordion-item[data-block-name="feature-accordion-item"], .feature-accordion-item')]
      : [...document.querySelectorAll('.feature-accordion-item[data-block-name="feature-accordion-item"], .feature-accordion-item')];

    const firstItemBlock = itemsInScope.find((item) => item.dataset.blockName === 'feature-accordion-item')
      || itemsInScope[0];
    const isFirstAccordionItem = firstItemBlock === block;

    setRowsOpenState(topPanelRows, isFirstAccordionItem);
    makeInteractiveTrigger(titleCell, (isOpen) => {
      setRowsOpenState(topPanelRows, isOpen);
      if (isOpen) {
        ensureTopMediaLoaded().catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load top accordion media:', error);
        });
        itemsInScope
          .filter((item) => item !== block)
          .forEach((item) => {
            collapseEntry(item, '.feature-accordion-item__trigger', ':scope > .feature-accordion-item__panel-row');
          });
      }
      if (isOpen && isNestedVariant) {
        expandFirstNested(block);
      }
    }, isFirstAccordionItem);

    if (isFirstAccordionItem && isNestedVariant) {
      expandFirstNested(block);
    }
    if (isFirstAccordionItem) {
      ensureTopMediaLoaded().catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load initial top accordion media:', error);
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating feature-accordion-item block:', error);
    block.innerHTML = '<div class="error-message">Failed to load feature-accordion-item block</div>';
  }
}
