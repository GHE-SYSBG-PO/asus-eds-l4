import {
  getBlockConfigs,
  getFieldValue,
  getProductLine,
  isAuthorUe,
} from '../../scripts/utils.js';

const DEFAULT_CONFIG = {
  // basic
  toptitle: 'FAQs',
  right: 'Collapse all',
  left: 'Show all',
  titleColor: '',
  infoColor: '',
  menuCtaColor: '',
  menuCtaArrowColor: '',
  menuBorderColor: '',
  menuArrowColor: '',

  // advanced
  titleFontDTM: '',
  titleFontColor: '',
  selectionFontDTM: '',
  selectionFontColor: '',
  menuTitleFontDTM: '',
  menuInfoFontDTM: '',
  menuCtaFontDTM: '',
};

const DEFAULT_ITEM_CONFIG = {
  // basic
  collapseItemTitle: '',
  collapseItemInfo: '',
  ctaText: '',
  ctaColor: '',
  ctaHyperlink: '',

  // Desktop Image
  collapseItemImageD: '',
  collapseItemImageAlignD: '',
  collapseItemImageWidthD: '',
  collapseItemImageHeightD: '',

  // Tablet Image
  collapseItemImageT: '',
  collapseItemImageAlignT: '',
  collapseItemImageWidthT: '',
  collapseItemImageHeightT: '',

  // Mobile Image
  collapseItemImageM: '',
  collapseItemImageAlignM: '',
  collapseItemImageWidthM: '',
  collapseItemImageHeightM: '',
};

const DEFAULT_FONT_CONFIG = {
  toptitle: {
    asus: { prefix: 'tt-md-', suffix: '' },
    proart: { prefix: 'tt-md-', suffix: '' },
    rog: { prefix: 'tg-bd-', suffix: '' },
    tuf: { prefix: 'dp-cb-', suffix: '' },
  },
  control: {
    asus: { prefix: 'ro-rg-', suffix: '' },
    proart: { prefix: 'ro-rg-', suffix: '' },
    rog: { prefix: 'rc-rg-', suffix: '' },
    tuf: { prefix: 'ro-rg-', suffix: '' },
  },
  title: {
    asus: { prefix: 'ro-rg-', suffix: '' },
    proart: { prefix: 'ro-rg-', suffix: '' },
    rog: { prefix: 'rc-rg-', suffix: '' },
    tuf: { prefix: 'ro-rg-', suffix: '' },
  },
  info: {
    asus: { prefix: 'ro-rg-', suffix: '' },
    proart: { prefix: 'ro-rg-', suffix: '' },
    rog: { prefix: 'rc-rg-', suffix: '' },
    tuf: { prefix: 'ro-rg-', suffix: '' },
  },
  cta: {
    asus: { prefix: 'ro-md-', suffix: '-sh' },
    proart: { prefix: 'ro-md-', suffix: '-sh' },
    rog: { prefix: 'rc-bd-', suffix: '-sh' },
    tuf: { prefix: 'ro-md-', suffix: '-sh' },
  },
};

const _getFontClass = (type, dtmValue, fallbackSizes) => {
  if (dtmValue) return dtmValue;

  const productLine = getProductLine() || 'asus';
  const config = DEFAULT_FONT_CONFIG[type];
  if (!config) return fallbackSizes.join(' ');

  const fontConfig = config[productLine] || config.asus;

  return fallbackSizes.map((sizeStr) => {
    if (sizeStr.startsWith('small_')) {
      return `small_${fontConfig.prefix}${sizeStr.replace('small_', '')}${fontConfig.suffix}`;
    }
    if (sizeStr.startsWith('sm:')) {
      return `sm:${fontConfig.prefix}${sizeStr.replace('sm:', '')}${fontConfig.suffix}`;
    }
    return `${fontConfig.prefix}${sizeStr}${fontConfig.suffix}`;
  }).join(' ');
};

const renderPanelImg = (imgConf) => {
  const {
    imgD, imgAlignD, imgWidthD, imgHeightD,
    imgT, imgAlignT, imgWidthT, imgHeightT,
    imgM, imgAlignM, imgWidthM, imgHeightM,
  } = imgConf;

  if (!imgD && !imgT && !imgM) return '';

  const styles = [];
  if (imgWidthD) styles.push(`--collapseItemImageWidthD: ${imgWidthD}`);
  if (imgHeightD) styles.push(`--collapseItemImageHeightD: ${imgHeightD}`);
  if (imgWidthT) styles.push(`--collapseItemImageWidthT: ${imgWidthT}`);
  if (imgHeightT) styles.push(`--collapseItemImageHeightT: ${imgHeightT}`);
  if (imgWidthM) styles.push(`--collapseItemImageWidthM: ${imgWidthM}`);
  if (imgHeightM) styles.push(`--collapseItemImageHeightM: ${imgHeightM}`);

  const classNames = new Set(['content-img-group']);

  const applyAlignClasses = (align, prefix) => {
    const a = (align || '').toLowerCase();
    if (a === 'left') {
      classNames.add(`${prefix}ml-auto`);
    } else if (a === 'center') {
      classNames.add(`${prefix}ml-auto`);
      classNames.add(`${prefix}mr-auto`);
    } else if (a === 'right') {
      classNames.add(`${prefix}mr-0`);
    }
  };

  applyAlignClasses(imgAlignD, '');
  applyAlignClasses(imgAlignT, 'md:');
  applyAlignClasses(imgAlignM, 'sm:');

  const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';

  return `
    <div class="${Array.from(classNames).join(' ')}"${styleAttr}>
      <picture>
        ${imgM ? `<source media="(max-width: 730.5px)" srcset="${imgM}">` : ''}
        ${imgT ? `<source media="(max-width: 1279.5px)" srcset="${imgT}">` : ''}
        ${imgD ? `<source media="(min-width: 0px)" srcset="${imgD}">` : ''}
        <img src="${imgD || imgT || imgM}" alt="" loading="lazy">
      </picture>
    </div>
  `;
};

const _appendPreservedElements = (itemContentDiv, titleEle, contentEle, row) => {
  const btn = itemContentDiv.querySelector('button');
  if (titleEle) {
    if (titleEle.nodeType === 1 && !titleEle.hasAttribute('data-aue-prop') && titleEle === Array.from(row.children)[1]) {
      while (titleEle.firstChild) btn.appendChild(titleEle.firstChild);
    } else {
      btn.appendChild(titleEle);
    }
  }

  const infoContainer = itemContentDiv.querySelector('.content-info');
  if (contentEle) {
    if (contentEle.nodeType === 1 && !contentEle.hasAttribute('data-aue-prop') && contentEle === Array.from(row.children)[2]) {
      while (contentEle.firstChild) infoContainer.appendChild(contentEle.firstChild);
    } else {
      infoContainer.appendChild(contentEle);
    }
  }
};

const _applyUEAlwaysOpen = (row, itemContentDiv, btn) => {
  if (isAuthorUe()) {
    row.dataset.listenerAttached = 'true';
    row.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');

    const panelGroup = itemContentDiv.querySelector('.accordion-group');
    const panelInner = itemContentDiv.querySelector('.accordion-panel');
    if (panelGroup) panelGroup.style.height = 'auto';
    if (panelInner) {
      panelInner.style.opacity = '1';
      panelInner.style.pointerEvents = 'auto';
    }
  }
};

const initFAQInteractions = (block) => {
  const items = block.querySelectorAll('.fold-item');
  const showAllBtn = block.querySelector('.btn-showall');
  const collapseAllBtn = block.querySelector('.btn-collapseall');

  const setItemState = (itemEl, expand) => {
    const btn = itemEl.querySelector('.content-title button');
    const panelGroup = itemEl.querySelector('.accordion-group');
    const panelInner = itemEl.querySelector('.accordion-panel');

    if (!btn || !panelGroup) return;

    if (expand) {
      itemEl.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      panelGroup.style.height = `${panelGroup.scrollHeight}px`;
      if (panelInner) {
        panelInner.style.opacity = '1';
        panelInner.style.pointerEvents = 'auto'; // Re-enable pointer events
      }
      setTimeout(() => {
        panelGroup.style.height = 'auto';
      }, 300);
    } else {
      panelGroup.style.height = `${panelGroup.scrollHeight}px`; // Force height for animation
      // Trigger reflow
      // eslint-disable-next-line no-unused-expressions
      panelGroup.offsetHeight;

      itemEl.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      panelGroup.style.height = '0px';

      if (panelInner) {
        panelInner.style.opacity = '0';
        panelInner.style.pointerEvents = 'none'; // Disable pointer events when collapsed
      }
    }
  };

  items.forEach((itemEl) => {
    if (itemEl.dataset.listenerAttached) return;
    itemEl.dataset.listenerAttached = 'true';

    itemEl.addEventListener('click', (e) => {
      // Prevent toggling when selecting text
      if (window.getSelection().toString().length > 0) return;

      const isTitleClick = e.target.closest('.content-title');
      if (!isTitleClick) return;

      const isExpanded = itemEl.classList.contains('active');
      setItemState(itemEl, !isExpanded);
    });
  });

  if (showAllBtn && !showAllBtn.dataset.listenerAttached) {
    showAllBtn.dataset.listenerAttached = 'true';
    showAllBtn.addEventListener('click', () => {
      items.forEach((itemEl) => setItemState(itemEl, true));
    });
  }

  if (collapseAllBtn && !collapseAllBtn.dataset.listenerAttached) {
    collapseAllBtn.dataset.listenerAttached = 'true';
    collapseAllBtn.addEventListener('click', () => {
      items.forEach((itemEl) => setItemState(itemEl, false));
    });
  }
};

const _categorizeRows = (block) => {
  const allRows = Array.from(block.children);

  const itemRows = allRows.filter((row) => {
    if (row.classList.contains('faqs-item-wrapper')) return true;
    if (row.classList.contains('faqs-item')) return true;
    if (row.dataset && row.dataset.aueModel === 'faqs-item') return true;
    return Array.from(row.children).some((cell) => cell.textContent && cell.textContent.includes('L4TagMulti-collapseItem'));
  });

  const layoutRows = allRows.filter((row) => !row.classList.contains('fold-outer-container') && !itemRows.includes(row));

  return { itemRows, layoutRows };
};

const _handleLayoutRows = (layoutRows) => {
  if (isAuthorUe()) {
    layoutRows.forEach((row) => { row.style.display = 'none'; });
  } else {
    layoutRows.forEach((row) => { row.remove(); });
  }
};

const _createShell = (block, showAllText, collapseAllText, v) => {
  const controlFontClass = _getFontClass('control', v && v('selectionFontDTM', 'text'), ['20']);
  let foldContainerOuter = block.querySelector('.fold-outer-container');
  if (!foldContainerOuter) {
    foldContainerOuter = document.createElement('div');
    foldContainerOuter.className = 'fold-outer-container';
    foldContainerOuter.innerHTML = `
      <div class="fold-control">
        <button type="button" class="fold-btn btn-showall wdga ${controlFontClass}" data-galabel="${showAllText}" aria-label="${showAllText}" data-eventname="faq_btn_show_all_clicked" tabindex="0">${showAllText}</button>
        <div class="fold-btn-split"></div>
        <button type="button" class="fold-btn btn-collapseall wdga ${controlFontClass}" data-galabel="${collapseAllText}" aria-label="${collapseAllText}" data-eventname="faq_btn_collapse_all_clicked" tabindex="0">${collapseAllText}</button>
      </div>
      <div class="fold-container">
        <div class="fold-items"></div>
      </div>
    `;
    block.appendChild(foldContainerOuter);
  }
  return foldContainerOuter.querySelector('.fold-items');
};

const _parseFaqItemBlock = async (faqItemBlock) => {
  const itemConfig = await getBlockConfigs(faqItemBlock, DEFAULT_ITEM_CONFIG, 'faqs-item');
  const titleText = itemConfig.collapseItemTitle?.text ?? itemConfig.collapseItemTitle ?? '';
  const contentText = itemConfig.collapseItemInfo?.text ?? itemConfig.collapseItemInfo ?? '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contentText;

  return {
    ctaColor: itemConfig.ctaColor ?? '',
    ctaText: itemConfig.ctaText ?? '',
    ctaHyperlink: itemConfig.ctaHyperlink ?? '',
    imgConf: {
      imgD: itemConfig.collapseItemImageD ?? '',
      imgAlignD: itemConfig.collapseItemImageAlignD ?? '',
      imgWidthD: itemConfig.collapseItemImageWidthD ?? '',
      imgHeightD: itemConfig.collapseItemImageHeightD ?? '',
      imgT: itemConfig.collapseItemImageT ?? '',
      imgAlignT: itemConfig.collapseItemImageAlignT ?? '',
      imgWidthT: itemConfig.collapseItemImageWidthT ?? '',
      imgHeightT: itemConfig.collapseItemImageHeightT ?? '',
      imgM: itemConfig.collapseItemImageM ?? '',
      imgAlignM: itemConfig.collapseItemImageAlignM ?? '',
      imgWidthM: itemConfig.collapseItemImageWidthM ?? '',
      imgHeightM: itemConfig.collapseItemImageHeightM ?? '',
    },
    titleEle: document.createTextNode(titleText),
    titleHtml: titleText,
    contentEle: tempDiv,
  };
};

const _parseFaqRawRow = (row) => {
  const cells = Array.from(row.children);
  const getCellElement = (idx) => {
    const cell = cells[idx];
    if (!cell) return null;
    return cell.querySelector('[data-aue-prop]') || cell;
  };

  const titleEle = getCellElement(1);
  const imgCell = cells[6];
  const img = imgCell ? imgCell.querySelector('img') : null;

  if (isAuthorUe()) {
    cells.forEach((cell) => { cell.style.display = 'none'; });
  } else {
    cells.forEach((cell) => { cell.remove(); });
  }

  return {
    ctaColor: '',
    ctaHyperlink: '',
    ctaText: '',
    imgConf: {
      imgD: img ? img.src : '',
      imgT: '',
      imgM: '',
      imgAlignD: '',
      imgWidthD: '',
      imgHeightD: '',
      imgAlignT: '',
      imgWidthT: '',
      imgHeightT: '',
      imgAlignM: '',
      imgWidthM: '',
      imgHeightM: '',
    },
    titleEle,
    titleHtml: titleEle?.textContent?.trim() || '',
    contentEle: getCellElement(2),
  };
};

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'faqs');
    const v = getFieldValue(config);

    const colorGroup = v('colorGroup', 'text') || '';
    if (colorGroup) block.classList.add(colorGroup);

    block.classList.add('faqs-container');

    const { itemRows, layoutRows } = _categorizeRows(block);
    _handleLayoutRows(layoutRows);

    const showAllText = v('left', 'text') || 'Show all';
    const collapseAllText = v('right', 'text') || 'Collapse all';
    const foldItemsContainer = _createShell(block, showAllText, collapseAllText, v);
    const foldContainerOuter = foldItemsContainer.closest('.fold-outer-container');

    // Apply CSS variables to fold-outer-container
    const applyCssVar = (el, name, value) => {
      if (value) el.style.setProperty(`--${name}`, value);
    };
    applyCssVar(foldContainerOuter, 'titleColor', v('titleColor', 'text'));
    applyCssVar(foldContainerOuter, 'infoColor', v('infoColor', 'text'));
    applyCssVar(foldContainerOuter, 'menuCtaColor', v('menuCtaColor', 'text'));
    applyCssVar(foldContainerOuter, 'menuCtaArrowColor', v('menuCtaArrowColor', 'text'));
    applyCssVar(foldContainerOuter, 'menuBorderColor', v('menuBorderColor', 'text'));
    applyCssVar(foldContainerOuter, 'menuArrowColor', v('menuArrowColor', 'text'));

    const titleFontClass = _getFontClass('title', v('menuTitleFontDTM', 'text'), ['20', 'small_18']);
    const infoFontClass = _getFontClass('info', v('menuInfoFontDTM', 'text'), ['18', 'small_16']);
    // const ctaFontClass = _getFontClass('cta', v('menuCtaFontDTM', 'text'), ['18']); // Uncomment if CTA is rendered later

    // Process each item block in-place
    await Promise.all(itemRows.map(async (row, index) => {
      let parsedItem;
      const num = index + 1;

      const faqItemBlock = row.querySelector('.faqs-item');
      if (faqItemBlock) {
        parsedItem = await _parseFaqItemBlock(faqItemBlock);
      } else {
        parsedItem = _parseFaqRawRow(row);
      }

      const {
        ctaColor, ctaText, ctaHyperlink, imgConf, titleEle, titleHtml, contentEle,
      } = parsedItem;

      // Class and styling wrapper matching styles
      row.classList.add('fold-item', `fold-item-${num}`);
      row.dataset.index = num;

      const itemContentDiv = document.createElement('div');
      itemContentDiv.className = 'faqs-item';

      const ctaHtml = ctaText ? `
        <a class="content__link wdga" aria-label="${ctaText} (opens in new window)" href="${ctaHyperlink}" target="_blank" rel="noopener noreferrer" data-galabel="${ctaText}" data-eventname="faqs_item_${num}_link_click" style="${ctaColor ? `--ctaColor: ${ctaColor}` : ''}">
          <span>${ctaText}</span>
        </a>
      ` : '';

      itemContentDiv.innerHTML = `
        <h3 class="content-title ${titleFontClass}">
          <button type="button" class="wdga"
            id="footer_qa_fold_accordion_${num}" 
            data-galabel="Expand tab ${num}" data-eventname="faq_btn_${num}"
            aria-label="Expand ${titleHtml} tab" aria-controls="footer_qa_fold_accordion_group_${num}"
            aria-expanded="false" tabindex="0"></button>
        </h3>
        <div class="accordion-group" id="footer_qa_fold_accordion_group_${num}" role="region" aria-labelledby="footer_qa_fold_accordion_${num}" aria-hidden="true">
          <div class="accordion-panel">
            <div class="content-info-group">
              <div class="content-info info-1 ${infoFontClass}"></div>
            </div>
            ${ctaHtml}
            ${(imgConf.imgD || imgConf.imgT || imgConf.imgM) ? renderPanelImg(imgConf) : ''}
          </div>
        </div>
      `;

      _appendPreservedElements(itemContentDiv, titleEle, contentEle, row);

      row.appendChild(itemContentDiv);
      foldItemsContainer.appendChild(row);

      const btn = itemContentDiv.querySelector('button');
      _applyUEAlwaysOpen(row, itemContentDiv, btn);
    }));

    // Initialize interactions
    initFAQInteractions(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating faqs block:', error);
    block.innerHTML = '<div class="error-message">Failed to load faqs block</div>';
  }
}
