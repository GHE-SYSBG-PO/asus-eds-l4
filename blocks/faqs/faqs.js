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
const renderPanelImg = (imgSrc) => `
    <div class="content-img-group">
      <img src="${imgSrc}" alt="">
    </div>
  `;

const renderItemHTML = (item, index) => {
  const num = index + 1;
  const title = item.title || '';
  const content = item.content || '';
  const imgSrc = item.imgSrc || '';
  const imgHTML = renderPanelImg(imgSrc);

  return `
    <div class="fold-item fold-item-${num}" data-index="${num}">
      <h3 class="content-title no-top-space ro-rg-20 small_ro-rg-18">
        <button type="button" class="wdga"
          id="footer_qa_fold_accordion_${num}" 
          data-galabel="Expand tab ${num}" data-eventname="qa_btn_${num}"
          aria-label="Expand ${title} tab" aria-controls="footer_qa_fold_accordion_group_${num}"
          aria-expanded="false" tabindex="0">${title}</button>
      </h3>
      <div class="accordion-group" id="footer_qa_fold_accordion_group_${num}" role="region" aria-labelledby="footer_qa_fold_accordion_${num}" aria-hidden="true">
        <div class="accordion-panel">
          <div class="content-info-group">
            <div class="content-info info-1 ro-rg-18 small_ro-rg-16">${content}</div>
          </div>
          ${imgHTML}
        </div>
      </div>
    </div>
  `;
};

const renderContainerHTML = (items = []) => `
    <div class="fold-outer-container">
      <div class="fold-control">
        <button type="button" class="fold-btn btn-showall wdga ro-rg-20" data-galabel="Show all" aria-label="Click to show all FAQ" data-eventname="faq_btn_show_all_clicked" tabindex="0">Show all</button>
        <div class="fold-btn-split"></div>
        <button type="button" class="fold-btn btn-collapseall wdga ro-rg-20" data-galabel="Collapse all" aria-label="Click to collapse all FAQ" data-eventname="faq_btn_collapse_all_clicked" tabindex="0">Collapse all</button>
      </div>
      <div class="fold-container">
        <div class="fold-items">
          ${items.map((item, index) => renderItemHTML(item, index)).join('')}
        </div>
      </div>
    </div>
  `;

// ── Interactions ──────────────────────────────────────────────

/**
 * Initializes FAQ accordion fold clicks and global show/collapse all buttons
 * @param {HTMLElement} block
 */
const initFAQInteractions = (block) => {
  const faqContainer = block.querySelector('.faqs-container');
  if (!faqContainer) return;

  const items = faqContainer.querySelectorAll('.fold-item');
  const showAllBtn = faqContainer.querySelector('.btn-showall');
  const collapseAllBtn = faqContainer.querySelector('.btn-collapseall');

  // Helper: update single item state
  const setItemState = (itemWrapper, isExpanded) => {
    const btn = itemWrapper.querySelector('button[aria-expanded]');
    const groupDiv = itemWrapper.querySelector('.accordion-group');

    if (isExpanded) {
      itemWrapper.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      groupDiv.setAttribute('aria-hidden', 'false');
      groupDiv.style.height = `${groupDiv.scrollHeight}px`; // Basic open height, may need SCSS transiton tuning
      groupDiv.querySelector('.accordion-panel').style.opacity = '1';
    } else {
      itemWrapper.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      groupDiv.setAttribute('aria-hidden', 'true');
      groupDiv.style.height = '0';
      groupDiv.querySelector('.accordion-panel').style.opacity = '0';
    }
  };

  // 1. Single item click toggle
  items.forEach((itemEl) => {
    itemEl.addEventListener('click', (e) => {
      // Prevent toggling if user is actually selecting text inside the content
      if (window.getSelection().toString().length > 0) return;

      const btn = itemEl.querySelector('.content-title button');
      if (!btn) return;

      // If click originated from the folded panel (which users want to use as a toggle too),
      // strictly triggering a click ensures the AEM GA logic catches the event on the button proxy.
      if (e.target !== btn && !btn.contains(e.target)) {
        btn.click(); // This will trigger the handler below
        return;
      }

      const isCurrentlyExpanded = btn.getAttribute('aria-expanded') === 'true';
      setItemState(itemEl, !isCurrentlyExpanded);
    });
  });

  // 2. Global buttons
  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
      items.forEach((itemEl) => setItemState(itemEl, true));
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      items.forEach((itemEl) => setItemState(itemEl, false));
    });
  }
};

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

    const containerHtml = renderContainerHTML(mockItems);

    block.innerHTML = `
      <div class="faqs-container">
        ${containerHtml}
      </div>
    `;

    // --- Animation ---
    if (!isUE) {
      // scroll animation setup
    }

    // --- Interactions ---
    initFAQInteractions(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating faqs: ', error);
    block.innerHTML = '<div class="error-message">Failed to load faqs block</div>';
  }
}
