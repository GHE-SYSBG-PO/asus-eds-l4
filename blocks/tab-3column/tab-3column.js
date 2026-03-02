/**
 * ID:15 TAB_3COLUMN
 */

import { getBlockConfigs } from '../../scripts/utils.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { prefixHex } from '../../components/button/button.js';

const DEFAULT_CONFIG = {
  motionEnabled: false,
  widthTabArea: '',
  widthTextArea: '',
  tabIconEnabled: true,
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
    const tabFontDT = tabData.tabfontdt || DEFAULT_CONFIG.tabFontDT;
    const tabFontM = tabData.tabfontm || DEFAULT_CONFIG.tabFontM;
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
    const titleFontD = tabData.titlefontd || DEFAULT_CONFIG.titleFontD;
    const titleFontT = tabData.titlefontt || DEFAULT_CONFIG.titleFontT;
    const titleFontM = tabData.titlefontm || DEFAULT_CONFIG.titleFontM;
    const titleFontColor = prefixHex(tabData.titlefontcolor || '');
    const infoFontD = tabData.infofontd || DEFAULT_CONFIG.infoFontD;
    const infoFontT = tabData.infofontt || DEFAULT_CONFIG.infoFontT;
    const infoFontM = tabData.infofontm || DEFAULT_CONFIG.infoFontM;
    const infoFontColor = prefixHex(tabData.infofontcolor || '');

    const itemEls = [...tabContainer.querySelectorAll('.tab-3column-item-wrapper')];

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

    // ── Font classes ─────────────────────────────────────────────
    const tabFontClass = [
      tabFontDT ? `${tabFontDT}-lg ${tabFontDT}-md` : '',
      tabFontM ? `${tabFontM}-sm` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const titleClass = [
      titleFontD ? `${titleFontD}-lg` : '',
      titleFontT ? `${titleFontT}-md` : '',
      titleFontM ? `${titleFontM}-sm` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const infoClass = [
      infoFontD ? `${infoFontD}-lg` : '',
      infoFontT ? `${infoFontT}-md` : '',
      infoFontM ? `${infoFontM}-sm` : '',
    ]
      .filter(Boolean)
      .join(' ');

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
      </div>`);

    // ── Move block-level instrumentation to component wrapper ────

    const panelsEl = componentHtml.querySelector('.tab3col-panels');

    // ── Build each panel, move per-item instrumentation ──────────
    itemEls.forEach((itemEl, i) => {
      const isActive = i === 0;
      const tab = tabs[i];

      const panel = document.createElement('div');
      panel.className = `tab-3column-item block tab3col-panel${isActive ? ' is-active' : ''}`;
      panel.id = `tab3col-panel-${i}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('data-tab-index', i);

      if (!isActive) panel.setAttribute('hidden', '');

      // Critical: transfer UE instrumentation from original item el to panel
      moveInstrumentation(itemEl.querySelector('.tab-3column-item'), panel);

      // Media slot — move nested blocks (non-field-row children) here
      const mediaSlot = document.createElement('div');
      mediaSlot.className = 'tab3col-media-slot';

      // Text column
      const textCol = document.createElement('div');
      textCol.className = 'tab3col-text-col';
      textCol.innerHTML += `<h3 class="tab3col-title ${titleClass}">${tab.tabTitle.html}</h3>`;
      textCol.innerHTML += `<div class="tab3col-info ${infoClass}">${tab.tabInfo.html}</div>`;

      panel.appendChild(mediaSlot);
      panel.appendChild(textCol);
      panelsEl.appendChild(panel);
    });

    block.innerHTML = '';
    block.append(componentHtml);

    setupInteraction(block.querySelector('.tab3col-component'), motionEnabled);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating tab-3column block:', error);
    block.innerHTML = '<div class="error-message">Failed to load tab-3column block</div>';
  }
}
