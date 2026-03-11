import {
  getBlockConfigs,
  getFieldValue,
  // getProductLine,
  isAuthorUe,
} from '../../scripts/utils.js';
// import { loadAnime } from '../../scripts/scripts.js';

// ── Constants ─────────────────────────────────────────────────
const DEFAULT_CONFIG = {};

/** Font-family prefix per product line */
// const PRODUCT_FONT_PREFIX = {
//   rog: 'tg-bd',
//   tuf: 'dp-cb',
//   proart: 'tt-bd',
//   asus: 'tt-bd',
// };

/** Base viewport heights used to compute minimum scroll container height */
// const BASE_VIEWPORT_HEIGHT = { D: 1024, T: 768, M: 736 };

/** Default font sizes when no value is configured */
// const DEFAULT_FONT_SIZE = { D: '96', T: '64', M: '40' };

/** Config key mapping for font size per device */
// const FONT_SIZE_KEY = { D: 'fontDesktop', T: 'fontTablet', M: 'fontMobile' };

/** Config key mapping for text max-width per device */
// const MAX_WIDTH_KEY = { D: 'textMaxWidthD', T: 'textMaxWidthT', M: 'textMaxWidthM' };

// ── Scroll animation timing ───────────────────────────────────
// const ANIMATION = {
//   IMG_DURATION: 400,
//   TEXT_DURATION: 300,
//   TEXT_OFFSET: 250,
// };

// ── Helpers ───────────────────────────────────────────────────

/**
 * Get the configured font size for a device, falling back to defaults.
 * @param {'D'|'T'|'M'} device
 * @param {Function} v - field value accessor
 * @returns {string} numeric font size string, e.g. '96'
 */
// const getFontSize = (device, v) => v(FONT_SIZE_KEY[device], 'text') || DEFAULT_FONT_SIZE[device];

/**
 * Get the configured text max-width for a device.
 * @param {'D'|'T'|'M'} device
 * @param {Function} v - field value accessor
 * @returns {string} e.g. '1260px' or ''
 */
// const getTextMaxWidth = (device, v) => {
//   const val = v(MAX_WIDTH_KEY[device], 'text');
//   return val ? `${val}px` : '';
// };

/**
 * Build RWD font class string based on current product line.
 * @param {string} dSize - desktop font size
 * @param {string} tSize - tablet font size
 * @param {string} mSize - mobile font size
 * @returns {string} e.g. 'tt-bd-96 tt-bd-64-md tt-bd-40-sm'
 */
// const getTextFontClass = (dSize, tSize, mSize) => {
//   const prefix = PRODUCT_FONT_PREFIX[getProductLine()] || PRODUCT_FONT_PREFIX.asus;
//   return `${prefix}-${dSize} ${prefix}-${tSize}-md ${prefix}-${mSize}-sm`;
// };

/**
 * Determine animation type based on whether an image is present.
 */
// const getAnimationType = (imageSrc) => (imageSrc ? 'type-1' : 'type-2');

// ── Render ─────────────────────────────────────────────────────

// const renderMediaHTML = (props) => {
//   const { imageSrc, text } = props;
//
//   const htmlImg = imageSrc ? `
//     <div class="absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 img-container">
//     </div>
//   ` : '';
//
//   const htmlText = text ? `
//     <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-container">
//     </div>
//   ` : '';
//
//   return htmlImg + htmlText;
// };

// ── Entry point ───────────────────────────────────────────────

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'faqs');
    const v = getFieldValue(config);
    const isUE = isAuthorUe();

    // const anime = await loadAnime();

    block.innerHTML = '';

    // --- Field values ---
    const colorGroup = v('colorGroup', 'text') || '';
    if (colorGroup) block.classList.add(colorGroup);

    // --- Layout ---
    if (isUE) {
      // UE-specific layout adjustments
    }

    block.innerHTML = `
      <div class="faqs-container">
      </div>
    `;

    // --- Animation ---
    if (!isUE) {
      // scroll animation setup
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating faqs: ', error);
    block.innerHTML = '<div class="error-message">Failed to load faqs block</div>';
  }
}
