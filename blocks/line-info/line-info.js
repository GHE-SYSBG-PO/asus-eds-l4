import {
  getBlockConfigs, getFieldValue, getBlockRepeatConfigs, parseL4TagMulti,
} from '../../scripts/utils.js';

const BASIC_DEFAULTS = {
  styleLayout: 1,
  paddingTopDesktop: 120,
  paddingTopTablet: 80,
  paddingTopMobile: 64,
  paddingBottomDesktop: 120,
  paddingBottomTablet: 80,
  paddingBottomMobile: 64,
  imgWidth: 706,
};

// Advanced 字段的預設配置
const ADVANCED_DEFAULTS = {
  titleFontDTselect: 'ro-md-14-sh',
  titleFontMselect: 'small_ro-md-13',
  infoFontDTselect: 'ro-rg-13',
  infoFontMselect: 'small_ro-rg-12',
  titleFontColor: '#000',
  infoFontColor: '#000',
  circleNameColorM: '#000',
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
 * 根據 styleLayout 獲取圖片預設類名
 * @param {string|number} styleLayout - 樣式佈局 (1-5)
 * @returns {Object} 包含響應式圖片類名的物件
 */
const getImageDefaultClasses = (styleLayout) => {
  const style = parseInt(styleLayout, 10);

  // 預設類名架構：根據 styleLayout 和響應式斷點設置
  const imageClassMap = {
    1: {
      // Style 1: Text On Left & Right
      sm: 'w-full', // Mobile: 全寬
      md: 'w-10/12', // Tablet: 10/12 寬度
      lg: 'w-8/12', // Desktop: 8/12 寬度
      base: 'max-w-4xl', // 基礎最大寬度限制
    },
    2: {
      // Style 2: Text On Left / Right Sides
      sm: 'w-full', // Mobile: 全寬
      md: 'w-10/12', // Tablet: 10/12 寬度
      lg: 'w-8/12', // Desktop: 8/12 寬度
      base: 'max-w-4xl', // 基礎最大寬度限制
    },
    3: {
      // Style 3: Text Below
      sm: 'w-full', // Mobile: 全寬
      md: 'w-full', // Tablet: 全寬
      lg: 'w-full', // Desktop: 全寬
      base: 'max-w-6xl', // 基礎最大寬度限制
    },
    4: {
      // Style 4: Freeform
      sm: 'w-full', // Mobile: 全寬
      md: 'w-full', // Tablet: 全寬
      lg: 'w-full', // Desktop: 全寬
      base: 'max-w-6xl', // 基礎最大寬度限制
    },
    5: {
      // Style 5: Freeform Dialog Box
      sm: 'w-full', // Mobile: 全寬
      md: 'w-full', // Tablet: 全寬
      lg: 'w-full', // Desktop: 全寬
      base: 'max-w-6xl', // 基礎最大寬度限制
    },
  };

  // 獲取對應的類名配置，如果找不到則使用預設值
  const config = imageClassMap[style] || imageClassMap[1];

  // 組合響應式類名
  const responsiveClasses = [
    config.sm, // Mobile (預設)
    `md:${config.md}`, // Tablet
    `lg:${config.lg}`, // Desktop
    config.base, // 基礎類名
  ].join(' ');

  return {
    responsive: responsiveClasses,
    mobile: config.sm,
    tablet: config.md,
    desktop: config.lg,
    base: config.base,
  };
};

/**
 * 生成圖片 HTML 結構
 * @param {Object} params - 參數物件
 * @param {string} params.assetDesktop - 桌面版圖片路徑
 * @param {string} params.assetTablet - 平板版圖片路徑
 * @param {string} params.assetMobile - 手機版圖片路徑
 * @param {string} params.imgWidth - 圖片寬度
 * @param {string} params.textItemsHtml - 文字項目 HTML
 * @param {string|number} params.styleLayout - 樣式佈局
 * @returns {string} 圖片區塊 HTML
 */
const generatePictureHtml = ({
  assetDesktop,
  assetTablet,
  assetMobile,
  imgWidth,
  textItemsHtml,
  styleLayout,
}) => {
  // RWD breakpoints: Mobile (≤730px), Tablet (731px-1279px), Desktop (≥1280px)
  const mobileSource = assetMobile ? `<source media="(max-width: 730px)" srcset="${assetMobile}">` : '';
  const tabletSource = assetTablet ? `<source media="(min-width: 731px) and (max-width: 1279px)" srcset="${assetTablet}">` : '';
  const defaultImgSrc = assetDesktop || assetTablet || assetMobile || '';

  // 獲取圖片預設類名
  const defaultClasses = getImageDefaultClasses(styleLayout);

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

  // 組合最終的圖片類名：預設響應式類名 + 自定義寬度類名（如果有）
  const finalImgClasses = imgWidthClass
    ? `block h-auto mx-auto ${imgWidthClass}`
    : `block h-auto mx-auto ${defaultClasses.responsive}`;

  return `
    <div class="line-info-item block relative"
      ${imgWidthStyle ? `style="${imgWidthStyle}"` : `class="${finalImgClasses}"`}>
      <picture>
        ${mobileSource}
        ${tabletSource}
        <img src="${defaultImgSrc}" alt="Line Info Product Image" loading="lazy">
      </picture>
      ${textItemsHtml}
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
 * @param {string} params.textWidthPercent - 文字容器寬度百分比（style1和style2使用）
 * @returns {string} 文字項目 HTML
 */
const generateTextItemsHtml = ({
  textItems, styleLayout, blockId, advancedStyles, textWidthPercent,
}) => {
  if (textItems.length === 0) {
    return '';
  }

  return textItems.map((item, index) => {
    // eslint-disable-next-line no-console
    console.log(`\n=== Item ${index} ===`, item);

    // Prefix for field names based on the current styleLayout
    const prefix = `textItems${styleLayout}`;

    // Extract values with prefixed names
    const xValue = item[`${prefix}XValue`]?.text || '0';
    const yValue = item[`${prefix}YValue`]?.text || '0';
    const titleRichtext = item[`${prefix}TitleRichtext`]?.html || '<p>Item Title</p>';
    const infoRichtext = item[`${prefix}InfoRichtext`]?.html || '<p>Description text here...</p>';

    const textWidth = item[`${prefix}TextWidth`]?.text || 'auto';
    const alignment = item[`${prefix}Alignment`]?.text || 'left';
    const side = item[`${prefix}Side`]?.text || 'left';
    const layoutStyle = item[`${prefix}LayoutStyle`]?.text || 'left';

    let responsiveStyle = '';

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

    let itemClasses = 'absolute flex flex-col bg-[#F23711] pointer-events-auto';
    let customStyles = '';

    // Generate unique ID for this item
    const itemId = `text-item-${blockId}-${index}`;

    switch (parseInt(styleLayout, 10)) {
      case 1:
      case 2: {
        // Style 1: Text On Left & Right (yValue is DT - Desktop/Tablet only)
        // Style 2: Text On Left / Right Sides (yValue is DT)

        if (styleLayout === 1) {
          // Style 1: side-based positioning
          if (side === 'right') {
            itemClasses += ' lg:-right-5 items-end text-left translate-x-full';
          } else {
            itemClasses += ' lg:-left-5 items-start text-right -translate-x-full';
          }
        } else if (layoutStyle === 'right') {
          // Style 2: layout-based positioning
          itemClasses += ' lg:-right-5 items-end text-left translate-x-full';
        } else {
          itemClasses += ' lg:-left-5 items-start text-right -translate-x-full';
        }

        // 處理 yValue 的響應式定位
        if (yValue && yValue !== '0') {
          const { className, customStyle } = convertToTailwindSpacing(yValue);
          if (className) {
            // Mobile: 不特別定位，Tablet/Desktop: 使用指定值
            itemClasses += ` md:top-${className} lg:top-${className}`;
          } else if (customStyle) {
            customStyles += `--top-md: ${customStyle}; --top-lg: ${customStyle};`;
          }
        }

        // 在 style1 和 style2 中使用 textWidthPercent 而不是個別的 textWidth
        const widthToUse = textWidthPercent || textWidth;
        if (widthToUse && widthToUse !== 'auto') {
          const { className, customStyle } = convertToTailwindSpacing(widthToUse);
          if (className) {
            // Mobile: 使用預設，Tablet/Desktop: 使用指定值
            itemClasses += ` md:w-${className} lg:w-${className}`;
          } else if (customStyle) {
            customStyles += `--width-md: ${customStyle}; --width-lg: ${customStyle};`;
          }
        }

        // 預設寬度設定 - 使用 CSS calc() 計算 grid 容器的2格寬度
        itemClasses += ' max-w-[276px]';
        // customStyles += 'width: calc(var(--grid-col-width, 8.33%) * 2); ';

        if (customStyles.includes('--')) {
          responsiveStyle = `
            <style>
              @media (min-width: 768px) {
                .${itemId} {
                  top: var(--top-md, auto) !important; 
                  width: var(--width-md, auto) !important;
                }
              }
              @media (min-width: 1280px) {
                .${itemId} {
                  top: var(--top-lg, auto) !important; 
                  width: var(--width-lg, auto) !important;
                }
              }
            </style>
          `;
        }
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
            // Mobile: 不特別定位，Tablet/Desktop: 使用指定值
            itemClasses += ` md:left-${className} lg:left-${className}`;
          } else if (customStyle) {
            customStyles += `--left-md: ${customStyle}; --left-lg: ${customStyle};`;
          }
        }

        // 處理 yValue
        if (yValue && yValue !== '0') {
          const { className, customStyle } = convertToTailwindSpacing(yValue);
          if (className) {
            // Mobile: 不特別定位，Tablet/Desktop: 使用指定值
            itemClasses += ` md:top-${className} lg:top-${className}`;
          } else if (customStyle) {
            customStyles += `--top-md: ${customStyle}; --top-lg: ${customStyle};`;
          }
        }

        // 處理 textWidth
        if (textWidth && textWidth !== 'auto') {
          const { className, customStyle } = convertToTailwindSpacing(textWidth);
          if (className) {
            // Mobile: 使用預設，Tablet/Desktop: 使用指定值
            itemClasses += ` md:w-${className} lg:w-${className}`;
          } else if (customStyle) {
            customStyles += `--width-md: ${customStyle}; --width-lg: ${customStyle};`;
          }
        } else {
          // 預設寬度 - 2格 grid 寬度
          itemClasses += ' max-w-[276px]';
          customStyles += 'width: calc(var(--grid-col-width, 8.33%) * 2); ';
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

    const styleAttribute = customStyles ? `style="${customStyles}"` : '';

    return `
      ${responsiveStyle}
      <div class="text-item ${itemClasses} ${itemId}" ${styleAttribute}>
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
    const paddingTopDesktop = v('paddingTopDesktop') || BASIC_DEFAULTS.paddingTopDesktop;
    const paddingTopTablet = v('paddingTopTablet') || BASIC_DEFAULTS.paddingTopTablet;
    const paddingBottomDesktop = v('paddingBottomDesktop') || BASIC_DEFAULTS.paddingBottomDesktop;
    const paddingBottomTablet = v('paddingBottomTablet') || BASIC_DEFAULTS.paddingBottomTablet;

    const imgWidth = v('assetDesktopImgWidth') || v('imgWidth') || BASIC_DEFAULTS.imgWidth;
    const textWidthPercent = v('textWidthPercent') || BASIC_DEFAULTS.textWidthPercent;

    // 4. Get Multifield Data (L4TagMulti- rows or data-aue-prop format)
    // Try new format first (data-aue-prop), then fall back to L4TagMulti- format
    const textItemsKey = `textItems${styleLayout}`;
    let textItems = parseL4TagMulti(block);
    // console.log('textItems', textItems);
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

    // 4.5. Get Advanced Styles (pass block for manual parsing)
    const advancedStyles = generateAdvancedStyles(advancedConfig, block);

    // 5. Generate Text Items HTML using function
    const textItemsHtml = generateTextItemsHtml({
      textItems, styleLayout, blockId, advancedStyles, textWidthPercent,
    });

    // 6. Generate Picture HTML (includes textItems inside line-info-image)
    const pictureHtml = generatePictureHtml({
      assetDesktop,
      assetTablet,
      assetMobile,
      imgWidth,
      textItemsHtml,
      styleLayout,
    });

    // 7. 生成容器的 Tailwind 響應式類名
    let containerClasses = `grid grid-cols-12 relative w-full max-w-screen-xl mx-auto box-border line-info--style${styleLayout} ${blockId}`;
    let containerStyles = '';

    // 處理 padding-top
    const paddingTopClasses = generateResponsiveClasses({
      Tablet: paddingTopTablet,
      Desktop: paddingTopDesktop,
    }, 'padding-top');

    const paddingTopCustom = generateCustomStyles({
      Tablet: paddingTopTablet,
      Desktop: paddingTopDesktop,
    }, 'padding-top');

    // 處理 padding-bottom
    const paddingBottomClasses = generateResponsiveClasses({
      Tablet: paddingBottomTablet,
      Desktop: paddingBottomDesktop,
    }, 'padding-bottom');

    const paddingBottomCustom = generateCustomStyles({
      Tablet: paddingBottomTablet,
      Desktop: paddingBottomDesktop,
    }, 'padding-bottom');

    // 組合類名
    if (paddingTopClasses) containerClasses += ` ${paddingTopClasses}`;
    if (paddingBottomClasses) containerClasses += ` ${paddingBottomClasses}`;

    // 組合自定義樣式
    containerStyles = `${paddingTopCustom}${paddingBottomCustom}`.trim();

    // 生成響應式 CSS 變數樣式
    let responsiveContainerStyle = `
      <style>
        .${blockId} {
          --grid-col-width: 8.33%; /* 100% / 12 = 8.33% per grid column */
          ${containerStyles}
        }`;

    if (containerStyles) {
      responsiveContainerStyle += `
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
        }`;
    }

    responsiveContainerStyle += `
      </style>
    `;

    // 8. Render with Tailwind classes
    block.innerHTML = `
      ${responsiveContainerStyle}
      <div class="line-info-block ${containerClasses}">
        ${pictureHtml}
      </div>
    `;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating line-info block:', error);
    block.innerHTML = '<div class="error-message">Failed to load line-info block</div>';
  }
}
