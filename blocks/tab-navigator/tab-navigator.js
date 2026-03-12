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
  getBlockRepeatConfigs,
} from '../../scripts/utils.js';
import { prefixHex } from '../../components/button/button.js';
import loadSwiper from '../../vendor/swiper/index.js';
import buildSecitonClass from '../../components/section/section.js';
import { loadFragment } from '../fragment/fragment.js';

const isLocalhost = window.location.href.indexOf('localhost') > -1;

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
  showIcon: 'false',
  colorGroup: '',
  // tab theme
  tabSelectedColor: '',
  tabDefaultColor: '',
  tabLineWidth: '',
  tabLineEndpoints: '',
  tabCornerDecorationColor: '',
  // tab container
  tabBorderColor2: '',
  tabBgColor: '',
  tabBorderWidthDefault: '',
  tabBorderWidthHover2: '',
  tabBorderWidthSelect2: '',
  tabContainerRadiusTl2: '',
  tabContainerRadiusTr2: '',
  tabContainerRadiusBr2: '',
  tabContainerRadiusBl2: '',
  tabContainerBorderColorDefault: '',
  tabContainerBorderColorHover: '',
  tabContainerBorderColorSelect: '',

  // tab text font colors
  tabFontColorDefault: '',
  tabFontColorHover: '',
  tabFontColorSelect: '',
  // tab text font size (style 1)
  tabFontD1: '',
  tabFontT1: '',
  tabFontM1: '',
  // tab text font size (style 2/3/4)
  tabFontD234: '',
  tabFontT234: '',
  tabFontM234: '',
  // summary richtext (layout 4)
  summaryFontD: '',
  summaryFontT: '',
  summaryFontM: '',
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

// ── Tab item decorator ───────────────────────────────────────

function decorateItemEl(
  itemEl,
  tabText,
  tabIconAsset,
  index,
  isActive,
  iconEnabled,
  tabRadiusStyle,
  fontClass,
) {
  const resolvedFontClass = fontClass || productFonts.tabText;

  // 補上 tab button 所需屬性（不覆蓋已有的 data-aue-* 屬性）
  itemEl.classList.add(
    'tab-tab-btn',
    'flex',
    'items-center',
    'justify-center',
    'gap-[6px]',
    'm-0',
    'border-none',
    'cursor-pointer',
    'font-[inherit]',
    'transition-[color,background]',
    'duration-200',
    'ease',
    'shrink-0',
    ...resolvedFontClass.split(' ').filter(Boolean),
  );
  if (isActive) itemEl.classList.add('is-active');
  itemEl.setAttribute('data-tab-index', index);
  itemEl.setAttribute('role', 'tab');
  itemEl.setAttribute('aria-selected', isActive ? 'true' : 'false');
  if (tabRadiusStyle) {
    // append to existing inline style if any
    const existing = itemEl.getAttribute('style') || '';
    itemEl.setAttribute('style', existing + tabRadiusStyle);
  }

  // 替換內部視覺內容
  itemEl.innerHTML = '';
  if (iconEnabled && tabIconAsset) {
    const img = document.createElement('img');
    img.className = 'tab-tab-icon object-contain shrink-0 h-[24px]';
    img.src = tabIconAsset;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    itemEl.appendChild(img);
  }
  const span = document.createElement('span');
  span.className = 'tab-tab-text block';
  span.textContent = tabText || '';
  itemEl.appendChild(span);
}

// ── Panel transition ──────────────────────────────────────────

function activateTab(index, tabBtns, panels) {
  tabBtns.forEach((btn, i) => {
    btn.classList.toggle('is-active', i === index);
    btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });

  const current = panels.find((p) => p.classList.contains('is-active'));
  const next = panels[index];
  if (!next || current === next) return;

  if (current) current.classList.remove('is-active');
  next.classList.add('is-active');
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

function setupSwiper(tabListEl, tabBarEl, tabBtns, panels, prefix) {
  if (window.innerWidth >= 1280) {
    // desktop: plain click
    tabBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => activateTab(i, tabBtns, panels));
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
              activateTab(idx, tabBtns, panels);
              s.slideTo(idx, 300);
            }
          }
        },
      },
    });
  });
}

// ── Fragment loader ───────────────────────────────────────────
async function loadFragmentCols(url) {
  if (!url) return { col1: null, col2: null };
  try {
    const main = await loadFragment(
      isLocalhost ? url.replace('/content/asus-l4', '') : url,
    );
    if (main && main.children.length) {
      const containerPage = main.children[0];
      const cols = containerPage.querySelectorAll('.container-2cols-item-wrapper');
      return {
        col1: cols[0] || null,
        col2: cols[1] || null,
      };
    }
  } catch {
    return { col1: null, col2: null };
  }
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

// ── Panel content updater ─────────────────────────────────────
// 根據 layoutStyle 和 idx，將新的 col1/col2 更新到對應的 panel 容器內。
// layout2: col1 在 col1-stage > .tab-col1-slot，col2 在 .tab-panel > .tab-col2
// 其他:    col1/col2 都在 .tab-panel > .tab-col1 / .tab-col2

async function refreshPanelContent(componentEl, layoutStyle, idx, fragmentUrl) {
  const { col1, col2 } = await loadFragmentCols(fragmentUrl);

  if (layoutStyle === '2') {
    const col1Stage = componentEl.querySelector('.tab-col1-stage');
    const col1Slots = col1Stage ? [...col1Stage.querySelectorAll('.tab-col1-slot')] : [];
    if (col1Slots[idx]) {
      col1Slots[idx].innerHTML = '';
      if (col1) col1Slots[idx].appendChild(col1);
    }
    const panels = [...componentEl.querySelectorAll('.tab-panel')];
    if (panels[idx]) {
      const slot2 = panels[idx].querySelector('.tab-col2');
      if (slot2) { slot2.innerHTML = ''; if (col2) slot2.appendChild(col2); }
    }
  } else {
    const panels = [...componentEl.querySelectorAll('.tab-panel')];
    if (panels[idx]) {
      const slot1 = panels[idx].querySelector('.tab-col1');
      const slot2 = panels[idx].querySelector('.tab-col2');
      if (slot1) { slot1.innerHTML = ''; if (col1) slot1.appendChild(col1); }
      if (slot2) { slot2.innerHTML = ''; if (col2) slot2.appendChild(col2); }
    }
  }
}

// ── Layout renderers ──────────────────────────────────────────

/**
 * Layout 1 — tab on top, col1 上 col2 下，全寬，上下排列
 */
async function renderLayout1(componentEl, items, cfg) {
  const { tabRadiusStyle, tabIconEnabled, tabFontSizeClass } = cfg;

  componentEl.innerHTML = `
    <div class="tab-nav-bar flex items-center w-full sticky top-0 z-10">
      <div class="tab-tab-list flex flex-row items-center w-full overflow-hidden" role="tablist"></div>
    </div>
    <div class="tab-panels w-full"></div>`;

  const panelsEl = componentEl.querySelector('.tab-panels');
  const tabBarEl = componentEl.querySelector('.tab-nav-bar');
  const tabListEl = componentEl.querySelector('.tab-tab-list');

  // move + decorate each item el into tab-tab-list
  items.forEach((item, i) => {
    decorateItemEl(
      item.el,
      item.tabText?.text,
      item.tabIconAsset?.text,
      i,
      i === 0,
      tabIconEnabled,
      tabRadiusStyle,
      tabFontSizeClass,
    );
    tabListEl.appendChild(item.el);
  });

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    // eslint-disable-next-line no-await-in-loop
    const { col1, col2 } = await loadFragmentCols(item.fragmentUrl?.text);
    const panel = document.createElement('div');
    panel.className = `tab-panel tab-panel-layout1${i === 0 ? ' is-active' : ''}`;
    panel.setAttribute('role', 'tabpanel');
    const { slot1, slot2 } = buildFragmentSlots(col1, col2);
    panel.append(slot1, slot2);
    panelsEl.append(panel);
  }

  const tabBtns = items.map((item) => item.el);
  const panels = [...componentEl.querySelectorAll('.tab-panel')];
  setupSwiper(tabListEl, tabBarEl, tabBtns, panels, 'tab');
}

/**
 * Layout 2 — tab in middle
 */
async function renderLayout2(componentEl, items, cfg) {
  const { tabRadiusStyle, tabIconEnabled, tabFontSizeClass } = cfg;

  componentEl.innerHTML = `
    <div class="tab-col1-stage w-full"></div>
    <div class="tab-nav-bar flex items-center w-full sticky top-0 z-10">
      <div class="tab-tab-list flex flex-row items-center w-full overflow-hidden" role="tablist"></div>
    </div>
    <div class="tab-panels w-full"></div>`;

  const col1Stage = componentEl.querySelector('.tab-col1-stage');
  const panelsEl = componentEl.querySelector('.tab-panels');
  const tabBarEl = componentEl.querySelector('.tab-nav-bar');
  const tabListEl = componentEl.querySelector('.tab-tab-list');

  // move + decorate each item el into tab-tab-list
  items.forEach((item, i) => {
    decorateItemEl(
      item.el,
      item.tabText?.text,
      item.tabIconAsset?.text,
      i,
      i === 0,
      tabIconEnabled,
      tabRadiusStyle,
      tabFontSizeClass,
    );
    tabListEl.appendChild(item.el);
  });

  const col1Els = [];

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    // eslint-disable-next-line no-await-in-loop
    const { col1, col2 } = await loadFragmentCols(item.fragmentUrl?.text);
    const col1Slot = document.createElement('div');
    col1Slot.className = `tab-col1-slot${i === 0 ? ' is-active' : ''}`;
    if (col1) col1Slot.appendChild(col1);
    col1Els.push(col1Slot);
    col1Stage.appendChild(col1Slot);
    const panel = document.createElement('div');
    panel.className = `tab-panel tab-panel-layout2${i === 0 ? ' is-active' : ''}`;
    panel.setAttribute('role', 'tabpanel');
    const slot2 = document.createElement('div');
    slot2.className = 'tab-col2';
    if (col2) slot2.appendChild(col2);
    panel.appendChild(slot2);
    panelsEl.appendChild(panel);
  }

  const tabBtns = items.map((item) => item.el);
  const panels = [...componentEl.querySelectorAll('.tab-panel')];

  if (window.innerWidth >= 1280) {
    // 事件委托，新增 tab 後自動生效
    tabListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-tab-btn');
      if (!btn) return;
      const allBtns = [...tabListEl.querySelectorAll('.tab-tab-btn')];
      const allPanels = [...componentEl.querySelectorAll('.tab-panel')];
      const allCol1Slots = [...componentEl.querySelectorAll('.tab-col1-slot')];
      const idx = allBtns.indexOf(btn);
      if (idx !== -1) {
        allCol1Slots.forEach((el, i) => el.classList.toggle('is-active', i === idx));
        activateTab(idx, allBtns, allPanels);
      }
    });
  } else {
    setupSwiper(tabListEl, tabBarEl, tabBtns, panels, 'tab');
    tabListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-tab-btn');
      if (!btn) return;
      const allBtns = [...tabListEl.querySelectorAll('.tab-tab-btn')];
      const allCol1Slots = [...componentEl.querySelectorAll('.tab-col1-slot')];
      const idx = allBtns.indexOf(btn);
      if (idx !== -1) {
        allCol1Slots.forEach((el, j) => el.classList.toggle('is-active', j === idx));
      }
    });
  }
}

/**
 * Layout 3 — tab on top, split container
 */
async function renderLayout3(componentEl, items, cfg) {
  const { tabRadiusStyle, tabIconEnabled, tabFontSizeClass } = cfg;

  componentEl.innerHTML = `
    <div class="tab-nav-bar flex items-center w-full sticky top-0 z-10">
      <div class="tab-tab-list flex flex-row items-center w-full overflow-hidden" role="tablist"></div>
    </div>
    <div class="tab-panels w-full"></div>`;

  const panelsEl = componentEl.querySelector('.tab-panels');
  const tabBarEl = componentEl.querySelector('.tab-nav-bar');
  const tabListEl = componentEl.querySelector('.tab-tab-list');

  items.forEach((item, i) => {
    decorateItemEl(
      item.el,
      item.tabText?.text,
      item.tabIconAsset?.text,
      i,
      i === 0,
      tabIconEnabled,
      tabRadiusStyle,
      tabFontSizeClass,
    );
    tabListEl.appendChild(item.el);
  });

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    // eslint-disable-next-line no-await-in-loop
    const { col1, col2 } = await loadFragmentCols(item.fragmentUrl?.text);
    const panel = document.createElement('div');
    panel.className = `tab-panel tab-panel-layout3${i === 0 ? ' is-active' : ''}`;
    panel.setAttribute('role', 'tabpanel');
    const { slot1, slot2 } = buildFragmentSlots(col1, col2);
    panel.append(slot1, slot2);
    panelsEl.append(panel);
  }

  const tabBtns = items.map((item) => item.el);
  const panels = [...componentEl.querySelectorAll('.tab-panel')];
  setupSwiper(tabListEl, tabBarEl, tabBtns, panels, 'tab');
}

// ── Layout4 單個 panel 建立器 ────────────────────────────────
// 供 renderLayout4 初次渲染 和 UE 事件二次更新共用。
// isActive: 決定 is-active class；cfg: tabRenderConfig

async function buildLayout4Panel(item, i, isActive, cfg) {
  const {
    tabRadiusStyle, tabIconEnabled, tabFontSizeClass, summaryFontClass,
  } = cfg;

  const hasSubTab = item.secondLayerTab === 'yes';
  const panel = document.createElement('div');
  panel.className = `tab-panel tab-panel-layout4${isActive ? ' is-active' : ''}`;
  panel.setAttribute('role', 'tabpanel');

  if (!hasSubTab) {
    const { col1, col2 } = await loadFragmentCols(item.fragmentUrl?.text);
    const { slot1, slot2 } = buildFragmentSlots(col1, col2);
    panel.append(slot1, slot2);
  } else {
    // summary richtext
    const summaryEl = document.createElement('div');
    summaryEl.className = `tab-summary-richtext ${summaryFontClass}`;
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

    const subItems = item.subItems || [];
    subItems.forEach((subItem, j) => {
      const subBtn = document.createElement('div');
      decorateItemEl(
        subBtn,
        subItem.subItemText?.text,
        subItem.subItemIconAsset?.text,
        j,
        j === 0,
        tabIconEnabled,
        tabRadiusStyle,
        tabFontSizeClass,
      );
      subTabList.appendChild(subBtn);
    });
    subNavBar.appendChild(subTabList);
    panel.appendChild(subNavBar);

    // sub panels
    const subPanelsEl = document.createElement('div');
    subPanelsEl.className = 'tab-sub-panels w-full';

    await Promise.all(
      subItems.map(async (subItem, j) => {
        const { col1, col2 } = await loadFragmentCols(subItem.subItemFragmentUrl?.text);
        const subPanel = document.createElement('div');
        subPanel.className = `tab-sub-panel${j === 0 ? ' is-active' : ''}`;
        subPanel.setAttribute('role', 'tabpanel');
        const { slot1, slot2 } = buildFragmentSlots(col1, col2);
        subPanel.append(slot1, slot2);
        subPanelsEl.appendChild(subPanel);
      }),
    );

    panel.appendChild(subPanelsEl);

    const subBtns = [...subTabList.querySelectorAll('.tab-tab-btn')];
    const subPanels = [...subPanelsEl.querySelectorAll('.tab-sub-panel')];
    setupSwiper(subTabList, subNavBar, subBtns, subPanels, 'subtab');
  }

  return panel;
}

/**
 * Layout 4 — Double tab
 */
async function renderLayout4(componentEl, items, cfg) {
  const {
    tabRadiusStyle, tabIconEnabled, tabFontSizeClass,
  } = cfg;

  componentEl.innerHTML = `
    <div class="tab-nav-bar flex items-center w-full sticky top-0 z-10">
      <div class="tab-tab-list flex flex-row items-center w-full overflow-hidden" role="tablist"></div>
    </div>
    <div class="tab-panels w-full"></div>`;

  const panelsEl = componentEl.querySelector('.tab-panels');
  const tabBarEl = componentEl.querySelector('.tab-nav-bar');
  const tabListEl = componentEl.querySelector('.tab-tab-list');

  // move + decorate each item el into tab-tab-list
  items.forEach((item, i) => {
    decorateItemEl(
      item.el,
      item.tabText?.text,
      item.tabIconAsset?.text,
      i,
      i === 0,
      tabIconEnabled,
      tabRadiusStyle,
      tabFontSizeClass,
    );
    tabListEl.appendChild(item.el);
  });

  for (let i = 0; i < items.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const panel = await buildLayout4Panel(items[i], i, i === 0, cfg);
    panelsEl.appendChild(panel);
  }

  const tabBtns = items.map((item) => item.el);
  const panels = [...panelsEl.querySelectorAll(':scope > .tab-panel')];
  setupSwiper(tabListEl, tabBarEl, tabBtns, panels, 'tab');
}

// ── Main decorator ────────────────────────────────────────────

async function decoratePage(block) {
  buildSecitonClass(block);

  const data = block.dataset;

  const layoutStyle = data.layoutstyle || DEFAULT_CONFIG.layoutStyle;
  const tabStyle = data.tabstyle || DEFAULT_CONFIG.tabStyle;
  // showIcon 是 boolean 欄位，EDS 傳來的是字串 "true" / "false"
  const showIcon = data.showicon === 'true';
  const colorGroup = data.colorgroup || '';

  // ── Helpers ─────────────────────────────────────────────────
  const parseGradientRaw = (key) => parseGradient(data[key] || '');
  const prefixHexRaw = (key) => prefixHex(data[key] || '');

  // ── Tab theme ────────────────────────────────────────────────
  // tabSelectedColor / tabDefaultColor support gradient "colorA,colorB" format
  const tabSelectedColor = parseGradientRaw('tabselectedcolor');
  const tabDefaultColor = parseGradientRaw('tabdefaultcolor');
  const tabLineWidth = data.tablinewidth || '';
  const tabLineEndpoints = data.tablineendpoints || ''; // 'round' | 'square'
  const tabCornerDecorationColor = prefixHexRaw('tabcornerdecorationcolor');

  // radius: style 2 only
  const tabRadiusStyle = buildRadiusValue(
    data.tabcontainerradiustl2 || '',
    data.tabcontainerradiustr2 || '',
    data.tabcontainerradiusbr2 || '',
    data.tabcontainerradiusbl2 || '',
  );

  // ── Tab container ────────────────────────────────────────────
  const tabBorderColor2 = parseGradientRaw('tabbordercolor2');
  const tabBgColor = parseGradientRaw('tabbgcolor');
  const tabBorderWidthDefault = data.tabborderwidthdefault || '';
  const tabBorderWidthHover2 = data.tabborderwidthhover2 || '';
  const tabBorderWidthSelect2 = data.tabborderwidthselect2 || '';

  const tabBorderGradientDefault = parseGradientRaw(
    'tabcontainerbordercolordefault',
  );
  const tabBorderGradientHover = parseGradientRaw(
    'tabcontainerbordercolorhover',
  );
  const tabBorderGradientSelect = parseGradientRaw(
    'tabcontainerbordercolorselect',
  );

  // ── Tab text font color ───────────────────────────────────────
  const tabFontColorDefault = prefixHexRaw('tabfontcolordefault');
  const tabFontColorHover = prefixHexRaw('tabfontcolorhover');
  const tabFontColorSelect = prefixHexRaw('tabfontcolorselect');

  // ── Tab text font size ────────────────────────────────────────
  // style 1: tabFontD1/T1/M1; style 2/3/4: tabFontD234/T234/M234
  // If author sets these, override productFonts.tabText
  const tabFontSizeClass = (() => {
    if (tabStyle === '1') {
      const d = data.tabfontd1 || '';
      const t = data.tabfontt1 || '';
      const m = data.tabfontm1 || '';
      return d || t || m ? [d, t, m].filter(Boolean).join(' ') : '';
    }
    const d = data.tabfontd234 || '';
    const t = data.tabfontt234 || '';
    const m = data.tabfontm234 || '';
    return d || t || m ? [d, t, m].filter(Boolean).join(' ') : '';
  })();

  // ── Summary richtext font ─────────────────────────────────────
  const summaryFontD = data.summaryfontd || '';
  const summaryFontT = data.summaryfontt || '';
  const summaryFontM = data.summaryfontm || '';
  const summaryFontColor = prefixHexRaw('summaryfontcolor');
  const summaryFontClass = [summaryFontD, summaryFontT, summaryFontM].filter(Boolean).join(' ')
    || productFonts.summaryText;

  // ── Build component CSS variable string ───────────────────────
  let componentStyle = '';

  // tab theme
  if (tabSelectedColor) {
    componentStyle += `--tab-selected-color-from: ${tabSelectedColor.from};`;
    componentStyle += `--tab-selected-color-to: ${tabSelectedColor.to};`;
  }
  if (tabDefaultColor) {
    componentStyle += `--tab-default-color-from: ${tabDefaultColor.from};`;
    componentStyle += `--tab-default-color-to: ${tabDefaultColor.to};`;
  }
  if (tabLineWidth) componentStyle += `--tab-line-width: ${tabLineWidth}px;`;
  if (tabCornerDecorationColor) componentStyle += `--tab-corner-decoration-color: ${tabCornerDecorationColor};`;

  // tab container
  if (tabBorderColor2) {
    componentStyle += `--tab-border-from-default: ${tabBorderColor2.from};`;
    componentStyle += `--tab-border-to-default: ${tabBorderColor2.to};`;
  }
  if (tabBgColor) {
    componentStyle += `--tab-bg-from-default: ${tabBgColor.from};`;
    componentStyle += `--tab-bg-to-default: ${tabBgColor.to};`;
  }
  if (tabBorderWidthDefault) componentStyle += `--tab-border-width-default: ${tabBorderWidthDefault}px;`;
  if (tabBorderWidthHover2) componentStyle += `--tab-border-width-hover: ${tabBorderWidthHover2}px;`;
  if (tabBorderWidthSelect2) componentStyle += `--tab-border-width-select: ${tabBorderWidthSelect2}px;`;
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

  // tab text colors
  if (tabFontColorDefault) componentStyle += `--tab-color-default: ${tabFontColorDefault};`;
  if (tabFontColorHover) componentStyle += `--tab-color-hover: ${tabFontColorHover};`;
  if (tabFontColorSelect) componentStyle += `--tab-color-select: ${tabFontColorSelect};`;

  // summary color
  if (summaryFontColor) componentStyle += `--tab-summary-color: ${summaryFontColor};`;

  // ── Collect item wrappers ────────────────────────────────────
  // 保留原始 itemEl DOM，取數後直接在原地 decorate，
  // 再將其 move 進 tab-tab-list，維持 UE data-aue-* 結構。
  const itemWrappers = [
    ...block.querySelectorAll('.tab-navigator-item-wrapper'),
  ];

  const items = await Promise.all(
    itemWrappers.map(async (wrapper) => {
      const itemEl = wrapper.querySelector('.tab-navigator-item');
      const itemConfig = await getBlockConfigs(
        itemEl,
        ITEM_DEFAULT_CONFIG,
        'tab-navigator-item',
      );
      const result = {
        el: itemEl,
        tabText: itemConfig.tabItemText,
        tabIconAsset: itemConfig.tabItemIconAsset,
        fragmentUrl: itemConfig.tabItemFragmentUrl,
        secondLayerTab: itemConfig.secondLayerTab?.text || 'no',
        summaryRichtext: itemConfig.summaryRichtext,
        subItems: [],
      };

      if (layoutStyle === '4' && result.secondLayerTab === 'yes') {
        result.subItems = getBlockRepeatConfigs(wrapper)[0] || [];
      }

      return result;
    }),
  );

  // 記錄每個 item 當前的 fragmentUrl，UE 更新時用於比對是否需要重新 fetch
  const fragmentUrlMap = items.map((item) => item.fragmentUrl?.text || '');

  // ── Build component shell ────────────────────────────────────
  const componentEl = document.createElement('div');
  const lineEndpointsClass = tabLineEndpoints
    ? `tab-line-${tabLineEndpoints}`
    : '';
  componentEl.className = `tab-component tab-layout${layoutStyle} tab-style${tabStyle} l4-column-width-12 box-border ${lineEndpointsClass}`.trim();
  if (componentStyle) componentEl.setAttribute('style', componentStyle.trim());

  if (colorGroup) block.classList.add(colorGroup);

  // 將 itemWrapper 之外的其他子節點清除，itemWrapper 暫時保留（renderer 會 move itemEl）
  [...block.children].forEach((child) => {
    if (!child.classList.contains('tab-navigator-item-wrapper')) child.remove();
  });
  block.insertBefore(componentEl, block.firstChild);

  // ── Dispatch to layout renderer ──────────────────────────────
  const renderers = {
    1: renderLayout1,
    2: renderLayout2,
    3: renderLayout3,
    4: renderLayout4,
  };
  const render = renderers[layoutStyle] || renderers[1];
  const tabRenderConfig = {
    tabRadiusStyle,
    tabIconEnabled: showIcon,
    tabFontSizeClass,
    summaryFontClass,
  };
  await render(componentEl, items, tabRenderConfig);

  // itemEl 已被 move 進 componentEl，移除剩餘的空 wrapper
  itemWrappers.forEach((wrapper) => wrapper.remove());

  // ── UE author live-update ────────────────────────────────────
  //
  // 框架行為：作者在 UE dialog 編輯某個 item 後，會在 block 下注入一個
  // display:none 的原始帶資料 DOM（即 detail = 新的 itemEl）。
  // 框架隨後會刪除舊的渲染好的 itemEl，讓 detail 顯示出來。
  //
  // 因此我們必須：
  //   1. 從 detail 讀取最新 itemConfig
  //   2. 用 detail 本身取代舊的 tab button（decorateItemEl in-place）
  //      並將其插入 tab-tab-list 的正確位置
  //   3. 重新 fetch fragment，更新對應的 tab-panel 內容
  //   4. layout2 額外更新 col1-slot

  block.addEventListener('asus-l4--section-tab', async ({ detail }) => {
    if (!componentEl) return;

    const itemConfig = await getBlockConfigs(
      detail,
      ITEM_DEFAULT_CONFIG,
      'tab-navigator-item',
    );

    // 找到這個 item 是第幾個（用 data-aue-resource 比對 tab-tab-list 裡現有的 btn）
    const listData = getBlockRepeatConfigs(detail.parentNode)[0] || [];
    const tabListEl = componentEl.querySelector('.tab-tab-list');
    const existingBtns = tabListEl ? [...tabListEl.querySelectorAll('.tab-tab-btn')] : [];
    const idx = existingBtns.findIndex(
      (el) => el.dataset.aueResource === detail.dataset.aueResource,
    );
    if (idx === -1) return;

    const isActive = existingBtns[idx].classList.contains('is-active');

    // 1. decorateItemEl in-place on detail（保留 data-aue-* 屬性）
    decorateItemEl(
      detail,
      itemConfig.tabItemText?.text,
      itemConfig.tabItemIconAsset?.text,
      idx,
      isActive,
      tabRenderConfig.tabIconEnabled,
      tabRenderConfig.tabRadiusStyle,
      tabRenderConfig.tabFontSizeClass,
    );

    // 2. 替換 tab-tab-list 中舊的 btn 為 detail
    if (tabListEl) {
      tabListEl.replaceChild(detail, existingBtns[idx]);
    }

    // 3. 更新對應 tab-panel
    if (layoutStyle === '4') {
      // layout4: secondLayerTab 可能改變，需整個 panel 結構重建
      const newSecondLayerTab = itemConfig.secondLayerTab?.text || 'no';
      const newSubItems = newSecondLayerTab === 'yes' ? listData : [];
      const updatedItem = {
        secondLayerTab: newSecondLayerTab,
        fragmentUrl: itemConfig.tabItemFragmentUrl,
        summaryRichtext: itemConfig.summaryRichtext,
        subItems: newSubItems,
      };
      const panelsEl = componentEl.querySelector('.tab-panels');
      const existingPanels = panelsEl
        ? [...panelsEl.querySelectorAll(':scope > .tab-panel')]
        : [];
      if (existingPanels[idx]) {
        const newPanel = await buildLayout4Panel(updatedItem, idx, isActive, tabRenderConfig);
        panelsEl.replaceChild(newPanel, existingPanels[idx]);
      }
      fragmentUrlMap[idx] = itemConfig.tabItemFragmentUrl?.text || '';
    } else {
      // layout1/2/3: 只需更新 fragment 內容（url 沒變則跳過）
      const newFragmentUrl = itemConfig.tabItemFragmentUrl?.text || '';
      if (newFragmentUrl !== fragmentUrlMap[idx]) {
        fragmentUrlMap[idx] = newFragmentUrl;
        await refreshPanelContent(componentEl, layoutStyle, idx, newFragmentUrl);
      }
    }
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
