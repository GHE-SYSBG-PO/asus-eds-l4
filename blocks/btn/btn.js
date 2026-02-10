import { getBlockConfigs, getFieldValue } from '../../scripts/utils.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { openModal } from '../modal/modal.js';
import { getRadiusStyle, buildCloseButtonHtml } from '../../components/button/button.js';

const DEFAULT_CONFIG = {
  // 基础配置
  styleLayout: '1',
  label: 'Button',
  // 容器配置 - 默认为空，由 CSS 控制
  containerBgColorDefault: '',
  containerBgColorDefault2: '',
  containerBgColorHover: '',
  containerBgColorHover2: '',
  containerBgColorActive: '',
  containerBgColorActive2: '',
  containerRadiusTL: '',
  containerRadiusTR: '',
  containerRadiusBR: '',
  containerRadiusBL: '',
  borderWidth: '',
  borderColor: '',
  // 字体配置
  fontDesktop: '',
  fontMobile: '',
  fontColorDefault: '',
  fontColorHover: '',
  fontColorActive: '',
  // 链接配置
  linkType: 'external',
  externalLink: '#',
  innerPageLink: '',

  // Close Btn 配置
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
  // 图标配置
  iconStyle: '',
  iconColor: '',
  iconBgColorDefault: '',
  iconBgColorHover: '',
  iconBgColorActive: '',
  iconAssetDefault: '',
  iconAssetHover: '',
  iconAssetActive: '',
};

/**
 * 判断是否支持图标
 */
const supportsIcon = (style) => ['2', '3', '5', '6'].includes(style);

/**
 * 判断是否为填充样式（需要背景色）
 */
const isFilledStyle = (style) => ['1', '2', '3'].includes(style);

/**
 * 处理 Quick View 功能
 * @param {string} modalPath - Modal 页面路径
 * @param {string} closeButtonHtml - 关闭按钮 HTML
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

function prefixHex(arr) {
  return arr.filter(c=>c).map((c) => `#${c}`);
}

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'btn');
    const v = getFieldValue(config);

    // 获取基础配置
    const style = String(v('styleLayout', 'text') || DEFAULT_CONFIG.styleLayout);
    const label = v('label', 'text') || DEFAULT_CONFIG.label;
    // 获取容器配置 - 只有有值才使用

    const containerBgColorDefaultArr = prefixHex((v('containerBgColorDefault', 'text') || '').split(','));
    const containerBgColorDefault = containerBgColorDefaultArr[0] || '';
    const containerBgColorDefault2 = containerBgColorDefaultArr[1] || '';

    const containerBgColorHoverArr = prefixHex((v('containerBgColorHover', 'text') || '').split(','));
    const containerBgColorHover = containerBgColorHoverArr[0] || '';
    const containerBgColorHover2 = containerBgColorHoverArr[1] || '';

    const containerBgColorActiveArr = prefixHex((v('containerBgColorActive', 'text') || '').split(','));
    const containerBgColorActive = containerBgColorActiveArr[0] || '';
    const containerBgColorActive2 = containerBgColorActiveArr[1] || '';

    const containerRadiusTL = v('containerRadiusTL', 'text') || '';
    const containerRadiusTR = v('containerRadiusTR', 'text') || '';
    const containerRadiusBR = v('containerRadiusBR', 'text') || '';
    const containerRadiusBL = v('containerRadiusBL', 'text') || '';
    const containerBorderWidth = v('borderWidth', 'text') || '';
    const containerBorderColor = v('borderColor', 'text') || '';
    // 获取字体配置
    const fontDesktop = v('fontDesktop', 'text') || DEFAULT_CONFIG.fontDesktop;
    const fontMobile = v('fontMobile', 'text') || DEFAULT_CONFIG.fontMobile;
    const fontColorDefault = v('fontColorDefault', 'text') || '';
    const fontColorHover = v('fontColorHover', 'text') || '';
    const fontColorActive = v('fontColorActive', 'text') || '';
    // 获取链接配置
    const linkType = v('linkType', 'text') || DEFAULT_CONFIG.linkType;
    const externalLink = v('externalLink', 'text') || DEFAULT_CONFIG.externalLink;
    const innerPageLink = v('innerPageLink', 'text') || DEFAULT_CONFIG.innerPageLink;
    // 获取图标配置
    const iconStyle = v('iconStyle', 'text') || DEFAULT_CONFIG.iconStyle;
    // 判断样式特性
    const filled = isFilledStyle(style);
    // 构建按钮链接
    let href = '';
    let isExternal = true;
    if (linkType === 'external' && externalLink) {
      href = externalLink;
      isExternal = true;
    } else if (linkType === 'inner' && innerPageLink) {
      href = '#';
      isExternal = false;
    }
    // 构建内联样式 - 通过 CSS 变量配置所有颜色
    let inlineStyle = '';
    // 默认背景色 CSS 变量
    if (containerBgColorDefault) {
      if (containerBgColorDefault2) {
        // 渐变 - 两个颜色都配置时
        inlineStyle += `--btn-bg-default-image: linear-gradient(270deg, ${containerBgColorDefault} 0%, ${containerBgColorDefault2} 100%);`;
      } else {
        // 纯色 - 只配置一个颜色
        inlineStyle += `--btn-bg-default: ${containerBgColorDefault};`;
        inlineStyle += '--btn-bg-default-image: none;';
      }
    }
    // Hover 背景色 CSS 变量
    if (containerBgColorHover) {
      if (containerBgColorHover2) {
        // 渐变 - 两个颜色都配置时
        inlineStyle += `--btn-bg-hover-image: linear-gradient(270deg, ${containerBgColorHover} 0%, ${containerBgColorHover2} 100%);`;
      } else {
        // 纯色 - 只配置一个颜色
        inlineStyle += `--btn-bg-hover: ${containerBgColorHover};`;
        inlineStyle += '--btn-bg-hover-image: none;';
      }
    }
    // Active 背景色 CSS 变量
    if (containerBgColorActive) {
      if (containerBgColorActive2) {
        // 渐变 - 两个颜色都配置时
        inlineStyle += `--btn-bg-active-image: linear-gradient(270deg, ${containerBgColorActive} 0%, ${containerBgColorActive2} 100%);`;
      } else {
        // 纯色 - 只配置一个颜色
        inlineStyle += `--btn-bg-active: ${containerBgColorActive};`;
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
    const radiusStyle = getRadiusStyle(containerRadiusTL, containerRadiusTR, containerRadiusBR, containerRadiusBL);
    if (radiusStyle) {
      inlineStyle += radiusStyle;
    }

    // container边框变量
    if (filled) {
      if (containerBorderColor) {
        inlineStyle += `--container-border-color: ${containerBorderColor};`;
      }
      if (containerBorderWidth) {
        inlineStyle += `--container-border-width: ${containerBorderWidth}px;`;
      }
    }
    // 构建图标 HTML
    let iconHtml = '';
    if (supportsIcon(style)) {
      const iconBgColorDefault = v('iconBgColorDefault', 'text') || '';
      const iconBgColorHover = v('iconBgColorHover', 'text') || '';
      const iconBgColorActive = v('iconBgColorActive', 'text') || '';
      const iconColor = v('iconColor', 'text') || '';
      let iconBgStyle = '';
      if (iconBgColorDefault) iconBgStyle += `--icon-bg-default: ${iconBgColorDefault};`;
      if (iconBgColorHover) iconBgStyle += `--icon-bg-hover: ${iconBgColorHover};`;
      if (iconBgColorActive) iconBgStyle += `--icon-bg-active: ${iconBgColorActive};`;
      if (iconColor) iconBgStyle += `--icon-color: ${iconColor};`;
      if (iconStyle === 'svg' || iconStyle === '') {
        // 确定图标类型
        let iconPath = '';
        if (filled) {
          // style=2 和 style=3：加号图标
          iconPath = 'M11 19v-6h-6v-2h6V5h2v6h6v2h-6v6h-2z';
        } else {
          // style=5 和 style=6：播放图标
          iconPath = 'M8 5v14l11-7z';
        }

        const getSvgLinearHtml = (id,start,end)=>{
          return `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${start}" />
                  <stop offset="100%" stop-color="${end}" />
                </linearGradient>`
        }

        iconHtml = `
          <div class="btn-icon-wrapper flex items-center justify-center transition-all"
               style="${iconBgStyle}"
               data-bg-default="${iconBgColorDefault}"
               data-bg-hover="${iconBgColorHover}"
               data-bg-active="${iconBgColorActive}">
            <svg viewBox="0 0 24 24" class="btn-icon-svg">
              <defs>
                ${getSvgLinearHtml('icon-filled-default','var(--bg-d-start)','var(--bg-d-end)')}
                ${getSvgLinearHtml('icon-filled-hover-active','var(--bg-h-a-start)','var(--bg-h-a-end)')}
                ${getSvgLinearHtml('icon-outline-default','var(--icon-d)','var(--icon-d)')}
                ${getSvgLinearHtml('icon-outline-hover','var(--bg-d-start)','var(--bg-d-end)')}
                ${getSvgLinearHtml('icon-outline-active','var(--bg-h-a-start)','var(--bg-h-a-end)')}
              </defs>
              <path d="${iconPath}" ${iconColor ? 'fill="var(--icon-color) !important"' : ''}/>
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
    // 构建按钮 HTML
    const buttonHtml = `
      <a href="${href}"
         class="btn-component inline-flex items-center justify-center transition-all duration-300 cursor-pointer ${fontDesktop} ${fontMobile}"
         data-link-type="${linkType}"
         data-is-external="${isExternal}"
         data-style="${style}"
         ${inlineStyle ? `style="${inlineStyle.trim()}"` : ''}
         data-filled="${filled}">
        <span class="btn-label">${label}</span>
        ${iconHtml}
      </a>
    `;

    // 移动 AEM 编辑器 instrumentation 属性到按钮元素（必须在修改 innerHTML 之前）
    const oldBtnElement = block.querySelector('.btn-component');
    if (oldBtnElement) {
      moveInstrumentation(block, oldBtnElement);
    }

    block.innerHTML = buttonHtml;

    const btnElement = block.querySelector('.btn-component');
    if (btnElement) {
      // 外部链接处理
      if (isExternal && href) {
        btnElement.setAttribute('target', '_blank');
        btnElement.setAttribute('rel', 'noopener noreferrer');
      }
      // Inner Page 处理 - 点击时调用 handleQuickView
      if (!isExternal && linkType === 'inner' && innerPageLink) {
        btnElement.addEventListener('click', (e) => {
          e.preventDefault();
          // 构建关闭按钮 HTML
          const closeButtonHtml = buildCloseButtonHtml(v);
          // 调用 handleQuickView 方法，传入 modal 路径和关闭按钮 HTML
          handleQuickView(innerPageLink, closeButtonHtml);
        });
      }
    }
  } catch (error) {
    console.error('Error decorating btn block:', error);
    block.innerHTML = '<div class="error-message">Failed to load btn block</div>';
  }
}
