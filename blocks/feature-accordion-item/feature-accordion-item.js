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
 * @returns {string} The base path with .html stripped and a trailing slash appended,
 *  e.g. "/content/asus-l4/.../light/"
 */
function getPageBasePath() {
  let { pathname } = window.location;
  // In AEM author (Universal Editor), the real page path is hidden in the hash.
  // Hash format: #/@<tenant>/aem/universal-editor/canvas/<host>/content/.../<page>.html
  const { hash } = window.location;
  if (hash) {
    // Extract the /content/... portion from the hash
    const match = hash.match(/(\/content\/[^?#]*)/);
    if (match) {
      // eslint-disable-next-line prefer-destructuring
      pathname = match[1];
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

const hasMeaningfulContent = (html) => {
  if (!html || typeof html !== 'string') return false;
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
  return text.length > 0 || /<(img|picture|video|svg|iframe|a)\b/i.test(html);
};

const createConfigRow = (html, className = '', color = '') => {
  const row = document.createElement('div');
  if (className) row.classList.add(className);

  const cell = document.createElement('div');
  if (html) {
    cell.innerHTML = html;
  }
  if (color) {
    cell.style.color = normalizeColor(color);
  }
  row.append(cell);
  return row;
};

const createAccordionItem = (
  titleHtml,
  titleColor,
  bodyNodes,
  openByDefault = false,
) => {
  const item = document.createElement('div');
  item.classList.add('feature-accordion-item__entry');

  const header = document.createElement('button');
  header.type = 'button';
  header.classList.add('feature-accordion-item__trigger');
  header.setAttribute('aria-expanded', openByDefault ? 'true' : 'false');
  header.innerHTML = titleHtml || '';
  if (titleColor) {
    header.style.color = normalizeColor(titleColor);
  }

  const panel = document.createElement('div');
  panel.classList.add('feature-accordion-item__panel');
  panel.hidden = !openByDefault;
  panel.append(bodyNodes);

  header.addEventListener('click', () => {
    const expanded = header.getAttribute('aria-expanded') === 'true';
    header.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    panel.hidden = expanded;
  });

  item.append(header, panel);
  return item;
};

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

// Variant-2 compact markup: top-level model occupies first 7 rows, each sub-item row has >= 5 cells.
const detectSubItemRows = (block) => [...block.children].filter((row, index) => index >= 7 && row.children.length >= 5);

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

const buildMediaRow = async (path, fallbackHtml, className) => {
  if (!path && !fallbackHtml) return null;
  const mediaRow = createConfigRow('', className);
  if (path) {
    const resolvedPath = resolveFragmentPath(path);
    const fragment = await loadFragment(resolvedPath);
    if (fragment?.childNodes?.length) {
      mediaRow.firstElementChild.append(...fragment.childNodes);
      return mediaRow;
    }
  }
  if (fallbackHtml) {
    mediaRow.firstElementChild.innerHTML = fallbackHtml;
  }
  return mediaRow;
};

const expandFirstNestedAccordion = (panel) => {
  if (!panel) return;
  const firstNestedTrigger = panel.querySelector('.feature-accordion-subitem__trigger');
  if (!firstNestedTrigger) return;

  const nestedEntry = firstNestedTrigger.closest('.feature-accordion-item__entry');
  const nestedPanel = nestedEntry?.querySelector('.feature-accordion-subitem__panel');
  if (!nestedPanel) return;

  firstNestedTrigger.setAttribute('aria-expanded', 'true');
  nestedPanel.hidden = false;
};

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'feature-accordion-item');
    const v = getFieldValue(config);

    const titleHtml = v('titleRichtext', 'html');
    const subtitleHtml = v('subtitleRichtext', 'html');
    const infoHtml = v('infoRichtext', 'html');
    const mediaBlockPath = v('mediaBlockContent');
    const mediaBlockHtml = v('mediaBlockContent', 'html');

    const subItemRows = detectSubItemRows(block);
    const isNestedVariant = subItemRows.length > 0;

    const panelRows = document.createDocumentFragment();
    if (hasMeaningfulContent(subtitleHtml)) {
      panelRows.append(createConfigRow(subtitleHtml, 'feature-accordion-item__subtitle', v('subtitleFontColor')));
    }
    if (hasMeaningfulContent(infoHtml)) {
      panelRows.append(createConfigRow(infoHtml, 'feature-accordion-item__info', v('infoFontColor')));
    }

    const mediaRow = await buildMediaRow(mediaBlockPath, mediaBlockHtml, 'feature-accordion-item__media');
    if (mediaRow) {
      panelRows.append(mediaRow);
    }

    if (isNestedVariant) {
      const nestedContainer = document.createElement('div');
      nestedContainer.classList.add('feature-accordion-item__nested');

      const nestedItems = await Promise.all(subItemRows.map(async (subRow) => {
        const subConfig = parseSubItemFromCompactRow(subRow);
        if (!subConfig) return null;

        const sv = getFieldValue(subConfig);
        const nestedTitleHtml = sv('subItemTitleRichtext', 'html') || sv('titleRichtext', 'html');
        if (!hasMeaningfulContent(nestedTitleHtml)) return null;

        const nestedPanelRows = document.createDocumentFragment();
        const subSubtitle = sv('subItemSubtitleRichtext', 'html');
        const subInfo = sv('subItemInfoRichtext', 'html');

        if (hasMeaningfulContent(subSubtitle)) {
          nestedPanelRows.append(createConfigRow(subSubtitle, 'feature-accordion-subitem__subtitle', sv('subItemSubtitleFontColor')));
        }
        if (hasMeaningfulContent(subInfo)) {
          nestedPanelRows.append(createConfigRow(subInfo, 'feature-accordion-subitem__info', sv('subItemInfoFontColor')));
        }

        const nestedMedia = await buildMediaRow(
          sv('subItemMediaBlockContent'),
          sv('subItemMediaBlockContent', 'html'),
          'feature-accordion-subitem__media',
        );
        if (nestedMedia) {
          nestedPanelRows.append(nestedMedia);
        }

        const nestedItem = createAccordionItem(
          nestedTitleHtml,
          sv('titleFontColor'),
          nestedPanelRows,
          false,
        );
        nestedItem.classList.add('feature-accordion-subitem__entry');
        nestedItem.querySelector('.feature-accordion-item__trigger')?.classList.add('feature-accordion-subitem__trigger', 'feature-accordion-subitem__title');
        nestedItem.querySelector('.feature-accordion-item__panel')?.classList.add('feature-accordion-subitem__panel');
        return nestedItem;
      }));

      nestedItems.filter(Boolean).forEach((nestedItem) => {
        nestedContainer.append(nestedItem);
      });

      if (nestedContainer.children.length > 0) {
        panelRows.append(nestedContainer);
      }
    }

    const accordionRoot = block.closest('.feature-accordion')
      || block.closest('.section')
      || block.parentElement;

    const itemsInScope = accordionRoot
      ? [...accordionRoot.querySelectorAll('.feature-accordion-item[data-block-name="feature-accordion-item"], .feature-accordion-item')]
      : [...document.querySelectorAll('.feature-accordion-item[data-block-name="feature-accordion-item"], .feature-accordion-item')];

    const firstItemBlock = itemsInScope.find((item) => item.dataset.blockName === 'feature-accordion-item')
      || itemsInScope[0];
    const isFirstAccordionItem = firstItemBlock === block;

    const finalTitleHtml = titleHtml;
    const accordionItem = createAccordionItem(
      finalTitleHtml,
      v('titleFontColor'),
      panelRows,
      isFirstAccordionItem,
    );

    accordionItem.classList.add(
      isNestedVariant ? 'feature-accordion-item__entry--nested-variant' : 'feature-accordion-item__entry--single-variant',
    );

    block.innerHTML = '';
    block.append(accordionItem);

    if (isNestedVariant) {
      const topTrigger = accordionItem.querySelector(':scope > .feature-accordion-item__trigger');
      const topPanel = accordionItem.querySelector(':scope > .feature-accordion-item__panel');

      if (topTrigger && topPanel) {
        topTrigger.addEventListener('click', () => {
          if (topTrigger.getAttribute('aria-expanded') === 'true') {
            expandFirstNestedAccordion(topPanel);
          }
        });

        if (topTrigger.getAttribute('aria-expanded') === 'true') {
          expandFirstNestedAccordion(topPanel);
        }
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating feature-accordion-item block:', error);
    block.innerHTML = '<div class="error-message">Failed to load feature-accordion-item block</div>';
  }
}
