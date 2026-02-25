import { getBlockConfigs, getFieldValue, getBlockRepeatConfigs, getBlockRepeatConfigsByDataAueProps } from '../../scripts/utils.js';

/**
 * 確保值有正確的單位，如果沒有則加上預設單位
 * @param {string} value - 要檢查的值
 * @param {string} defaultUnit - 預設單位（預設為 'px'）
 * @returns {string} - 帶有單位的值，如果值為空或無效的數字則返回空字符串
 */
const ensureUnit = (value, defaultUnit = 'px') => {
  if (!value) return '';

  // 防呆：移除前後空格並檢查是否為有效的數字或數字+單位
  const trimmedValue = String(value).trim();

  // 檢查是否以數字開頭（必須是有效的數字）
  if (!/^-?\d/.test(trimmedValue)) return '';

  // 檢查是否已有單位
  const hasUnit = /(%|px|vh|vw|em|rem)$/.test(trimmedValue);
  return hasUnit ? trimmedValue : `${trimmedValue}${defaultUnit}`;
};

/**
 * 生成 RWD 媒體查詢樣式
 * @param {string} blockId - 元素的唯一 class ID
 * @param {Object} paddings - Padding 配置物件
 * @param {string} paddings.paddingTopDesktop - 桌機上邊距
 * @param {string} paddings.paddingTopTablet - 平板上邊距
 * @param {string} paddings.paddingTopMobile - 手機上邊距
 * @param {string} paddings.paddingBottomDesktop - 桌機下邊距
 * @param {string} paddings.paddingBottomTablet - 平板下邊距
 * @param {string} paddings.paddingBottomMobile - 手機下邊距
 * @returns {string} 媒體查詢樣式字符串
 */
const generateRwdMediaQueries = (blockId, {
  paddingTopDesktop,
  paddingTopTablet,
  paddingTopMobile,
  paddingBottomDesktop,
  paddingBottomTablet,
  paddingBottomMobile
}) => {
  let mediaQueryStyles = '';

  // Process all values through ensureUnit
  const paddingTopDesktopValue = ensureUnit(paddingTopDesktop);
  const paddingTopTabletValue = ensureUnit(paddingTopTablet);
  const paddingTopMobileValue = ensureUnit(paddingTopMobile);
  const paddingBottomDesktopValue = ensureUnit(paddingBottomDesktop);
  const paddingBottomTabletValue = ensureUnit(paddingBottomTablet);
  const paddingBottomMobileValue = ensureUnit(paddingBottomMobile);

  // Desktop styles (1280px and above)
  let desktopStyles = '';
  if (paddingTopDesktopValue) {
    desktopStyles += `padding-top: ${paddingTopDesktopValue};`;
  }
  if (paddingBottomDesktopValue) {
    desktopStyles += `padding-bottom: ${paddingBottomDesktopValue};`;
  }
  if (desktopStyles) {
    mediaQueryStyles += `
        @media (min-width: 1280px) {
          .${blockId} { ${desktopStyles} }
        }
      `;
  }

  // Tablet media query (731px - 1279px)
  let tabletStyles = '';
  if (paddingTopTabletValue) {
    tabletStyles += `padding-top: ${paddingTopTabletValue};`;
  }
  if (paddingBottomTabletValue) {
    tabletStyles += `padding-bottom: ${paddingBottomTabletValue};`;
  }
  if (tabletStyles) {
    mediaQueryStyles += `
        @media (min-width: 731px) and (max-width: 1279px) {
          .${blockId} { ${tabletStyles} }
        }
      `;
  }

  // Mobile media query (730px and below)
  let mobileStyles = '';
  if (paddingTopMobileValue) {
    mobileStyles += `padding-top: ${paddingTopMobileValue};`;
  }
  if (paddingBottomMobileValue) {
    mobileStyles += `padding-bottom: ${paddingBottomMobileValue};`;
  }
  if (mobileStyles) {
    mediaQueryStyles += `
        @media (max-width: 730px) {
          .${blockId} { ${mobileStyles} }
        }
      `;
  }

  return mediaQueryStyles;
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
    const childrenWithL4Tag = [...block.children].filter(child => child.outerHTML.includes('L4TagMulti-'));
    console.log('Children with L4TagMulti-:', childrenWithL4Tag.length);
    if (childrenWithL4Tag.length > 0) {
      // eslint-disable-next-line no-console
      console.log('L4TagMulti- children HTML:', childrenWithL4Tag.map(child => child.outerHTML));
    }

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

    // 5. Construct HTML Structure for RWD Image
    let pictureHtml = '';

    if (assetDesktop || assetTablet || assetMobile) {
      // RWD breakpoints: Mobile (≤730px), Tablet (731px-1279px), Desktop (≥1280px)
      const mobileSource = assetMobile ? `<source media="(max-width: 730px)" srcset="${assetMobile}">` : '';
      const tabletSource = assetTablet ? `<source media="(min-width: 731px) and (max-width: 1279px)" srcset="${assetTablet}">` : '';
      const defaultImgSrc = assetDesktop || assetTablet || assetMobile || '';

      // 處理 imgWidth 單位（如果沒有單位則加上 px）
      const imgWidthValue = ensureUnit(imgWidth);
      const imgWidthAttribute = imgWidthValue ? `style="width: ${imgWidthValue};"` : '';

      pictureHtml = `
        <div class="line-info-image">
          <picture>
            ${mobileSource}
            ${tabletSource}
            <img src="${defaultImgSrc}" alt="Line Info Product Image" loading="lazy" ${imgWidthAttribute}>
          </picture>
        </div>
      `;
    }

    // 6. Construct Text Items HTML based on style

    let textItemsHtml = '';

    // 構建 line-info-items 的 style：包含 width 和 max-width
    // 處理 textWidthPercent 單位（如果沒有單位則加上 %）
    const textWidthValue = ensureUnit(textWidthPercent, '%');

    // 處理 textMaxWidth 單位（如果沒有單位則加上 px）
    const textMaxWidthValue = ensureUnit(textMaxWidth);

    // 組合 width 和 max-width
    let styleProps = [];
    if (textWidthValue) {
      styleProps.push(`width: ${textWidthValue}`);
    }
    if (textMaxWidthValue) {
      styleProps.push(`max-width: ${textMaxWidthValue}`);
    }
    const textItemsStyle = styleProps.length > 0 ? `style="${styleProps.join(';')};"` : '';

    if (textItems.length > 0) {
      textItemsHtml = textItems.map((item, index) => {
        // eslint-disable-next-line no-console
        console.log(`\n=== Item ${index} ===`, item);

        // Extract values from {html, text} format
        // item contains fields like: { side: {html, text}, yValue: {html, text}, ... }
        const xValue = item.xValue?.text || '0';
        const yValue = item.yValue?.text || '0';
        const titleRichtext = item.titleRichtext?.html || '<p>Item Title</p>';
        const infoRichtext = item.infoRichtext?.html || '<p>Description text here...</p>';
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
          textWidth
        });

        // Build style-specific HTML
        let itemHtml = '';
        let itemClass = 'line-info-item';

        switch (styleLayout) {
          case 1:
            // Style 1: Text On Left & Right
            // side 值: "left" 或 "right"
            itemClass += ` side-${side}`;
            itemHtml = `
              <div class="${itemClass}" style="top: ${yValue}px;">
                <div class="title">${titleRichtext}</div>
                <div class="info">${infoRichtext}</div>
              </div>
            `;
            break;

          case 2:
            // Style 2: Text On Left / Right Sides
            // layoutStyle 值: "left" 或 "right"
            itemClass += ` layout-${layoutStyle}`;
            itemHtml = `
              <div class="${itemClass}" style="top: ${yValue}px;">
                <div class="title">${titleRichtext}</div>
                <div class="info">${infoRichtext}</div>
              </div>
            `;
            break;

          case 3:
          case 4:
          case 5:
            // Style 3, 4, 5: Text below / Freeform / Freeform-dialog box
            // alignment 值: "left" 或 "right"
            itemClass += ` align-${alignment}`;
            itemHtml = `
              <div class="${itemClass}" style="left: ${xValue}px; top: ${yValue}px; width: ${textWidth}px;">
                <div class="title">${titleRichtext}</div>
                <div class="info">${infoRichtext}</div>
              </div>
            `;
            break;

          default:
            itemHtml = `
              <div class="${itemClass}" style="left: ${xValue}px; top: ${yValue}px;">
                <div class="title">${titleRichtext}</div>
                <div class="info">${infoRichtext}</div>
              </div>
            `;
        }

        return itemHtml;
      }).join('');
    }

    // 7. Generate RWD Media Queries
    // Generate unique class ID for this block instance to avoid style conflicts
    const blockId = `line-info-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const mediaQueryStyles = generateRwdMediaQueries(blockId, {
      paddingTopDesktop,
      paddingTopTablet,
      paddingTopMobile,
      paddingBottomDesktop,
      paddingBottomTablet,
      paddingBottomMobile
    });

    // Inline style should only contain non-padding properties
    let containerStyle = '';

    // 8. Render with style class and media queries
    // Padding is controlled via media queries, not inline-style
    block.innerHTML = `
      ${mediaQueryStyles ? `<style>${mediaQueryStyles}</style>` : ''}
      <div class="line-info-container line-info--style${styleLayout} ${blockId}" style="${containerStyle}">
        ${pictureHtml}
        <div class="line-info-items" ${textItemsStyle}>
          ${textItemsHtml}
        </div>
      </div>
    `;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating line-info block:', error);
    block.innerHTML = '<div class="error-message">Failed to load line-info block</div>';
  }
}
