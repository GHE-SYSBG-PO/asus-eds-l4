import { loadCSS } from '../../scripts/aem.js';

const DEFAULT_CONFIG = {
  // Basic configuration
  gBtnStyleLayout: '1',
  gBtnLabel: 'Button',
};

export const getRadiusStyle = (tl, tr, br, bl) => {
  // If none are configured, return empty (use CSS default)
  if (tl === '' && tr === '' && br === '' && bl === '') return '';
  const radiuses = [];
  if (tl !== '') radiuses.push(`border-top-left-radius:${tl}px`);
  if (tr !== '') radiuses.push(`border-top-right-radius:${tr}px`);
  if (br !== '') radiuses.push(`border-bottom-right-radius:${br}px`);
  if (bl !== '') radiuses.push(`border-bottom-left-radius:${bl}px`);
  if (radiuses.length === 4) {
    return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  }
  if (radiuses.length > 0) {
    return `${radiuses.join(';')};`;
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
 * Determine whether icon is supported
 */
const supportsIcon = (style) => ['2', '3', '5', '6'].includes(style);

/**
 * Determine if it is a filled style (requires background color)
 */
const isFilledStyle = (style) => ['1', '2', '3'].includes(style);

export function buildCloseButtonHtml(v) {
  loadCSS(`${window.hlx.codeBasePath}/components/button/button.css`);
  // Get basic configuration
  const style = String(v('gBtnStyleLayout', 'text') || DEFAULT_CONFIG.gBtnStyleLayout);
  const label = v('gBtnLabel', 'text') || DEFAULT_CONFIG.gBtnLabel;
  // Get container configuration - only use if there is a value

  const gBtnContainerBgColorDefaultArr = prefixHex((v('gBtnContainerBgColorDefault', 'text')).split(','));
  const gBtnContainerBgColorDefault = gBtnContainerBgColorDefaultArr[0];
  const gBtnContainerBgColorDefault2 = gBtnContainerBgColorDefaultArr[1];

  const gBtnContainerBgColorHoverArr = prefixHex((v('gBtnContainerBgColorHover', 'text')).split(','));
  const gBtnContainerBgColorHover = gBtnContainerBgColorHoverArr[0];
  const gBtnContainerBgColorHover2 = gBtnContainerBgColorHoverArr[1];

  const gBtnContainerBgColorActiveArr = prefixHex((v('gBtnContainerBgColorActive', 'text')).split(','));
  const gBtnContainerBgColorActive = gBtnContainerBgColorActiveArr[0];
  const gBtnContainerBgColorActive2 = gBtnContainerBgColorActiveArr[1];

  const gBtnContainerRadiusTL = v('gBtnContainerRadiusTL', 'text');
  const gBtnContainerRadiusTR = v('gBtnContainerRadiusTR', 'text');
  const gBtnContainerRadiusBR = v('gBtnContainerRadiusBR', 'text');
  const gBtnContainerRadiusBL = v('gBtnContainerRadiusBL', 'text');
  const containerBorderWidth = v('gBtnBorderWidth', 'text');
  const containerBorderColor = prefixHex(v('gBtnBorderColor', 'text'));
  // Get font configuration
  const gBtnFontDesktop = v('gBtnFontDesktop', 'text') || DEFAULT_CONFIG.gBtnFontDesktop;
  const gBtnFontMobile = v('gBtnFontMobile', 'text') || DEFAULT_CONFIG.gBtnFontMobile;
  const gBtnFontColorDefault = prefixHex(v('gBtnFontColorDefault', 'text'));
  const gBtnFontColorHover = prefixHex(v('gBtnFontColorHover', 'text'));
  const gBtnFontColorActive = prefixHex(v('gBtnFontColorActive', 'text'));
  // Get icon configuration
  const gBtnIconStyle = v('gBtnIconStyle', 'text') || DEFAULT_CONFIG.gBtnIconStyle;
  // Determine style characteristics
  const filled = isFilledStyle(style);

  // Build inline styles - configure all colors via CSS variables
  let inlineStyle = '';
  // Default background color CSS variables
  if (gBtnContainerBgColorDefault) {
    if (gBtnContainerBgColorDefault2) {
      // Gradient - when two colors are configured
      inlineStyle += `--g-btn-bg-default-image: linear-gradient(270deg, ${gBtnContainerBgColorDefault} 0%, ${gBtnContainerBgColorDefault2} 100%);`;
    } else {
      // Solid - only one color configured
      inlineStyle += `--g-btn-bg-default: ${gBtnContainerBgColorDefault};`;
      inlineStyle += '--g-btn-bg-default-image: none;';
    }
  }
  // Hover background color CSS variables
  if (gBtnContainerBgColorHover) {
    if (gBtnContainerBgColorHover2) {
      // Gradient - when two colors are configured
      inlineStyle += `--g-btn-bg-hover-image: linear-gradient(270deg, ${gBtnContainerBgColorHover} 0%, ${gBtnContainerBgColorHover2} 100%);`;
    } else {
      // Solid - only one color configured
      inlineStyle += `--g-btn-bg-hover: ${gBtnContainerBgColorHover};`;
      inlineStyle += '--g-btn-bg-hover-image: none;';
    }
  }
  // Active background color CSS variables
  if (gBtnContainerBgColorActive) {
    if (gBtnContainerBgColorActive2) {
      // Gradient - when two colors are configured
      inlineStyle += `--g-btn-bg-active-image: linear-gradient(270deg, ${gBtnContainerBgColorActive} 0%, ${gBtnContainerBgColorActive2} 100%);`;
    } else {
      // Solid - only one color configured
      inlineStyle += `--g-btn-bg-active: ${gBtnContainerBgColorActive};`;
      inlineStyle += '--g-btn-bg-active-image: none;';
    }
  }
  // Font color CSS variables
  if (gBtnFontColorDefault) {
    inlineStyle += `--g-btn-color-default: ${gBtnFontColorDefault};`;
  }
  if (gBtnFontColorHover) {
    inlineStyle += `--g-btn-color-hover: ${gBtnFontColorHover};`;
  }
  if (gBtnFontColorActive) {
    inlineStyle += `--g-btn-color-active: ${gBtnFontColorActive};`;
  }
  // Custom border radius
  // eslint-disable-next-line max-len
  const radiusStyle = getRadiusStyle(gBtnContainerRadiusTL, gBtnContainerRadiusTR, gBtnContainerRadiusBR, gBtnContainerRadiusBL);
  if (radiusStyle) {
    inlineStyle += radiusStyle;
  }

  // Container border variables
  if (filled) {
    if (containerBorderColor) {
      inlineStyle += `--g-btn-container-border-color: ${containerBorderColor};`;
    }
    if (containerBorderWidth) {
      inlineStyle += `--g-btn-container-border-width: ${containerBorderWidth}px;`;
    }
  }
  // Build icon HTML
  let iconHtml = '';
  if (supportsIcon(style)) {
    const gBtnIconBgColorDefault = prefixHex(v('gBtnIconBgColorDefault', 'text'));
    const gBtnIconBgColorHover = prefixHex(v('gBtnIconBgColorHover', 'text'));
    const gBtnIconBgColorActive = prefixHex(v('gBtnIconBgColorActive', 'text'));
    const gBtnIconColor = prefixHex(v('gBtnIconColor', 'text'));
    let iconBgStyle = '';
    if (gBtnIconBgColorDefault) iconBgStyle += `--g-btn-icon-bg-default: ${gBtnIconBgColorDefault};`;
    if (gBtnIconBgColorHover) iconBgStyle += `--g-btn-icon-bg-hover: ${gBtnIconBgColorHover};`;
    if (gBtnIconBgColorActive) iconBgStyle += `--g-btn-icon-bg-active: ${gBtnIconBgColorActive};`;
    if (gBtnIconColor) iconBgStyle += `--g-btn-icon-color: ${gBtnIconColor};`;
    if (gBtnIconStyle === 'svg' || gBtnIconStyle === '') {
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
               data-bg-default="${gBtnIconBgColorDefault}"
               data-bg-hover="${gBtnIconBgColorHover}"
               data-bg-active="${gBtnIconBgColorActive}">
            <svg viewBox="0 0 24 24" class="btn-icon-svg">
              <defs>
                ${getSvgLinearHtml('icon-filled-default', 'var(--g-btn-bg-d-start)', 'var(--g-btn-bg-d-end)')}
                ${getSvgLinearHtml('icon-filled-hover-active', 'var(--g-btn-bg-h-a-start)', 'var(--g-btn-bg-h-a-end)')}
                ${getSvgLinearHtml('icon-outline-default', 'var(--g-btn-icon-d)', 'var(--g-btn-icon-d)')}
                ${getSvgLinearHtml('icon-outline-hover', 'var(--g-btn-bg-d-start)', 'var(--g-btn-bg-d-end)')}
                ${getSvgLinearHtml('icon-outline-active', 'var(--g-btn-bg-h-a-start)', 'var(--g-btn-bg-h-a-end)')}
              </defs>
              <path d="${iconPath}" ${gBtnIconColor ? 'fill="var(--g-btn-icon-color) !important"' : ''}/>
            </svg>
          </div>
        `;
    } else if (gBtnIconStyle === 'png') {
      const gBtnIconAssetDefault = v('gBtnIconAssetDefault', 'text');
      const gBtnIconAssetHover = v('gBtnIconAssetHover', 'text');
      const gBtnIconAssetActive = v('gBtnIconAssetActive', 'text');
      iconHtml = `
          <div class="btn-icon-wrapper btn-icon-png flex items-center justify-center transition-all" style="${iconBgStyle}">
            <img src="${gBtnIconAssetDefault}" alt="icon" class="btn-icon-default object-cover"/>
            <img src="${gBtnIconAssetHover}" alt="icon hover" class="btn-icon-hover object-cover hidden"/>
            <img src="${gBtnIconAssetActive}" alt="icon active" class="btn-icon-active object-cover hidden"/>
          </div>
        `;
    }
  }
  // Build button HTML
  const buttonHtml = `
      <a
         class="g-button inline-flex items-center justify-center transition-all duration-300 cursor-pointer ${gBtnFontDesktop} ${gBtnFontMobile}"
         data-style="${style}"
         ${inlineStyle ? `style="${inlineStyle.trim()}"` : ''}
         data-filled="${filled}">
        <span class="btn-label">${label}</span>
        ${iconHtml}
      </a>
    `;
  return buttonHtml;
}
