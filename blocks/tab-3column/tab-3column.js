import { getBlockConfigs, getFieldValue } from '../../scripts/utils.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { prefixHex } from '../../components/button/button.js';

/**
 * ID:15 TAB_3COLUMN
 *
 * AEM DOM before decorate (two-level block structure):
 *
 *  div.tab-3column          ← block (1st level, tab-3column model)
 *    div                    ← item wrapper (2nd level, tab-3column-item model)
 *      div                  ← item row
 *        div                  ← cell: tabText
 *        div                  ← cell: tabIconAsset
 *        div                  ← cell: tabTitle
 *        div                  ← cell: tabInfo
 *      [nested media-block] ← 3rd level, authored separately
 *
 * DOM Structure after decorate:
 *
 *  .tab3col-component
 *    ├── .tab3col-tab-bar
 *    │     ├── .tab3col-arrow--prev
 *    │     ├── .tab3col-tab-list [role=tablist]
 *    │     │     └── .tab3col-tab-btn × N
 *    │     └── .tab3col-arrow--next
 *    └── .tab3col-panels
 *          └── .tab3col-panel × N  ← instrumentation moved from original item wrapper
 *                ├── .tab3col-media-slot  ← original item wrapper's nested media-block moved here
 *                └── .tab3col-text-col
 *                      ├── .tab3col-title
 *                      └── .tab3col-info
 */

const DEFAULT_CONFIG = {
  motionEnabled: false,
  widthTabArea: '',
  widthTextArea: '',
  tabIconEnabled: false,
  tabBarBgColorValue: '',
  tabFontDT: 'ro-md-16',
  tabFontM: 'ro-md-14',
  tabFontColorDefault: '',
  tabFontColorHover: '',
  tabFontColorSelect: '',
  tabContainerBorderWidthDefault: '',
  tabContainerBorderWidthHover: '',
  tabContainerBorderWidthSelect: '',
  tabContainerBorderColorDefault: '',
  tabContainerBorderColorHover: '',
  tabContainerBorderColorSelect: '',
  tabContainerBgColorDefault: '',
  tabContainerBgColorHover: '',
  tabContainerBgColorSelect: '',
  tabContainerRadiusTL: '',
  tabContainerRadiusTR: '',
  tabContainerRadiusBR: '',
  tabContainerRadiusBL: '',
  titleFontD: 'tt-md-28',
  titleFontT: 'tt-md-28',
  titleFontM: 'tt-md-24',
  titleFontColor: '',
  infoFontD: 'ro-rg-16',
  infoFontT: 'ro-rg-16',
  infoFontM: 'ro-rg-14',
  infoFontColor: '',
};

function buildRadiusValue(tl, tr, br, bl) {
  if ([tl, tr, br, bl].every((v) => !v)) return '';
  const px = (v) => (v ? `${v}px` : '0');
  return `${px(tl)} ${px(tr)} ${px(br)} ${px(bl)}`;
}

function buildTabBtnHtml(tabText, tabIconAsset, index, isActive, iconEnabled) {
  const iconHtml = (iconEnabled && tabIconAsset)
    ? `<img class="tab3col-tab-icon" src="${tabIconAsset}" alt="" aria-hidden="true" />`
    : '';
  return `
    <button
      class="tab3col-tab-btn${isActive ? ' is-active' : ''}"
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
    const scrollTarget = activeBtn.offsetLeft - tabList.offsetWidth / 2 + activeBtn.offsetWidth / 2;
    if (motionEnabled) tabList.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    else tabList.scrollLeft = scrollTarget;
  }
}

function updateArrows(tabList, prevArrow, nextArrow) {
  if (!tabList || !prevArrow || !nextArrow) return;
  const { scrollLeft, scrollWidth, clientWidth } = tabList;
  prevArrow.style.display = scrollLeft > 1 ? '' : 'none';
  nextArrow.style.display = (scrollLeft + clientWidth < scrollWidth - 1) ? '' : 'none';
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
    tabList.addEventListener('scroll', () => updateArrows(tabList, prevArrow, nextArrow), { passive: true });
    setTimeout(() => updateArrows(tabList, prevArrow, nextArrow), 150);
  }

  if (prevArrow) prevArrow.addEventListener('click', () => tabList.scrollBy({ left: -160, behavior: 'smooth' }));
  if (nextArrow) nextArrow.addEventListener('click', () => tabList.scrollBy({ left: 160, behavior: 'smooth' }));
}

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'tab-3column');
    const v = getFieldValue(config);

    // ── Config ──────────────────────────────────────────────────
    const motionEnabled = v('motionEnabled', 'boolean') || DEFAULT_CONFIG.motionEnabled;
    const colorGroup = v('colorGroup', 'text') || '';
    const widthTabArea = v('widthTabArea', 'text') || '';
    const widthTextArea = v('widthTextArea', 'text') || '';
    const tabIconEnabled = v('tabIconEnabled', 'boolean') || DEFAULT_CONFIG.tabIconEnabled;
    const tabBarBgColor = prefixHex(v('tabBarBgColorValue', 'text') || '');
    const tabFontDT = v('tabFontDT', 'text') || DEFAULT_CONFIG.tabFontDT;
    const tabFontM = v('tabFontM', 'text') || DEFAULT_CONFIG.tabFontM;
    const tabFontColorDefault = prefixHex(v('tabFontColorDefault', 'text') || '');
    const tabFontColorHover = prefixHex(v('tabFontColorHover', 'text') || '');
    const tabFontColorSelect = prefixHex(v('tabFontColorSelect', 'text') || '');
    const tabBorderWidthDefault = v('tabContainerBorderWidthDefault', 'text') || '';
    const tabBorderWidthHover = v('tabContainerBorderWidthHover', 'text') || '';
    const tabBorderWidthSelect = v('tabContainerBorderWidthSelect', 'text') || '';
    const tabBorderColorDefault = prefixHex(v('tabContainerBorderColorDefault', 'text') || '');
    const tabBorderColorHover = prefixHex(v('tabContainerBorderColorHover', 'text') || '');
    const tabBorderColorSelect = prefixHex(v('tabContainerBorderColorSelect', 'text') || '');
    const tabBgDefault = prefixHex(v('tabContainerBgColorDefault', 'text') || '');
    const tabBgHover = prefixHex(v('tabContainerBgColorHover', 'text') || '');
    const tabBgSelect = prefixHex(v('tabContainerBgColorSelect', 'text') || '');
    const tabRadiusValue = buildRadiusValue(
      v('tabContainerRadiusTL', 'text') || '',
      v('tabContainerRadiusTR', 'text') || '',
      v('tabContainerRadiusBR', 'text') || '',
      v('tabContainerRadiusBL', 'text') || '',
    );
    const titleFontD = v('titleFontD', 'text') || DEFAULT_CONFIG.titleFontD;
    const titleFontT = v('titleFontT', 'text') || DEFAULT_CONFIG.titleFontT;
    const titleFontM = v('titleFontM', 'text') || DEFAULT_CONFIG.titleFontM;
    const titleFontColor = prefixHex(v('titleFontColor', 'text') || '');
    const infoFontD = v('infoFontD', 'text') || DEFAULT_CONFIG.infoFontD;
    const infoFontT = v('infoFontT', 'text') || DEFAULT_CONFIG.infoFontT;
    const infoFontM = v('infoFontM', 'text') || DEFAULT_CONFIG.infoFontM;
    const infoFontColor = prefixHex(v('infoFontColor', 'text') || '');

    // ── Collect item elements BEFORE mutating DOM ───────────────
    // Each direct child div of block is a tab-3column-item wrapper
    const itemEls = [...block.querySelectorAll(':scope > div')];

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

    // ── Font classes ─────────────────────────────────────────────
    const tabFontClass = [
      tabFontDT ? `${tabFontDT}-lg ${tabFontDT}-md` : '',
      tabFontM ? `${tabFontM}-sm` : '',
    ].filter(Boolean).join(' ');

    const titleClass = [
      titleFontD ? `${titleFontD}-lg` : '',
      titleFontT ? `${titleFontT}-md` : '',
      titleFontM ? `${titleFontM}-sm` : '',
    ].filter(Boolean).join(' ');

    const infoClass = [
      infoFontD ? `${infoFontD}-lg` : '',
      infoFontT ? `${infoFontT}-md` : '',
      infoFontM ? `${infoFontM}-sm` : '',
    ].filter(Boolean).join(' ');

    // ── Parse each item's field values from AEM DOM ──────────────
    // AEM renders block/item fields as cells inside the item wrapper
    const tabs = itemEls.map((itemEl) => {
      const cells = [...itemEl.querySelectorAll(':scope > div > div')];
      return {
        tabText: cells[0]?.textContent?.trim() || '',
        tabIconAsset: cells[1]?.querySelector('img')?.src || cells[1]?.textContent?.trim() || '',
        tabTitle: cells[2]?.textContent?.trim() || '',
        tabInfo: cells[3]?.innerHTML?.trim() || '',
      };
    });

    // ── Build tab buttons HTML ───────────────────────────────────
    const tabBtnsHtml = tabs
      .map((tab, i) => buildTabBtnHtml(tab.tabText, tab.tabIconAsset, i, i === 0, tabIconEnabled))
      .join('');

    // ── Build component shell (without panels yet) ───────────────
    const componentHtml = `
      <div
        class="tab3col-component ${colorGroup}"
        data-motion="${motionEnabled}"
        data-icon="${tabIconEnabled}"
        ${inlineStyle ? `style="${inlineStyle.trim()}"` : ''}
      >
        <div class="tab3col-tab-bar">
          <button class="tab3col-arrow tab3col-arrow--prev" aria-label="Scroll tabs left" style="display:none">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <div class="tab3col-tab-list ${tabFontClass}" role="tablist">
            ${tabBtnsHtml}
          </div>
          <button class="tab3col-arrow tab3col-arrow--next" aria-label="Scroll tabs right" style="display:none">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
        <div class="tab3col-panels"></div>
      </div>`;

    // ── Move block-level instrumentation to component wrapper ────
    const oldComponent = block.querySelector('.tab3col-component');
    if (oldComponent) moveInstrumentation(block, oldComponent);

    block.innerHTML = componentHtml;

    const panelsEl = block.querySelector('.tab3col-panels');

    // ── Build each panel, move item instrumentation ──────────────
    itemEls.forEach((itemEl, i) => {
      const isActive = i === 0;
      const tab = tabs[i];

      // Create panel element
      const panel = document.createElement('div');
      panel.className = `tab3col-panel${isActive ? ' is-active' : ''}`;
      panel.id = `tab3col-panel-${i}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('data-tab-index', i);
      if (!isActive) panel.setAttribute('hidden', '');

      // Move item instrumentation (UE attributes) to panel
      // This is critical for AEM author UE to track each item correctly
      moveInstrumentation(itemEl, panel);

      // Media slot — move any nested media-block child nodes into it
      const mediaSlot = document.createElement('div');
      mediaSlot.className = 'tab3col-media-slot';
      // Any child of itemEl that is NOT the field row (i.e. nested blocks) goes here
      [...itemEl.children].forEach((child) => {
        // The first child div is the field row; skip it, move the rest (nested blocks)
        if (child !== itemEl.firstElementChild) {
          mediaSlot.appendChild(child);
        }
      });

      // Text column
      const textCol = document.createElement('div');
      textCol.className = 'tab3col-text-col';
      if (tab.tabTitle) {
        textCol.innerHTML += `<h3 class="tab3col-title ${titleClass}">${tab.tabTitle}</h3>`;
      }
      if (tab.tabInfo) {
        textCol.innerHTML += `<div class="tab3col-info ${infoClass}">${tab.tabInfo}</div>`;
      }

      panel.appendChild(mediaSlot);
      panel.appendChild(textCol);
      panelsEl.appendChild(panel);
    });

    setupInteraction(block.querySelector('.tab3col-component'), motionEnabled);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating tab-3column block:', error);
    block.innerHTML = '<div class="error-message">Failed to load tab-3column block</div>';
  }
}
