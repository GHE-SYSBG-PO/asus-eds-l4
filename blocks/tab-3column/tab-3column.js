/* eslint-disable max-len */
/**
 * ID:15 TAB_3COLUMN
 */

import { getBlockConfigs, getProductLine } from '../../scripts/utils.js';
import { prefixHex } from '../../components/button/button.js';

const FONTS = {
  asus: {
    tabText: 'ro-md-18-sh-lg ro-md-18-sh-md ro-md-16-sh-sm',
    tabTitle: 'tt-md-24',
    tabInfo: {
      fontDT: 'ro-rg-18-lg ro-rg-18-md',
      fontM: 'ro-rg-16-sm',
    },
  },
  proart: {
    tabText: 'ro-md-18-sh-lg ro-md-18-sh-md ro-md-16-sh-sm',
    tabTitle: 'tt-md-24',
    tabInfo: {
      fontDT: 'ro-rg-18-lg ro-rg-18-md',
      fontM: 'ro-rg-16-sm',
    },
  },
  rog: {
    tabText: 'rc-bd-18-sh-lg rc-bd-18-sh-md rc-bd-16-sh-sm',
    tabTitle: 'tg-bd-24',
    tabInfo: {
      fontDT: 'rc-rg-18-lg rc-rg-18-md',
      fontM: 'rc-rg-16-sm',
    },
  },
  tuf: {
    tabText: 'ro-md-18-sh-lg ro-md-18-sh-md ro-md-16-sh-sm',
    tabTitle: 'dp-cb-24',
    tabInfo: {
      fontDT: 'ro-rg-18-lg ro-rg-18-md',
      fontM: 'ro-rg-16-sm',
    },
  },
};

const PRODUCT_LINE = getProductLine();
const productFonts = FONTS[PRODUCT_LINE];

const DEFAULT_CONFIG = {
  motionEnabled: false,
  tabIconEnabled: true,
};

const ITEM_DEFAULT_CONFIG = {
  tabText: '',
  tabIconAsset: '',
  tabTitle: '',
  tabInfo: '',
};

function buildRadiusValue(tl, tr, br, bl) {
  if ([tl, tr, br, bl].every((v) => !v)) return '';
  const px = (v) => (v ? `${v}px` : '0');
  return `${px(tl)} ${px(tr)} ${px(br)} ${px(bl)}`;
}

function buildTabBtnHtml(tabText, tabIconAsset, index, isActive, iconEnabled) {
  const iconHtml = iconEnabled && tabIconAsset
    ? `<img class="tab3col-tab-icon object-contain shrink-0 h-[36px] mr-[12px] sm:mr-0 md:mr-0" src="${tabIconAsset}" alt="" aria-hidden="true" />`
    : '';
  return `
    <button
      class="tab3col-tab-btn flex items-center m-0 mb-[20px] border border-solid rounded-[28px] cursor-pointer whitespace-nowrap font-[inherit] transition-[background] duration-250 ease h-[56px] px-[16px] justify-start text-left lg:w-full md:flex-col md:items-center md:gap-[6px] px-[10px] py-[6px] sm:flex-col md:flex-row sm:items-center sm:gap-[4px] sm:shrink-0${isActive ? ' is-active' : ''} ${productFonts.tabText}"
      data-tab-index="${index}"
      role="tab"
      aria-selected="${isActive}"
      aria-controls="tab3col-panel-${index}"
    >${iconHtml}<span class="tab3col-tab-text">${tabText || ''}</span></button>`;
}

function activateTab(index, tabBtns, panels, tabList, motionEnabled) {
  tabBtns.forEach((btn, i) => {
    const active = i === index;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  panels.forEach((panel, i) => {
    const active = i === index;
    panel.classList.toggle('is-active', active);
    if (active) panel.removeAttribute('hidden');
    else panel.setAttribute('hidden', '');
  });

  const activeBtn = tabBtns[index];
  if (activeBtn && tabList) {
    const scrollTarget = activeBtn.offsetLeft
      - tabList.offsetWidth / 2
      + activeBtn.offsetWidth / 2;
    if (motionEnabled) tabList.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    else tabList.scrollLeft = scrollTarget;
  }
}

function updateArrows(tabList, prevArrow, nextArrow) {
  if (!tabList || !prevArrow || !nextArrow) return;
  const { scrollLeft, scrollWidth, clientWidth } = tabList;
  prevArrow.style.display = scrollLeft > 1 ? '' : 'none';
  nextArrow.style.display = scrollLeft + clientWidth < scrollWidth - 1 ? '' : 'none';
}

function setupInteraction(componentEl, motionEnabled) {
  const tabBtns = [...componentEl.querySelectorAll('.tab3col-tab-btn')];
  const panels = [...componentEl.querySelectorAll('.tab3col-panel')];
  const tabList = componentEl.querySelector('.tab3col-tab-list');
  const prevArrow = componentEl.querySelector('.tab3col-arrow--prev');
  const nextArrow = componentEl.querySelector('.tab3col-arrow--next');

  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => activateTab(i, tabBtns, panels, tabList, motionEnabled));
  });

  if (tabList) {
    tabList.addEventListener(
      'scroll',
      () => updateArrows(tabList, prevArrow, nextArrow),
      { passive: true },
    );
    setTimeout(() => updateArrows(tabList, prevArrow, nextArrow), 150);
  }

  if (prevArrow) prevArrow.addEventListener('click', () => tabList.scrollBy({ left: -160, behavior: 'smooth' }));
  if (nextArrow) nextArrow.addEventListener('click', () => tabList.scrollBy({ left: 160, behavior: 'smooth' }));
}

export default async function decorate(block) {
  try {
    // tab-3column data
    const tabContainer = block;
    const tabData = tabContainer.dataset;
    const motionEnabled = tabData.motionenabled || DEFAULT_CONFIG.motionEnabled;
    const colorGroup = tabData.colorgroup || '';
    const widthTabArea = tabData.widthtabarea || '';
    const widthTextArea = tabData.widthtextarea || '';
    const tabIconEnabled = tabData.tabiconenabled || DEFAULT_CONFIG.tabIconEnabled;
    const tabBarBgColor = prefixHex(tabData.tabbarbgcolorvalue || '');
    const tabFontColorDefault = prefixHex(tabData.tabfontcolordefault || '');
    const tabFontColorHover = prefixHex(tabData.tabfontcolorhover || '');
    const tabFontColorSelect = prefixHex(tabData.tabfontcolorselect || '');
    const tabBorderWidthDefault = tabData.tabcontainerborderwidthdefault || '';
    const tabBorderWidthHover = tabData.tabcontainerborderwidthhover || '';
    const tabBorderWidthSelect = tabData.tabcontainerborderwidthselect || '';
    const tabBorderColorDefault = prefixHex(
      tabData.tabcontainerbordercolordefault || '',
    );
    const tabBorderColorHover = prefixHex(
      tabData.tabcontainerbordercolorhover || '',
    );
    const tabBorderColorSelect = prefixHex(
      tabData.tabcontainerbordercolorselect || '',
    );
    const tabBgDefault = prefixHex(tabData.tabcontainerbgcolordefault || '');
    const tabBgHover = prefixHex(tabData.tabcontainerbgcolorhover || '');
    const tabBgSelect = prefixHex(tabData.tabcontainerbgcolorselect || '');
    const tabRadiusValue = buildRadiusValue(
      tabData.tabcontainerradiustl || '',
      tabData.tabcontainerradiustr || '',
      tabData.tabcontainerradiusbr || '',
      tabData.tabcontainerradiusbl || '',
    );
    const titleFontDTM = tabData.titleFontDTM || DEFAULT_CONFIG.titleFontDTM;
    const titleFontColor = prefixHex(tabData.titlefontcolor || '');
    const infoFontColor = prefixHex(tabData.infofontcolor || '');

    const itemEls = [
      ...tabContainer.querySelectorAll('.tab-3column-item-wrapper'),
    ];

    // ── 2nd-level item config ────────────────────────────────────
    // Each itemEl is passed individually to getBlockConfigs using the
    // tab-3column-item model, so field values are read correctly.
    const tabs = await Promise.all(
      itemEls.map(async (itemEl) => {
        const itemConfig = await getBlockConfigs(
          itemEl.querySelector('.tab-3column-item'),
          ITEM_DEFAULT_CONFIG,
          'tab-3column-item',
        );
        console.log('tab item data', itemConfig);
        return itemConfig;
      }),
    );

    // ── Inline CSS variables ─────────────────────────────────────
    let inlineStyle = '';
    if (widthTabArea) inlineStyle += `--tab3col-tab-area-width: ${widthTabArea}%;`;
    if (widthTextArea) inlineStyle += `--tab3col-text-area-width: ${widthTextArea}%;`;
    if (tabBarBgColor) inlineStyle += `--tab3col-tab-bar-bg: ${tabBarBgColor};`;
    if (tabFontColorDefault) inlineStyle += `--tab3col-tab-color-default: ${tabFontColorDefault};`;
    if (tabFontColorHover) inlineStyle += `--tab3col-tab-color-hover: ${tabFontColorHover};`;
    if (tabFontColorSelect) inlineStyle += `--tab3col-tab-color-select: ${tabFontColorSelect};`;
    if (tabBorderWidthDefault) inlineStyle += `--tab3col-tab-border-width-default: ${tabBorderWidthDefault}px;`;
    if (tabBorderWidthHover) inlineStyle += `--tab3col-tab-border-width-hover: ${tabBorderWidthHover}px;`;
    if (tabBorderWidthSelect) inlineStyle += `--tab3col-tab-border-width-select: ${tabBorderWidthSelect}px;`;
    if (tabBorderColorDefault) inlineStyle += `--tab3col-tab-border-color-default: ${tabBorderColorDefault};`;
    if (tabBorderColorHover) inlineStyle += `--tab3col-tab-border-color-hover: ${tabBorderColorHover};`;
    if (tabBorderColorSelect) inlineStyle += `--tab3col-tab-border-color-select: ${tabBorderColorSelect};`;
    if (tabBgDefault) inlineStyle += `--tab3col-tab-bg-default: ${tabBgDefault};`;
    if (tabBgHover) inlineStyle += `--tab3col-tab-bg-hover: ${tabBgHover};`;
    if (tabBgSelect) inlineStyle += `--tab3col-tab-bg-select: ${tabBgSelect};`;
    if (tabRadiusValue) inlineStyle += `--tab3col-tab-radius: ${tabRadiusValue};`;
    if (titleFontColor) inlineStyle += `--tab3col-title-color: ${titleFontColor};`;
    if (infoFontColor) inlineStyle += `--tab3col-info-color: ${infoFontColor};`;

    // ── Build tab buttons HTML ───────────────────────────────────
    const tabBtnsHtml = tabs
      .map((tab, i) => buildTabBtnHtml(
        tab.tabText.text,
        tab.tabIconAsset.text,
        i,
        i === 0,
        tabIconEnabled,
      ))
      .join('');

    // ── Build component shell ────────────────────────────────────
    const componentHtml = document.createRange().createContextualFragment(`
      <div
        class="tab3col-component box-border container-inline w-[87.5%] gap-[40px] lg:flex lg:flex-row lg:items-start md:block sm:block ${colorGroup}"
        data-motion="${motionEnabled}"
        data-icon="${tabIconEnabled}"
        ${inlineStyle ? `style="${inlineStyle.trim()}"` : ''}
      >
        <div class="tab3col-tab-bar flex items-center lg:flex-col lg:items-stretch lg:shrink-0 lg:w-[185px] md:flex-row md:w-full md:sticky md:top-0 md:z-10 sm:flex-row sm:items-center sm:w-full sm:sticky sm:top-0 sm:z-10">
          <button class="tab3col-arrow tab3col-arrow--prev hidden shrink-0 items-center justify-center w-[32px] h-[32px] bg-transparent border-none cursor-pointer sm:flex" aria-label="Scroll tabs left" style="display:none">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <div class="tab3col-tab-list flex items-center grow overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible md:flex-row  sm:flex-row sm:grow" role="tablist">
            ${tabBtnsHtml}
          </div>
          <button class="tab3col-arrow tab3col-arrow--next hidden shrink-0 items-center justify-center w-[32px] h-[32px] bg-transparent border-none cursor-pointer sm:flex" aria-label="Scroll tabs right" style="display:none">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
        <div class="tab3col-panels w-full lg:grow"></div>
      </div>`);

    // ── Move block-level instrumentation to component wrapper ────

    const panelsEl = componentHtml.querySelector('.tab3col-panels');

    // ── Build each panel, move per-item instrumentation ──────────
    // eslint-disable-next-line no-inner-declarations
    async function renderTabItemHtml(itemEl, tab, oldEl) {
      itemEl.classList.add('tab3col-panel', 'gap-[40px]');
      const isActive = oldEl ? oldEl.classList.contains('is-active') : false;
      if (isActive) {
        itemEl.classList.add('is-active');
      }

      const lastDom = itemEl.children[itemEl.children.length - 1];

      const newItem = document.createRange().createContextualFragment(`
        <div class="tab3col-media-slot grow min-w-0 md:w-full sm:w-full"></div>
        <div class="tab3col-text-col shrink-0 box-border sm:w-full md:w-[12.5cqw] sm:w-full">
          <h3 class="tab3col-title ${productFonts.tabTitle} m-0 mb-[12px] ${titleFontDTM}">${tab.tabTitle.html || ''}</h3>
          <div class="tab3col-info m-0 ${productFonts.tabInfo.fontDT} ${productFonts.tabInfo.fontM}">${tab.tabInfo.html || ''}</div>
        </div>
      `);
      if (lastDom.children.length > 2 || lastDom.querySelector('.block')) {
        newItem.querySelector('.tab3col-media-slot').append(lastDom);
      }
      itemEl.innerHTML = '';
      itemEl.append(newItem);
      if (!oldEl) {
        panelsEl.appendChild(itemEl);
      }
    }

    itemEls.forEach((itemEl, i) => {
      renderTabItemHtml(itemEl.querySelector('.tab-3column-item'), tabs[i]);
    });

    block.innerHTML = '';
    block.append(componentHtml);

    // default show
    if (block.querySelector('.tab-3column-item')) {
      block.querySelector('.tab-3column-item').classList.add('is-active');
    }

    setupInteraction(block.querySelector('.tab3col-component'), motionEnabled);

    // update item dom data from block tab-3column-item
    block.addEventListener(
      'asus-l4--section-tab-3column',
      async ({ detail }) => {
        const tab = await getBlockConfigs(
          detail,
          ITEM_DEFAULT_CONFIG,
          'tab-3column-item',
        );

        // update menu text
        const doms = [...block.querySelectorAll('.tab-3column-item')];
        const index = doms.findIndex(
          (r) => r.dataset.aueResource === detail.dataset.aueResource,
        );
        const menuDom = block.querySelectorAll('.tab3col-tab-text')[index];
        if (menuDom) {
          menuDom.innerHTML = tab.tabText.text;
        }

        renderTabItemHtml(detail, tab, doms[index]);
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating tab-3column block:', error);
    block.innerHTML = '<div class="error-message">Failed to load tab-3column block</div>';
  }
}
