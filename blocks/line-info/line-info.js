import {
  getProductLine,
  getBlockConfigs,
  getFieldValue,
  getBlockRepeatConfigs,
} from '../../scripts/utils.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const PRODUCT_LINE = getProductLine();
// const PRODUCT_LINE = 'rog';

/** Font-family prefix per product line */
const PRODUCT_FONT_PREFIX_TITLE = {
  asus: 'ro-md',
  proart: 'ro-md',
  rog: 'rc-bd',
  tuf: 'ro-md',
};

const PRODUCT_FONT_PREFIX_INFO = {
  asus: 'ro-rg',
  proart: 'ro-rg',
  rog: 'rc-rg',
  tuf: 'ro-rg',
};

/** 每個 product line 的預設字型設定 */
const FONT_DEFAULTS_BY_PRODUCT_LINE = {
  asus: {
    titleFontDTselect: '16-sh', titleFontMselect: '14-sh', infoFontDTselect: '13', infoFontMselect: '12',
  },
  proart: {
    titleFontDTselect: '16-sh', titleFontMselect: '14-sh', infoFontDTselect: '13', infoFontMselect: '12',
  },
  rog: {
    titleFontDTselect: '16-sh', titleFontMselect: '14-sh', infoFontDTselect: '13', infoFontMselect: '13',
  },
  tuf: {
    titleFontDTselect: '16-sh', titleFontMselect: '14-sh', infoFontDTselect: '13', infoFontMselect: '12',
  },
};

/**
 * Build RWD font class string based on current product line.
 * @param {string} dSize - desktop font size
 * @param {string} tSize - tablet font size
 * @param {string} mSize - mobile font size
 * @returns {string} e.g. 'tt-bd-96 tt-bd-64-md tt-bd-40-sm'
 */
const getTextFontClass = (dSize, tSize, mSize, prefix) => `${prefix}-${dSize}-lg ${prefix}-${tSize}-md ${prefix}-${mSize}-sm`;

/** 每種 styleLayout 的預設圖片尺寸 */
const IMAGE_DEFAULTS_BY_LAYOUT = {
  1: {
    imgDesktopWidth: '706px', imgDesktopHeight: 'auto', imgTabletWidth: '408px', imgTabletHeight: 'auto', imgMobileWidth: '100%', imgMobileHeight: 'auto',
  },
  2: {
    imgDesktopWidth: '726px', imgDesktopHeight: 'auto', imgTabletWidth: '408px', imgTabletHeight: 'auto', imgMobileWidth: '100%', imgMobileHeight: 'auto',
  },
  3: {
    imgDesktopWidth: '1120px', imgDesktopHeight: 'auto', imgTabletWidth: '672px', imgTabletHeight: 'auto', imgMobileWidth: '100%', imgMobileHeight: 'auto',
  },
  4: {
    imgDesktopWidth: '1120px', imgDesktopHeight: 'auto', imgTabletWidth: '672px', imgTabletHeight: 'auto', imgMobileWidth: '100%', imgMobileHeight: 'auto',
  },
  5: {
    imgDesktopWidth: '1120px', imgDesktopHeight: 'auto', imgTabletWidth: '672px', imgTabletHeight: 'auto', imgMobileWidth: '100%', imgMobileHeight: 'auto',
  },
};

const dialogDirectionMap = {
  TC: 'top-center',
  TL: 'top-left',
  TR: 'top-right',
  BL: 'bottom-left',
  BR: 'bottom-right',
  BC: 'bottom-center',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** 移除字串中所有空白字元（空格、換行等） */
const cleanString = (str) => str.replace(/\s/g, '');

/**
 * 將值轉換為 CSS width 變數字串。
 * - 若有 px 直接使用
 * - 若有 % 或純數字，轉為 calc(...) 格式
 * @param {string} value - 原始值（e.g. "50%", "300px", "50"）
 * @param {string} cssVar - CSS 自訂變數名稱（e.g. "--line-info-text-width-lg"）
 * @returns {string|null}
 */
const buildWidthStyle = (value, cssVar) => {
  if (!value) return null;
  if (value.includes('px')) return `${cssVar}:${value}`;
  if (value.includes('%') || !Number.isNaN(Number(value))) {
    return `${cssVar}:calc(var(--l4-column-width-12) * ${parseFloat(value) / 100})`;
  }
  return null;
};

/**
 * 將值轉換為 CSS max-width 變數字串。
 * 若值沒有單位，自動補上 px。
 * @param {string} value
 * @param {string} cssVar
 * @returns {string|null}
 */
const buildMaxWidthStyle = (value, cssVar) => {
  if (!value) return null;
  const resolved = value.includes('px') ? value : `${value}px`;
  return `${cssVar}:${resolved}`;
};

// ─── HTML Generators ─────────────────────────────────────────────────────────

/**
 * 產生 <picture> 區塊的 HTML。
 * 支援 desktop / tablet / mobile 三種圖片來源，並透過 CSS 自訂變數設定尺寸。
 */
const generatePictureHtml = ({
  assetDesktop,
  assetDesktopImgWidth,
  assetDesktopImgHeight,
  assetTablet,
  assetTabletImgWidth,
  assetTabletImgHeight,
  assetMobile,
  assetMobileImgWidth,
  assetMobileImgHeight,
}) => {
  const mobileSource = assetMobile
    ? `<source media="(max-width: 730px)" srcset="${assetMobile}">`
    : '';
  const tabletSource = assetTablet
    ? `<source media="(min-width: 731px) and (max-width: 1279px)" srcset="${assetTablet}">`
    : '';
  const defaultImgSrc = assetDesktop || assetTablet || assetMobile || '';

  const styles = [
    assetDesktopImgWidth && `--img-width-lg: ${assetDesktopImgWidth}`,
    assetDesktopImgHeight && `--img-height-lg: ${assetDesktopImgHeight}`,
    assetTabletImgWidth && `--img-width-md: ${assetTabletImgWidth}`,
    assetTabletImgHeight && `--img-height-md: ${assetTabletImgHeight}`,
    assetMobileImgWidth && `--img-width-sm: ${assetMobileImgWidth}`,
    assetMobileImgHeight && `--img-height-sm: ${assetMobileImgHeight}`,
  ].filter(Boolean).join('; ');

  return `
    <div class="line-info-item-img-container block relative">
      <div class="line-info-item-img block h-auto mx-auto" style="${styles}">
        <picture>
          ${mobileSource}
          ${tabletSource}
          <img src="${defaultImgSrc}" alt="Line Info Product Image" loading="lazy">
        </picture>
      </div>
    </div>
  `;
};

// ─── Text Item Processing ─────────────────────────────────────────────────────

/**
 * 從 config 與 productLine 預設值，產生 title / info 的字型 class 與 color style。
 * @param {object} config - block 的完整設定
 * @param {object} defaults - 對應 productLine 的預設字型設定
 */
const generateAdvancedStyles = (config, defaults) => {
  const v = getFieldValue(config);
  const titleFontDT = v('titleFontDTselect') || defaults?.titleFontDTselect;
  const titleFontM = v('titleFontMselect') || defaults?.titleFontMselect;
  const titleFontColor = v('titleFontColor') || defaults?.titleFontColor;
  const infoFontDT = v('infoFontDTselect') || defaults?.infoFontDTselect;
  const infoFontM = v('infoFontMselect') || defaults?.infoFontMselect;
  const infoFontColor = v('infoFontColor') || defaults?.infoFontColor;

  return {
    title: {
      classes: [getTextFontClass(titleFontDT, titleFontDT, titleFontM, PRODUCT_FONT_PREFIX_TITLE[PRODUCT_LINE])].filter(Boolean).join(' '),
      style: titleFontColor ? `--base-text-item-title-color: ${titleFontColor};` : '',
    },
    info: {
      classes: [getTextFontClass(infoFontDT, infoFontDT, infoFontM, PRODUCT_FONT_PREFIX_INFO[PRODUCT_LINE])].filter(Boolean).join(' '),
      style: infoFontColor ? `--base-text-item-info-color: ${infoFontColor};` : '',
    },
  };
};

/**
 * 從原始 repeat config 物件，取出對應 styleLayout 的欄位值。
 * @param {object} itemData - 單筆 repeat item 的 raw data
 * @param {string|number} styleLayout - 目前的 layout 編號
 * @param {number} index - item 的索引值
 */
const extractItemData = (itemData, styleLayout, index) => {
  const prefix = `textItems${styleLayout}`;
  const get = (key, fallback = '') => cleanString(itemData[`${prefix}${key}`]?.text || fallback);
  const itemDataExtract = {
    index,
    layoutStyle: get('LayoutStyle', 'left'),
    titleRichtext: itemData[`${prefix}TitleRichtext`]?.text || 'Item Title',
    infoRichtext: itemData[`${prefix}InfoRichtext`]?.text || null,
    textWidthPercentDesktop: get('TextWidthPercentDesktop'),
    textWidthPercentTablet: get('TextWidthPercentTablet'),
    textWidthDesktop: get('TextWidthDesktop'),
    textWidthTablet: get('TextWidthTablet'),
    textMaxWidthDesktop: get('TextMaxWidthDesktop'),
    textMaxWidthTablet: get('TextMaxWidthTablet'),
    xValueDesktop: get('XValueDesktop', '0'),
    xValueTablet: get('XValueTablet', '0'),
    yValueDesktop: get('YValueDesktop', '0'),
    yValueTablet: get('YValueTablet', '0'),
    alignmentDesktop: get('AlignmentDesktop', 'left'),
    alignmentTablet: get('AlignmentTablet', 'left'),
    sideDesktop: get('SideDesktop', 'left'),
    sideTablet: get('SideTablet', 'left'),
    dialogBoxWidthDesktop: get('DialogBoxWidthDesktop'),
    dialogBoxWidthTablet: get('DialogBoxWidthTablet'),
    maxDialogBoxWidthDesktop: get('MaxDialogBoxWidthDesktop'),
    maxDialogBoxWidthTablet: get('MaxDialogBoxWidthTablet'),
    dialogDirectionDesktop: get('DialogDirectionDesktop', 'TL'),
    dialogDirectionTablet: get('DialogDirectionTablet', 'TL'),
  };
  return itemDataExtract;
};

/**
 * 根據 styleLayout 產生 text item 的 CSS class 與 inline style。
 *
 * Layout 1/2：圖左右兩側排文字，使用 % 寬計算。
 * Layout 3/4/5：文字絕對定位於圖片底部，使用絕對寬度。
 *
 * @param {object} item - extractItemData 的結果
 * @param {string|number} styleLayout
 * @param {{ desktop: string, tablet: string }|undefined} textWidth  - layout 1/2 專用
 * @param {{ desktop: string, tablet: string }|undefined} textMaxWidth - layout 1/2 專用
 * @param {string} textItems2LayoutStyle - layout 2 的文字側（'left' | 'right'）
 */
const getItemStyles = (item, styleLayout, textWidth, textMaxWidth, textItems2LayoutStyle) => {
  const {
    textWidthDesktop, textWidthTablet,
    textMaxWidthDesktop, textMaxWidthTablet,
    alignmentDesktop, alignmentTablet,
    sideDesktop, sideTablet,
    xValueDesktop, xValueTablet,
    yValueDesktop, yValueTablet,
    dialogBoxWidthDesktop, dialogBoxWidthTablet,
    maxDialogBoxWidthDesktop, maxDialogBoxWidthTablet,
    dialogDirectionDesktop, dialogDirectionTablet,
  } = item;

  const layout = parseInt(styleLayout, 10);
  const classes = ['absolute flex pointer-events-auto'];
  const styles = [];

  if (layout === 1 || layout === 2) {
    // ── Layout 1/2：左右排列，text 寬度用 % 計算 ──
    if (layout === 1) {
      classes.push(sideTablet === 'right' ? 'md:text-left' : 'md:text-right');
      classes.push(sideDesktop === 'right' ? 'lg:text-left' : 'lg:text-right');
    } else {
      classes.push(textItems2LayoutStyle === 'right' ? 'text-left' : 'text-right');
    }

    styles.push(buildWidthStyle(textWidth?.desktop, '--line-info-text-width-lg'));
    styles.push(buildMaxWidthStyle(textMaxWidth?.desktop, '--line-info-text-max-width-lg'));
    styles.push(buildWidthStyle(textWidth?.tablet, '--line-info-text-width-md'));
    styles.push(buildMaxWidthStyle(textMaxWidth?.tablet, '--line-info-text-max-width-md'));
    if (yValueTablet && yValueTablet !== '0') styles.push(`--line-info-y-md:${yValueTablet}`);
    if (yValueDesktop && yValueDesktop !== '0') styles.push(`--line-info-y-lg:${yValueDesktop}`);
  } else if ([3, 4, 5].includes(layout)) {
    // ── Layout 3/4/5：絕對定位，text 寬度直接用 px 或 % ──
    if (layout === 3 || layout === 4) {
      if (alignmentDesktop) classes.push(alignmentDesktop === 'right' ? 'bottom-right-lg lg:text-left' : 'bottom-left-lg lg:text-right');
      if (alignmentTablet) classes.push(alignmentTablet === 'right' ? 'bottom-right-md md:text-left' : 'bottom-left-md md:text-right');
    }

    if (layout === 5) {
      if (dialogDirectionDesktop) {
        classes.push(`${dialogDirectionMap[dialogDirectionDesktop]}-lg`);
      }
      if (dialogDirectionTablet) {
        classes.push(`${dialogDirectionMap[dialogDirectionTablet]}-md`);
      }

      if (alignmentDesktop) classes.push(`lg:text-${alignmentDesktop}`);
      if (alignmentTablet) classes.push(`md:text-${alignmentTablet}`);
    }

    const dw = layout === 5 ? dialogBoxWidthDesktop : textWidthDesktop;
    const tw = layout === 5 ? dialogBoxWidthTablet : textWidthTablet;
    const mdw = layout === 5 ? maxDialogBoxWidthDesktop : textMaxWidthDesktop;
    const mtw = layout === 5 ? maxDialogBoxWidthTablet : textMaxWidthTablet;

    styles.push(buildWidthStyle(dw, '--line-info-text-width-lg'));
    styles.push(buildMaxWidthStyle(mdw, '--line-info-text-max-width-lg'));
    styles.push(buildWidthStyle(tw, '--line-info-text-width-md'));
    styles.push(buildMaxWidthStyle(mtw, '--line-info-text-max-width-md'));
    if (xValueDesktop && xValueDesktop !== '0') styles.push(`--line-info-x-lg: ${xValueDesktop}`);
    if (xValueTablet && xValueTablet !== '0') styles.push(`--line-info-x-md: ${xValueTablet}`);
    if (yValueTablet && yValueTablet !== '0') styles.push(`--line-info-y-md: ${yValueTablet}`);
    if (yValueDesktop && yValueDesktop !== '0') styles.push(`--line-info-y-lg: ${yValueDesktop}`);
  }

  return {
    className: classes.join(' '),
    style: styles.filter(Boolean).join('; '),
  };
};

/**
 * 產生單一 text item 的 HTML。
 * @param {object} item - extractItemData 的結果
 * @param {string} className
 * @param {string} style
 * @param {object} advancedStyles - generateAdvancedStyles 的結果
 * @param {number} blockLayout - 整個 block 的 layout 編號（用於決定 class）
 * @param {boolean} isMobile - 若為 true，移除絕對定位相關的 class/style（行動版用）
 */
const renderItemHtml = (item, className, style, advancedStyles, blockLayout, isMobile = false) => {
  const containerClass = isMobile ? '' : className;
  const containerStyle = isMobile ? '' : style;

  const textItemTypeClasses = [
    [4, 5].includes(blockLayout) && 'text-item-freeform',
    blockLayout === 5 && 'text-item-freeform-dialog',
  ].filter(Boolean).join(' ');

  const titleHtml = item.titleRichtext ? `<div class="title w-full ${advancedStyles.title.classes}" style="${advancedStyles.title.style}">${item.titleRichtext}</div>` : '';
  const infoHtml = item.infoRichtext ? `<div class="info w-full ${advancedStyles.info.classes}" style="${advancedStyles.info.style}">${item.infoRichtext}</div>` : '';

  let circleNumber = '';
  if (isMobile || [3, 4, 5].includes(blockLayout)) {
    circleNumber = `
      <div class="lg:hidden md:hidden circle-number ${advancedStyles.title.classes}">
        <span class="number">${item.index + 1}</span>
      </div>
    `;
  }

  return `
    <div class="text-item-container ${textItemTypeClasses} ${containerClass} text-item-${item.index}" style="${containerStyle}" data-index="${item.index}">
    ${circleNumber}
      <div class="text-item">
        ${titleHtml}
        ${infoHtml}
      </div>
    </div>
  `;
};

/**
 * 將所有 text items 依照 side（left/right）分組，並輸出對應的 HTML 區塊。
 *
 * 回傳的物件鍵對應到不同的容器位置：
 * - sideLeftDesktop / sideRightDesktop：桌機左右側
 * - sideLeftTablet / sideRightTablet：平板左右側
 * - sideNone：行動版（沒有絕對定位）
 *
 * @param {object} params
 * @param {Array} params.textItems
 * @param {string|number} params.styleLayout
 * @param {object} params.advancedStyles
 * @param {{ desktop: string, tablet: string }} params.textWidth
 * @param {{ desktop: string, tablet: string }} params.textMaxWidth
 * @param {number} params.blockLayout
 * @param {string} params.textItems2LayoutStyle
 */
const generateTextItemsHtml = ({
  textItems,
  styleLayout,
  advancedStyles,
  textWidth,
  textMaxWidth,
  blockLayout,
  textItems2LayoutStyle,
}) => {
  if (!textItems?.length) return {};

  const layout = parseInt(styleLayout, 10);
  const sides = {
    sideLeftDesktop: [],
    sideLeftTablet: [],
    sideRightDesktop: [],
    sideRightTablet: [],
    sideNone: [],
  };

  textItems.forEach((rawItem, index) => {
    const item = extractItemData(rawItem, styleLayout, index);
    const { className, style } = getItemStyles(item, styleLayout, textWidth, textMaxWidth, textItems2LayoutStyle);
    const itemHtml = renderItemHtml(item, className, style, advancedStyles, blockLayout);
    const mobileHtml = renderItemHtml(item, '', '', advancedStyles, blockLayout, true);
    if (layout === 1) {
      if (item.sideDesktop === 'right') sides.sideRightDesktop.push(itemHtml);
      else sides.sideLeftDesktop.push(itemHtml);
      if (item.sideTablet === 'right') sides.sideRightTablet.push(itemHtml);
      else sides.sideLeftTablet.push(itemHtml);
      sides.sideNone.push(mobileHtml);
    } else if (layout === 2) {
      if (textItems2LayoutStyle === 'right') sides.sideRightDesktop.push(itemHtml);
      else sides.sideLeftDesktop.push(itemHtml);
      sides.sideNone.push(mobileHtml);
    } else {
      sides.sideNone.push(itemHtml);
    }
  });

  const wrap = (items, classes) => (items.length ? `<div class="${classes}">${items.join('')}</div>` : '');

  const sideNoneClass = [3, 4, 5].includes(layout)
    ? 'line-info-side line-info-side-none'
    : 'hidden md:hidden sm:block lg:hidden line-info-side line-info-side-none';
  return {
    sideLeftDesktop: wrap(sides.sideLeftDesktop, 'hidden lg:block md:hidden sm:hidden line-info-side line-info-side-left-desktop'),
    sideLeftTablet: wrap(sides.sideLeftTablet, 'hidden md:block lg:hidden line-info-side line-info-side-left-tablet'),
    sideRightDesktop: wrap(sides.sideRightDesktop, 'hidden lg:block md:hidden sm:hidden line-info-side line-info-side-right-desktop'),
    sideRightTablet: wrap(sides.sideRightTablet, 'hidden md:block lg:hidden line-info-side line-info-side-right-tablet'),
    sideNone: wrap(sides.sideNone, sideNoneClass),
  };
};

// ─── Block Config Helpers ─────────────────────────────────────────────────────

/**
 * 從所有的 repeat config groups，找出對應目前 styleLayout 的那一組。
 * 判斷依據：group 內第一個 item 的第一個 key 是否包含 prefix（e.g. "textItems2"）
 * @param {Array<Array>} allGroups
 * @param {string} prefix - e.g. "textItems2"
 */
const findTextItemsByPrefix = (allGroups, prefix) => {
  const matched = allGroups.find((group) => Object.keys(group[0])[0].includes(prefix));
  return matched || [];
};

/**
 * 從 block config 建立 block-level 的 CSS inline style（padding 等）。
 * @param {Function} v - getFieldValue 的回傳函式
 */
const buildBlockStyles = (v) => [
  v('paddingTopDesktop') && `--line-info-block-pd-top-lg: ${v('paddingTopDesktop')}`,
  v('paddingBottomDesktop') && `--line-info-block-pd-bottom-lg: ${v('paddingBottomDesktop')}`,
  v('paddingTopTablet') && `--line-info-block-pd-top-md: ${v('paddingTopTablet')}`,
  v('paddingBottomTablet') && `--line-info-block-pd-bottom-md: ${v('paddingBottomTablet')}`,
].filter(Boolean).join('; ');

// ─── Main Decorator ───────────────────────────────────────────────────────────

export default async function decorate(block) {
  // console.log(block);
  // return;
  try {
    const config = await getBlockConfigs(block, {}, 'line-info');
    const v = getFieldValue(config);

    // ── 取得 layout 與預設值 ──
    const blockLayout = parseInt(config.styleLayout?.text || config.styleLayout || '1', 10);
    const imageDef = IMAGE_DEFAULTS_BY_LAYOUT[blockLayout] || IMAGE_DEFAULTS_BY_LAYOUT[1];
    const fontDef = FONT_DEFAULTS_BY_PRODUCT_LINE[PRODUCT_LINE] || FONT_DEFAULTS_BY_PRODUCT_LINE.asus;
    const colorGroup = v('colorGroup') || 'light';
    const debugEnabled = v('debugEnabled') === 'true';
    // if (blockLayout === 5) {
    //   console.log('debugEnabled', v('debugEnabled'));
    // }
    // return block;

    // ── Layout 2 專屬：文字擺放側 ──
    const textItems2LayoutStyle = blockLayout === 2 ? (v('textItems2LayoutStyle') || 'left') : null;

    // ── 組 <picture> 的參數 ──
    const picParams = {
      assetDesktop: v('assetDesktop'),
      assetDesktopImgWidth: v('assetDesktopImgWidth') || imageDef.imgDesktopWidth,
      assetDesktopImgHeight: v('assetDesktopImgHeight') || imageDef.imgDesktopHeight,
      assetTablet: v('assetTablet'),
      assetTabletImgWidth: v('assetTabletImgWidth') || imageDef.imgTabletWidth,
      assetTabletImgHeight: v('assetTabletImgHeight') || imageDef.imgTabletHeight,
      assetMobile: v('assetMobile'),
      assetMobileImgWidth: v('assetMobileImgWidth') || imageDef.imgMobileWidth,
      assetMobileImgHeight: v('assetMobileImgHeight') || imageDef.imgMobileHeight,
    };

    // ── 找出對應 layout 的 text items ──
    const prefix = `textItems${blockLayout}`;
    const allRepeatGroups = getBlockRepeatConfigs(block);
    const textItems = findTextItemsByPrefix(allRepeatGroups, prefix);

    // ── 計算 text width（layout 1/2 用） ──
    const textWidth = {
      desktop: v('textWidthPercentDesktop'),
      tablet: v('textWidthPercentTablet'),
    };
    const textMaxWidth = {
      desktop: v('textMaxWidthDesktop'),
      tablet: v('textMaxWidthTablet'),
    };

    // ── 產生字型與顏色 class/style ──
    const advancedStyles = generateAdvancedStyles(config, fontDef);
    // console.log('advancedStyles', advancedStyles);
    // ── 產生所有 text items HTML ──
    const txt = generateTextItemsHtml({
      textItems,
      styleLayout: blockLayout,
      advancedStyles,
      textWidth,
      textMaxWidth,
      blockLayout,
      textItems2LayoutStyle,
    });

    // ── 組合 block inline style（padding）──
    const blockStyles = buildBlockStyles(v);

    // dialog style
    const dialogStyle = [
      v('dialogBoxRadius') && `--base-text-item-radius: ${v('dialogBoxRadius')}`,
      v('dialogBoxBorderWidth') && `--base-text-item-border-width: ${v('dialogBoxBorderWidth')}`,
      v('dialogBoxBorderColor') && `--base-text-item-border-color: ${v('dialogBoxBorderColor')}`,
      v('dialogBoxBgColor') && `--base-text-item-bg-color: #${v('dialogBoxBgColor')}`,
      v('dialogBoxPadding') && `--base-text-item-dialog-padding: ${v('dialogBoxPadding')}`,
    ].filter(Boolean).join('; ');

    const combinedStyles = [blockStyles, dialogStyle].filter(Boolean).join('; ');
    // ── 寫入 DOM ──
    block.innerHTML = `
      <div class="line-info-block relative box-border colorGroup-${colorGroup} test" ${combinedStyles ? `style="${combinedStyles}"` : ''}>
        ${txt.sideLeftDesktop || ''} ${txt.sideLeftTablet || ''}
        ${generatePictureHtml(picParams)}
        ${txt.sideRightDesktop || ''} ${txt.sideRightTablet || ''} ${txt.sideNone || ''}
      </div>
    `;

    block.classList.add(`theme-${colorGroup}`);
    block.classList.add(`style-layout-${blockLayout}`);

    if (debugEnabled) block.classList.add('debug-enabled');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating line-info block:', error);
    block.innerHTML = '<div class="error-message">Failed to load line-info block</div>';
  }
}
