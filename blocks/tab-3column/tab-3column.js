/* eslint-disable max-len */
/**
 * ID:15 TAB_3COLUMN
 */

import { getBlockConfigs, getProductLine } from '../../scripts/utils.js';
import { prefixHex } from '../../components/button/button.js';
import loadSwiper from '../../vendor/swiper/index.js';

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
      class="tab3col-tab-btn flex items-center m-0 border border-solid rounded-[28px] sm:max-w-[172px] md:max-w-none cursor-pointer whitespace-nowrap font-[inherit] transition-[background] duration-250 ease sm:h-auto md:h-[56px] px-[16px] justify-start text-left lg:w-full md:flex-col md:items-center md:gap-[6px] px-[10px] py-[6px] sm:flex-col md:flex-row sm:items-center sm:gap-[4px] sm:shrink-0${isActive ? ' is-active' : ''} ${productFonts.tabText}"
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

function isMobile() {
  return window.innerWidth < 750;
}

function setupInteraction(componentEl, motionEnabled) {
  const tabBtns = [...componentEl.querySelectorAll('.tab3col-tab-btn')];
  const panels = [...componentEl.querySelectorAll('.tab3col-panel')];
  const tabList = componentEl.querySelector('.tab3col-tab-list');
  // Shared tab activation (used by both swiper and desktop click)
  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (!isMobile()) {
        activateTab(i, tabBtns, panels, tabList, motionEnabled);
      }
    });
  });

  // ── Mobile: Swiper ───────────────────────────────────────────
  // Wrap each tab-btn in a swiper-slide, init swiper with centeredSlides
  if (isMobile()) {
    // Wrap tab buttons in swiper structure
    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper-wrapper';
    tabBtns.forEach((btn) => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide tab3col-swiper-slide w-full flex items-center';
      slide.appendChild(btn);
      swiperWrapper.appendChild(slide);
    });

    // Swiper prev/next buttons
    const swiperPrev = document.createElement('div');
    swiperPrev.className = 'tab3col-swiper-prev';
    swiperPrev.innerHTML = `<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6.69394 11.6916C6.28586 12.1028 5.62504 12.1028 5.21696 11.6916L0.305897 6.74443C-0.101857 6.33324 -0.102073 5.6663 0.305897 5.25525L5.21696 0.308047C5.62496 -0.102684 6.28595 -0.102684 6.69394 0.308047C7.10202 0.719213 7.10202 1.38606 6.69394 1.79723L2.5234 6.00035L6.69394 10.2035C7.10202 10.6146 7.10202 11.2805 6.69394 11.6916Z" fill="currentColor"/>
                            </svg>`;

    const swiperNext = document.createElement('div');
    swiperNext.className = 'tab3col-swiper-next';
    swiperNext.innerHTML = `<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0.306058 0.308374C0.714136 -0.102791 1.37496 -0.102791 1.78304 0.308374L6.6941 5.25557C7.10186 5.66676 7.10207 6.3337 6.6941 6.74475L1.78304 11.692C1.37504 12.1027 0.714052 12.1027 0.306056 11.692C-0.102021 11.2808 -0.102021 10.6139 0.306056 10.2028L4.4766 5.99965L0.306058 1.79653C-0.102019 1.38537 -0.102019 0.719539 0.306058 0.308374Z" fill="currentColor"/>
                            </svg>`;

    // Rebuild tab-bar: [prev] [swiper] [next]
    tabList.innerHTML = '';
    tabList.classList.add('swiper', 'tab3col-tab-swiper');
    tabList.appendChild(swiperWrapper);

    const tabBar = componentEl.querySelector('.tab3col-tab-bar');
    tabBar.insertBefore(swiperPrev, tabList);
    tabBar.appendChild(swiperNext);

    loadSwiper().then((Swiper) => {
      const swiper = new Swiper(tabList, {
        centeredSlides: true,
        slidesPerView: 'auto',
        loop: false,
        navigation: {
          prevEl: swiperPrev,
          nextEl: swiperNext,
        },
        on: {
          slideChange(s) {
            activateTab(s.activeIndex, tabBtns, panels, null, motionEnabled);
          },
        },
      });

      // Sync initial active tab
      swiper.slideTo(0, 0);
    });
  }
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
    // Parse gradient/solid color values from dialog (no # prefix).
    // "4379B1"        → { from: "#4379b1", to: "#4379b1" }  solid
    // "4379B1,5977A1" → { from: "#4379b1", to: "#5977a1" }  gradient
    const parseGradient = (raw) => {
      if (!raw) return null;
      const parts = raw.split(',').map((s) => `#${s.trim().toLowerCase()}`);
      return { from: parts[0], to: parts[1] || parts[0] };
    };

    const tabBorderGradientDefault = parseGradient(tabData.tabcontainerbordercolordefault || '');
    const tabBorderGradientHover = parseGradient(tabData.tabcontainerbordercolorhover || '');
    const tabBorderGradientSelect = parseGradient(tabData.tabcontainerbordercolorselect || '');
    const tabBgDefault = prefixHex(tabData.tabcontainerbgcolordefault || '');
    const tabBgGradientHover = parseGradient(tabData.tabcontainerbgcolorhover || '');
    const tabBgGradientSelect = parseGradient(tabData.tabcontainerbgcolorselect || '');
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
    // Border gradient stops per state
    if (tabBorderGradientDefault) {
      inlineStyle += `--tab3col-tab-border-from-default: ${tabBorderGradientDefault.from};`;
      inlineStyle += `--tab3col-tab-border-to-default: ${tabBorderGradientDefault.to};`;
    }
    if (tabBorderGradientHover) {
      inlineStyle += `--tab3col-tab-border-from-hover: ${tabBorderGradientHover.from};`;
      inlineStyle += `--tab3col-tab-border-to-hover: ${tabBorderGradientHover.to};`;
    }
    if (tabBorderGradientSelect) {
      inlineStyle += `--tab3col-tab-border-from-select: ${tabBorderGradientSelect.from};`;
      inlineStyle += `--tab3col-tab-border-to-select: ${tabBorderGradientSelect.to};`;
    }
    // Bg: default solid, hover/select gradient stops
    if (tabBgDefault) inlineStyle += `--tab3col-tab-bg-default: ${tabBgDefault};`;
    if (tabBgGradientHover) {
      inlineStyle += `--tab3col-tab-bg-from-hover: ${tabBgGradientHover.from};`;
      inlineStyle += `--tab3col-tab-bg-to-hover: ${tabBgGradientHover.to};`;
    }
    if (tabBgGradientSelect) {
      inlineStyle += `--tab3col-tab-bg-from-select: ${tabBgGradientSelect.from};`;
      inlineStyle += `--tab3col-tab-bg-to-select: ${tabBgGradientSelect.to};`;
    }
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
        class="tab3col-component box-border container-inline sm:w-full md:w-[87.5%] sm:max-w-full md:max-w-[896px] lg:max-w-[1260px] sm:gap-[20px] md:gap-[24px]  lg:gap-[40px] lg:flex lg:flex-row lg:items-start md:grid sm:grid ${colorGroup}"
        data-motion="${motionEnabled}"
        data-icon="${tabIconEnabled}"
        ${inlineStyle ? `style="${inlineStyle.trim()}"` : ''}
      >
        <div class="tab3col-tab-bar order-0 flex items-center lg:flex-col lg:items-stretch lg:shrink-0 lg:w-[185px] md:flex-row md:w-full md:sticky md:top-0 md:z-10 sm:flex-row sm:items-center sm:w-full sm:sticky sm:top-0 sm:z-10">
          <div class="tab3col-tab-list sm:w-[87.5%] sm:max-w-[480px] md:w-auto md:max-w-none flex md:gap-[20px] items-center sm:justify-center lg:justify-start grow overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible md:flex-row sm:flex-row sm:grow" role="tablist">
            ${tabBtnsHtml}
          </div>
        </div>
        <div class="tab3col-panels w-full lg:grow"></div>
      </div>`);

    // ── Move block-level instrumentation to component wrapper ────

    const panelsEl = componentHtml.querySelector('.tab3col-panels');

    // ── Build each panel, move per-item instrumentation ──────────
    // eslint-disable-next-line no-inner-declarations
    async function renderTabItemHtml(itemEl, tab, oldEl) {
      itemEl.classList.add('tab3col-panel', 'lg:gap-[40px]', 'md:gap-[32px]', 'sm:gap-[24px]', 'lg:flex-row', 'sm:flex-col');
      const isActive = oldEl ? oldEl.classList.contains('is-active') : false;
      if (isActive) {
        itemEl.classList.add('is-active');
      }

      const lastDom = itemEl.children[itemEl.children.length - 1];

      const newItem = document.createRange().createContextualFragment(`
        <div class="tab3col-media-slot sm:order-2 lg:order-1 grow min-w-0 md:w-full sm:w-full"></div>
        <div class="tab3col-text-col sm:order-1 lg:order-2 sm:text-center lg:text-left shrink-0 box-border sm:w-full lg:w-[12.5cqw]">
          <h3 class="tab3col-title ${productFonts.tabTitle} sm:mb-[8px] md:mb-[12px] ${titleFontDTM || ''}">${tab.tabTitle.html || ''}</h3>
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
