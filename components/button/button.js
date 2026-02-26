import { loadCSS } from '../../scripts/aem.js';

/**
 * Build border-radius styles - only return if configured
 */
export const getRadiusStyle = (tl, tr, br, bl) => {
  // If none are configured, return empty (use CSS default)
  if (!tl && !tr && !br && !bl) return '';
  const radiuses = [];
  if (tl) radiuses.push(`${tl}px 0 0 0`);
  if (tr) radiuses.push(`0 ${tr}px 0 0`);
  if (br) radiuses.push(`0 0 ${br}px 0`);
  if (bl) radiuses.push(`0 0 0 ${bl}px`);
  if (radiuses.length === 4) {
    return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  }
  if (radiuses.length > 0) {
    return `border-radius: ${radiuses.join(' / ')};`;
  }
  return '';
};

export function prefixHex(colors) {
  if (typeof colors === 'object') {
    return colors.filter((c) => c).map((c) => `#${c}`);
  }
  return colors ? `#${colors}` : '';
}

/**
 * Build close button HTML
 * @param {Function} v - Configuration getter function
 * @returns {string} HTML string for the close button
 */
export const buildCloseButtonHtml = (v) => {
  loadCSS(`${window.hlx.codeBasePath}/components/button/button.css`);
  const gBtnStyle = v('gBtnStyle', 'text') || 'default';
  // Default close button
  if (gBtnStyle !== 'customized') {
    return `
      <button class="g-button">
        <span>Close</span>
      </button>
    `;
  }
  // Custom close button - apply full styles
  const label = v('gBtnLabel', 'text') || 'Close';
  const fontDesktop = v('gBtnFontDesktop', 'text') || 'ro-md-16';
  const fontMobile = v('gBtnFontM', 'text') || 'ro-md-14';
  const fontColorDefault = prefixHex(v('gBtnFontColorDefault', 'text') || '');
  const fontColorHover = prefixHex(v('gBtnFontColorHover', 'text') || '');
  const fontColorActive = prefixHex(v('gBtnFontColorActive', 'text') || '');
  // Background colors (support gradient)
  const bgColorDefaultArr = prefixHex((v('gBtnbgColorDefault', 'text') || '').split(','));
  const bgColorDefault = bgColorDefaultArr[0] || '';
  const bgColorDefault2 = bgColorDefaultArr[1] || '';

  const bgColorHoverArr = prefixHex((v('gBtnbgColorHover', 'text') || '').split(','));
  const bgColorHover = bgColorHoverArr[0] || '';
  const bgColorHover2 = bgColorHoverArr[1] || '';

  const bgColorActiveArr = prefixHex((v('gBtnbgColorHover', 'text') || '').split(','));
  const bgColorActive = bgColorActiveArr[0] || '';
  const bgColorActive2 = bgColorActiveArr[1] || '';
  // Border radius settings
  const radiusTL = v('gBtnContainerRadiusTL', 'text') || '';
  const radiusTR = v('gBtnContainerRadiusTR', 'text') || '';
  const radiusBR = v('gBtnContainerRadiusBR', 'text') || '';
  const radiusBL = v('gBtnContainerRadiusBL', 'text') || '';
  // Border settings
  const gBtnBorderWidth = v('gBtnBorderWidth', 'text') || '';
  const gBtnBorderColor = prefixHex(v('gBtnBorderColor', 'text') || '');
  // Build inline styles
  let inlineStyle = '';
  // Default background color CSS variables
  if (bgColorDefault) {
    if (bgColorDefault2) {
      // Gradient - when two colors are configured
      inlineStyle += `--btn-bg-default-image: linear-gradient(270deg, ${bgColorDefault} 0%, ${bgColorDefault2} 100%);`;
    } else {
      // Solid - only one color configured
      inlineStyle += `--btn-bg-default: ${bgColorDefault};`;
      inlineStyle += '--btn-bg-default-image: none;';
    }
  }
  // Hover background color CSS variables
  if (bgColorHover) {
    if (bgColorHover2) {
      // Gradient - when two colors are configured
      inlineStyle += `--btn-bg-hover-image: linear-gradient(270deg, ${bgColorHover} 0%, ${bgColorHover2} 100%);`;
    } else {
      // Solid - only one color configured
      inlineStyle += `--btn-bg-hover: ${bgColorHover};`;
      inlineStyle += '--btn-bg-hover-image: none;';
    }
  }
  // Active background color CSS variables
  if (bgColorActive) {
    if (bgColorActive2) {
      // Gradient - when two colors are configured
      inlineStyle += `--btn-bg-active-image: linear-gradient(270deg, ${bgColorActive} 0%, ${bgColorActive2} 100%);`;
    } else {
      // Solid - only one color configured
      inlineStyle += `--btn-bg-active: ${bgColorActive};`;
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
  const radiusStyle = getRadiusStyle(radiusTL, radiusTR, radiusBR, radiusBL);
  if (radiusStyle) {
    inlineStyle += radiusStyle;
  }

  // Container border variables
  if (gBtnBorderColor) {
    inlineStyle += `--container-border-color: ${gBtnBorderColor};`;
  }
  if (gBtnBorderWidth) {
    inlineStyle += `--container-border-width: ${gBtnBorderWidth}px;`;
  }
  // Build custom close button HTML
  return `
    <button class="g-button ${fontDesktop} ${fontMobile}" style="${inlineStyle}">
      <span>${label}</span>
    </button>
  `;
};
