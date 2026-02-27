import { getBlockConfigs, getFieldValue, getProductLine } from '../../scripts/utils.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { openModal } from '../modal/modal.js';
import { getRadiusStyle, buildCloseButtonHtml, prefixHex } from '../../components/button/button.js';

const FONTS = {
  asus: {
    fontD: 'ro-md-18-sh-lg',
    fontT: 'ro-md-18-sh-lg',
    fontM: 'ro-md-16-sh-lg',
  },
  proart: {
    fontD: 'ro-md-18-sh-lg',
    fontT: 'ro-md-18-sh-lg',
    fontM: 'ro-md-16-sh-lg',
  },
  rog: {
    fontD: 'rc-bd-18-sh-lg',
    fontT: 'rc-bd-18-sh-lg',
    fontM: 'rc-bd-16-sh-lg',
  },
  tuf: {
    fontD: 'ro-md-18-sh-lg',
    fontT: 'ro-md-18-sh-lg',
    fontM: 'ro-md-16-sh-lg',
  },
};

const PRODUCT_LINE = getProductLine();

const DEFAULT_CONFIG = {
  // Basic configuration
  styleLayout: '1',
  label: 'Button',
  // Link configuration
  linkType: 'external',
  externalLink: '#',
  // Close button configuration
  gBtnStyleLayout: 'default',
  gBtnLabel: 'Close',
};

function decreaseFontSize(isSmaller, font, amount = 2) {
  return isSmaller ? font.replace(/(\d+)/, (match) => Number(match) - amount) : font;
}

// When style is 3 or 6, the font size should be reduced by 2 sizes, handled with JS.
const getDefaultFont = (style, fontD, fontT, fontM) => {
  const isSmaller = style === '3' || style === '6';
  const f = FONTS[PRODUCT_LINE];
  const d = decreaseFontSize(isSmaller, f.fontD);
  const t = decreaseFontSize(isSmaller, f.fontT);
  const m = decreaseFontSize(isSmaller, f.fontM);
  const fonts = [fontD || d, fontT || t, fontM || m];
  return fonts.join(' ');
};

/**
 * Determine whether icon is supported
 */
const supportsIcon = (style) => ['2', '3', '5', '6'].includes(style);

/**
 * Determine if it is a filled style (requires background color)
 */
const isFilledStyle = (style) => ['1', '2', '3'].includes(style);

/**
 * Handle Quick View functionality
 * @param {string} modalPath - Modal page path
 * @param {string} closeButtonHtml - Close button HTML
 */
async function handleQuickView(modalPath, closeButtonHtml) {
  // Open modal with the authored page, dialog ID, and classes
  await openModal(
    modalPath,
    true, // is modal
    'btn-inner-page', // dialog ID
    ['cmp-btn-inner-page'], // classes
    null,
    closeButtonHtml,
  );
}

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'btn');
    const v = getFieldValue(config);

    // Get basic configuration
    const style = String(v('styleLayout', 'text') || DEFAULT_CONFIG.styleLayout);
    const label = v('label', 'text') || DEFAULT_CONFIG.label;
    // Get container configuration - only use if there is a value

    const containerBgColorDefaultArr = prefixHex((v('containerBgColorDefault', 'text')).split(','));
    const containerBgColorDefault = containerBgColorDefaultArr[0];
    const containerBgColorDefault2 = containerBgColorDefaultArr[1];

    const containerBgColorHoverArr = prefixHex((v('containerBgColorHover', 'text')).split(','));
    const containerBgColorHover = containerBgColorHoverArr[0];
    const containerBgColorHover2 = containerBgColorHoverArr[1];

    const containerBgColorActiveArr = prefixHex((v('containerBgColorActive', 'text')).split(','));
    const containerBgColorActive = containerBgColorActiveArr[0];
    const containerBgColorActive2 = containerBgColorActiveArr[1];

    const containerRadiusTL = v('containerRadiusTL', 'text');
    const containerRadiusTR = v('containerRadiusTR', 'text');
    const containerRadiusBR = v('containerRadiusBR', 'text');
    const containerRadiusBL = v('containerRadiusBL', 'text');
    const containerBorderWidth = v('borderWidth', 'text');
    const containerBorderColor = prefixHex(v('borderColor', 'text'));
    // Get font configuration
    const fontD = v('fontD', 'text') || DEFAULT_CONFIG.fontD;
    const fontT = v('fontT', 'text') || DEFAULT_CONFIG.fontT;
    const fontM = v('fontM', 'text') || DEFAULT_CONFIG.fontM;
    const totalFonts = getDefaultFont(style, fontD, fontT, fontM);
    const fontColorDefault = prefixHex(v('fontColorDefault', 'text'));
    const fontColorHover = prefixHex(v('fontColorHover', 'text'));
    const fontColorActive = prefixHex(v('fontColorActive', 'text'));
    // Get link configuration
    const linkType = v('linkType', 'text') || DEFAULT_CONFIG.linkType;
    const externalLink = v('externalLink', 'text') || DEFAULT_CONFIG.externalLink;
    const innerPageLink = v('innerPageLink', 'text') || DEFAULT_CONFIG.innerPageLink;
    // Get icon configuration
    const iconStyle = v('iconStyle', 'text') || DEFAULT_CONFIG.iconStyle;
    // Determine style characteristics
    const filled = isFilledStyle(style);
    // Build button link
    let href = '';
    let isExternal = true;
    if (linkType === 'external' && externalLink) {
      href = externalLink;
      isExternal = true;
    } else if (linkType === 'inner' && innerPageLink) {
      href = '#';
      isExternal = false;
    }
    // Build inline styles - configure all colors via CSS variables
    let inlineStyle = '';
    // Default background color CSS variables
    if (containerBgColorDefault) {
      if (containerBgColorDefault2) {
        // Gradient - when two colors are configured
        inlineStyle += `--btn-bg-default-image: linear-gradient(270deg, ${containerBgColorDefault} 0%, ${containerBgColorDefault2} 100%);`;
      } else {
        // Solid - only one color configured
        inlineStyle += `--btn-bg-default: ${containerBgColorDefault};`;
        inlineStyle += '--btn-bg-default-image: none;';
      }
    }
    // Hover background color CSS variables
    if (containerBgColorHover) {
      if (containerBgColorHover2) {
        // Gradient - when two colors are configured
        inlineStyle += `--btn-bg-hover-image: linear-gradient(270deg, ${containerBgColorHover} 0%, ${containerBgColorHover2} 100%);`;
      } else {
        // Solid - only one color configured
        inlineStyle += `--btn-bg-hover: ${containerBgColorHover};`;
        inlineStyle += '--btn-bg-hover-image: none;';
      }
    }
    // Active background color CSS variables
    if (containerBgColorActive) {
      if (containerBgColorActive2) {
        // Gradient - when two colors are configured
        inlineStyle += `--btn-bg-active-image: linear-gradient(270deg, ${containerBgColorActive} 0%, ${containerBgColorActive2} 100%);`;
      } else {
        // Solid - only one color configured
        inlineStyle += `--btn-bg-active: ${containerBgColorActive};`;
        inlineStyle += '--btn-bg-active-image: none;';
      }
    }
    // Font color CSS variables
    if (fontColorDefault) {
      inlineStyle += `--btn-color-default: ${fontColorDefault};`;
    }
    if (fontColorHover) {
      inlineStyle += `--btn-color-hover: ${fontColorHover};`;
    }
    if (fontColorActive) {
      inlineStyle += `--btn-color-active: ${fontColorActive};`;
    }
    // Custom border radius
    // eslint-disable-next-line max-len
    const radiusStyle = getRadiusStyle(containerRadiusTL, containerRadiusTR, containerRadiusBR, containerRadiusBL);
    if (radiusStyle) {
      inlineStyle += radiusStyle;
    }

    // Container border variables
    if (filled) {
      if (containerBorderColor) {
        inlineStyle += `--btn-container-border-color: ${containerBorderColor};`;
      }
      if (containerBorderWidth) {
        inlineStyle += `--btn-container-border-width: ${containerBorderWidth}px;`;
      }
    }
    // Build icon HTML
    let iconHtml = '';
    if (supportsIcon(style)) {
      const iconBgColorDefault = prefixHex(v('iconBgColorDefault', 'text'));
      const iconBgColorHover = prefixHex(v('iconBgColorHover', 'text'));
      const iconBgColorActive = prefixHex(v('iconBgColorActive', 'text'));
      const iconColor = prefixHex(v('iconColor', 'text'));
      let iconBgStyle = '';
      if (iconBgColorDefault) iconBgStyle += `--btn-icon-bg-default: ${iconBgColorDefault};`;
      if (iconBgColorHover) iconBgStyle += `--btn-icon-bg-hover: ${iconBgColorHover};`;
      if (iconBgColorActive) iconBgStyle += `--btn-icon-bg-active: ${iconBgColorActive};`;
      if (iconColor) iconBgStyle += `--btn-icon-color: ${iconColor};`;
      if (iconStyle === 'svg' || iconStyle === '') {
        // Determine icon type
        let iconPath = '';
        if (filled) {
          // style=2 and style=3: plus icon
          iconPath = 'M11 19v-6h-6v-2h6V5h2v6h6v2h-6v6h-2z';
        } else {
          // style=5 and style=6: play icon
          iconPath = 'M8 5v14l11-7z';
        }

        const getSvgLinearHtml = (id, start, end) => `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${start}" />
                  <stop offset="100%" stop-color="${end}" />
                </linearGradient>`;

        iconHtml = `
          <div class="btn-icon-wrapper flex items-center justify-center transition-all"
               style="${iconBgStyle}"
               data-bg-default="${iconBgColorDefault}"
               data-bg-hover="${iconBgColorHover}"
               data-bg-active="${iconBgColorActive}">
            <svg viewBox="0 0 24 24" class="btn-icon-svg">
              <defs>
                ${getSvgLinearHtml('icon-filled-default', 'var(--btn-bg-d-start)', 'var(--btn-bg-d-end)')}
                ${getSvgLinearHtml('icon-filled-hover-active', 'var(--btn-bg-h-a-start)', 'var(--btn-bg-h-a-end)')}
                ${getSvgLinearHtml('icon-outline-default', 'var(--btn-icon-d)', 'var(--btn-icon-d)')}
                ${getSvgLinearHtml('icon-outline-hover', 'var(--btn-bg-d-start)', 'var(--btn-bg-d-end)')}
                ${getSvgLinearHtml('icon-outline-active', 'var(--btn-bg-h-a-start)', 'var(--btn-bg-h-a-end)')}
              </defs>
              <path d="${iconPath}" ${iconColor ? 'fill="var(--btn-icon-color) !important"' : ''}/>
            </svg>
          </div>
        `;
      } else if (iconStyle === 'png') {
        const iconAssetDefault = v('iconAssetDefault', 'text');
        const iconAssetHover = v('iconAssetHover', 'text');
        const iconAssetActive = v('iconAssetActive', 'text');
        iconHtml = `
          <div class="btn-icon-wrapper btn-icon-png flex items-center justify-center transition-all" style="${iconBgStyle}">
            <img src="${iconAssetDefault}" alt="icon" class="btn-icon-default object-cover"/>
            <img src="${iconAssetHover}" alt="icon hover" class="btn-icon-hover object-cover hidden"/>
            <img src="${iconAssetActive}" alt="icon active" class="btn-icon-active object-cover hidden"/>
          </div>
        `;
      }
    }
    // Build button HTML
    const buttonHtml = `
      <a href="${href}"
         class="btn-component inline-flex items-center justify-center transition-all duration-300 cursor-pointer ${totalFonts}"
         data-link-type="${linkType}"
         data-is-external="${isExternal}"
         data-style="${style}"
         ${inlineStyle ? `style="${inlineStyle.trim()}"` : ''}
         data-filled="${filled}">
        <span class="btn-label">${label}</span>
        ${iconHtml}
      </a>
    `;

    // Move AEM editor instrumentation attributes to the button element (must be before innerHTML modification)
    const oldBtnElement = block.querySelector('.btn-component');
    if (oldBtnElement) {
      moveInstrumentation(block, oldBtnElement);
    }

    block.innerHTML = buttonHtml;

    const btnElement = block.querySelector('.btn-component');
    if (btnElement) {
      // External link handling
      if (isExternal && href) {
        btnElement.setAttribute('target', '_blank');
        btnElement.setAttribute('rel', 'noopener noreferrer');
      }
      // Inner Page handling - call handleQuickView on click
      if (!isExternal && linkType === 'inner' && innerPageLink) {
        btnElement.addEventListener('click', (e) => {
          e.preventDefault();
          // Build close button HTML
          const closeButtonHtml = buildCloseButtonHtml(v);
          // Call handleQuickView method, passing modal path and close button HTML
          handleQuickView(innerPageLink, closeButtonHtml);
        });
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating btn block:', error);
    block.innerHTML = '<div class="error-message">Failed to load btn block</div>';
  }
}
