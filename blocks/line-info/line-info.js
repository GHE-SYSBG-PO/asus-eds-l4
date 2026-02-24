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
    const textItems = v(textItemsKey) || [];

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

    // 6. Construct Text Items HTML
    let textItemsHtml = '';
    if (Array.isArray(textItems) && textItems.length > 0) {
      textItemsHtml = textItems.map((item) => {
        // Handle both object and string formats
        const itemData = typeof item === 'string' ? JSON.parse(item) : item;

        const xValue = itemData.xValue || '0';
        const yValue = itemData.yValue || '0';
        const titleRichtext = itemData.titleRichtext || '<p>Item Title</p>';
        const infoRichtext = itemData.infoRichtext || '<p>Description text here...</p>';
        const textWidth = itemData.textWidth || 'auto';

        return `
          <div class="line-info-item" style="left: ${xValue}; top: ${yValue}; width: ${textWidth};">
            <div class="line-info-item-title">${titleRichtext}</div>
            <div class="line-info-item-info">${infoRichtext}</div>
          </div>
        `;
      }).join('');
    }

    // 7. Construct Container Style
    let containerStyle = '';
    if (paddingTop) containerStyle += `padding-top: ${paddingTop};`;
    if (paddingBottom) containerStyle += `padding-bottom: ${paddingBottom};`;

    // 8. Render
    block.innerHTML = `
      <div class="line-info-container" style="${containerStyle}">
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
