import {
  getProductLine,
  getBlockConfigs,
  getFieldValue,
  getBlockRepeatConfigs,
} from '../../scripts/utils.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const PRODUCT_LINE = getProductLine();
// const PRODUCT_LINE = 'rog';

/** Font-family prefix per product line，title 與 info 各自管理 */
const FONT_PREFIX = {
  title: {
    asus: 'ro-md', proart: 'ro-md', rog: 'rc-bd', tuf: 'ro-md',
  },
  info: {
    asus: 'ro-rg', proart: 'ro-rg', rog: 'rc-rg', tuf: 'ro-rg',
  },
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

/** dialog 彈出方向對應的 CSS class 名稱 */
const DIALOG_DIRECTION_MAP = {
  TC: 'top-center',
  TL: 'top-left',
  TR: 'top-right',
  BL: 'bottom-left',
  BR: 'bottom-right',
  BC: 'bottom-center',
};

// ─── Generic Helpers ──────────────────────────────────────────────────────────

/** 移除字串中所有空白字元 */
const cleanString = (str) => str.replace(/\s/g, '');

/**
 * 將值轉換為 CSS width 自訂變數字串。
 * - 有 px → 直接使用
 * - 有 % 或純數字 → 轉為 calc(column-width * ratio)
 */
const buildWidthStyle = (value, cssVar) => {
  if (!value) return null;
  if (value.includes('px')) return `${cssVar}:${value}`;
  const numValue = parseFloat(value);
  if (!Number.isNaN(numValue)) {
    return `${cssVar}:calc(var(--l4-column-width-12) * ${numValue / 100})`;
  }
  return null;
};

/**
 * 將值轉換為 CSS max-width 自訂變數字串。
 * 若值沒有 px 單位，自動補上。
 */
const buildMaxWidthStyle = (value, cssVar) => {
  if (!value) return null;
  if (value.includes('px')) return `${cssVar}:${value}`;
  return `${cssVar}:${value}px`;
};

/** 將非空字串組合成 class string */
const joinClasses = (...parts) => parts.filter(Boolean).join(' ');

/** 將非空樣式組合成 inline style string */
const joinStyles = (...parts) => parts.filter(Boolean).join('; ');

/** 將 items 包在指定 class 的 div 裡，若 items 為空則回傳空字串 */
const wrapSide = (items, classes) => {
  if (items.length === 0) return '';
  return `<div class="${classes}">${items.join('')}</div>`;
};

// ─── HTML Generators ─────────────────────────────────────────────────────────

/**
 * 產生 <picture> 區塊的 HTML。
 * 支援 desktop / tablet / mobile 三種圖片來源。
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

  const styles = joinStyles(
    assetDesktopImgWidth && `--img-width-lg: ${assetDesktopImgWidth}`,
    assetDesktopImgHeight && `--img-height-lg: ${assetDesktopImgHeight}`,
    assetTabletImgWidth && `--img-width-md: ${assetTabletImgWidth}`,
    assetTabletImgHeight && `--img-height-md: ${assetTabletImgHeight}`,
    assetMobileImgWidth && `--img-width-sm: ${assetMobileImgWidth}`,
    assetMobileImgHeight && `--img-height-sm: ${assetMobileImgHeight}`,
  );

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

// ─── Font & Style Helpers ─────────────────────────────────────────────────────

/**
 * 根據字型大小與 prefix 產生 RWD font class string。
 * @param {string} dtSize - desktop 字型大小
 * @param {string} tSize  - tablet 字型大小（未設定時由呼叫端 fallback 到 dtSize）
 * @param {string} mSize  - mobile 字型大小
 * @param {string} prefix - font class prefix
 */
const buildFontClass = (dtSize, tSize, mSize, prefix) => `${prefix}-${dtSize}-lg ${prefix}-${tSize}-md ${prefix}-${mSize}-sm`;

/**
 * 根據 config 與 productLine 預設值，產生 title / info 的 font class 與 color style。
 */
const generateAdvancedStyles = (config, defaults) => {
  const v = getFieldValue(config);
  const titleFontDT = v('titleFontDTselect') || defaults?.titleFontDTselect;
  const titleFontT = v('titleFontTselect') || defaults?.titleFontTselect || titleFontDT;
  const titleFontM = v('titleFontMselect') || defaults?.titleFontMselect;
  const titleFontColor = v('titleFontColor') || defaults?.titleFontColor;
  const infoFontDT = v('infoFontDTselect') || defaults?.infoFontDTselect;
  const infoFontT = v('infoFontTselect') || defaults?.infoFontTselect || infoFontDT;
  const infoFontM = v('infoFontMselect') || defaults?.infoFontMselect;
  const infoFontColor = v('infoFontColor') || defaults?.infoFontColor;

  return {
    title: {
      classes: buildFontClass(titleFontDT, titleFontT, titleFontM, FONT_PREFIX.title[PRODUCT_LINE]),
      style: titleFontColor ? `--base-text-item-title-color: ${titleFontColor};` : '',
    },
    info: {
      classes: buildFontClass(infoFontDT, infoFontT, infoFontM, FONT_PREFIX.info[PRODUCT_LINE]),
      style: infoFontColor ? `--base-text-item-info-color: ${infoFontColor};` : '',
    },
  };
};

// ─── Item Data Extraction ─────────────────────────────────────────────────────

/**
 * 從原始 repeat config 物件，取出對應 styleLayout 的欄位值。
 */
const extractItemData = (itemData, styleLayout, index) => {
  const prefix = `textItems${styleLayout}`;
  const get = (key, fallback = '') => cleanString(itemData[`${prefix}${key}`]?.text || fallback);

  return {
    index,
    layoutStyle: get('LayoutStyle', 'left'),
    titleRichtext: itemData[`${prefix}TitleRichtext`]?.text || 'Item Title',
    infoRichtext: itemData[`${prefix}InfoRichtext`]?.text || null,
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
};

// ─── Item HTML Renderer ───────────────────────────────────────────────────────

/**
 * 產生單一 text item 的 HTML。
 * blockLayout 用來決定 text-item-freeform / freeform-dialog class。
 * isMobile 為 true 時，移除定位相關 class/style（行動版用）。
 */
const renderItemHtml = (item, itemClasses, itemStyle, advancedStyles, blockLayout, isMobile = false) => {
  const containerClass = isMobile ? '' : itemClasses;
  const containerStyle = isMobile ? '' : itemStyle;

  const typeClasses = [];
  if (blockLayout === 4 || blockLayout === 5) typeClasses.push('text-item-freeform');
  if (blockLayout === 5) typeClasses.push('text-item-freeform-dialog');

  const titleHtml = item.titleRichtext
    ? `<div class="title w-full ${advancedStyles.title.classes}" style="${advancedStyles.title.style}"><span class="item-title-text">${item.titleRichtext}</span></div>`
    : '';

  const infoHtml = item.infoRichtext
    ? `<div class="info w-full ${advancedStyles.info.classes}" style="${advancedStyles.info.style}"><span class="item-info-text">${item.infoRichtext}</span></div>`
    : '';

  let circleNumberHtml = '';
  if (isMobile || blockLayout === 3 || blockLayout === 4 || blockLayout === 5) {
    circleNumberHtml = `
      <div class="lg:hidden md:hidden circle-number ${advancedStyles.title.classes}">
        <span class="number">${item.index + 1}</span>
      </div>
    `;
  }

  const fullClass = joinClasses('text-item-container', ...typeClasses, containerClass, `text-item-${item.index}`);

  return `
    <div class="${fullClass}" style="${containerStyle}" data-index="${item.index}">
      ${circleNumberHtml}
      <div class="text-item">
        ${titleHtml}
        ${infoHtml}
      </div>
    </div>
  `;
};

// ─── Layout Strategies ────────────────────────────────────────────────────────
//
// 每個 strategy 對外統一簽名：(ctx) => sides
// sides = { sideLeftDesktop, sideLeftTablet, sideRightDesktop, sideRightTablet, sideNone }
//
// ctx = {
//   textItems, styleLayout, advancedStyles,
//   textWidth, textMaxWidth, blockLayout, textItems2LayoutStyle
// }

/**
 * Layout 1：左右兩側分欄。
 * 桌機依 sideDesktop、平板依 sideTablet 各自分組。
 */
const layoutStrategy1 = (ctx) => {
  const {
    textItems, styleLayout, advancedStyles, textWidth, textMaxWidth,
  } = ctx;

  const groups = {
    sideLeftDesktop: [],
    sideRightDesktop: [],
    sideLeftTablet: [],
    sideRightTablet: [],
    mobile: [],
  };

  textItems.forEach((rawItem, index) => {
    const item = extractItemData(rawItem, styleLayout, index);

    const desktopSideClass = item.sideDesktop === 'right' ? 'lg:text-left' : 'lg:text-right';
    const tabletSideClass = item.sideTablet === 'right' ? 'md:text-left' : 'md:text-right';
    const classes = joinClasses('absolute flex pointer-events-auto', desktopSideClass, tabletSideClass);

    const styles = joinStyles(
      buildWidthStyle(textWidth.desktop, '--line-info-text-width-lg'),
      buildMaxWidthStyle(textMaxWidth.desktop, '--line-info-text-max-width-lg'),
      buildWidthStyle(textWidth.tablet, '--line-info-text-width-md'),
      buildMaxWidthStyle(textMaxWidth.tablet, '--line-info-text-max-width-md'),
      item.yValueTablet !== '0' && `--line-info-y-md:${item.yValueTablet}`,
      item.yValueDesktop !== '0' && `--line-info-y-lg:${item.yValueDesktop}`,
    );

    const itemHtml = renderItemHtml(item, classes, styles, advancedStyles, 1);
    const mobileHtml = renderItemHtml(item, '', '', advancedStyles, 1, true);

    if (item.sideDesktop === 'right') groups.sideRightDesktop.push(itemHtml);
    else groups.sideLeftDesktop.push(itemHtml);

    if (item.sideTablet === 'right') groups.sideRightTablet.push(itemHtml);
    else groups.sideLeftTablet.push(itemHtml);

    groups.mobile.push(mobileHtml);
  });

  return {
    sideLeftDesktop: wrapSide(groups.sideLeftDesktop, 'hidden lg:block md:hidden sm:hidden line-info-side line-info-side-left-desktop'),
    sideLeftTablet: wrapSide(groups.sideLeftTablet, 'hidden md:block lg:hidden line-info-side line-info-side-left-tablet'),
    sideRightDesktop: wrapSide(groups.sideRightDesktop, 'hidden lg:block md:hidden sm:hidden line-info-side line-info-side-right-desktop'),
    sideRightTablet: wrapSide(groups.sideRightTablet, 'hidden md:block lg:hidden line-info-side line-info-side-right-tablet'),
    sideNone: wrapSide(groups.mobile, 'hidden md:hidden sm:block lg:hidden line-info-side line-info-side-none'),
  };
};

/**
 * Layout 2：全部 item 統一放同一側。
 * textItems2LayoutStyle 決定文字在圖片的左側或右側。
 */
const layoutStrategy2 = (ctx) => {
  const {
    textItems, styleLayout, advancedStyles, textWidth, textMaxWidth, textItems2LayoutStyle,
  } = ctx;

  const sideItems = [];
  const mobileItems = [];

  textItems.forEach((rawItem, index) => {
    const item = extractItemData(rawItem, styleLayout, index);

    const textAlignClass = textItems2LayoutStyle === 'right' ? 'text-left' : 'text-right';
    const classes = joinClasses('absolute flex pointer-events-auto', textAlignClass);

    const styles = joinStyles(
      buildWidthStyle(textWidth.desktop, '--line-info-text-width-lg'),
      buildMaxWidthStyle(textMaxWidth.desktop, '--line-info-text-max-width-lg'),
      buildWidthStyle(textWidth.tablet, '--line-info-text-width-md'),
      buildMaxWidthStyle(textMaxWidth.tablet, '--line-info-text-max-width-md'),
      item.yValueTablet !== '0' && `--line-info-y-md:${item.yValueTablet}`,
      item.yValueDesktop !== '0' && `--line-info-y-lg:${item.yValueDesktop}`,
    );

    sideItems.push(renderItemHtml(item, classes, styles, advancedStyles, 2));
    mobileItems.push(renderItemHtml(item, '', '', advancedStyles, 2, true));
  });

  const isRight = textItems2LayoutStyle === 'right';
  const sideWrapClass = isRight
    ? 'hidden lg:block md:hidden sm:hidden line-info-side line-info-side-right-desktop'
    : 'hidden lg:block md:hidden sm:hidden line-info-side line-info-side-left-desktop';

  return {
    sideLeftDesktop: isRight ? '' : wrapSide(sideItems, sideWrapClass),
    sideLeftTablet: '',
    sideRightDesktop: isRight ? wrapSide(sideItems, sideWrapClass) : '',
    sideRightTablet: '',
    sideNone: wrapSide(mobileItems, 'hidden md:hidden sm:block lg:hidden line-info-side line-info-side-none'),
  };
};

/**
 * Layout 3 & 4 共用邏輯：絕對定位，bottom-left / bottom-right 對齊。
 * Layout 4 會額外加上 text-item-freeform（由 renderItemHtml 依 blockLayout 自動處理）。
 */
const buildAbsolutePositionedSides = (ctx) => {
  const {
    textItems, styleLayout, advancedStyles, blockLayout,
  } = ctx;

  const allItems = [];

  textItems.forEach((rawItem, index) => {
    const item = extractItemData(rawItem, styleLayout, index);

    const classes = ['absolute flex pointer-events-auto'];

    if (item.alignmentDesktop) {
      classes.push(item.alignmentDesktop === 'right' ? 'bottom-right-lg lg:text-left' : 'bottom-left-lg lg:text-right');
    }
    if (item.alignmentTablet) {
      classes.push(item.alignmentTablet === 'right' ? 'bottom-right-md md:text-left' : 'bottom-left-md md:text-right');
    }

    const styles = joinStyles(
      buildWidthStyle(item.textWidthDesktop, '--line-info-text-width-lg'),
      buildMaxWidthStyle(item.textMaxWidthDesktop, '--line-info-text-max-width-lg'),
      buildWidthStyle(item.textWidthTablet, '--line-info-text-width-md'),
      buildMaxWidthStyle(item.textMaxWidthTablet, '--line-info-text-max-width-md'),
      item.xValueDesktop !== '0' && `--line-info-x-lg: ${item.xValueDesktop}`,
      item.xValueTablet !== '0' && `--line-info-x-md: ${item.xValueTablet}`,
      item.yValueTablet !== '0' && `--line-info-y-md: ${item.yValueTablet}`,
      item.yValueDesktop !== '0' && `--line-info-y-lg: ${item.yValueDesktop}`,
    );

    allItems.push(renderItemHtml(item, classes.join(' '), styles, advancedStyles, blockLayout));
  });

  return {
    sideLeftDesktop: '',
    sideLeftTablet: '',
    sideRightDesktop: '',
    sideRightTablet: '',
    sideNone: wrapSide(allItems, 'line-info-side line-info-side-none'),
  };
};

/** Layout 3：絕對定位，無 freeform */
const layoutStrategy3 = (ctx) => buildAbsolutePositionedSides(ctx);

/** Layout 4：絕對定位，加 text-item-freeform */
const layoutStrategy4 = (ctx) => buildAbsolutePositionedSides(ctx);

/**
 * Layout 5：Dialog popup 模式。
 * 使用 dialogDirectionMap 決定彈出方向，寬度來自 dialogBoxWidth。
 */
const layoutStrategy5 = (ctx) => {
  const { textItems, styleLayout, advancedStyles } = ctx;

  const allItems = [];

  textItems.forEach((rawItem, index) => {
    const item = extractItemData(rawItem, styleLayout, index);

    const classes = ['absolute flex pointer-events-auto'];

    const directionDesktop = DIALOG_DIRECTION_MAP[item.dialogDirectionDesktop];
    if (directionDesktop) classes.push(`${directionDesktop}-lg`);

    const directionTablet = DIALOG_DIRECTION_MAP[item.dialogDirectionTablet];
    if (directionTablet) classes.push(`${directionTablet}-md`);

    if (item.alignmentDesktop) classes.push(`lg:text-${item.alignmentDesktop}`);
    if (item.alignmentTablet) classes.push(`md:text-${item.alignmentTablet}`);

    const styles = joinStyles(
      buildWidthStyle(item.dialogBoxWidthDesktop, '--line-info-text-width-lg'),
      buildMaxWidthStyle(item.maxDialogBoxWidthDesktop, '--line-info-text-max-width-lg'),
      buildWidthStyle(item.dialogBoxWidthTablet, '--line-info-text-width-md'),
      buildMaxWidthStyle(item.maxDialogBoxWidthTablet, '--line-info-text-max-width-md'),
      item.xValueDesktop !== '0' && `--line-info-x-lg: ${item.xValueDesktop}`,
      item.xValueTablet !== '0' && `--line-info-x-md: ${item.xValueTablet}`,
      item.yValueTablet !== '0' && `--line-info-y-md: ${item.yValueTablet}`,
      item.yValueDesktop !== '0' && `--line-info-y-lg: ${item.yValueDesktop}`,
    );

    allItems.push(renderItemHtml(item, classes.join(' '), styles, advancedStyles, 5));
  });

  return {
    sideLeftDesktop: '',
    sideLeftTablet: '',
    sideRightDesktop: '',
    sideRightTablet: '',
    sideNone: wrapSide(allItems, 'line-info-side line-info-side-none'),
  };
};

/** styleLayout → strategy function 的唯一入口 */
const LAYOUT_STRATEGIES = {
  1: layoutStrategy1,
  2: layoutStrategy2,
  3: layoutStrategy3,
  4: layoutStrategy4,
  5: layoutStrategy5,
};

// ─── Block-level Helpers ──────────────────────────────────────────────────────

/**
 * 從所有 repeat config groups 中，找出對應 blockLayout 的那一組 items。
 * 使用 startsWith 避免 prefix substring 誤 match（例如 'textItems1' 誤 match 'textItems10'）。
 * 使用 some 掃所有 key，不依賴 key 的排列順序。
 * @param {Array} allGroups - getBlockRepeatConfigs 的回傳值
 * @param {number} blockLayout - 目前的 layout 編號
 */
const findTextItemsByLayout = (allGroups, blockLayout) => {
  const prefix = `textItems${blockLayout}`;
  const matched = allGroups.find((group) => {
    if (!group || group.length === 0) return false;
    return Object.keys(group[0]).some((key) => key.startsWith(prefix));
  });
  return matched || [];
};

/** 產生 block-level 的 padding inline style */
const buildBlockStyles = (v) => joinStyles(
  v('paddingTopDesktop') && `--line-info-block-pd-top-lg: ${v('paddingTopDesktop')}`,
  v('paddingBottomDesktop') && `--line-info-block-pd-bottom-lg: ${v('paddingBottomDesktop')}`,
  v('paddingTopTablet') && `--line-info-block-pd-top-md: ${v('paddingTopTablet')}`,
  v('paddingBottomTablet') && `--line-info-block-pd-bottom-md: ${v('paddingBottomTablet')}`,
);

/** 產生 dialog box 相關的 CSS 變數 inline style */
const buildDialogStyles = (v) => joinStyles(
  v('dialogBoxRadius') && `--base-text-item-radius: ${v('dialogBoxRadius')}`,
  v('dialogBoxBorderWidth') && `--base-text-item-border-width: ${v('dialogBoxBorderWidth')}`,
  v('dialogBoxBorderColor') && `--base-text-item-border-color: ${v('dialogBoxBorderColor')}`,
  v('dialogBoxBgColor') && `--base-text-item-bg-color: #${v('dialogBoxBgColor')}`,
  v('dialogBoxPadding') && `--base-text-item-dialog-padding: ${v('dialogBoxPadding')}`,
);

// ─── Main Decorator ───────────────────────────────────────────────────────────

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, {}, 'line-info');
    const v = getFieldValue(config);

    // ── 基本設定 ──
    const blockLayout = parseInt(config.styleLayout?.text || config.styleLayout || '1', 10);
    const imageDef = IMAGE_DEFAULTS_BY_LAYOUT[blockLayout] || IMAGE_DEFAULTS_BY_LAYOUT[1];
    const fontDef = FONT_DEFAULTS_BY_PRODUCT_LINE[PRODUCT_LINE] || FONT_DEFAULTS_BY_PRODUCT_LINE.asus;
    const colorGroup = v('colorGroup') || 'section-light';
    const debugEnabled = v('debugEnabled') === 'true';

    // ── Layout 2 專屬：文字擺放側 ──
    const textItems2LayoutStyle = blockLayout === 2 ? (v('textItems2LayoutStyle') || 'left') : null;

    // ── 圖片參數 ──
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

    // ── 取得對應 layout 的 text items ──
    const allRepeatGroups = getBlockRepeatConfigs(block);
    const textItems = findTextItemsByLayout(allRepeatGroups, blockLayout);

    // ── text width（layout 1/2 的 block-level 設定）──
    const textWidth = {
      desktop: v('textWidthPercentDesktop'),
      tablet: v('textWidthPercentTablet'),
    };
    const textMaxWidth = {
      desktop: v('textMaxWidthDesktop'),
      tablet: v('textMaxWidthTablet'),
    };

    // ── 字型與顏色 ──
    const advancedStyles = generateAdvancedStyles(config, fontDef);

    // ── 以 styleLayout 為唯一入口，執行對應 strategy ──
    const strategy = LAYOUT_STRATEGIES[blockLayout] || LAYOUT_STRATEGIES[1];
    const ctx = {
      textItems,
      styleLayout: blockLayout,
      advancedStyles,
      textWidth,
      textMaxWidth,
      blockLayout,
      textItems2LayoutStyle,
    };
    const sides = strategy(ctx);

    // ── 組合 inline styles ──
    const combinedStyles = joinStyles(buildBlockStyles(v), buildDialogStyles(v));

    // ── 寫入 DOM ──
    block.innerHTML = `
      <div class="line-info-block relative box-border colorGroup-${colorGroup}" ${combinedStyles ? `style="${combinedStyles}"` : ''}>
        ${sides.sideLeftDesktop}
        ${sides.sideLeftTablet}
        ${generatePictureHtml(picParams)}
        ${sides.sideRightDesktop}
        ${sides.sideRightTablet}
        ${sides.sideNone}
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
