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

const renderItemHTML = (item, index) => {
  const num = index + 1;
  const title = item.title || '';
  const content = item.content || '';
  return `
    <div class="fold_item fold_item-${num}" data-index="${num}">
      <div class="fold_group">
        <div class="fold_content fold_content-${num}">
          <div class="wd_content large_text-left medium_text-left small_text-left fold_content-wdcontent">
            <div class="content_title no-top-space ro-rg-20 small_ro-rg-18"
              id="footer_qa_fold_accordion_${num}" role="button"
              data-galabel="Expand tab ${num}" data-eventname="qa_btn_${num}"
              aria-label="Expand ${title} tab" aria-controls="footer_qa_fold_accordion_group_${num}"
              aria-expanded="false" aria-hidden="false" tabindex="0">${title}</div>
            <div class="accordion_group" id="footer_qa_fold_accordion_group_${num}" role="region" aria-labelledby="footer_qa_fold_accordion_${num}" aria-hidden="true">
              <div class="accordion_panel">
                <div class="content_info_group">
                  <div class="content_info info-1 ro-rg-18 small_ro-rg-16">${content}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const renderMediaHTML = (items = []) => `
    <div class="fold_outer-container">
      <div class="fold_control">
        <div class="fold_btn btn_showall wdga" role="button" data-galabel="Show all" aria-label="Click to show all FAQ" data-eventname="faq_btn_show_all_clicked" tabindex="0"><span class="ro-rg-20">Show all</span></div>
        <div class="fold_btn_split"></div>
        <div class="fold_btn btn_collapseall wdga" role="button" data-galabel="Collapse all" aria-label="Click to collapse all FAQ" data-eventname="faq_btn_collapse_all_clicked" tabindex="0"><span class="ro-rg-20">Collapse all</span></div>
      </div>
      <div class="fold_container">
        <div class="fold_items">
          ${items.map((item, index) => renderItemHTML(item, index)).join('')}
        </div>
      </div>
    </div>
  `;

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

    // TODO: Fetch items from block or UE config. Mocking data for now based on your content.
    const mockItems = [
      {
        title: 'What is an AI PC?',
        content: 'An AI PC, like the ASUS ExpertBook Ultra, is a business laptop powered by AI acceleration, which enhances productivity and efficiency through features like intelligent performance and AI-driven tasks, such as real-time translations and automated meeting summaries.',
      },
      {
        title: 'Is an AI PC better than a standard PC?',
        content: 'Yes, an AI PC is designed to offer superior performance with dedicated AI capabilities, making it better for tasks that require intelligent automation, enhanced productivity, and enterprise-grade security compared to a standard PC.',
      },
      {
        title: 'What laptop is best for business?',
        content: 'The ASUS ExpertBook Ultra is an ideal business laptop, offering a blend of powerful AI-driven performance, military-grade durability, advanced security features, and a lightweight design, making it perfect for professionals who need efficiency and mobility.',
      },
      {
        title: 'How much RAM is needed for a business laptop?',
        content: 'For optimal business performance, a business laptop like the ASUS ExpertBook Ultra can support up to 64 GB of DDR5x memory, ensuring smooth multitasking and handling of demanding tasks.',
      },
      {
        title: 'What laptop do entrepreneurs use?',
        content: 'Entrepreneurs often choose high-performance laptops like the ASUS ExpertBook Ultra, which combines advanced AI capabilities, durability, and enterprise-grade security to meet the diverse needs of modern business professionals.',
      },
    ];

    const containerHtml = renderMediaHTML(mockItems);

    block.innerHTML = `
      <div class="faqs-container">
        ${containerHtml}
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
