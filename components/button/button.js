import { loadCSS } from '../../scripts/aem.js';

loadCSS(`${window.hlx.codeBasePath}/components/button/button.css`);
/**
 * 构建圆角样式 - 只在有配置时才返回
 */
export const getRadiusStyle = (tl, tr, br, bl) => {
  // 如果都没有配置，返回空（使用 CSS 默认值）
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

/**
 * 构建关闭按钮 HTML
 * @param {Function} v - 配置获取函数
 * @returns {string} 关闭按钮的 HTML 字符串
 */
export const buildCloseButtonHtml = (v) => {
  const gBtnStyle = v('gBtnStyle', 'text') || 'default';
  // 默认关闭按钮
  if (gBtnStyle !== 'customized') {
    return `
      <button class="g-button">
        <span>Close</span>
      </button>
    `;
  }

function prefixHex(arr) {
  return arr.filter(c=>c).map((c) => `#${c}`);
}


  // 自定义关闭按钮 - 应用完整样式
  const label = v('gBtnLabel', 'text') || 'Close';
  const fontDesktop = v('gBtnFontDesktop', 'text') || 'ro-md-16';
  const fontMobile = v('gBtnFontM', 'text') || 'ro-md-14';
  const fontColorDefault = v('gBtnFontColorDefault', 'text') || '#ffffff';
  const fontColorHover = v('gBtnFontColorHover', 'text') || '';
  const fontColorActive = v('gBtnFontColorActive', 'text') || '';
  // 背景颜色（支持渐变）
  const bgColorDefaultArr = prefixHex((v('gBtnbgColorDefault', 'text') || '').split(','));
  const bgColorDefault = bgColorDefaultArr[0] || '';
  const bgColorDefault2 = bgColorDefaultArr[1] || '';

  const bgColorHoverArr = prefixHex((v('gBtnbgColorHover', 'text') || '').split(','));
  const bgColorHover = bgColorHoverArr[0] || '';
  const bgColorHover2 = bgColorHoverArr[1] || '';

  const bgColorActiveArr = prefixHex((v('gBtnbgColorHover', 'text') || '').split(','));
  const bgColorActive = bgColorActiveArr[0] || '';
  const bgColorActive2 = bgColorActiveArr[1] || '';
  // 圆角设置
  const radiusTL = v('gBtnContainerRadiusTL', 'text') || '';
  const radiusTR = v('gBtnContainerRadiusTR', 'text') || '';
  const radiusBR = v('gBtnContainerRadiusBR', 'text') || '';
  const radiusBL = v('gBtnContainerRadiusBL', 'text') || '';
  // 边框设置
  const gBtnBorderWidth = v('gBtnBorderWidth', 'text') || '';
  const gBtnBorderColor = v('gBtnBorderColor', 'text') || '';
  // 构建内联样式
  let inlineStyle = '';
  // 默认背景色 CSS 变量
  if (bgColorDefault) {
    if (bgColorDefault2) {
      // 渐变 - 两个颜色都配置时
      inlineStyle += `--btn-bg-default-image: linear-gradient(270deg, ${bgColorDefault} 0%, ${bgColorDefault2} 100%);`;
    } else {
      // 纯色 - 只配置一个颜色
      inlineStyle += `--btn-bg-default: ${bgColorDefault};`;
      inlineStyle += '--btn-bg-default-image: none;';
    }
  }
  // Hover 背景色 CSS 变量
  if (bgColorHover) {
    if (bgColorHover2) {
      // 渐变 - 两个颜色都配置时
      inlineStyle += `--btn-bg-hover-image: linear-gradient(270deg, ${bgColorHover} 0%, ${bgColorHover2} 100%);`;
    } else {
      // 纯色 - 只配置一个颜色
      inlineStyle += `--btn-bg-hover: ${bgColorHover};`;
      inlineStyle += '--btn-bg-hover-image: none;';
    }
  }
  // Active 背景色 CSS 变量
  if (bgColorActive) {
    if (bgColorActive2) {
      // 渐变 - 两个颜色都配置时
      inlineStyle += `--btn-bg-active-image: linear-gradient(270deg, ${bgColorActive} 0%, ${bgColorActive2} 100%);`;
    } else {
      // 纯色 - 只配置一个颜色
      inlineStyle += `--btn-bg-active: ${bgColorActive};`;
      inlineStyle += '--btn-bg-active-image: none;';
    }
  }
  // 字体颜色 CSS 变量
  if (fontColorDefault) {
    inlineStyle += `--btn-color-default: ${fontColorDefault};`;
  }
  if (fontColorHover) {
    inlineStyle += `--btn-color-hover: ${fontColorHover};`;
  }
  if (fontColorActive) {
    inlineStyle += `--btn-color-active: ${fontColorActive};`;
  }
  // 圆角自定义
  // eslint-disable-next-line max-len
  const radiusStyle = getRadiusStyle(radiusTL, radiusTR, radiusBR, radiusBL);
  if (radiusStyle) {
    inlineStyle += radiusStyle;
  }

  // container边框变量
  if (gBtnBorderColor) {
    inlineStyle += `--container-border-color: ${gBtnBorderColor};`;
  }
  if (gBtnBorderWidth) {
    inlineStyle += `--container-border-width: ${gBtnBorderWidth}px;`;
  }
  // 构建自定义关闭按钮 HTML
  return `
    <button class="g-button ${fontDesktop} ${fontMobile}" style="${inlineStyle}">
      <span>${label}</span>
    </button>
  `;
};
