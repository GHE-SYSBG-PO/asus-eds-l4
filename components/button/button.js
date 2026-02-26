const DEFAULT_CONFIG = {
  // Basic configuration
  gBtnStyleLayout: '1',
  label: 'Button',
  // Container configuration - defaults to empty, controlled by CSS
  gBtnContainerBgColorDefault: '',
  gBtnContainerBgColorDefault2: '',
  gBtnContainerBgColorHover: '',
  gBtnContainerBgColorHover2: '',
  gBtnContainerBgColorActive: '',
  gBtnContainerBgColorActive2: '',
  gBtnContainerRadiusTL: '',
  gBtnContainerRadiusTR: '',
  gBtnContainerRadiusBR: '',
  gBtnContainerRadiusBL: '',
  gBtnBorderWidth: '',
  gBtnBorderColor: '',
  // Font configuration
  fontDesktop: '',
  fontMobile: '',
  fontColorDefault: '',
  fontColorHover: '',
  fontColorActive: '',

  // Close button configuration
  closeBtnStyle: 'default',
  closeBtnLabel: 'Close',
  closeBtnFontDesktop: '',
  closeBtnFontM: '',
  closeBtnFontColorDefault: '',
  closeBtnFontColorHover: '',
  closeBtnFontColorActive: '',
  closeBtnContainerBgColorDefault: '',
  closeBtnContainerBgColorDefault2: '',
  closeBtnContainerBgColorHover: '',
  closeBtnContainerBgColorHover2: '',
  closeBtnContainerBgColorActive: '',
  closeBtnContainerBgColorActive2: '',
  closeBtnContainerRadiusTL: '',
  closeBtnContainerRadiusTR: '',
  closeBtnContainerRadiusBR: '',
  closeBtnContainerRadiusBL: '',
  closeBtnBorderWidth: '',
  closeBtnBorderColor: '',
  // Icon configuration
  iconStyle: '',
  iconColor: '',
  iconBgColorDefault: '',
  iconBgColorHover: '',
  iconBgColorActive: '',
  iconAssetDefault: '',
  iconAssetHover: '',
  iconAssetActive: '',
};

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
 * Determine whether icon is supported
 */
const supportsIcon = (style) => ['2', '3', '5', '6'].includes(style);

/**
 * Determine if it is a filled style (requires background color)
 */
const isFilledStyle = (style) => ['1', '2', '3'].includes(style);

export function buildCloseButtonHtml(v) {
  // Get basic configuration
  const style = String(v('gBtnStyleLayout', 'text') || DEFAULT_CONFIG.gBtnStyleLayout);
  const label = v('label', 'text') || DEFAULT_CONFIG.label;
  // Get container configuration - only use if there is a value

  const gBtnContainerBgColorDefaultArr = prefixHex((v('gBtnContainerBgColorDefault', 'text') || '').split(','));
  const gBtnContainerBgColorDefault = gBtnContainerBgColorDefaultArr[0] || '';
  const gBtnContainerBgColorDefault2 = gBtnContainerBgColorDefaultArr[1] || '';

  const gBtnContainerBgColorHoverArr = prefixHex((v('gBtnContainerBgColorHover', 'text') || '').split(','));
  const gBtnContainerBgColorHover = gBtnContainerBgColorHoverArr[0] || '';
  const gBtnContainerBgColorHover2 = gBtnContainerBgColorHoverArr[1] || '';

  const gBtnContainerBgColorActiveArr = prefixHex((v('gBtnContainerBgColorActive', 'text') || '').split(','));
  const gBtnContainerBgColorActive = gBtnContainerBgColorActiveArr[0] || '';
  const gBtnContainerBgColorActive2 = gBtnContainerBgColorActiveArr[1] || '';

  const gBtnContainerRadiusTL = v('gBtnContainerRadiusTL', 'text') || '';
  const gBtnContainerRadiusTR = v('gBtnContainerRadiusTR', 'text') || '';
  const gBtnContainerRadiusBR = v('gBtnContainerRadiusBR', 'text') || '';
  const gBtnContainerRadiusBL = v('gBtnContainerRadiusBL', 'text') || '';
  const containerBorderWidth = v('gBtnBorderWidth', 'text') || '';
  const containerBorderColor = prefixHex(v('gBtnBorderColor', 'text') || '');
  // Get font configuration
  const fontDesktop = v('fontDesktop', 'text') || DEFAULT_CONFIG.fontDesktop;
  const fontMobile = v('fontMobile', 'text') || DEFAULT_CONFIG.fontMobile;
  const fontColorDefault = prefixHex(v('fontColorDefault', 'text') || '');
  const fontColorHover = prefixHex(v('fontColorHover', 'text') || '');
  const fontColorActive = prefixHex(v('fontColorActive', 'text') || '');
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
  if (fontColorDefault) {
    inlineStyle += `--g-btn-color-default: ${fontColorDefault};`;
  }
  if (fontColorHover) {
    inlineStyle += `--g-btn-color-hover: ${fontColorHover};`;
  }
  if (fontColorActive) {
    inlineStyle += `--g-btn-color-active: ${fontColorActive};`;
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
    const iconBgColorDefault = prefixHex(v('iconBgColorDefault', 'text') || '');
    const iconBgColorHover = prefixHex(v('iconBgColorHover', 'text') || '');
    const iconBgColorActive = prefixHex(v('iconBgColorActive', 'text') || '');
    const iconColor = prefixHex(v('iconColor', 'text') || '');
    let iconBgStyle = '';
    if (iconBgColorDefault) iconBgStyle += `--g-btn-icon-bg-default: ${iconBgColorDefault};`;
    if (iconBgColorHover) iconBgStyle += `--g-btn-icon-bg-hover: ${iconBgColorHover};`;
    if (iconBgColorActive) iconBgStyle += `--g-btn-icon-bg-active: ${iconBgColorActive};`;
    if (iconColor) iconBgStyle += `--g-btn-icon-color: ${iconColor};`;
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
                ${getSvgLinearHtml('icon-filled-default', 'var(--g-btn-bg-d-start)', 'var(--g-btn-bg-d-end)')}
                ${getSvgLinearHtml('icon-filled-hover-active', 'var(--g-btn-bg-h-a-start)', 'var(--g-btn-bg-h-a-end)')}
                ${getSvgLinearHtml('icon-outline-default', 'var(--g-btn-icon-d)', 'var(--g-btn-icon-d)')}
                ${getSvgLinearHtml('icon-outline-hover', 'var(--g-btn-bg-d-start)', 'var(--g-btn-bg-d-end)')}
                ${getSvgLinearHtml('icon-outline-active', 'var(--g-btn-bg-h-a-start)', 'var(--g-btn-bg-h-a-end)')}
              </defs>
              <path d="${iconPath}" ${iconColor ? 'fill="var(--g-btn-icon-color) !important"' : ''}/>
            </svg>
          </div>
        `;
    } else if (iconStyle === 'png') {
      const iconAssetDefault = v('iconAssetDefault', 'text') || '';
      const iconAssetHover = v('iconAssetHover', 'text') || '';
      const iconAssetActive = v('iconAssetActive', 'text') || '';
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
         class="g-button inline-flex items-center justify-center transition-all duration-300 cursor-pointer ${fontDesktop} ${fontMobile}"
         data-link-type="${linkType}"
         data-is-external="${isExternal}"
         data-style="${style}"
         ${inlineStyle ? `style="${inlineStyle.trim()}"` : ''}
         data-filled="${filled}">
        <span class="btn-label">${label}</span>
        ${iconHtml}
      </a>
    `;
  return buttonHtml;
}
