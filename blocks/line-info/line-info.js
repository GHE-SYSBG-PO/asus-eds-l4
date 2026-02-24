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
    let textItems = v(textItemsKey) || [];

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
    let textItemsHtml = '';
    if (textItems.length > 0) {
      textItemsHtml = textItems.map((item, index) => {
        // Parse item if it's a string (JSON encoded)
        let itemData = typeof item === 'string' ? JSON.parse(item) : item;

        // Filter out hidden L4TagMulti fields to get clean data
        const cleanData = {};
        Object.keys(itemData).forEach((key) => {
          if (!key.startsWith('L4TagMulti-')) {
            cleanData[key] = itemData[key];
          }
        });
        itemData = cleanData;

        // Create a getFieldValue function for this item to handle richtext properly
        const itemFieldValue = getFieldValue(itemData);

        const xValue = itemData.xValue || '0';
        const yValue = itemData.yValue || '0';
        const titleRichtext = itemFieldValue('titleRichtext', 'html') || '<p>Item Title</p>';
        const infoRichtext = itemFieldValue('infoRichtext', 'html') || '<p>Description text here...</p>';
        const textWidth = itemData.textWidth || 'auto';
        const alignment = itemData.alignment || 'left';
        const side = itemData.side || 'left';

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
