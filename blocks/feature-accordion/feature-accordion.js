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
  'subItemTitleRichtext',
  'subItemSubtitleRichtext',
  'subItemInfoRichtext',
  'subItemMediaBlockContent',
  'subItemTitleFontColor',
  'subItemSubtitleFontColor',
  'subItemInfoFontColor',
];

// Legacy compact rows may include an extra leading title field.
const SUBITEM_FIELD_ORDER_LEGACY = [
  'titleRichtext',
  ...SUBITEM_FIELD_ORDER,
];

// Some authored compact rows include parent (first-level) title color before nested colors.
const SUBITEM_FIELD_ORDER_WITH_PARENT_COLOR = [
  'subItemTitleRichtext',
  'subItemSubtitleRichtext',
  'subItemInfoRichtext',
  'subItemMediaBlockContent',
  'titleFontColor',
  'subItemTitleFontColor',
  'subItemSubtitleFontColor',
  'subItemInfoFontColor',
];

/**
 * Normalizes a color value to a valid CSS color format.
 *
 * - Trims whitespace and validates input
 * - Returns valid hex, rgb, hsl, or var() values as-is
 * - Prefixes valid hex codes without # with #
 * - Returns empty string for invalid inputs
 *
 * @param {string} color - The color value to normalize
 * @returns {string} The normalized color value or empty string
 */
const normalizeColor = (color) => {
  if (!color || typeof color !== 'string') return '';
  const value = color.trim();
  if (!value) return '';
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) return value;
  return /^[0-9a-fA-F]{3,8}$/.test(value) ? `#${value}` : value;
};

/**
 * Checks if a value is likely a color token.
 *
 * - Validates string input and trims whitespace
 * - Recognizes hex codes, rgb/hsl functions, and CSS variables
 * - Returns false for empty or non-string inputs
 *
 * @param {string} value - The value to check
 * @returns {boolean} True if the value appears to be a color token
 */
const isLikelyColorToken = (value) => {
  if (!value || typeof value !== 'string') return false;
  const token = value.trim();
  if (!token) return false;
  if (token.startsWith('#') || token.startsWith('rgb') || token.startsWith('hsl')) return true;
  if (/^[0-9a-fA-F]{3,8}$/.test(token)) return true;
  if (token.startsWith('var(')) return true;
  return false;
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
const nestedExpandTimerByBlock = new WeakMap();
const CTA_DATA_KEYS = ['ctavisiblity', 'ctatext', 'ctahyperlink', 'ctafontcolor'];

/**
 * Runs multiple async loaders with controlled concurrency.
 *
 * - Limits the number of concurrent executions to prevent overload
 * - Uses a worker pool pattern for efficient processing
 * - Handles errors gracefully without stopping other loaders
 *
 * @param {Function[]} loaders - Array of async loader functions
 * @param {number} concurrency - Maximum number of concurrent loaders (default: PREFETCH_CONCURRENCY)
 */
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

/**
 * Runs prefetching for all registered delayed media loaders.
 *
 * - Prevents multiple executions with a started flag
 * - Collects all registered loaders and runs them concurrently
 * - Used when the delayed media event fires
 */
const runDelayedMediaPrefetch = async () => {
  if (delayedMediaPrefetchStarted) return;
  delayedMediaPrefetchStarted = true;

  const loaders = [...delayedMediaRegistry];
  await runLoadersWithConcurrency(loaders, PREFETCH_CONCURRENCY);
};

/**
 * Registers a loader function for delayed media prefetching.
 *
 * - Adds the loader to the registry if it's a valid function
 * - Triggers prefetch immediately if the delayed event has already fired
 * - Handles errors gracefully during prefetch triggering
 *
 * @param {Function} loader - The async loader function to register
 */
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

/**
 * Binds a listener for the 'delayed-loaded' event to trigger media prefetch.
 *
 * - Prevents multiple bindings with a flag
 * - Listens for the delayed-loaded event once
 * - Runs prefetch when the event fires, handling errors gracefully
 */
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

/**
 * Synchronizes video control button visibility with video state.
 *
 * - Shows replay button when video has ended
 * - Shows play button when video is paused
 * - Shows pause button when video is playing
 * - Hides irrelevant buttons based on current state
 *
 * @param {HTMLVideoElement} video - The video element to sync controls for
 */
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

/**
 * Synchronizes video playback within an accordion context.
 *
 * - Pauses all videos outside the active container
 * - Plays the video in the active container if present
 * - Updates control visibility for all affected videos
 * - Handles play promise rejections gracefully
 *
 * @param {HTMLElement} activeContainer - The currently active media container
 */
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

/**
 * Binds event delegation for media control buttons and video events.
 *
 * - Handles click events for play, pause, and replay buttons
 * - Listens for video play, pause, and ended events
 * - Updates control visibility and video state accordingly
 * - Uses capture phase for reliable event handling
 */
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

/**
 * Syncs CTA-related dataset attributes from container to group element.
 *
 * - Copies visibility, text, hyperlink, and font color data
 * - Only copies attributes that exist on the container
 * - Used to propagate CTA settings to the group wrapper
 *
 * @param {HTMLElement} container - The source container element
 * @param {HTMLElement} group - The target group element
 */
const syncContainerCtaDatasetToGroup = (container, group) => {
  if (!container || !group) return;
  CTA_DATA_KEYS.forEach((key) => {
    if (container.dataset[key]) {
      group.dataset[key] = container.dataset[key];
    }
  });
};

/**
 * Creates a CTA (Call-to-Action) element for the accordion.
 *
 * - Returns null if visibility is not 'show' or required fields are missing
 * - Creates a wrapper div with link, text span, and arrow icon
 * - Applies custom font color if provided
 * - Includes proper ARIA attributes for accessibility
 *
 * @param {Object} dataset - The dataset object containing CTA configuration
 * @returns {HTMLElement|null} The created CTA element or null
 */
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

/**
 * Ensures a CTA element is present in the accordion list group.
 *
 * - Syncs dataset from container to group
 * - Removes existing CTA if new one is null
 * - Creates and appends new CTA if valid
 * - Replaces existing CTA with new one if both exist
 *
 * @param {HTMLElement} container - The accordion container
 * @param {HTMLElement} group - The accordion group element
 */
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

/**
 * Ensures the accordion group wrapper structure exists.
 *
 * - Creates list-group wrapper for accordion items if missing
 * - Creates media-group wrapper for shared media if missing
 * - Moves existing wrappers into the group structure
 * - Ensures CTA is properly set up in the group
 *
 * @param {HTMLElement} block - The accordion block element
 * @returns {Object|null} Object with container, group, and mediaGroup elements
 */
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
/**
 * Detects sub-item rows in compact markup variant.
 *
 * - Filters rows starting from index 7 (after top-level config)
 * - Requires at least 5 cells per row for valid sub-items
 * - Used for nested accordion structures
 *
 * @param {HTMLElement} block - The accordion block element
 * @returns {HTMLElement[]} Array of sub-item row elements
 */
const detectSubItemRows = (block) => [...block.children].filter((row, index) => index >= 7 && row.children.length >= 5);

/**
 * Ensures a nested wrapper exists for sub-item rows.
 *
 * - Creates the wrapper div if it doesn't exist
 * - Inserts the wrapper before the first sub-item row
 * - Moves all sub-item rows into the wrapper
 * - Returns the wrapper element
 *
 * @param {HTMLElement} block - The accordion block element
 * @param {HTMLElement[]} subItemRows - Array of sub-item row elements
 * @returns {HTMLElement|null} The nested wrapper element
 */
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

/**
 * Ensures a top content wrapper exists for accordion rows.
 *
 * - Creates the wrapper div if it doesn't exist
 * - Inserts the wrapper before the first row
 * - Moves all connected rows into the wrapper
 * - Returns the wrapper element
 *
 * @param {HTMLElement} block - The accordion block element
 * @param {HTMLElement[]} rows - Array of row elements to wrap
 * @returns {HTMLElement|null} The content wrapper element
 */
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

/**
 * Converts a table cell to a field value object.
 *
 * - Extracts both HTML and text content
 * - Trims whitespace from both values
 * - Returns empty strings if cell is null
 *
 * @param {HTMLElement} cell - The table cell element
 * @returns {Object} Object with html and text properties
 */
const toFieldValue = (cell) => {
  if (!cell) return { html: '', text: '' };
  return {
    html: cell.innerHTML?.trim() || '',
    text: cell.textContent?.trim() || '',
  };
};

/**
 * Parses sub-item configuration from a compact row.
 *
 * - Builds configs using different field order patterns
 * - Handles legacy and parent color variants
 * - Scores configs by field completeness
 * - Returns the best matching configuration
 *
 * @param {HTMLElement} row - The compact row element
 * @returns {Object|null} The parsed sub-item configuration
 */
const parseSubItemFromCompactRow = (row) => {
  const cells = [...row.children];
  if (cells.length < 5) return null;
  const buildConfigByOrder = (fieldOrder) => {
    const config = {};
    fieldOrder.forEach((field, index) => {
      const value = toFieldValue(cells[index]);
      if (value.html || value.text) {
        config[field] = value;
      }
    });
    return config;
  };

  const scoreConfig = (config) => [
    'subItemTitleRichtext',
    'subItemSubtitleRichtext',
    'subItemInfoRichtext',
    'subItemMediaBlockContent',
    'subItemTitleFontColor',
    'subItemSubtitleFontColor',
    'subItemInfoFontColor',
  ].filter((field) => config[field]?.html || config[field]?.text).length;

  const primaryConfig = buildConfigByOrder(SUBITEM_FIELD_ORDER);
  const legacyConfig = buildConfigByOrder(SUBITEM_FIELD_ORDER_LEGACY);
  const withParentColorConfig = buildConfigByOrder(SUBITEM_FIELD_ORDER_WITH_PARENT_COLOR);

  // Deterministic mapping for authored compact rows:
  // 0..3: nested content, 4: parent color, 5..7: nested colors.
  if (cells.length >= 8) {
    const fifthCellValue = toFieldValue(cells[4]);
    const candidate = fifthCellValue.text;
    if (isLikelyColorToken(candidate)) {
      return withParentColorConfig;
    }
  }

  const configs = [primaryConfig, withParentColorConfig, legacyConfig];
  return configs.reduce((best, candidate) => (
    scoreConfig(candidate) > scoreConfig(best) ? candidate : best
  ), configs[0]);
};

/**
 * Resolves a fragment URL to a full path.
 *
 * - Returns absolute URLs unchanged
 * - Resolves relative paths using page base path
 * - Handles AEM author environment path adjustments
 * - Constructs full URLs for relative fragments
 *
 * @param {string} fragmentUrl - The fragment URL to resolve
 * @returns {string} The resolved full path
 */
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

/**
 * Extracts plain text path from HTML content.
 *
 * - Creates a temporary div to parse HTML
 * - Returns the text content trimmed
 * - Returns empty string if no HTML provided
 *
 * @param {string} html - The HTML content to extract from
 * @returns {string} The extracted text path
 */
const extractPathFromHtml = (html) => {
  if (!html) return '';
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  return wrapper.textContent?.trim() || '';
};

/**
 * Checks if a value is likely a fragment path.
 *
 * - Validates string input and trims whitespace
 * - Recognizes relative paths (./), absolute paths (/), and URLs (http)
 * - Returns false for empty or non-string inputs
 *
 * @param {string} value - The value to check
 * @returns {boolean} True if the value appears to be a path
 */
const isLikelyFragmentPath = (value) => {
  if (!value || typeof value !== 'string') return false;
  const path = value.trim();
  return path.startsWith('./') || path.startsWith('/') || path.startsWith('http');
};

/**
 * Gets a likely path from a table cell.
 *
 * - Extracts both text and HTML content from the cell
 * - Checks both for valid path patterns
 * - Returns the first valid path found or empty string
 *
 * @param {HTMLElement} cell - The table cell element
 * @returns {string} The extracted path or empty string
 */
const getLikelyPathFromCell = (cell) => {
  const value = toFieldValue(cell);
  return [value.text, extractPathFromHtml(value.html)].find(isLikelyFragmentPath) || '';
};

/**
 * Resolves cell indexes for sub-item content.
 *
 * - Finds the media cell by detecting path content
 * - Calculates relative positions for header, subtitle, info
 * - Provides fallback positioning if media detection fails
 * - Returns an object with index mappings
 *
 * @param {HTMLElement[]} cells - Array of cell elements
 * @returns {Object} Object with header, subtitle, info, and media indexes
 */
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

/**
 * Makes an element an interactive accordion trigger.
 *
 * - Sets ARIA attributes for accessibility
 * - Handles click and keyboard events (Enter/Space)
 * - Manages focus when opening panels
 * - Calls the provided toggle callback
 *
 * @param {HTMLElement} el - The element to make interactive
 * @param {Function} onToggle - Callback function called with new expanded state
 * @param {boolean} initialOpen - Initial expanded state
 */
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

    // Focus management: If opening, focus first content element
    if (next) {
      requestAnimationFrame(() => {
        const panel = el.closest('.feature-accordion-item__entry')
          ?.querySelector('.feature-accordion-item__panel-row');
        if (panel) {
          const focusable = panel.querySelector('a, button, [tabindex]');
          if (focusable) {
            focusable.focus();
          } else {
            panel.setAttribute('tabindex', '-1');
            panel.focus();
          }
        }
      });
    }
  };

  el.addEventListener('click', handler);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  });
};

/**
 * Animates a row's expand/collapse with staggered timing.
 *
 * - Supports immediate state changes without animation
 * - Uses max-height and opacity transitions
 * - Applies staggered delays for sequential animations
 * - Manages animation state to prevent conflicts
 *
 * @param {HTMLElement} row - The row element to animate
 * @param {boolean} open - Whether to expand or collapse
 * @param {boolean} immediate - Skip animation if true
 * @param {number} index - Position in animation sequence
 * @param {number} total - Total number of rows animating
 */
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
  const pendingTimer = nestedExpandTimerByBlock.get(entry);
  if (pendingTimer) {
    window.clearTimeout(pendingTimer);
    nestedExpandTimerByBlock.delete(entry);
  }
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

  // Add aria-live for status updates
  if (!target.hasAttribute('aria-live')) {
    target.setAttribute('aria-live', 'polite');
    target.setAttribute('aria-atomic', 'true');
  }
  target.setAttribute('aria-busy', 'true');

  target.classList.remove('is-media-enter');
  target.classList.add('is-media-switching');
  target.innerHTML = '';

  if (fragment instanceof HTMLTemplateElement) {
    target.append(fragment.content.cloneNode(true));
  } else if (fragment?.childNodes?.length) {
    target.append(...fragment.childNodes);
  } else if (fallbackHtml) {
    // Sanitize HTML content to prevent XSS
    if (window.DOMPurify) {
      target.innerHTML = window.DOMPurify.sanitize(fallbackHtml);
    } else {
      // Fallback: create wrapper to safely handle content
      const wrapper = document.createElement('div');
      wrapper.textContent = fallbackHtml;
      target.append(wrapper);
      // eslint-disable-next-line no-console
      console.warn('DOMPurify not available - content rendered as text only');
    }
  }

  // Force style recalc so transition class restarts reliably.
  // eslint-disable-next-line no-unused-expressions
  target.offsetHeight;
  target.classList.add('is-media-enter');
  target.classList.remove('is-media-switching');

  // Clear busy state when rendering completes
  requestAnimationFrame(() => {
    target.setAttribute('aria-busy', 'false');
  });
};

const activateMediaGroupSlot = (slot) => {
  if (!slot || !slot.parentElement) return;
  const mediaGroup = slot.parentElement;
  const slots = [...mediaGroup.querySelectorAll(':scope > .feature-accordion-media-slot')];
  slots.forEach((candidate) => {
    const isActive = candidate === slot;
    candidate.hidden = false;
    candidate.style.display = '';
    candidate.classList.toggle('is-active', isActive);
    candidate.setAttribute('aria-hidden', isActive ? 'false' : 'true');
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
        state.groupSlot.setAttribute('aria-hidden', 'true');
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

const clearScheduledNestedExpand = (block) => {
  const timer = nestedExpandTimerByBlock.get(block);
  if (!timer) return;
  window.clearTimeout(timer);
  nestedExpandTimerByBlock.delete(block);
};

const scheduleExpandFirstNested = (block) => {
  if (!block) return;
  clearScheduledNestedExpand(block);
  const timer = window.setTimeout(() => {
    nestedExpandTimerByBlock.delete(block);
    const topTrigger = block.querySelector('.feature-accordion-item__trigger');
    if (topTrigger?.getAttribute('aria-expanded') !== 'true') return;
    expandFirstNested(block);
  }, ROW_ANIMATION_MS + 80);
  nestedExpandTimerByBlock.set(block, timer);
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

/**
 * Decorates a single accordion item block with all its functionality.
 * @param {HTMLElement} block - The accordion item block
 * @param {Object} scaffold - The section scaffold containing mediaGroup
 * @param {Array} itemsInScope - All accordion items in this section
 * @param {Boolean} isFirstAccordionItem - Whether this is the first item
 */
const decorateAccordionItem = async (block, scaffold, itemsInScope, isFirstAccordionItem) => {
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
  const topContentWrapper = ensureTopContentWrapper(block, [titleRow, subtitleRow, infoRow, mediaRow]);

  // Create wrapper for subtitle and info rows
  const descriptionWrapper = document.createElement('div');
  descriptionWrapper.classList.add('feature-accordion-item__description');
  let hasDescriptionContent = false;

  if (subtitleRow?.isConnected) {
    descriptionWrapper.appendChild(subtitleRow);
    hasDescriptionContent = true;
  }
  if (infoRow?.isConnected) {
    descriptionWrapper.appendChild(infoRow);
    hasDescriptionContent = true;
  }

  if (hasDescriptionContent && topContentWrapper) {
    if (titleRow?.isConnected) {
      titleRow.parentElement?.insertBefore(descriptionWrapper, titleRow.nextSibling);
    } else {
      topContentWrapper.appendChild(descriptionWrapper);
    }
  }

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
    if (!isOpen) {
      clearScheduledNestedExpand(block);
    }
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
      scheduleExpandFirstNested(block);
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
};

export default async function decorate(block) {
  try {
    bindDelayedMediaListener();
    bindMediaControlDelegation();
    const scaffold = ensureAccordionGroupWrapper(block);

    // Get all accordion item blocks within this section
    // Query anywhere in the section since items are wrapped in list-group
    const itemBlocks = [...block.querySelectorAll('.feature-accordion-item[data-block-name="feature-accordion-item"]')];
    if (!itemBlocks.length) return;

    // Decorate each accordion item
    await Promise.all(itemBlocks.map((itemBlock, index) => {
      const isFirst = index === 0;
      return decorateAccordionItem(itemBlock, scaffold, itemBlocks, isFirst);
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating feature-accordion block:', error);
    block.innerHTML = '<div class="error-message">Failed to load feature-accordion block</div>';
  }
}
