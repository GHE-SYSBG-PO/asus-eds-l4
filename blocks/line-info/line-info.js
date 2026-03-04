import {
  getBlockConfigs, getFieldValue, getBlockRepeatConfigs, getBlockRepeatConfigsByDataAueProps,
} from '../../scripts/utils.js';

// Advanced 字段的預設配置
const ADVANCED_DEFAULTS = {
  titleFontDTselect: 'ro-md-14-sh',
  titleFontMselect: 'small_ro-md-13',
  infoFontDTselect: 'ro-rg-13',
  infoFontMselect: 'small_ro-rg-12',
  titleFontColor: '',
  infoFontColor: '',
  circleNameColorM: '',
};

/**
 * 將數值轉換為 Tailwind 間距類名或自定義樣式
 * @param {string} value - 要轉換的值
 * @returns {Object} - 包含 className 和 customStyle 的物件
 */
const convertToTailwindSpacing = (value) => {
  if (!value) return { className: '', customStyle: '' };

  const trimmedValue = String(value).trim();
  if (!/^-?\d/.test(trimmedValue)) return { className: '', customStyle: '' };

  // 檢查是否有單位
  const hasUnit = /(%|px|vh|vw|em|rem)$/.test(trimmedValue);
  const finalValue = hasUnit ? trimmedValue : `${trimmedValue}px`;

  // 對於常見的 px 值，嘗試轉換為 Tailwind 類名
  if (finalValue.endsWith('px')) {
    const pxValue = parseInt(finalValue, 10);
    const tailwindSpacingMap = {
      0: '0',
      4: '1',
      8: '2',
      12: '3',
      16: '4',
      20: '5',
      24: '6',
      28: '7',
      32: '8',
      36: '9',
      40: '10',
      44: '11',
      48: '12',
      56: '14',
      64: '16',
      80: '20',
      96: '24',
      112: '28',
      128: '32',
    };
    if (tailwindSpacingMap[pxValue] !== undefined) {
      return { className: tailwindSpacingMap[pxValue], customStyle: '' };
    }
  }

  // 如果無法對應 Tailwind 類名，返回自定義樣式
  return {
    className: '',
    customStyle: finalValue,
  };
};

/**
 * 生成響應式 Tailwind 類名
 * @param {Object} properties - 屬性配置物件，包含 Desktop、Tablet、Mobile 的值
 * @param {string} propertyType - 屬性類型 ('padding-top', 'padding-bottom', 'width', 'top', 'left')
 * @returns {string} Tailwind 響應式類名字符串
 */
const generateResponsiveClasses = (properties, propertyType) => {
  const {
    Desktop,
    Tablet,
    Mobile,
  } = properties;
  const classes = [];

  // 處理不同的屬性類型
  const getClassPrefix = (type) => {
    switch (type) {
      case 'padding-top': return 'pt';
      case 'padding-bottom': return 'pb';
      case 'width': return 'w';
      case 'top': return 'top';
      case 'left': return 'left';
      default: return type;
    }
  };

  const prefix = getClassPrefix(propertyType);

  // Mobile first (基礎類名)
  if (Mobile) {
    const { className } = convertToTailwindSpacing(Mobile);
    if (className) classes.push(`${prefix}-${className}`);
  }

  // Tablet (md:)
  if (Tablet) {
    const { className } = convertToTailwindSpacing(Tablet);
    if (className) classes.push(`md:${prefix}-${className}`);
  }

  // Desktop (lg:)
  if (Desktop) {
    const { className } = convertToTailwindSpacing(Desktop);
    if (className) classes.push(`lg:${prefix}-${className}`);
  }

  return classes.join(' ');
};

/**
 * 生成自定義 CSS 變數和樣式（當無法使用 Tailwind 類名時）
 * @param {Object} properties - 屬性配置物件
 * @param {string} propertyType - CSS 屬性名稱
 * @returns {string} CSS 變數樣式字符串
 */
const generateCustomStyles = (properties, propertyType) => {
  const {
    Desktop,
    Tablet,
    Mobile,
  } = properties;
  let customStyles = '';

  if (Mobile) {
    const { customStyle } = convertToTailwindSpacing(Mobile);
    if (customStyle) {
      customStyles += `${propertyType}: ${customStyle}; `;
    }
  }

  // 如果有 Tablet 或 Desktop 的自定義值，使用 CSS 自定義屬性
  if (Tablet || Desktop) {
    if (Tablet) {
      const { customStyle } = convertToTailwindSpacing(Tablet);
      if (customStyle) {
        customStyles += `--${propertyType}-md: ${customStyle}; `;
      }
    }
    if (Desktop) {
      const { customStyle } = convertToTailwindSpacing(Desktop);
      if (customStyle) {
        customStyles += `--${propertyType}-lg: ${customStyle}; `;
      }
    }
  }

  return customStyles;
};

/**
 * 生成圖片 HTML 結構
 * @param {Object} params - 參數物件
 * @param {string} params.assetDesktop - 桌面版圖片路徑
 * @param {string} params.assetTablet - 平板版圖片路徑
 * @param {string} params.assetMobile - 手機版圖片路徑
 * @param {string} params.imgWidth - 圖片寬度
 * @param {string} params.textItemsHtml - 文字項目 HTML
 * @param {string} params.textContainerClasses - 文字容器 Tailwind 類名
 * @param {string} params.textContainerStyles - 文字容器自定義樣式
 * @returns {string} 圖片區塊 HTML
 */
const generatePictureHtml = ({
  assetDesktop,
  assetTablet,
  assetMobile,
  imgWidth,
  textItemsHtml,
  textContainerClasses,
  textContainerStyles,
}) => {
  // RWD breakpoints: Mobile (≤730px), Tablet (731px-1279px), Desktop (≥1280px)
  const mobileSource = assetMobile ? `<source media="(max-width: 730px)" srcset="${assetMobile}">` : '';
  const tabletSource = assetTablet ? `<source media="(min-width: 731px) and (max-width: 1279px)" srcset="${assetTablet}">` : '';
  const defaultImgSrc = assetDesktop || assetTablet || assetMobile || '';

  // 處理圖片寬度 - 轉換為 Tailwind 或自定義樣式
  let imgWidthClass = '';
  let imgWidthStyle = '';

  if (imgWidth) {
    const { className, customStyle } = convertToTailwindSpacing(imgWidth);
    if (className) {
      imgWidthClass = `w-${className}`;
    } else if (customStyle) {
      imgWidthStyle = `width: ${customStyle};`;
    }
  }

  const imgClasses = `block w-full h-auto mx-auto ${imgWidthClass}`.trim();

  return `
    <div class="block relative left-1/2 transform -translate-x-1/2" ${imgWidthStyle ? `style="${imgWidthStyle}"` : ''}>
      <picture>
        ${mobileSource}
        ${tabletSource}
        <img src="${defaultImgSrc}" alt="Line Info Product Image" loading="lazy" class="${imgClasses}">
      </picture>
      <div class="absolute top-0 -left-5 w-full ${textContainerClasses}" ${textContainerStyles ? `style="${textContainerStyles}"` : ''}>
        ${textItemsHtml}
      </div>
    </div>
  `;
};

/**
 * 生成 Advanced 樣式設置
 * @param {Object} config - 區塊配置物件
 * @param {HTMLElement} block - 區塊元素（用於手動解析）
 * @returns {Object} Advanced 樣式物件
 */
const generateAdvancedStyles = (config) => {
  const v = getFieldValue(config);

  const titleFontDT = v('titleFontDTselect') || ADVANCED_DEFAULTS.titleFontDTselect;
  const titleFontM = v('titleFontMselect') || ADVANCED_DEFAULTS.titleFontMselect;
  const titleFontColor = v('titleFontColor') || ADVANCED_DEFAULTS.titleFontColor;
  const infoFontDT = v('infoFontDTselect') || ADVANCED_DEFAULTS.infoFontDTselect;
  const infoFontM = v('infoFontMselect') || ADVANCED_DEFAULTS.infoFontMselect;
  const infoFontColor = v('infoFontColor') || ADVANCED_DEFAULTS.infoFontColor;
  const circleNameColorM = v('circleNameColorM') || ADVANCED_DEFAULTS.circleNameColorM;

  console.log('Advanced Style Values:', {
    titleFontDT,
    titleFontM,
    titleFontColor,
    infoFontDT,
    infoFontM,
    infoFontColor,
    circleNameColorM,
  });

  const titleFontClasses = [titleFontDT, titleFontM].filter(Boolean).join(' ');
  const infoFontClasses = [infoFontDT, infoFontM].filter(Boolean).join(' ');

  const titleStyle = titleFontColor ? `color: ${titleFontColor};` : '';
  const infoStyle = infoFontColor ? `color: ${infoFontColor};` : '';

  return {
    title: {
      classes: titleFontClasses,
      style: titleStyle,
    },
    info: {
      classes: infoFontClasses,
      style: infoStyle,
    },
    circleColorM: circleNameColorM,
  };
};

/**
 * 生成文字項目 HTML 結構
 * @param {Object} params - 參數物件
 * @param {Array} params.textItems - 文字項目陣列
 * @param {string|number} params.styleLayout - 樣式佈局
 * @param {string} params.blockId - 區塊唯一識別碼
 * @param {Object} params.advancedStyles - Advanced 樣式設置
 * @returns {string} 文字項目 HTML
 */
const generateTextItemsHtml = ({
  textItems, styleLayout, blockId, advancedStyles,
}) => {
  if (textItems.length === 0) {
    return '';
  }

  return textItems.map((item, index) => {
    // eslint-disable-next-line no-console
    console.log(`\n=== Item ${index} ===`, item);

    // Extract values from {html, text} format
    const xValue = item.xValue?.text || '0';
    const yValue = item.yValue?.text || '0';
    const titleRichtext = item.titleRichtext?.html || '<p>Item Title</p>';

    // 根據 styleLayout 讀取對應的 infoRichtext 欄位
    const infoRichtextFieldName = `infoRichtext${styleLayout}`;
    const infoRichtext = item[infoRichtextFieldName]?.html || item.infoRichtext?.html || '<p>Description text here...</p>';

    const textWidth = item.textWidth?.text || 'auto';
    const alignment = item.alignment?.text || 'left';
    const side = item.side?.text || 'left';
    const layoutStyle = item.layoutStyle?.text || 'left';

    // eslint-disable-next-line no-console
    console.log(`Item ${index} extracted values:`, {
      side,
      yValue,
      titleRichtext: titleRichtext.substring(0, 50),
      infoRichtext: infoRichtext.substring(0, 50),
      alignment,
      xValue,
      textWidth,
    });

    // 基礎類名
    let itemClasses = 'absolute pointer-events-auto flex flex-col';
    let customStyles = '';

    // Generate unique ID for this item
    const itemId = `text-item-${blockId}-${index}`;

    switch (parseInt(styleLayout, 10)) {
      case 1:
      case 2: {
        // Style 1: Text On Left & Right (yValue is DT - Desktop/Tablet only)
        // Style 2: Text On Left / Right Sides (yValue is DT)

        if (styleLayout === '1') {
          // Style 1: side-based positioning
          if (side === 'right') {
            itemClasses += ' right-0 lg:-right-5 items-end text-right';
          } else {
            itemClasses += ' left-0 lg:-left-5 items-start text-left';
          }
        } else if (layoutStyle === 'right') {
          // Style 2: layout-based positioning
          itemClasses += ' right-0 lg:-right-5 items-end text-right';
        } else {
          itemClasses += ' left-0 lg:-left-5 items-start text-left';
        }

        // 處理 yValue 的響應式定位
        if (yValue && yValue !== '0') {
          const { className, customStyle } = convertToTailwindSpacing(yValue);
          if (className) {
            itemClasses += ` md:top-${className} lg:top-${className}`;
          } else if (customStyle) {
            customStyles += `--top-md: ${customStyle}; --top-lg: ${customStyle}; top: var(--top-md);`;
          }
        }

        // 預設寬度設定
        itemClasses += ' w-2/5 max-w-xs lg:max-w-sm';
        break;
      }

      case 3:
      case 4:
      case 5: {
        // Style 3, 4, 5: Text below / Freeform / Freeform-dialog box

        // 處理對齊方式
        if (alignment === 'right') {
          itemClasses += ' items-end text-right';
        } else {
          itemClasses += ' items-start text-left';
        }

        // 處理 xValue
        if (xValue && xValue !== '0') {
          const { className, customStyle } = convertToTailwindSpacing(xValue);
          if (className) {
            itemClasses += ` md:left-${className} lg:left-${className}`;
          } else if (customStyle) {
            customStyles += `--left-md: ${customStyle}; --left-lg: ${customStyle}; left: var(--left-md);`;
          }
        }

        // 處理 yValue
        if (yValue && yValue !== '0') {
          const { className, customStyle } = convertToTailwindSpacing(yValue);
          if (className) {
            itemClasses += ` md:top-${className} lg:top-${className}`;
          } else if (customStyle) {
            customStyles += `--top-md: ${customStyle}; --top-lg: ${customStyle}; top: var(--top-md);`;
          }
        }

        // 處理 textWidth
        if (textWidth && textWidth !== 'auto') {
          const { className, customStyle } = convertToTailwindSpacing(textWidth);
          if (className) {
            itemClasses += ` md:w-${className} lg:w-${className}`;
          } else if (customStyle) {
            customStyles += `--width-md: ${customStyle}; --width-lg: ${customStyle}; width: var(--width-md);`;
          }
        } else {
          // 預設寬度
          itemClasses += ' w-1/6 max-w-xs';
        }
        break;
      }

      default:
        // 預設情況
        itemClasses += ' w-1/6 max-w-xs';
        if (xValue && xValue !== '0') {
          const { customStyle } = convertToTailwindSpacing(xValue);
          if (customStyle) customStyles += `left: ${customStyle}; `;
        }
        if (yValue && yValue !== '0') {
          const { customStyle } = convertToTailwindSpacing(yValue);
          if (customStyle) customStyles += `top: ${customStyle}; `;
        }
    }

    // 處理 CSS 自定義屬性的響應式樣式
    let responsiveStyle = '';
    if (customStyles.includes('--')) {
      responsiveStyle = `
        <style>
          .${itemId} {
            ${customStyles}
          }
          @media (min-width: 768px) {
            .${itemId} {
              top: var(--top-md, auto);
              left: var(--left-md, auto);
              width: var(--width-md, auto);
            }
          }
          @media (min-width: 1280px) {
            .${itemId} {
              top: var(--top-lg, auto);
              left: var(--left-lg, auto);
              width: var(--width-lg, auto);
            }
          }
        </style>
      `;
      customStyles = ''; // 清空，因為已經放在 style 標籤中
    }

    const styleAttribute = customStyles ? `style="${customStyles}"` : '';

    return `
      ${responsiveStyle}
      <div class="${itemClasses} ${itemId}" ${styleAttribute}>
        <div class="title mb-2 w-full ${advancedStyles.title.classes}" style="${advancedStyles.title.style}">${titleRichtext}</div>
        <div class="info w-full ${advancedStyles.info.classes}" style="${advancedStyles.info.style}">${infoRichtext}</div>
      </div>
    `;
  }).join('');
};

export default async function decorate(block) {
  try {
    // DEBUG: Check block structure FIRST
    // eslint-disable-next-line no-console
    console.log('=== BLOCK STRUCTURE DEBUG ===');
    // eslint-disable-next-line no-console
    console.log('Full Block HTML:', block.outerHTML);
    // eslint-disable-next-line no-console
    console.log('Block children count:', block.children.length);
    // eslint-disable-next-line no-console
    const childrenWithL4Tag = [...block.children].filter((child) => child.outerHTML.includes('L4TagMulti-'));
    console.log('Children with L4TagMulti-:', childrenWithL4Tag.length);
    if (childrenWithL4Tag.length > 0) {
      // eslint-disable-next-line no-console
      console.log('L4TagMulti- children HTML:', childrenWithL4Tag.map((child) => child.outerHTML));
    }

    const advancedConfig = await getBlockConfigs(block, ADVANCED_DEFAULTS, 'line-info');
    const config = await getBlockConfigs(block, {}, 'line-info');
    const v = getFieldValue(config);

    // 1. Get Style Layout (direct access for select field)
    const styleLayout = config.styleLayout?.text || config.styleLayout || '1';

    // 2. Get Asset Paths
    const assetDesktop = v('assetDesktop');
    const assetTablet = v('assetTablet');
    const assetMobile = v('assetMobile');

    // 3. Get Layout Styles (RWD breakpoints)
    // Padding values for different breakpoints
    const paddingTopDesktop = v('paddingTopDesktop');
    const paddingTopTablet = v('paddingTopTablet');
    const paddingTopMobile = v('paddingTopMobile');
    const paddingBottomDesktop = v('paddingBottomDesktop');
    const paddingBottomTablet = v('paddingBottomTablet');
    const paddingBottomMobile = v('paddingBottomMobile');

    const imgWidth = v('imgWidth');
    const textWidthPercent = v('textWidthPercent');
    const textMaxWidth = v('textMaxWidth');

    // 4. Get Multifield Data (L4TagMulti- rows or data-aue-prop format)
    // Try new format first (data-aue-prop), then fall back to L4TagMulti- format
    const textItemsKey = `textItems${styleLayout}`;
    let textItems = getBlockRepeatConfigsByDataAueProps(block, textItemsKey);

    // If new format returned empty, try old L4TagMulti- format
    if (textItems.length === 0) {
      const [oldFormatItems = []] = getBlockRepeatConfigs(block);
      textItems = oldFormatItems;
    }
    // eslint-disable-next-line no-console
    console.log(`Text Items from multifield (${textItemsKey}):`, textItems);

    // eslint-disable-next-line no-console
    console.log('Parsed textItems:', textItems);

    // Generate unique class ID for this block instance to avoid style conflicts
    const blockId = `line-info-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 處理文字容器的寬度和最大寬度
    let textContainerClasses = '';
    let textContainerStyles = '';

    if (textWidthPercent) {
      const { customStyle } = convertToTailwindSpacing(textWidthPercent);
      if (customStyle && customStyle.includes('%')) {
        textContainerStyles += `width: ${customStyle}; `;
      }
    }

    if (textMaxWidth) {
      const { className, customStyle } = convertToTailwindSpacing(textMaxWidth);
      if (className && !customStyle) {
        textContainerClasses += ` max-w-${className}`;
      } else if (customStyle) {
        textContainerStyles += `max-width: ${customStyle}; `;
      }
    }

    // 4.5. Get Advanced Styles (pass block for manual parsing)
    const advancedStyles = generateAdvancedStyles(advancedConfig, block);

    // 5. Generate Text Items HTML using function
    const textItemsHtml = generateTextItemsHtml({
      textItems, styleLayout, blockId, advancedStyles,
    });

    // 6. Generate Picture HTML (includes textItems inside line-info-image)
    const pictureHtml = generatePictureHtml({
      assetDesktop,
      assetTablet,
      assetMobile,
      imgWidth,
      textItemsHtml,
      textContainerClasses,
      textContainerStyles: textContainerStyles.trim(),
    });

    // 7. 生成容器的 Tailwind 響應式類名
    let containerClasses = `relative w-full max-w-screen-xl mx-auto box-border line-info--style${styleLayout} ${blockId}`;
    let containerStyles = '';

    // 處理 padding-top
    const paddingTopClasses = generateResponsiveClasses({
      Mobile: paddingTopMobile,
      Tablet: paddingTopTablet,
      Desktop: paddingTopDesktop,
    }, 'padding-top');

    const paddingTopCustom = generateCustomStyles({
      Mobile: paddingTopMobile,
      Tablet: paddingTopTablet,
      Desktop: paddingTopDesktop,
    }, 'padding-top');

    // 處理 padding-bottom
    const paddingBottomClasses = generateResponsiveClasses({
      Mobile: paddingBottomMobile,
      Tablet: paddingBottomTablet,
      Desktop: paddingBottomDesktop,
    }, 'padding-bottom');

    const paddingBottomCustom = generateCustomStyles({
      Mobile: paddingBottomMobile,
      Tablet: paddingBottomTablet,
      Desktop: paddingBottomDesktop,
    }, 'padding-bottom');

    // 組合類名
    if (paddingTopClasses) containerClasses += ` ${paddingTopClasses}`;
    if (paddingBottomClasses) containerClasses += ` ${paddingBottomClasses}`;

    // 組合自定義樣式
    containerStyles = `${paddingTopCustom}${paddingBottomCustom}`.trim();

    // 生成響應式 CSS 變數樣式
    let responsiveContainerStyle = '';
    if (containerStyles) {
      responsiveContainerStyle = `
        <style>
          .${blockId} {
            ${containerStyles}
          }
          @media (min-width: 768px) {
            .${blockId} {
              padding-top: var(--padding-top-md, auto);
              padding-bottom: var(--padding-bottom-md, auto);
            }
          }
          @media (min-width: 1280px) {
            .${blockId} {
              padding-top: var(--padding-top-lg, auto);
              padding-bottom: var(--padding-bottom-lg, auto);
            }
          }
        </style>
      `;
    }

    // 8. Render with Tailwind classes
    block.innerHTML = `
      ${responsiveContainerStyle}
      <div class="${containerClasses}">
        ${pictureHtml}
      </div>
    `;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating line-info block:', error);
    block.innerHTML = '<div class="error-message">Failed to load line-info block</div>';
  }
}
