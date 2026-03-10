/* eslint-disable max-len */
/**
 * ID:8 TAB
 *
 * Layout styles:
 *   1 — tab on top, full-width content below (col1 上 col2 下，上下排列)
 *   2 — tab in middle: col1 above tab bar, col2 below tab bar
 *   3 — tab on top, split container: col1 | col2 左右並排
 *   4 — double tab: 每個 tab item 下有 sub-tab，各自 fetch 獨立 fragment
 *
 * Fragment rendering:
 *   每個 item (或 layout4 的 sub-item) 設定一個 ID12 fragment URL。
 *   Fetch 該頁面 HTML，從 .container-2cols 取出第一個 child (col1/綠框)
 *   和第二個 child (col2/紫框)，強制覆蓋 ID12 原本排版，依 ID8 layout 來排。
 */

import {
  getBlockConfigs,
  getProductLine,
  isAuthorUe,
} from '../../scripts/utils.js';
import { prefixHex } from '../../components/button/button.js';
import loadSwiper from '../../vendor/swiper/index.js';
import buildSecitonClass from '../../components/section/section.js';

// ── Font config per product line ─────────────────────────────
const FONTS = {
  asus: {
    tabText: 'ro-md-14-sh-lg ro-md-14-sh-md ro-md-14-sh-sm',
    summaryText: 'ro-rg-20-lg ro-rg-20-md ro-rg-18-sm',
  },
  proart: {
    tabText: 'ro-md-14-sh-lg ro-md-14-sh-md ro-md-14-sh-sm',
    summaryText: 'ro-rg-20-lg ro-rg-20-md ro-rg-18-sm',
  },
  rog: {
    tabText: 'rc-bd-14-sh-lg rc-bd-14-sh-md rc-bd-14-sh-sm',
    summaryText: 'rc-rg-20-lg rc-rg-20-md rc-rg-18-sm',
  },
  tuf: {
    tabText: 'ro-md-14-sh-lg ro-md-14-sh-md ro-md-14-sh-sm',
    summaryText: 'ro-rg-20-lg ro-rg-20-md ro-rg-18-sm',
  },
};

const PRODUCT_LINE = getProductLine();
const productFonts = FONTS[PRODUCT_LINE] || FONTS.asus;

// ── Default configs ───────────────────────────────────────────
const DEFAULT_CONFIG = {
  layoutStyle: '1',
  tabStyle: '1',
  showIcon: 'no',
  motionEnabled: 'false',
  colorGroup: '',
  // Advanced: tab container style overrides
  tabContainerBorderWidthDefault: '',
  tabContainerBorderWidthHover: '',
  tabContainerBorderWidthSelect: '',
  tabContainerBorderColorDefault: '',
  tabContainerBorderColorHover: '',
  tabContainerBorderColorSelect: '',
  tabContainerBgColorDefault: '',
  tabContainerBgColorHover: '',
  tabContainerBgColorSelect: '',
  tabContainerRadiusTl: '',
  tabContainerRadiusTr: '',
  tabContainerRadiusBr: '',
  tabContainerRadiusBl: '',
  tabFontColorDefault: '',
  tabFontColorHover: '',
  tabFontColorSelect: '',
  summaryFontColor: '',
};

const ITEM_DEFAULT_CONFIG = {
  tabText: '',
  tabIconAsset: '',
  fragmentUrl: '',
  // layout 4 only
  secondLayerTab: 'no',
  summaryRichtext: '',
  secondTabStyle: '1',
};

// ── Helpers ───────────────────────────────────────────────────

/**
 * Parse "colorA,colorB" (no #) → { from: '#colorA', to: '#colorB' }
 * Single value → { from: '#color', to: '#color' }
 */
function parseGradient(raw) {
  if (!raw) return null;
  const parts = raw.split(',').map((s) => `#${s.trim().toLowerCase()}`);
  return { from: parts[0], to: parts[1] || parts[0] };
}

function buildRadiusValue(tl, tr, br, bl) {
  if (!tl && !tr && !br && !bl) return '';
  if (tl && tr && br && bl) return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  const parts = [];
  if (tl) parts.push(`border-top-left-radius:${tl}px`);
  if (tr) parts.push(`border-top-right-radius:${tr}px`);
  if (br) parts.push(`border-bottom-right-radius:${br}px`);
  if (bl) parts.push(`border-bottom-left-radius:${bl}px`);
  return parts.length ? `${parts.join(';')};` : '';
}

// ── Fragment loader ───────────────────────────────────────────

/**
 * Fetch an ID12 fragment page.
 * ID12 renders as: .container-2cols > [firstChild(col1), secondChild(col2)]
 * We grab the two direct children and return them.
 * @param {string} url
 * @returns {Promise<{ col1: Element|null, col2: Element|null }>}
 */
async function loadFragment(url) {
  if (!url) return { col1: null, col2: null };
  try {
    const resp = await fetch(url);
    if (!resp.ok) return { col1: null, col2: null };
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // ID12 block name is "container-2cols"
    const container = doc.querySelector('.container-2cols');
    if (!container) return { col1: null, col2: null };
    const children = [...container.children];
    return {
      col1: children[0] || null,
      col2: children[1] || null,
    };
  } catch {
    return { col1: null, col2: null };
  }
}

// ── Tab button builder ────────────────────────────────────────

function buildTabBtnHtml(tabText, tabIconAsset, index, isActive, iconEnabled, tabRadiusStyle) {
  const iconHtml = iconEnabled && tabIconAsset
    ? `<img class="tab-tab-icon object-contain shrink-0 h-[24px]" src="${tabIconAsset}" alt="" aria-hidden="true" />`
    : '';
  return `
    <button
      class="tab-tab-btn flex items-center justify-center gap-[6px] m-0 border-none cursor-pointer font-[inherit] transition-[color,background] duration-200 ease shrink-0${isActive ? ' is-active' : ''} ${productFonts.tabText}"
      data-tab-index="${index}"
      role="tab"
      aria-selected="${isActive ? 'true' : 'false'}"
      ${tabRadiusStyle ? `style="${tabRadiusStyle}"` : ''}
    >${iconHtml}<span class="tab-tab-text block">${tabText || ''}</span>
    </button>`;
}

// ── Panel transition ──────────────────────────────────────────

function activateTab(index, tabBtns, panels, motionEnabled) {
  tabBtns.forEach((btn, i) => {
    btn.classList.toggle('is-active', i === index);
    btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });

  const current = panels.find((p) => p.classList.contains('is-active'));
  const next = panels[index];
  if (!next || current === next) return;

  if (!motionEnabled) {
    if (current) current.classList.remove('is-active');
    next.classList.add('is-active');
    return;
  }

  const doFadeIn = () => {
    next.classList.add('is-active', 'tab-panel-fade-in');
    // eslint-disable-next-line no-unused-expressions
    next.offsetHeight;
    next.classList.add('tab-panel-visible');
    next.addEventListener('transitionend', () => {
      next.classList.remove('tab-panel-fade-in', 'tab-panel-visible');
    }, { once: true });
  };

  if (current) {
    current.classList.add('tab-panel-fade-out');
    current.addEventListener('transitionend', () => {
      current.classList.remove('is-active', 'tab-panel-fade-out');
      doFadeIn();
    }, { once: true });
  } else {
    doFadeIn();
  }
}

// ── Swiper setup (shared by primary + sub tab) ───────────────

function createSwiperArrows(prefix) {
  const prevSvg = '<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.69394 11.6916C6.28586 12.1028 5.62504 12.1028 5.21696 11.6916L0.305897 6.74443C-0.101857 6.33324 -0.102073 5.6663 0.305897 5.25525L5.21696 0.308047C5.62496 -0.102684 6.28595 -0.102684 6.69394 0.308047C7.10202 0.719213 7.10202 1.38606 6.69394 1.79723L2.5234 6.00035L6.69394 10.2035C7.10202 10.6146 7.10202 11.2805 6.69394 11.6916Z" fill="currentColor"/></svg>';
  const nextSvg = '<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.306058 0.308374C0.714136 -0.102791 1.37496 -0.102791 1.78304 0.308374L6.6941 5.25557C7.10186 5.66676 7.10207 6.3337 6.6941 6.74475L1.78304 11.692C1.37504 12.1027 0.714052 12.1027 0.306056 11.692C-0.102021 11.2808 -0.102021 10.6139 0.306056 10.2028L4.4766 5.99965L0.306058 1.79653C-0.102019 1.38537 -0.102019 0.719539 0.306058 0.308374Z" fill="currentColor"/></svg>';
  const prev = document.createElement('div');
  prev.className = `${prefix}-swiper-prev`;
  prev.innerHTML = prevSvg;
  const next = document.createElement('div');
  next.className = `${prefix}-swiper-next`;
  next.innerHTML = nextSvg;
  return { prev, next };
}

function setupSwiper(tabListEl, tabBarEl, tabBtns, panels, motionEnabled, prefix) {
  if (window.innerWidth >= 1280) {
    // desktop: plain click
    tabBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => activateTab(i, tabBtns, panels, motionEnabled));
    });
    return;
  }

  // tablet / mobile: Swiper
  const swiperWrapper = document.createElement('div');
  swiperWrapper.className = 'swiper-wrapper';
  tabBtns.forEach((btn) => {
    const slide = document.createElement('div');
    slide.className = `swiper-slide ${prefix}-swiper-slide`;
    slide.appendChild(btn);
    swiperWrapper.appendChild(slide);
  });

  const { prev, next } = createSwiperArrows(prefix);
  tabListEl.innerHTML = '';
  tabListEl.classList.add('swiper');
  tabListEl.appendChild(swiperWrapper);
  tabBarEl.insertBefore(prev, tabListEl);
  tabBarEl.appendChild(next);

  loadSwiper().then((Swiper) => {
    // eslint-disable-next-line no-new
    new Swiper(tabListEl, {
      slidesPerView: 'auto',
      spaceBetween: 0,
      loop: false,
      navigation: {
        prevEl: prev,
        nextEl: next,
        disabledClass: `${prefix}-swiper-btn-hidden`,
      },
      on: {
        click(s) {
          const btn = s.clickedSlide?.querySelector('.tab-tab-btn');
          if (btn) {
            const idx = tabBtns.indexOf(btn);
            if (idx !== -1) {
              activateTab(idx, tabBtns, panels, motionEnabled);
              s.slideTo(idx, 300);
            }
          }
        },
      },
    });
  });
}

// ── Fragment slot builder ─────────────────────────────────────

function buildFragmentSlots(col1, col2) {
  const slot1 = document.createElement('div');
  slot1.className = 'tab-col1';
  if (col1) slot1.appendChild(col1);

  const slot2 = document.createElement('div');
  slot2.className = 'tab-col2';
  if (col2) slot2.appendChild(col2);

  return { slot1, slot2 };
}

// ── Layout renderers ──────────────────────────────────────────

/**
 * Layout 1 — tab on top, col1 上 col2 下，全寬，上下排列
 *
 * Desktop/Tablet:
 *   .tab-nav-bar (sticky)
 *   .tab-panels
 *     .tab-panel
 *       .tab-col1   ← 綠框，全寬
 *       .tab-col2   ← 紫框，全寬，在 col1 下方
 *
 * Mobile: 同上
 */
async function renderLayout1(componentEl, items, motionEnabled, tabRadiusStyle, tabIconEnabled) {
  const tabBtnsHtml = items.map((item, i) => buildTabBtnHtml(item.tabText?.text, item.tabIconAsset?.text, i, i === 0, tabIconEnabled, tabRadiusStyle)).join('');

  componentEl.innerHTML = `
    <div class="tab-nav-bar flex items-center w-full sticky top-0 z-10">
      <div class="tab-tab-list flex flex-row items-center w-full overflow-hidden" role="tablist">
        ${tabBtnsHtml}
      </div>
    </div>
    <div class="tab-panels w-full"></div>`;

  const panelsEl = componentEl.querySelector('.tab-panels');
  const tabBarEl = componentEl.querySelector('.tab-nav-bar');
  const tabListEl = componentEl.querySelector('.tab-tab-list');

  await Promise.all(items.map(async (item, i) => {
    const { col1, col2 } = await loadFragment(item.fragmentUrl?.text);
    const panel = document.createElement('div');
    panel.className = `tab-panel tab-panel-layout1${i === 0 ? ' is-active' : ''}`;
    panel.setAttribute('role', 'tabpanel');
    const { slot1, slot2 } = buildFragmentSlots(col1, col2);
    panel.append(slot1, slot2);
    panelsEl.append(panel);
  }));

  const tabBtns = [...componentEl.querySelectorAll('.tab-tab-btn')];
  const panels = [...componentEl.querySelectorAll('.tab-panel')];
  setupSwiper(tabListEl, tabBarEl, tabBtns, panels, motionEnabled, 'tab');
}

/**
 * Layout 2 — tab in middle
 *   col1 (綠框) 在 tab bar 上方，隨 tab 切換
 *   col2 (紫框) 在 tab bar 下方
 *
 * Desktop:
 *   .tab-col1-stage  ← 只顯示 active item 的 col1
 *   .tab-nav-bar
 *   .tab-panels
 *     .tab-panel
 *       .tab-col2
 *
 * Layout 2 多個 container 時，僅第一個 container 的 col1 移到 tab 上方（spec）
 * 這裡只有一組 tab，col1-stage 隨 tab 切換更新。
 */
async function renderLayout2(componentEl, items, motionEnabled, tabRadiusStyle, tabIconEnabled) {
  const tabBtnsHtml = items.map((item, i) => buildTabBtnHtml(item.tabText?.text, item.tabIconAsset?.text, i, i === 0, tabIconEnabled, tabRadiusStyle)).join('');

  componentEl.innerHTML = `
    <div class="tab-col1-stage w-full"></div>
    <div class="tab-nav-bar flex items-center w-full sticky top-0 z-10">
      <div class="tab-tab-list flex flex-row items-center w-full overflow-hidden" role="tablist">
        ${tabBtnsHtml}
      </div>
    </div>
    <div class="tab-panels w-full"></div>`;

  const col1Stage = componentEl.querySelector('.tab-col1-stage');
  const panelsEl = componentEl.querySelector('.tab-panels');
  const tabBarEl = componentEl.querySelector('.tab-nav-bar');
  const tabListEl = componentEl.querySelector('.tab-tab-list');

  // store all col1 elements, swap on tab change
  const col1Els = [];

  await Promise.all(items.map(async (item, i) => {
    const { col1, col2 } = await loadFragment(item.fragmentUrl?.text);

    // col1 slot goes into stage
    const col1Slot = document.createElement('div');
    col1Slot.className = `tab-col1-slot${i === 0 ? ' is-active' : ''}`;
    if (col1) col1Slot.appendChild(col1);
    col1Els.push(col1Slot);
    col1Stage.appendChild(col1Slot);

    // panel only holds col2
    const panel = document.createElement('div');
    panel.className = `tab-panel tab-panel-layout2${i === 0 ? ' is-active' : ''}`;
    panel.setAttribute('role', 'tabpanel');
    const slot2 = document.createElement('div');
    slot2.className = 'tab-col2';
    if (col2) slot2.appendChild(col2);
    panel.appendChild(slot2);
    panelsEl.appendChild(panel);
  }));

  const tabBtns = [...componentEl.querySelectorAll('.tab-tab-btn')];
  const panels = [...componentEl.querySelectorAll('.tab-panel')];

  // override activate to also swap col1Stage
  const activateLayout2 = (index) => {
    col1Els.forEach((el, i) => el.classList.toggle('is-active', i === index));
    activateTab(index, tabBtns, panels, motionEnabled);
  };

  // desktop: plain click
  if (window.innerWidth >= 1280) {
    tabBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => activateLayout2(i));
    });
  } else {
    setupSwiper(tabListEl, tabBarEl, tabBtns, panels, motionEnabled, 'tab');
    // also wire col1 swap on swiper click (swiper sets up its own click handler)
    tabBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        col1Els.forEach((el, j) => el.classList.toggle('is-active', j === i));
      });
    });
  }
}

/**
 * Layout 3 — tab on top, split container
 *   col1 (綠框) 和 col2 (紫框) 在 tab 下方左右並排
 *
 * Desktop/Tablet:
 *   .tab-nav-bar
 *   .tab-panels
 *     .tab-panel.tab-panel-layout3   ← flex-row
 *       .tab-col1   ← 左 (綠框)
 *       .tab-col2   ← 右 (紫框)
 *
 * Mobile: col1 col2 上下排列
 */
async function renderLayout3(componentEl, items, motionEnabled, tabRadiusStyle, tabIconEnabled) {
  const tabBtnsHtml = items.map((item, i) => buildTabBtnHtml(item.tabText?.text, item.tabIconAsset?.text, i, i === 0, tabIconEnabled, tabRadiusStyle)).join('');

  componentEl.innerHTML = `
    <div class="tab-nav-bar flex items-center w-full sticky top-0 z-10">
      <div class="tab-tab-list flex flex-row items-center w-full overflow-hidden" role="tablist">
        ${tabBtnsHtml}
      </div>
    </div>
    <div class="tab-panels w-full"></div>`;

  const panelsEl = componentEl.querySelector('.tab-panels');
  const tabBarEl = componentEl.querySelector('.tab-nav-bar');
  const tabListEl = componentEl.querySelector('.tab-tab-list');

  await Promise.all(items.map(async (item, i) => {
    const { col1, col2 } = await loadFragment(item.fragmentUrl?.text);
    const panel = document.createElement('div');
    panel.className = `tab-panel tab-panel-layout3${i === 0 ? ' is-active' : ''}`;
    panel.setAttribute('role', 'tabpanel');
    const { slot1, slot2 } = buildFragmentSlots(col1, col2);
    panel.append(slot1, slot2);
    panelsEl.append(panel);
  }));

  const tabBtns = [...componentEl.querySelectorAll('.tab-tab-btn')];
  const panels = [...componentEl.querySelectorAll('.tab-panel')];
  setupSwiper(tabListEl, tabBarEl, tabBtns, panels, motionEnabled, 'tab');
}

/**
 * Layout 4 — Double tab
 *   每個 primary tab item 底下有 sub-tab (second layer)，
 *   每個 sub-item 各自 fetch 一個 fragment。
 *
 *   若 secondLayerTab = 'yes':
 *     .tab-panel
 *       .tab-summary-richtext   ← 空值則隱藏
 *       .tab-subnav-bar         ← sub tab nav
 *       .tab-sub-panels
 *         .tab-sub-panel
 *           .tab-col1 / .tab-col2
 *
 *   若 secondLayerTab = 'no':
 *     .tab-panel
 *       .tab-col1 / .tab-col2   ← 直接顯示 fragment（視為 layout1）
 */
async function renderLayout4(componentEl, items, motionEnabled, tabRadiusStyle, tabIconEnabled) {
  const tabBtnsHtml = items.map((item, i) => buildTabBtnHtml(item.tabText?.text, item.tabIconAsset?.text, i, i === 0, tabIconEnabled, tabRadiusStyle)).join('');

  componentEl.innerHTML = `
    <div class="tab-nav-bar flex items-center w-full sticky top-0 z-10">
      <div class="tab-tab-list flex flex-row items-center w-full overflow-hidden" role="tablist">
        ${tabBtnsHtml}
      </div>
    </div>
    <div class="tab-panels w-full"></div>`;

  const panelsEl = componentEl.querySelector('.tab-panels');
  const tabBarEl = componentEl.querySelector('.tab-nav-bar');
  const tabListEl = componentEl.querySelector('.tab-tab-list');

  await Promise.all(items.map(async (item, i) => {
    const hasSubTab = item.secondLayerTab === 'yes';
    const panel = document.createElement('div');
    panel.className = `tab-panel tab-panel-layout4${i === 0 ? ' is-active' : ''}`;
    panel.setAttribute('role', 'tabpanel');

    if (!hasSubTab) {
      // no sub tab → direct fragment display (col1/col2)
      const { col1, col2 } = await loadFragment(item.fragmentUrl?.text);
      const { slot1, slot2 } = buildFragmentSlots(col1, col2);
      panel.append(slot1, slot2);
    } else {
      // has sub tab
      // summary richtext (hide if empty)
      const summaryEl = document.createElement('div');
      summaryEl.className = `tab-summary-richtext ${productFonts.summaryText}`;
      if (item.summaryRichtext?.html) {
        summaryEl.innerHTML = item.summaryRichtext.html;
      } else {
        summaryEl.hidden = true;
      }
      panel.appendChild(summaryEl);

      // sub nav bar
      const subNavBar = document.createElement('div');
      subNavBar.className = 'tab-subnav-bar flex items-center w-full sticky z-9';

      const subTabList = document.createElement('div');
      subTabList.className = 'tab-subtab-list flex flex-row items-center w-full overflow-hidden';
      subTabList.setAttribute('role', 'tablist');

      // sub tab style: use item.secondTabStyle if available
      const subTabRadiusStyle = tabRadiusStyle; // same radius token for now

      const subItems = item.subItems || [];
      const subTabBtnsHtml = subItems.map((subItem, j) => buildTabBtnHtml(subItem.subItemText?.text, subItem.subItemIconAsset?.text, j, j === 0, tabIconEnabled, subTabRadiusStyle)).join('');
      subTabList.innerHTML = subTabBtnsHtml;
      subNavBar.appendChild(subTabList);
      panel.appendChild(subNavBar);

      // sub panels
      const subPanelsEl = document.createElement('div');
      subPanelsEl.className = 'tab-sub-panels w-full';

      await Promise.all(subItems.map(async (subItem, j) => {
        const { col1, col2 } = await loadFragment(subItem.subItemFragmentUrl?.text);
        const subPanel = document.createElement('div');
        subPanel.className = `tab-sub-panel${j === 0 ? ' is-active' : ''}`;
        subPanel.setAttribute('role', 'tabpanel');
        const { slot1, slot2 } = buildFragmentSlots(col1, col2);
        subPanel.append(slot1, slot2);
        subPanelsEl.appendChild(subPanel);
      }));

      panel.appendChild(subPanelsEl);

      // wire sub tab interaction
      const subBtns = [...subTabList.querySelectorAll('.tab-tab-btn')];
      const subPanels = [...subPanelsEl.querySelectorAll('.tab-sub-panel')];
      setupSwiper(subTabList, subNavBar, subBtns, subPanels, motionEnabled, 'subtab');
    }

    panelsEl.appendChild(panel);
  }));

  const tabBtns = [...componentEl.querySelectorAll(':scope > .tab-nav-bar .tab-tab-btn')];
  const panels = [...panelsEl.querySelectorAll(':scope > .tab-panel')];
  setupSwiper(tabListEl, tabBarEl, tabBtns, panels, motionEnabled, 'tab');
}

// ── Main decorator ────────────────────────────────────────────

async function decoratePage(block) {
  buildSecitonClass(block);

  const data = block.dataset;

  const layoutStyle = data.layoutstyle || DEFAULT_CONFIG.layoutStyle;
  const tabStyle = data.tabstyle || DEFAULT_CONFIG.tabStyle;
  const showIcon = data.showicon === 'yes';
  const motionEnabled = data.motionenabled === 'true';
  const colorGroup = data.colorgroup || '';

  // ── Advanced: inline CSS overrides ──────────────────────────
  const parseGradientRaw = (key) => parseGradient(data[key] || '');
  const prefixHexRaw = (key) => prefixHex(data[key] || '');

  const tabBorderWidthDefault = data.tabcontainerborderwidthdefault || '';
  const tabBorderWidthHover = data.tabcontainerborderwidthhover || '';
  const tabBorderWidthSelect = data.tabcontainerborderwidthselect || '';
  const tabBorderGradientDefault = parseGradientRaw('tabcontainerbordercolordefault');
  const tabBorderGradientHover = parseGradientRaw('tabcontainerbordercolorhover');
  const tabBorderGradientSelect = parseGradientRaw('tabcontainerbordercolorselect');
  const tabBgDefault = prefixHexRaw('tabcontainerbgcolordefault');
  const tabBgGradientHover = parseGradientRaw('tabcontainerbgcolorhover');
  const tabBgGradientSelect = parseGradientRaw('tabcontainerbgcolorselect');
  const tabFontColorDefault = prefixHexRaw('tabfontcolordefault');
  const tabFontColorHover = prefixHexRaw('tabfontcolorhover');
  const tabFontColorSelect = prefixHexRaw('tabfontcolorselect');
  const summaryFontColor = prefixHexRaw('summaryfontcolor');

  const tabRadiusStyle = buildRadiusValue(
    data.tabcontainerradiustl || '',
    data.tabcontainerradiustr || '',
    data.tabcontainerradiusbr || '',
    data.tabcontainerradiusbl || '',
  );

  // build component CSS variable string
  let componentStyle = '';
  if (tabBorderWidthDefault) componentStyle += `--tab-border-width-default: ${tabBorderWidthDefault}px;`;
  if (tabBorderWidthHover) componentStyle += `--tab-border-width-hover: ${tabBorderWidthHover}px;`;
  if (tabBorderWidthSelect) componentStyle += `--tab-border-width-select: ${tabBorderWidthSelect}px;`;
  if (tabBorderGradientDefault) {
    componentStyle += `--tab-border-from-default: ${tabBorderGradientDefault.from};`;
    componentStyle += `--tab-border-to-default: ${tabBorderGradientDefault.to};`;
  }
  if (tabBorderGradientHover) {
    componentStyle += `--tab-border-from-hover: ${tabBorderGradientHover.from};`;
    componentStyle += `--tab-border-to-hover: ${tabBorderGradientHover.to};`;
  }
  if (tabBorderGradientSelect) {
    componentStyle += `--tab-border-from-select: ${tabBorderGradientSelect.from};`;
    componentStyle += `--tab-border-to-select: ${tabBorderGradientSelect.to};`;
  }
  if (tabBgDefault) componentStyle += `--tab-bg-default: ${tabBgDefault};`;
  if (tabBgGradientHover) {
    componentStyle += `--tab-bg-from-hover: ${tabBgGradientHover.from};`;
    componentStyle += `--tab-bg-to-hover: ${tabBgGradientHover.to};`;
  }
  if (tabBgGradientSelect) {
    componentStyle += `--tab-bg-from-select: ${tabBgGradientSelect.from};`;
    componentStyle += `--tab-bg-to-select: ${tabBgGradientSelect.to};`;
  }
  if (tabFontColorDefault) componentStyle += `--tab-color-default: ${tabFontColorDefault};`;
  if (tabFontColorHover) componentStyle += `--tab-color-hover: ${tabFontColorHover};`;
  if (tabFontColorSelect) componentStyle += `--tab-color-select: ${tabFontColorSelect};`;
  if (summaryFontColor) componentStyle += `--tab-summary-color: ${summaryFontColor};`;

  // ── Collect item wrappers ────────────────────────────────────
  const itemWrappers = [...block.querySelectorAll('.tab-item-wrapper')];

  const items = await Promise.all(itemWrappers.map(async (wrapper) => {
    const itemEl = wrapper.querySelector('.tab-item');
    const itemConfig = await getBlockConfigs(itemEl, ITEM_DEFAULT_CONFIG, 'tab-item');

    const result = {
      tabText: itemConfig.tabItemText,
      tabIconAsset: itemConfig.tabItemIconAsset,
      fragmentUrl: itemConfig.tabItemFragmentUrl,
      secondLayerTab: itemConfig.secondLayerTab?.text || 'no',
      summaryRichtext: itemConfig.summaryRichtext,
      subItems: [],
    };

    // layout 4: sub-items come from the multi container field "subItems"
    // getBlockConfigs returns multi fields as an array on itemConfig.subItems
    if (layoutStyle === '4' && result.secondLayerTab === 'yes') {
      result.subItems = itemConfig.subItems || [];
    }

    return result;
  }));

  // ── Build component shell ────────────────────────────────────
  const componentEl = document.createElement('div');
  componentEl.className = `tab-component tab-layout${layoutStyle} tab-style${tabStyle} l4-column-width-12 box-border`;
  if (componentStyle) componentEl.setAttribute('style', componentStyle.trim());

  if (colorGroup) block.classList.add(colorGroup);

  block.innerHTML = '';
  block.appendChild(componentEl);

  // ── Dispatch to layout renderer ──────────────────────────────
  const renderers = {
    1: renderLayout1,
    2: renderLayout2,
    3: renderLayout3,
    4: renderLayout4,
  };
  const render = renderers[layoutStyle] || renderers[1];
  await render(componentEl, items, motionEnabled, tabRadiusStyle, showIcon);

  // ── UE author live-update ────────────────────────────────────
  block.addEventListener('asus-l4--section-tab', async ({ detail }) => {
    const itemConfig = await getBlockConfigs(detail, ITEM_DEFAULT_CONFIG, 'tab-item');
    const allItemEls = [...block.querySelectorAll('.tab-item')];
    const idx = allItemEls.findIndex((el) => el.dataset.aueResource === detail.dataset.aueResource);
    // update tab button text
    const menuDom = block.querySelectorAll('.tab-tab-text')[idx];
    if (menuDom) menuDom.textContent = itemConfig.tabItemText?.text || '';
  });
}

export default async function decorate(block) {
  try {
    await decoratePage(block);

    let resizeTimer;
    if (!isAuthorUe()) {
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => window.location.reload(), 200);
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating tab block:', error);
    block.innerHTML = '<div class="error-message">Failed to load tab block</div>';
  }
}
