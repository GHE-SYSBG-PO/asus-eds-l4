import {
  getBlockConfigs, getFieldValue, getBlockRepeatConfigs, getBlockRepeatConfigsByDataAueProps,
} from '../../scripts/utils.js';

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
 * 生成 RWD 媒體查詢樣式（可擴充）
 * @param {string} blockId - 元素的唯一 class ID
 * @param {Object} properties - 屬性配置物件，可包含任意 CSS 屬性
 * 例如: { padding: { Desktop: '20px', Tablet: '15px', Mobile: '10px' } }
 * 或    { margin: { Desktop: '10px', Mobile: '5px' } } (可省略 Tablet)
 * @returns {string} 媒體查詢樣式字符串
 */
const generateRwdMediaQueries = (blockId, properties) => {
  let mediaQueryStyles = '';

  // 定義媒體查詢斷點
  const breakpoints = {
    Desktop: { condition: '(min-width: 1280px)', priority: 3 },
    Tablet: { condition: '(min-width: 731px) and (max-width: 1279px)', priority: 2 },
    Mobile: { condition: '(max-width: 730px)', priority: 1 },
  };

  // 收集各斷點的樣式
  const stylesByBreakpoint = {
    Desktop: '',
    Tablet: '',
    Mobile: '',
  };

  // 遍歷所有屬性
  Object.entries(properties).forEach(([propName, variants]) => {
    if (typeof variants !== 'object' || variants === null) return;

    // 遍歷每個斷點的值
    Object.entries(variants).forEach(([breakpoint, value]) => {
      if (!breakpoints[breakpoint]) return; // 略過無效的斷點

      const processedValue = ensureUnit(value);
      if (processedValue) {
        stylesByBreakpoint[breakpoint] += `${propName}: ${processedValue};`;
      }
    });
  });

  // 按優先級生成媒體查詢（Desktop > Tablet > Mobile）
  Object.entries(breakpoints)
    .sort((a, b) => b[1].priority - a[1].priority)
    .forEach(([breakpoint, { condition }]) => {
      if (stylesByBreakpoint[breakpoint]) {
        mediaQueryStyles += `
        @media ${condition} {
          .${blockId} { ${stylesByBreakpoint[breakpoint]} }
        }
      `;
      }
    });

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
    const childrenWithL4Tag = [...block.children].filter((child) => child.outerHTML.includes('L4TagMulti-'));
    console.log('Children with L4TagMulti-:', childrenWithL4Tag.length);
    if (childrenWithL4Tag.length > 0) {
      // eslint-disable-next-line no-console
      console.log('L4TagMulti- children HTML:', childrenWithL4Tag.map((child) => child.outerHTML));
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

    // Construct Text Items HTML based on style

    let textItemsHtml = '';

    // Generate unique class ID for this block instance to avoid style conflicts
    const blockId = `line-info-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 構建 line-info-items 的 style：包含 width 和 max-width
    // 處理 textWidthPercent 單位（如果沒有單位則加上 %）
    const textWidthValue = ensureUnit(textWidthPercent, '%');

    // 處理 textMaxWidth 單位（如果沒有單位則加上 px）
    const textMaxWidthValue = ensureUnit(textMaxWidth);

    // 組合 width 和 max-width
    const styleProps = [];
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
          textWidth,
        });

        // Build style-specific HTML
        let itemHtml = '';
        let itemClass = 'line-info-item';
        // Generate unique ID for this item to apply RWD styles
        const itemId = `line-info-item-${blockId}-${index}`;

        switch (styleLayout) {
          case 1:
          case 2: {
            // Style 1: Text On Left & Right (yValue is DT - Desktop/Tablet only)
            // Style 2: Text On Left / Right Sides (yValue is DT)
            // For Mobile, yValue is not applicable, so we use default 0
            itemClass += styleLayout === 1 ? ` side-${side}` : ` layout-${layoutStyle}`;

            // Build RWD styles for yValue
            let itemMediaQueries = '';
            const yValueProcessed = ensureUnit(yValue);
            if (yValueProcessed) {
              itemMediaQueries = generateRwdMediaQueries(itemId, {
                top: {
                  Desktop: yValue,
                  Tablet: yValue,
                  // Mobile: '0' (not specified, use default)
                },
              });
            }

            itemHtml = `
              ${itemMediaQueries ? `<style>${itemMediaQueries}</style>` : ''}
              <div class="${itemClass} ${itemId}" style="${itemMediaQueries ? '' : `top: ${yValueProcessed || '0'}px;`}">
                <div class="title">${titleRichtext}</div>
                <div class="info">${infoRichtext}</div>
              </div>
            `;
            break;
          }

          case 3:
          case 4:
          case 5: {
            // Style 3, 4, 5: Text below / Freeform / Freeform-dialog box
            // xValue, yValue, textWidth are DT (Desktop/Tablet only)
            itemClass += ` align-${alignment}`;

            // Build RWD styles for positioning
            let itemMediaQueries2 = '';
            const xValueProcessed = ensureUnit(xValue);
            const yValueProcessed2 = ensureUnit(yValue);
            const textWidthProcessed = ensureUnit(textWidth);

            if (xValueProcessed || yValueProcessed2 || textWidthProcessed) {
              itemMediaQueries2 = generateRwdMediaQueries(itemId, {
                left: { Desktop: xValue, Tablet: xValue },
                top: { Desktop: yValue, Tablet: yValue },
                width: { Desktop: textWidth, Tablet: textWidth },
              });
            }

            itemHtml = `
              ${itemMediaQueries2 ? `<style>${itemMediaQueries2}</style>` : ''}
              <div class="${itemClass} ${itemId}" style="${itemMediaQueries2 ? '' : `left: ${xValueProcessed || '0'}px; top: ${yValueProcessed2 || '0'}px; width: ${textWidthProcessed || 'auto'};`}">
                <div class="title">${titleRichtext}</div>
                <div class="info">${infoRichtext}</div>
              </div>
            `;
            break;
          }

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

    // 7. Generate RWD Media Queries for container padding
    const mediaQueryStyles = generateRwdMediaQueries(blockId, {
      'padding-top': {
        Desktop: paddingTopDesktop,
        Tablet: paddingTopTablet,
        Mobile: paddingTopMobile,
      },
      'padding-bottom': {
        Desktop: paddingBottomDesktop,
        Tablet: paddingBottomTablet,
        Mobile: paddingBottomMobile,
      },
    });

    // Inline style should only contain non-padding properties
    const containerStyle = '';

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
