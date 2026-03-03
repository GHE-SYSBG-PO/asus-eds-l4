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
const fragmentTemplateByPath = new Map();
const rowAnimationState = new WeakMap();
const ROW_ANIMATION_MS = 420;
const ROW_STAGGER_MS = 0;
const PREFETCH_CONCURRENCY = 2;
const delayedMediaRegistry = new Set();
let delayedMediaListenerBound = false;
let delayedMediaEventFired = false;
let delayedMediaPrefetchStarted = false;
let mediaControlDelegationBound = false;
const CTA_DATA_KEYS = ['ctavisiblity', 'ctatext', 'ctahyperlink', 'ctafontcolor'];

const runLoadersWithConcurrency = async (loaders, concurrency = PREFETCH_CONCURRENCY) => {
  if (!loaders.length) return;
  let pointer = 0;

  const worker = async () => {
    if (pointer >= loaders.length) return;
    const currentIndex = pointer;
    pointer += 1;
    await loaders[currentIndex]().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to prefetch accordion media:', error);
    });
    return worker();
  };

  const workerCount = Math.min(concurrency, loaders.length);
  await Promise.allSettled(Array.from({ length: workerCount }, () => worker()));
};

const runDelayedMediaPrefetch = async () => {
  if (delayedMediaPrefetchStarted) return;
  delayedMediaPrefetchStarted = true;

  const loaders = [...delayedMediaRegistry];
  await runLoadersWithConcurrency(loaders, PREFETCH_CONCURRENCY);
};

const registerDelayedMediaLoader = (loader) => {
  if (typeof loader !== 'function') return;
  delayedMediaRegistry.add(loader);
  if (delayedMediaEventFired) {
    runDelayedMediaPrefetch().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to trigger delayed media prefetch:', error);
    });
  }
};

const bindDelayedMediaListener = () => {
  if (delayedMediaListenerBound) return;
  delayedMediaListenerBound = true;
  window.addEventListener('delayed-loaded', () => {
    delayedMediaEventFired = true;
    runDelayedMediaPrefetch().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to run delayed media prefetch:', error);
    });
  }, { once: true });
};

const syncVideoControls = (video) => {
  if (!video) return;
  const container = video.closest('.media-block-video-container');
  if (!container) return;

  const playBtn = container.querySelector('.media-block-play-btn');
  const pauseBtn = container.querySelector('.media-block-pause-btn');
  const replayBtn = container.querySelector('.media-block-replay-btn');

  if (video.ended && replayBtn) {
    replayBtn.style.display = 'flex';
    if (playBtn) playBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    return;
  }

  if (video.paused) {
    if (playBtn) playBtn.style.display = 'flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
  } else {
    if (playBtn) playBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'flex';
  }
  if (replayBtn) replayBtn.style.display = 'none';
};

const syncAccordionVideoPlayback = (activeContainer) => {
  if (!activeContainer) return;
  const accordionContainer = activeContainer.closest('.feature-accordion-item-container');
  if (!accordionContainer) return;

  const allVideos = [...accordionContainer.querySelectorAll('video')];
  allVideos.forEach((video) => {
    if (!activeContainer.contains(video)) {
      if (!video.paused) {
        video.pause();
      }
      syncVideoControls(video);
    }
  });

  const activeVideo = activeContainer.querySelector('video');
  if (activeVideo) {
    activeVideo.play().catch(() => {});
    syncVideoControls(activeVideo);
  }
};

const bindMediaControlDelegation = () => {
  if (mediaControlDelegationBound) return;
  mediaControlDelegationBound = true;

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const playBtn = target.closest('.media-block-play-btn');
    if (playBtn) {
      const container = playBtn.closest('.media-block-video-container');
      const video = container?.querySelector('video');
      if (video) {
        event.preventDefault();
        event.stopPropagation();
        video.play().catch(() => {});
        syncVideoControls(video);
      }
      return;
    }

    const pauseBtn = target.closest('.media-block-pause-btn');
    if (pauseBtn) {
      const container = pauseBtn.closest('.media-block-video-container');
      const video = container?.querySelector('video');
      if (video) {
        event.preventDefault();
        event.stopPropagation();
        video.pause();
        syncVideoControls(video);
      }
      return;
    }

    const replayBtn = target.closest('.media-block-replay-btn');
    if (replayBtn) {
      const container = replayBtn.closest('.media-block-video-container');
      const video = container?.querySelector('video');
      if (video) {
        event.preventDefault();
        event.stopPropagation();
        video.currentTime = 0;
        video.play().catch(() => {});
        syncVideoControls(video);
      }
    }
  }, true);

  document.addEventListener('play', (event) => {
    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (video) syncVideoControls(video);
  }, true);

  document.addEventListener('pause', (event) => {
    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (video) syncVideoControls(video);
  }, true);

  document.addEventListener('ended', (event) => {
    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (video) syncVideoControls(video);
  }, true);
};

const syncContainerCtaDatasetToGroup = (container, group) => {
  if (!container || !group) return;
  CTA_DATA_KEYS.forEach((key) => {
    if (container.dataset[key]) {
      group.dataset[key] = container.dataset[key];
    }
  });
};

const createAccordionCta = (dataset) => {
  if (!dataset || dataset.ctavisiblity !== 'show') return null;
  const text = dataset.ctatext?.trim();
  const href = dataset.ctahyperlink?.trim();
  if (!text || !href) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'feature-accordion-cta';

  const link = document.createElement('a');
  link.className = 'feature-accordion-cta__link';
  link.href = href;
  link.setAttribute('aria-label', text);

  const textNode = document.createElement('span');
  textNode.className = 'feature-accordion-cta__text';
  textNode.textContent = text;

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.classList.add('feature-accordion-cta__icon');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M9 6l6 6-6 6');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  icon.append(path);

  const color = normalizeColor(dataset.ctafontcolor);
  if (color) {
    wrapper.style.setProperty('--feature-accordion-cta-color', color);
  }

  link.append(textNode, icon);
  wrapper.append(link);
  return wrapper;
};

const ensureAccordionListCta = (container, group) => {
  if (!container || !group) return;
  syncContainerCtaDatasetToGroup(container, group);

  const existing = group.querySelector(':scope > .feature-accordion-cta');
  const cta = createAccordionCta(group.dataset);
  if (!cta) {
    if (existing) existing.remove();
    return;
  }

  if (existing) existing.remove();
  group.append(cta);
};

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

  ensureAccordionListCta(container, group);

  return { container, group, mediaGroup };
};

// Variant-2 compact markup: top-level model occupies first 7 rows.
const detectSubItemRows = (block) => [...block.children].filter((row, index) => index >= 7 && row.children.length >= 5);

const ensureNestedWrapper = (block, subItemRows) => {
  if (!block || !subItemRows.length) return null;

  let nestedWrapper = block.querySelector(':scope > .feature-accordion-item__nested');
  if (!nestedWrapper) {
    nestedWrapper = document.createElement('div');
    nestedWrapper.classList.add('feature-accordion-item__nested');
  }

  const [firstSubItemRow] = subItemRows;
  if (firstSubItemRow && firstSubItemRow.parentElement === block) {
    block.insertBefore(nestedWrapper, firstSubItemRow);
  }
  nestedWrapper.append(...subItemRows);
  return nestedWrapper;
};

const ensureTopContentWrapper = (block, rows) => {
  if (!block || !rows.length) return null;

  let contentWrapper = block.querySelector(':scope > .feature-accordion-item__content');
  if (!contentWrapper) {
    contentWrapper = document.createElement('div');
    contentWrapper.classList.add('feature-accordion-item__content');
  }

  const rowsToWrap = rows.filter((row) => row && row.isConnected);
  if (!rowsToWrap.length) return contentWrapper;

  const [firstRow] = rowsToWrap;
  if (firstRow && firstRow.parentElement === block) {
    block.insertBefore(contentWrapper, firstRow);
  }
  contentWrapper.append(...rowsToWrap);
  return contentWrapper;
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

const extractPathFromHtml = (html) => {
  if (!html) return '';
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  return wrapper.textContent?.trim() || '';
};

const isLikelyFragmentPath = (value) => {
  if (!value || typeof value !== 'string') return false;
  const path = value.trim();
  return path.startsWith('./') || path.startsWith('/') || path.startsWith('http');
};

const getLikelyPathFromCell = (cell) => {
  const value = toFieldValue(cell);
  return [value.text, extractPathFromHtml(value.html)].find(isLikelyFragmentPath) || '';
};

const resolveSubItemCellIndexes = (cells) => {
  const mediaIndex = cells.findIndex((cell) => isLikelyFragmentPath(getLikelyPathFromCell(cell)));
  const safeMediaIndex = mediaIndex >= 3 ? mediaIndex : Math.min(4, Math.max(cells.length - 1, 0));

  return {
    header: Math.max(0, safeMediaIndex - 3),
    subtitle: Math.max(0, safeMediaIndex - 2),
    info: Math.max(0, safeMediaIndex - 1),
    media: safeMediaIndex,
  };
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

const animateRow = (row, open, immediate = false, index = 0, total = 1) => {
  if (!row) return;
  const currentState = rowAnimationState.get(row);
  if (currentState?.timer) {
    clearTimeout(currentState.timer);
  }

  if (immediate) {
    row.hidden = !open;
    row.style.maxHeight = '';
    row.style.opacity = '';
    rowAnimationState.set(row, {});
    return;
  }

  row.style.overflow = 'hidden';
  const openDelay = index * ROW_STAGGER_MS;
  const closeDelay = (Math.max(total - index - 1, 0)) * Math.round(ROW_STAGGER_MS * 0.45);

  if (open) {
    row.hidden = false;
    row.style.maxHeight = '0px';
    row.style.opacity = '0';
    row.style.transitionDelay = `${openDelay}ms`;
    requestAnimationFrame(() => {
      row.style.maxHeight = `${row.scrollHeight}px`;
      row.style.opacity = '1';
    });
    const timer = setTimeout(() => {
      row.style.maxHeight = '';
      row.style.overflow = '';
      row.style.transitionDelay = '';
      rowAnimationState.set(row, {});
    }, ROW_ANIMATION_MS + openDelay + 60);
    rowAnimationState.set(row, { timer });
  } else {
    const currentHeight = row.scrollHeight;
    row.style.maxHeight = `${currentHeight}px`;
    row.style.opacity = '1';
    row.style.transitionDelay = `${closeDelay}ms`;
    requestAnimationFrame(() => {
      row.style.maxHeight = '0px';
      row.style.opacity = '0';
    });
    const timer = setTimeout(() => {
      row.hidden = true;
      row.style.maxHeight = '';
      row.style.overflow = '';
      row.style.transitionDelay = '';
      rowAnimationState.set(row, {});
    }, ROW_ANIMATION_MS + closeDelay + 60);
    rowAnimationState.set(row, { timer });
  }
};

const setRowsOpenState = (rows, open, immediate = false) => {
  const total = rows.length;
  rows.forEach((row, index) => {
    animateRow(row, open, immediate, index, total);
  });
};

const collapseEntry = (entry, triggerSelector, panelRowSelector) => {
  if (!entry) return;
  const trigger = entry.querySelector(triggerSelector);
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
  }
  entry.classList.remove('is-expanded');
  entry.querySelector('.feature-accordion-item__content')?.classList.remove('is-expanded');
  entry.querySelector('.feature-accordion-item__nested')?.classList.remove('is-expanded');
  const panelRows = entry.querySelectorAll(panelRowSelector);
  setRowsOpenState([...panelRows], false);
};

const reserveMediaSpace = (cell) => {
  if (!cell || cell.style.minHeight) return;
  const width = cell.clientWidth || cell.parentElement?.clientWidth || 0;
  const estimatedHeight = width > 0 ? Math.round(width * 0.5625) : 180;
  cell.style.minHeight = `${Math.max(estimatedHeight, 160)}px`;
};

const renderIntoTarget = (target, fragment, fallbackHtml = '') => {
  if (!target) return;
  target.classList.remove('is-media-enter');
  target.classList.add('is-media-switching');
  target.innerHTML = '';
  if (fragment instanceof HTMLTemplateElement) {
    target.append(fragment.content.cloneNode(true));
  } else if (fragment?.childNodes?.length) {
    target.append(...fragment.childNodes);
  } else if (fallbackHtml) {
    target.innerHTML = fallbackHtml;
  }
  // Force style recalc so transition class restarts reliably.
  // eslint-disable-next-line no-unused-expressions
  target.offsetHeight;
  target.classList.add('is-media-enter');
  target.classList.remove('is-media-switching');
};

const activateMediaGroupSlot = (slot) => {
  if (!slot || !slot.parentElement) return;
  const mediaGroup = slot.parentElement;
  const slots = [...mediaGroup.querySelectorAll(':scope > .feature-accordion-media-slot')];
  slots.forEach((candidate) => {
    const isActive = candidate === slot;
    candidate.hidden = !isActive;
    candidate.style.display = isActive ? '' : 'none';
  });
  syncAccordionVideoPlayback(slot);
};

const createTemplateFromFragment = (fragment) => {
  if (!fragment?.childNodes?.length) return null;
  const template = document.createElement('template');
  template.content.append(...[...fragment.childNodes].map((node) => node.cloneNode(true)));
  return template;
};

const getCachedFragmentTemplate = async (resolvedPath) => {
  if (!resolvedPath) return null;
  if (!fragmentTemplateByPath.has(resolvedPath)) {
    fragmentTemplateByPath.set(resolvedPath, (async () => {
      const fragment = await loadFragment(resolvedPath);
      return createTemplateFromFragment(fragment);
    })());
  }
  return fragmentTemplateByPath.get(resolvedPath);
};

const createLazyMediaLoader = (cell, path, fallbackHtml, getRenderTargets = () => [cell]) => async () => {
  if (!cell || (!path && !fallbackHtml)) return;

  const state = mediaStateByCell.get(cell) || {
    fragmentPath: '',
    fragmentTemplate: null,
    fallback: '',
    loadingTargets: new WeakMap(),
    loadedTargets: new WeakSet(),
    renderedTargets: new WeakSet(),
    groupSlot: null,
    groupPreferred: false,
  };
  mediaStateByCell.set(cell, state);

  const targets = [...new Set((getRenderTargets() || []).filter(Boolean))];
  if (!targets.length) return;

  targets.forEach((target) => {
    reserveMediaSpace(target);
    target.classList.add('is-media-loading');
    target.setAttribute('aria-busy', 'true');
  });

  if (!state.fragmentPath) {
    const fallbackPath = extractPathFromHtml(fallbackHtml);
    const inlinePath = cell.textContent?.trim() || '';
    const fragmentPath = [path, inlinePath, fallbackPath].find(isLikelyFragmentPath) || '';
    state.fragmentPath = fragmentPath ? resolveFragmentPath(fragmentPath) : '';
    state.fallback = fallbackHtml || '';
  }

  const ensureLoadedInto = async (container) => {
    if (!container) return;
    if (state.loadedTargets.has(container)) return;

    const inFlight = state.loadingTargets.get(container);
    if (inFlight) {
      await inFlight;
      return;
    }

    const promise = (async () => {
      if (state.fragmentPath) {
        const template = state.fragmentTemplate || await getCachedFragmentTemplate(state.fragmentPath);
        if (template) {
          state.fragmentTemplate = template;
          renderIntoTarget(container, template, state.fallback);
          state.loadedTargets.add(container);
          return;
        }
      }

      if (state.fallback) {
        renderIntoTarget(container, null, state.fallback);
        state.loadedTargets.add(container);
      }
    })();

    state.loadingTargets.set(container, promise);
    try {
      await promise;
    } finally {
      state.loadingTargets.delete(container);
    }
  };

  await Promise.all(targets.map(async (target) => {
    if (target.classList.contains('feature-accordion-media-group')) {
      if (!state.groupSlot) {
        state.groupSlot = document.createElement('div');
        state.groupSlot.classList.add('feature-accordion-media-slot');
        state.groupSlot.hidden = true;
        state.groupSlot.style.display = 'none';
        target.append(state.groupSlot);
      }

      await ensureLoadedInto(state.groupSlot);
    } else if (!state.renderedTargets.has(target)) {
      await ensureLoadedInto(target);
      state.renderedTargets.add(target);
    }

    target.classList.remove('is-media-loading');
    target.removeAttribute('aria-busy');
    requestAnimationFrame(() => {
      target.style.minHeight = '';
    });
  }));
};

const expandFirstNested = (container) => {
  const firstTrigger = container.querySelector('.feature-accordion-subitem__trigger');
  if (!firstTrigger) return;
  if (firstTrigger.getAttribute('aria-expanded') === 'false') {
    firstTrigger.click();
  }
};

const isMediaCellCurrentlyActive = (cell) => {
  if (!cell) return false;

  const nestedEntry = cell.closest('.feature-accordion-subitem__entry');
  if (nestedEntry) {
    const nestedTrigger = nestedEntry.querySelector('.feature-accordion-subitem__trigger');
    const topEntry = cell.closest('.feature-accordion-item__entry');
    const topTrigger = topEntry?.querySelector('.feature-accordion-item__trigger');
    return nestedTrigger?.getAttribute('aria-expanded') === 'true'
      && topTrigger?.getAttribute('aria-expanded') === 'true';
  }

  const topEntry = cell.closest('.feature-accordion-item__entry');
  const topTrigger = topEntry?.querySelector('.feature-accordion-item__trigger');
  return topTrigger?.getAttribute('aria-expanded') === 'true';
};

const showMediaGroupSlotForCell = (cell) => {
  if (!cell) return;
  if (!isMediaCellCurrentlyActive(cell)) return;
  const state = mediaStateByCell.get(cell);
  if (!state) return;
  state.groupPreferred = true;
  const mediaGroup = state.groupSlot?.parentElement;
  const useGroupSlot = !!(mediaGroup && window.getComputedStyle(mediaGroup).display !== 'none');

  if (state.groupSlot && useGroupSlot) {
    activateMediaGroupSlot(state.groupSlot);
  } else {
    syncAccordionVideoPlayback(cell);
  }
};

const hasRenderableMediaSource = (cell, configText = '', configHtml = '') => {
  const configPath = [configText, extractPathFromHtml(configHtml)].find(isLikelyFragmentPath);
  if (configPath) return true;
  if (!cell) return false;

  const inlinePath = getLikelyPathFromCell(cell);
  if (inlinePath) return true;

  const hasMediaElement = !!cell.querySelector('img, picture, video, iframe, .media-block');
  return hasMediaElement;
};

const hasMeaningfulCellContent = (cell) => {
  if (!cell) return false;
  if (cell.querySelector('img, picture, video, iframe, .media-block')) return true;
  const text = cell.textContent?.replace(/\u00A0/g, ' ').trim() || '';
  return text.length > 0;
};

export default async function decorate(block) {
  try {
    console.log('accordion item block', block);
    bindDelayedMediaListener();
    bindMediaControlDelegation();
    const scaffold = ensureAccordionGroupWrapper(block);

    const rows = [...block.children];
    if (!rows.length) return;

    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'feature-accordion-item');
    const v = getFieldValue(config);

    const titleRow = rows[0];
    const subtitleRow = rows[1];
    const infoRow = rows[2];
    const mediaRow = rows[3];
    const titleCell = titleRow?.children?.[0];
    const subtitleCell = subtitleRow?.children?.[0];
    const infoCell = infoRow?.children?.[0];
    const mediaCell = mediaRow?.children?.[0];

    block.classList.add('feature-accordion-item__entry');
    titleCell?.classList.add('feature-accordion-item__trigger');
    mediaCell?.classList.add('feature-accordion-item__media');

    if (v('titleFontColor')) block.style.setProperty('--feature-accordion-item-title-color', normalizeColor(v('titleFontColor')));
    if (v('subtitleFontColor')) block.style.setProperty('--feature-accordion-item-subtitle-color', normalizeColor(v('subtitleFontColor')));
    if (v('infoFontColor')) block.style.setProperty('--feature-accordion-item-info-color', normalizeColor(v('infoFontColor')));

    const subItemRows = detectSubItemRows(block);
    const isNestedVariant = subItemRows.length > 0;
    const nestedWrapper = isNestedVariant ? ensureNestedWrapper(block, subItemRows) : null;
    const hasTopMedia = hasRenderableMediaSource(
      mediaCell,
      v('mediaBlockContent'),
      v('mediaBlockContent', 'html'),
    );

    if (isNestedVariant && !hasTopMedia) {
      if (mediaRow) mediaRow.remove();
    }

    if (subtitleRow && !hasMeaningfulCellContent(subtitleCell)) {
      subtitleRow.remove();
    }
    if (infoRow && !hasMeaningfulCellContent(infoCell)) {
      infoRow.remove();
    }
    // Compact model rows 4-6 are config-only (font color fields), never visual content.
    rows.slice(4, 7).forEach((row) => {
      if (row?.isConnected) row.remove();
    });
    const topContentWrapper = ensureTopContentWrapper(block, [titleRow, subtitleRow, infoRow]);

    const getMediaTargets = (inlineCell) => {
      const targets = [inlineCell];
      if (scaffold?.mediaGroup) targets.push(scaffold.mediaGroup);
      return targets;
    };

    const ensureTopMediaLoaded = createLazyMediaLoader(
      mediaCell,
      v('mediaBlockContent'),
      v('mediaBlockContent', 'html'),
      () => getMediaTargets(mediaCell),
    );
    if (hasTopMedia) {
      registerDelayedMediaLoader(ensureTopMediaLoaded);
    }

    const topPanelRows = [subtitleRow, infoRow, mediaRow, nestedWrapper].filter((row) => row?.isConnected);
    topPanelRows.forEach((row) => {
      row.classList.add('feature-accordion-item__panel-row');
      if (row === subtitleRow) {
        row.classList.add('feature-accordion-item__subtitle');
      }
      if (row === infoRow) {
        row.classList.add('feature-accordion-item__info');
      }
    });
    const hasFirstLevelPanelContent = [subtitleRow, infoRow, mediaRow].some((row) => row?.isConnected);
    const hasOnlyNestedContent = isNestedVariant && !hasFirstLevelPanelContent;
    topContentWrapper?.classList.toggle('has-only-nested-accordion', hasOnlyNestedContent);

    await Promise.all(subItemRows.map(async (subRow) => {
      const subConfig = parseSubItemFromCompactRow(subRow);
      if (!subConfig) return;
      const sv = getFieldValue(subConfig);
      const cells = [...subRow.children];

      const nestedIndexes = resolveSubItemCellIndexes(cells);
      const nestedHeaderCell = cells[nestedIndexes.header];
      const nestedSubtitleCell = cells[nestedIndexes.subtitle];
      const nestedInfoCell = cells[nestedIndexes.info];
      const nestedMediaCell = cells[nestedIndexes.media];
      const contentIndexes = new Set([
        nestedIndexes.header,
        nestedIndexes.subtitle,
        nestedIndexes.info,
        nestedIndexes.media,
      ]);
      cells.forEach((cell, idx) => {
        if (!contentIndexes.has(idx)) {
          cell.remove();
        }
      });
      const nestedPanelCells = [...new Set([nestedSubtitleCell, nestedInfoCell, nestedMediaCell])]
        .filter((cell) => cell && cell !== nestedHeaderCell);

      subRow.classList.add('feature-accordion-subitem__entry');
      nestedHeaderCell?.classList.add('feature-accordion-subitem__trigger', 'feature-accordion-subitem__title');
      nestedPanelCells.forEach((cell) => cell.classList.add('feature-accordion-subitem__panel-row'));
      nestedSubtitleCell?.classList.add('feature-accordion-subitem__subtitle');
      nestedInfoCell?.classList.add('feature-accordion-subitem__info');
      nestedMediaCell?.classList.add('feature-accordion-subitem__media');

      if (sv('subItemTitleFontColor')) subRow.style.setProperty('--feature-accordion-subitem-title-color', normalizeColor(sv('subItemTitleFontColor')));
      if (sv('subItemSubtitleFontColor')) subRow.style.setProperty('--feature-accordion-subitem-subtitle-color', normalizeColor(sv('subItemSubtitleFontColor')));
      if (sv('subItemInfoFontColor')) subRow.style.setProperty('--feature-accordion-subitem-info-color', normalizeColor(sv('subItemInfoFontColor')));

      const ensureNestedMediaLoaded = createLazyMediaLoader(
        nestedMediaCell,
        getLikelyPathFromCell(nestedMediaCell) || sv('subItemMediaBlockContent'),
        toFieldValue(nestedMediaCell).html || sv('subItemMediaBlockContent', 'html'),
        () => getMediaTargets(nestedMediaCell),
      );
      registerDelayedMediaLoader(ensureNestedMediaLoaded);

      setRowsOpenState(nestedPanelCells, false, true);
      makeInteractiveTrigger(nestedHeaderCell, (isOpen) => {
        setRowsOpenState(nestedPanelCells, isOpen);
        if (isOpen) {
          ensureNestedMediaLoaded()
            .then(() => {
              showMediaGroupSlotForCell(nestedMediaCell);
            })
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error('Failed to load nested media on open:', error);
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

    const setTopWrapperExpandedState = (isOpen) => {
      block.classList.toggle('is-expanded', isOpen);
      topContentWrapper?.classList.toggle('is-expanded', isOpen);
      nestedWrapper?.classList.toggle('is-expanded', isOpen);
    };

    setRowsOpenState(topPanelRows, isFirstAccordionItem, true);
    setTopWrapperExpandedState(isFirstAccordionItem);
    makeInteractiveTrigger(titleCell, (isOpen) => {
      setRowsOpenState(topPanelRows, isOpen);
      setTopWrapperExpandedState(isOpen);
      if (isOpen) {
        if (hasTopMedia) {
          ensureTopMediaLoaded()
            .then(() => {
              showMediaGroupSlotForCell(mediaCell);
            })
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error('Failed to load top media on open:', error);
            });
        }
        itemsInScope
          .filter((item) => item !== block)
          .forEach((item) => {
            collapseEntry(item, '.feature-accordion-item__trigger', '.feature-accordion-item__panel-row');
          });
      }
      if (isOpen && isNestedVariant) {
        expandFirstNested(block);
      }
    }, isFirstAccordionItem);

    if (isFirstAccordionItem && isNestedVariant) {
      if (hasTopMedia) {
        ensureTopMediaLoaded()
          .then(() => {
            showMediaGroupSlotForCell(mediaCell);
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to load initial top media:', error);
          });
      }
      expandFirstNested(block);
    } else if (isFirstAccordionItem) {
      if (hasTopMedia) {
        ensureTopMediaLoaded()
          .then(() => {
            showMediaGroupSlotForCell(mediaCell);
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to load initial top media:', error);
          });
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating feature-accordion-item block:', error);
    block.innerHTML = '<div class="error-message">Failed to load feature-accordion-item block</div>';
  }
}
