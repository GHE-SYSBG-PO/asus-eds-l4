import {
  getBlockConfigs,
  getFieldValue,
  isAuthorUe,
} from '../../scripts/utils.js';

const DEFAULT_CONFIG = {
  right: 'Collapse all',
  left: 'Show all',
};

const DEFAULT_ITEM_CONFIG = {
  collapseItemTitle: '',
  collapseItemInfo: '',
  collapseItemImageD: '',
};

const renderPanelImg = (imgSrc) => `
  <div class="content-img-group">
    <img src="${imgSrc}" alt="">
  </div>
`;

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

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'faqs');
    const v = getFieldValue(config);

    // Apply main config variables
    const colorGroup = v('colorGroup', 'text') || '';
    if (colorGroup) block.classList.add(colorGroup);

    block.classList.add('faqs-container');

    // Categorize existing rows
    const allRows = Array.from(block.children);

    // Identify items: either a nested block wrapper, UE item row, or raw row with the marker
    const itemRows = allRows.filter((row) => {
      if (row.classList.contains('faqs-item-wrapper')) return true;
      if (row.classList.contains('faqs-item')) return true;
      if (row.dataset && row.dataset.aueModel === 'faqs-item') return true;
      // Check if any child cell contains the specific item marker
      return Array.from(row.children).some((cell) => cell.textContent && cell.textContent.includes('L4TagMulti-collapseItem'));
    });

    // Layout rows: everything else that isn't our UI container or an item
    const layoutRows = allRows.filter((row) => !row.classList.contains('fold-outer-container') && !itemRows.includes(row));

    // Handle layout config rows
    if (isAuthorUe()) {
      // Hide layout config rows directly instead of deleting them to preserve UE configs
      layoutRows.forEach((row) => {
        row.style.display = 'none';
      });
    } else {
      layoutRows.forEach((row) => {
        row.remove();
      });
    }

    const showAllText = v('left', 'text') || 'Show all';
    const collapseAllText = v('right', 'text') || 'Collapse all';

    // Create the folding UI wrapper if it doesn't exist
    let foldContainerOuter = block.querySelector('.fold-outer-container');
    if (!foldContainerOuter) {
      foldContainerOuter = document.createElement('div');
      foldContainerOuter.className = 'fold-outer-container';
      foldContainerOuter.innerHTML = `
        <div class="fold-control">
          <button type="button" class="fold-btn btn-showall wdga ro-rg-20" data-galabel="${showAllText}" aria-label="${showAllText}" data-eventname="faq_btn_show_all_clicked" tabindex="0">${showAllText}</button>
          <div class="fold-btn-split"></div>
          <button type="button" class="fold-btn btn-collapseall wdga ro-rg-20" data-galabel="${collapseAllText}" aria-label="${collapseAllText}" data-eventname="faq_btn_collapse_all_clicked" tabindex="0">${collapseAllText}</button>
        </div>
        <div class="fold-container">
          <div class="fold-items"></div>
        </div>
      `;
      block.appendChild(foldContainerOuter);
    }

    const foldItemsContainer = foldContainerOuter.querySelector('.fold-items');

    // Process each item block in-place
    await Promise.all(itemRows.map(async (row, index) => {
      let imgSrc = '';
      let titleEle = null;
      let contentEle = null;
      let titleHtml = '';
      const num = index + 1;

      // Handle both nested block style and raw row style
      const faqItemBlock = row.querySelector('.faqs-item');
      if (faqItemBlock) {
        const itemConfig = await getBlockConfigs(faqItemBlock, DEFAULT_ITEM_CONFIG, 'faqs-item');
        const titleText = itemConfig.collapseItemTitle?.text ?? itemConfig.collapseItemTitle ?? '';
        const contentText = itemConfig.collapseItemInfo?.text ?? itemConfig.collapseItemInfo ?? '';
        imgSrc = itemConfig.collapseItemImageD ?? '';
        titleEle = document.createTextNode(titleText);
        titleHtml = titleText;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentText;
        contentEle = tempDiv;
      } else {
        const cells = Array.from(row.children);
        const getCellElement = (idx) => {
          const cell = cells[idx];
          if (!cell) return null;
          const auePropEle = cell.querySelector('[data-aue-prop]');
          return auePropEle || cell;
        };

        titleEle = getCellElement(1);
        contentEle = getCellElement(2);

        const imgCell = cells[6];
        const img = imgCell ? imgCell.querySelector('img') : null;
        imgSrc = img ? img.src : '';
        titleHtml = titleEle?.textContent?.trim() || '';

        if (isAuthorUe()) {
          // Hide original cells (keep them for UE bindings but hide visually)
          cells.forEach((cell) => { cell.style.display = 'none'; });
        } else {
          cells.forEach((cell) => { cell.remove(); });
        }
      }

      // Class and styling wrapper matching styles
      row.classList.add('fold-item', `fold-item-${num}`);
      row.dataset.index = num;

      const itemContentDiv = document.createElement('div');
      itemContentDiv.className = 'faqs-item';

      itemContentDiv.innerHTML = `
        <h3 class="content-title no-top-space ro-rg-20 small_ro-rg-18">
          <button type="button" class="wdga"
            id="footer_qa_fold_accordion_${num}" 
            data-galabel="Expand tab ${num}" data-eventname="qa_btn_${num}"
            aria-label="Expand ${titleHtml} tab" aria-controls="footer_qa_fold_accordion_group_${num}"
            aria-expanded="false" tabindex="0"></button>
        </h3>
        <div class="accordion-group" id="footer_qa_fold_accordion_group_${num}" role="region" aria-labelledby="footer_qa_fold_accordion_${num}" aria-hidden="true">
          <div class="accordion-panel">
            <div class="content-info-group">
              <div class="content-info info-1 ro-rg-18 small_ro-rg-16"></div>
            </div>
            ${imgSrc ? renderPanelImg(imgSrc) : ''}
          </div>
        </div>
      `;

      // Insert actual elements natively to preserve UE bounds
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

      // Add the new UI wrapper to row
      row.appendChild(itemContentDiv);

      // Move it into the fold container
      foldItemsContainer.appendChild(row);

      // Expand automatically if in UE authoring environment
      if (isAuthorUe()) {
        row.dataset.listenerAttached = 'true'; // Prevent click initialization
        row.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');

        const panelGroup = itemContentDiv.querySelector('.accordion-group');
        const panelInner = itemContentDiv.querySelector('.accordion-panel');
        if (panelGroup) {
          panelGroup.style.height = 'auto'; // Fully expand without animation
        }
        if (panelInner) {
          panelInner.style.opacity = '1';
          panelInner.style.pointerEvents = 'auto';
        }
      }
    }));

    // Initialize interactions
    initFAQInteractions(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating faqs block:', error);
    block.innerHTML = '<div class="error-message">Failed to load faqs block</div>';
  }
}
