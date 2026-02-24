import { getBlockConfigs, getFieldValue, getBlockRepeatConfigs, getBlockRepeatConfigsByDataAueProps } from '../../scripts/utils.js';

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

    // 3. Get Layout Styles
    const paddingTop = v('paddingTop');
    const paddingBottom = v('paddingBottom');

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
