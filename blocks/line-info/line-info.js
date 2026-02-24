import { getBlockConfigs, getFieldValue } from '../../scripts/utils.js';

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, {}, 'line-info');
    const v = getFieldValue(config);

    // 1. Get Style Layout
    const styleLayout = v('styleLayout') || '1';

    // 2. Get Asset Paths
    const assetDesktop = v('assetDesktop');
    const assetTablet = v('assetTablet');
    const assetMobile = v('assetMobile');

    // 3. Get Layout Styles
    const paddingTop = v('paddingTop');
    const paddingBottom = v('paddingBottom');

    // 4. Get Text Items (based on style)
    const textItemsKey = `textItems${styleLayout}`;
    // Multifield is stored directly as an array, not nested in 'text' property
    let textItems = config[textItemsKey] || [];

    // Ensure textItems is an array
    if (!Array.isArray(textItems)) {
      textItems = textItems ? [textItems] : [];
    }

    // 5. Construct HTML Structure for RWD Image
    let pictureHtml = '';

    if (assetDesktop || assetTablet || assetMobile) {
      const mobileSource = assetMobile ? `<source media="(max-width: 767px)" srcset="${assetMobile}">` : '';
      const tabletSource = assetTablet ? `<source media="(min-width: 768px) and (max-width: 1024px)" srcset="${assetTablet}">` : '';
      const defaultImgSrc = assetDesktop || assetTablet || assetMobile || '';

      pictureHtml = `
        <div class="line-info-image">
          <picture>
            ${mobileSource}
            ${tabletSource}
            <img src="${defaultImgSrc}" alt="Line Info Product Image" loading="lazy">
          </picture>
        </div>
      `;
    }

    // 6. Construct Text Items HTML based on style
    // eslint-disable-next-line no-console
    console.log('styleLayout:', styleLayout);
    // eslint-disable-next-line no-console
    console.log('textItemsKey:', textItemsKey);
    // eslint-disable-next-line no-console
    console.log('textItems raw:', textItems);
    // eslint-disable-next-line no-console
    console.log('textItems type:', typeof textItems);
    // eslint-disable-next-line no-console
    console.log('textItems is Array:', Array.isArray(textItems));
    // eslint-disable-next-line no-console
    console.log('Full config object:', config);

    let textItemsHtml = '';
    if (textItems.length > 0) {
      textItemsHtml = textItems.map((item, index) => {
        // eslint-disable-next-line no-console
        console.log(`\n=== Item ${index} ===`);
        // eslint-disable-next-line no-console
        console.log('Raw item:', item);
        // eslint-disable-next-line no-console
        console.log('Item type:', typeof item);

        // Handle different data formats
        let itemData = item;

        // If item is a string, try to parse it
        if (typeof item === 'string') {
          try {
            itemData = JSON.parse(item);
            // eslint-disable-next-line no-console
            console.log('Parsed item:', itemData);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to parse item string:', e);
          }
        }

        // If item is an object with 'text' and 'html' properties (AEM format)
        if (itemData.text && itemData.html && !itemData.titleRichtext) {
          // eslint-disable-next-line no-console
          console.log('Item is in AEM format {text, html}, need to extract multifield data');
          // This might be the case where multifield data is encoded differently
        }

        // Filter out hidden L4TagMulti fields to get clean data
        const cleanData = {};
        Object.keys(itemData).forEach((key) => {
          if (!key.startsWith('L4TagMulti-')) {
            cleanData[key] = itemData[key];
          }
        });
        itemData = cleanData;

        // eslint-disable-next-line no-console
        console.log('Cleaned data:', itemData);

        // Directly use itemData values (no need for getFieldValue)
        const xValue = itemData.xValue || '0';
        const yValue = itemData.yValue || '0';
        const titleRichtext = itemData.titleRichtext || '<p>Item Title</p>';
        const infoRichtext = itemData.infoRichtext || '<p>Description text here...</p>';
        const textWidth = itemData.textWidth || 'auto';
        const alignment = itemData.alignment || 'left';
        const side = itemData.side || 'left';

        // eslint-disable-next-line no-console
        console.log(`Item ${index} extracted values:`, {
          titleRichtext,
          infoRichtext,
          side,
          yValue,
          xValue,
          textWidth
        });

        // Build style-specific HTML
        let itemHtml = '';
        let itemClass = 'line-info-item';

        switch (styleLayout) {
          case '1':
            // Style 1: Text On Left & Right
            itemClass += ` line-info-item--side-${side}`;
            itemHtml = `
              <div class="${itemClass}" style="top: ${yValue}px;">
                <div class="line-info-item-title">${titleRichtext}</div>
                <div class="line-info-item-info">${infoRichtext}</div>
              </div>
            `;
            break;

          case '2':
            // Style 2: Text On Left / Right Sides
            const layoutStyle = itemData.layoutStyle || 'left';
            itemClass += ` line-info-item--layout-${layoutStyle}`;
            itemHtml = `
              <div class="${itemClass}" style="top: ${yValue}px;">
                <div class="line-info-item-title">${titleRichtext}</div>
                <div class="line-info-item-info">${infoRichtext}</div>
              </div>
            `;
            break;

          case '3':
          case '4':
          case '5':
            // Style 3, 4, 5: Text below / Freeform / Freeform-dialog box
            itemClass += ` line-info-item--align-${alignment}`;
            itemHtml = `
              <div class="${itemClass}" style="left: ${xValue}px; top: ${yValue}px; width: ${textWidth}px;">
                <div class="line-info-item-title">${titleRichtext}</div>
                <div class="line-info-item-info">${infoRichtext}</div>
              </div>
            `;
            break;

          default:
            itemHtml = `
              <div class="${itemClass}" style="left: ${xValue}px; top: ${yValue}px;">
                <div class="line-info-item-title">${titleRichtext}</div>
                <div class="line-info-item-info">${infoRichtext}</div>
              </div>
            `;
        }

        return itemHtml;
      }).join('');
    }

    // 7. Construct Container Style
    let containerStyle = '';
    if (paddingTop) containerStyle += `padding-top: ${paddingTop};`;
    if (paddingBottom) containerStyle += `padding-bottom: ${paddingBottom};`;

    // 8. Render with style class
    block.innerHTML = `
      <div class="line-info-container line-info--style${styleLayout}" style="${containerStyle}">
        ${pictureHtml}
        <div class="line-info-items">
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
