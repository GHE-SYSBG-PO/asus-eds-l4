import {
  getBlockConfigs,
  getFieldValue,
} from '../../scripts/utils.js';

const DEFAULT_CONFIG = {};
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
    const layoutRows = allRows.filter((row) => !row.classList.contains('faqs-item-wrapper') && !row.classList.contains('fold-outer-container'));
    const itemRows = allRows.filter((row) => row.classList.contains('faqs-item-wrapper'));

    // Hide layout config rows directly instead of deleting them to preserve UE configs
    layoutRows.forEach((row) => {
      row.style.display = 'none';
    });

    // Create the folding UI wrapper if it doesn't exist
    let foldContainerOuter = block.querySelector('.fold-outer-container');
    if (!foldContainerOuter) {
      foldContainerOuter = document.createElement('div');
      foldContainerOuter.className = 'fold-outer-container';
      foldContainerOuter.innerHTML = `
        <div class="fold-control">
          <button type="button" class="fold-btn btn-showall wdga ro-rg-20" data-galabel="Show all" aria-label="Click to show all FAQ" data-eventname="faq_btn_show_all_clicked" tabindex="0">Show all</button>
          <div class="fold-btn-split"></div>
          <button type="button" class="fold-btn btn-collapseall wdga ro-rg-20" data-galabel="Collapse all" aria-label="Click to collapse all FAQ" data-eventname="faq_btn_collapse_all_clicked" tabindex="0">Collapse all</button>
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
      const faqItemBlock = row.querySelector('.faqs-item');

      // Class and styling wrapper matching styles
      row.classList.add('fold-item', `fold-item-${index + 1}`);
      row.dataset.index = index + 1;

      if (faqItemBlock) {
        const itemConfig = await getBlockConfigs(faqItemBlock, DEFAULT_ITEM_CONFIG, 'faqs-item');
        const num = index + 1;

        const title = itemConfig.collapseItemTitle?.text ?? itemConfig.collapseItemTitle ?? '';
        const content = itemConfig.collapseItemInfo?.text ?? itemConfig.collapseItemInfo ?? '';
        const imgSrc = itemConfig.collapseItemImageD ?? '';

        faqItemBlock.innerHTML = `
          <h3 class="content-title no-top-space ro-rg-20 small_ro-rg-18">
            <button type="button" class="wdga"
              id="footer_qa_fold_accordion_${num}" 
              data-galabel="Expand tab ${num}" data-eventname="qa_btn_${num}"
              aria-label="Expand ${title} tab" aria-controls="footer_qa_fold_accordion_group_${num}"
              aria-expanded="false" tabindex="0">${title}</button>
          </h3>
          <div class="accordion-group" id="footer_qa_fold_accordion_group_${num}" role="region" aria-labelledby="footer_qa_fold_accordion_${num}" aria-hidden="true">
            <div class="accordion-panel">
              <div class="content-info-group">
                <div class="content-info info-1 ro-rg-18 small_ro-rg-16">${content}</div>
              </div>
              ${imgSrc ? renderPanelImg(imgSrc) : ''}
            </div>
          </div>
        `;
      }

      // Move it into the fold container, preserving AEM wrappers hooks
      foldItemsContainer.appendChild(row);
    }));

    // Initialize interactions
    initFAQInteractions(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating faqs block:', error);
    block.innerHTML = '<div class="error-message">Failed to load faqs block</div>';
  }
}
