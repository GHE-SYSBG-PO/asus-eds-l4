import {
  getBlockConfigs,
  isAuthorUe,
} from '../../scripts/utils.js';

const DEFAULT_CONFIG = {
  labelName: '',
  sectionId: '',
  customizeHtml: {},
};

const _genContainerStyle = (config) => {
  const styleList = [];

  if (config.basic.itemTopStyle !== 'default') {
    styleList.push('item-top-customized');
  }

  if (config.basic.itemDotStyle !== 'default') {
    styleList.push('item-dot-customized');
  }

  if (config.basic.topImgStyle !== 'default') {
    styleList.push('top-img-customized');
  }

  return styleList.join(' ');
};

// -- for style 3/4 custom image
const _renderCustomTopImg = (_config) => {
  const { topImgAsset, topImgWidth, topImgHeight } = _config.advanced;

  if (!topImgAsset) {
    return '';
  }

  return `
    <div class="icon-container container-top-img relative" style="--icon-width:${topImgWidth}; --icon-height:${topImgHeight};">
      <img
        src="${topImgAsset}"
        alt=""
        class="animation-img absolute left-0 top-0 w-full h-full object-cover"
      />
    </div>
  `;
};

const _renderCustomItemTop = (_config) => {
  const { itemTopAsset, itemTopWidth, itemTopHeight } = _config.advanced;

  if (!itemTopAsset) {
    return '';
  }

  return `
    <div class="icon-container container-item-top" style="--icon-width:${itemTopWidth}; --icon-height:${itemTopHeight};">
      <img
        src="${itemTopAsset}"
        alt=""
        class="animation-img absolute left-0 top-0 w-full h-full object-cover"
      />
    </div>
  `;
};

const _renderCustomItemDot = (_config) => {
  const { itemDotAssetDefault } = _config.advanced;
  const itemDotAssetHover = _config.advanced.itemDotAssetHover || itemDotAssetDefault;
  const itemDotAssetSelect = _config.advanced.itemDotAssetSelect || itemDotAssetDefault;

  if (!itemDotAssetDefault) {
    return '';
  }

  return `
    <div class="icon-container container-item-dot">
      <img
        src="${itemDotAssetDefault}"
        alt=""
        class="animation-img absolute left-0 top-0 w-full h-full object-cover icon-default"
      />

      <img
        src="${itemDotAssetHover}"
        alt=""
        class="animation-img absolute left-0 top-0 w-full h-full object-cover icon-hover"
      />

      <img
        src="${itemDotAssetSelect}"
        alt=""
        class="animation-img absolute left-0 top-0 w-full h-full object-cover icon-select"
      />
    </div>
  `;
};

const _renderItemStyle = () => {
  const styles = [];

  // Size variables
  const { itemDotWidth, itemDotHeight } = DEFAULT_CONFIG.customizeHtml;
  if (itemDotWidth) styles.push(`--width: ${itemDotWidth}`);
  if (itemDotHeight) styles.push(`--height: ${itemDotHeight}`);

  if (styles.length === 0) return '';
  return `style="${styles.join('; ')};"`;
};

const _renderItemDataAttributes = (_config) => {
  const jumpPointOffsetDText = _config?.jumpPointOffsetD?.text || '';
  const jumpPointOffsetTText = _config?.jumpPointOffsetT?.text || '';
  const jumpPointOffsetMText = _config?.jumpPointOffsetM?.text || '';

  const attrs = [];
  if (jumpPointOffsetDText) attrs.push(`data-offset-top-d="${jumpPointOffsetDText}"`);
  if (jumpPointOffsetTText) attrs.push(`data-offset-top-t="${jumpPointOffsetTText}"`);
  if (jumpPointOffsetMText) attrs.push(`data-offset-top-m="${jumpPointOffsetMText}"`);

  return attrs.join(' ');
};

const _getLabelFontClass = () => {
  const main = document.querySelector('main');
  const product = main ? main.dataset.product : 'asus';

  switch (product) {
    case 'rog':
      return 'tg-bd-16-sh tg-bd-20-sh-md tg-bd-18-sh-sm';
    case 'tuf':
      return 'dp-cb-16-sh dp-cb-20-sh-md dp-cb-18-sh-sm';
    case 'proart':
      return 'tt-bd-16-sh tt-bd-20-sh-md tt-bd-18-sh-sm';
    case 'asus':
    default:
      return 'tt-bd-16-sh tt-bd-20-sh-md tt-bd-18-sh-sm';
  }
};

// ── Shared item template ──────────────────────────────────────
const _renderItemHtml = (_config, index) => {
  // eslint-disable-next-line no-console
  console.log('_renderItemHtml: ', _config);
  const name = _config?.labelName?.text ?? _config?.labelName ?? '';
  const sectionId = _config?.sectionId?.text ?? _config?.sectionId ?? '';
  const gaLabel = _config ? name.toLowerCase() : 'go to top';
  const eventName = _config ? `sidenav_item_${index}_clicked` : 'sidenav_goto_top_clicked';

  const custumStyle = index === 0
    ? DEFAULT_CONFIG.customizeHtml.customItemTopHtml
    : DEFAULT_CONFIG.customizeHtml.customItemDotHtml;

  const styleHtml = _renderItemStyle();
  const dataAttrs = _renderItemDataAttributes(_config);
  const fontClass = _getLabelFontClass();

  return `
    <li class="item-container">
      <button class="item wdga item-${index}" aria-label="${name}" data-galabel="${gaLabel}" data-eventname="${eventName}" data-sectionid="${sectionId}" ${dataAttrs} ${styleHtml}>
        <div class="item-label">
          <div class="label-name ${fontClass}"><span>${name}</span></div>
        </div>
        <div class="item-dot">
          ${custumStyle}
        </div>
      </button>
    </li>
  `;
};

// ── Outer shell (shared by UE & Frontend) ─────────────────────
const _renderShell = (config, containerStyle) => {
  const barBgPadding = `
    style="--padding-top: ${config.advanced.barPaddingTop}; --padding-bottom: ${config.advanced.barPaddingBottom};"
  `;

  return `
    <div class="nav-hero is-hidden">
      <div class="nav-hero-container ${containerStyle}">
        <div class="container-decorator absolute">
          ${DEFAULT_CONFIG.customizeHtml.customTopImgHtml}
        </div>
        <div class="container-bg" ${DEFAULT_CONFIG.customizeHtml.bgColorStyle}></div>
        <div class="container-collapse is-close" tabindex="0" role="button">
          <div class="collapse-open">
            <span class="visuallyhidden">Open side navigation</span>
            <div class="img-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 11H19M3 4H19M3 18H19" stroke="white" stroke-width="2.5" stroke-miterlimit="10" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          <div class="collapse-close">
            <span class="visuallyhidden">Close side navigation</span>
            <div class="img-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6L18.44 18.44M6 18.44L18.44 6" stroke="#F5F5F5" stroke-width="2.5" stroke-miterlimit="10" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
        <ul class="container-items" ${barBgPadding}></ul>
      </div>
    </div>
  `;
};

// ── UE authoring mode ─────────────────────────────────────────
function _decorateUE(listEl, itemEls, items, config) {
  // GO TO TOP (no config = default)
  listEl.appendChild(
    document.createRange().createContextualFragment(_renderItemHtml({
      labelName: config.basic.labelNameGoToTop,
      sectionId: config.basic.sectionIdGoToTop,
    }, 0)),
  );

  itemEls.forEach((itemEl, i) => {
    const navItem = itemEl.querySelector('.nav-hero-item');
    if (navItem && items[i]) {
      navItem.innerHTML = _renderItemHtml(items[i], i + 1);
    }
    listEl.appendChild(itemEl);
  });
}

// ── Frontend (published page) ─────────────────────────────────
function _decorateFrontend(listEl, items, config) {
  // GO TO TOP (no config = default)
  listEl.appendChild(
    document.createRange().createContextualFragment(_renderItemHtml({
      labelName: config.basic.labelNameGoToTop,
      sectionId: config.basic.sectionIdGoToTop,
    }, 0)),
  );

  items.forEach((item, i) => {
    const frag = document.createRange().createContextualFragment(
      _renderItemHtml(item, i + 1),
    );
    listEl.appendChild(frag);
  });
}

function _handleItemClick(block) {
  const itemButtons = block.querySelectorAll('.item');

  itemButtons.forEach((button) => {
    // Handle click events
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const sectionId = button.dataset.sectionid;

      // Handle navigation logic here
      if (sectionId) {
        // Scroll to section
        const targetSection = document.querySelector(`.section[data-sectionid="${sectionId}"]`) || document.getElementById(sectionId);
        if (targetSection) {
          // Determine offset based on RWD type
          const rwdType = window.getRwdType ? window.getRwdType() : 'desktop';
          let offsetStr;
          if (rwdType === 'desktop') {
            offsetStr = button.dataset.offsetTopD;
          } else if (rwdType === 'tablet') {
            offsetStr = button.dataset.offsetTopT;
          } else {
            offsetStr = button.dataset.offsetTopM;
          }

          const offsetVal = parseInt(offsetStr, 10) || 0;
          const targetY = targetSection.getBoundingClientRect().top + window.scrollY - offsetVal;

          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      } else if (button.classList.contains('item-0')) {
        // Go to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // Handle keyboard events (Enter key)
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault();
        // Trigger the same logic as click
        button.click();
      }
    });
  });
}

function _handleCollapseClick(block) {
  const collapseButton = block.querySelector('.container-collapse');
  const itemContainers = block.closest('.nav-hero-item-container');

  collapseButton.addEventListener('click', (event) => {
    event.preventDefault();
    const isClose = collapseButton.classList.contains('is-close');
    if (isClose) {
      collapseButton.classList.remove('is-close');
      collapseButton.classList.add('is-open');
      itemContainers.classList.add('show');
    } else {
      collapseButton.classList.remove('is-open');
      collapseButton.classList.add('is-close');
      itemContainers.classList.remove('show');
    }
  });
}

const _hexColor = (val) => {
  if (!val || val.startsWith('#')) return val;
  // Only add # if the value looks like a hex color (3, 4, 6, or 8 hex chars)
  if (/^[0-9a-fA-F]{3,8}$/.test(val)) return `#${val}`;
  return val;
};

function _getDialogConfig(data) {
  return {
    basic: {
      styleLayout: data.stylelayout || '1',
      // Bar Bg
      bgColor: _hexColor(data.bgcolor) || '',
      opacity: data.opacity || '',
      radius: data.radius || '',
      width: data.width || '24px',
      showMenuId: data.showmenuid || '',

      // Item Go To Top
      labelNameGoToTop: data.labelnamegototop || 'GO TO TOP',
      sectionIdGoToTop: data.sectionidgototop || '',

      // Item Top (1/2)
      iconColor: _hexColor(data.iconcolor) || '',

      // Item Dot (1/2)
      itemDotBorderColorDefault: _hexColor(data.itemdotbordercolordefault) || '',
      itemDotBorderColorHover: _hexColor(data.itemdotbordercolorhover) || '',
      itemDotBorderColorSelect: _hexColor(data.itemdotbordercolorselect) || '',
      itemDotBgColorDefault: _hexColor(data.itemdotbgcolordefault) || '',
      itemDotBgColorHover: _hexColor(data.itemdotbgcolorhover) || '',
      itemDotBgColorSelect: _hexColor(data.itemdotbgcolorselect) || '',

      // Item Label (1/2)
      ItemLabelTextColor: _hexColor(data.ItemLabelTextColor) || '',
      itemLabelBgColor: _hexColor(data.itemlabelbgcolor) || '',
      itemLabelRadius: data.itemlabelradius || '',

      // Item Top (3/4)
      itemTopStyle: data.itemtopstyle || 'default',
      itemTopIconColor: _hexColor(data.itemtopiconcolor) || '',

      // Item Dot (3/4)
      itemDotStyle: data.itemdotstyle || 'default',
      borderColorDefault: _hexColor(data.bordercolordefault) || '',
      borderColorHover: _hexColor(data.bordercolorhover) || '',
      borderColorSelect: _hexColor(data.bordercolorselect) || '',
      bgColorDefault: _hexColor(data.bgcolordefault) || '',
      bgColorHover: _hexColor(data.bgcolorhover) || '',
      bgColorSelect: _hexColor(data.bgcolorselect) || '',

      // Top Img (3/4)
      topImgStyle: data.topimgstyle || 'default',
      topImgColor: _hexColor(data.topimgcolor) || '',
    },
    advanced: {
      // common
      barPaddingTop: data.barpaddingtop || '0',
      barPaddingBottom: data.barpaddingbottom || '0',

      // Item Top (3/4)
      itemTopWidth: data.itemtopwidth || '20px',
      itemTopHeight: data.itemtopheight || '20px',
      itemTopAsset: data.itemtopasset || '',

      // Item Dot (3/4)
      itemDotWidth: data.itemdotwidth || '24px',
      itemDotHeight: data.itemdotheight || '40px',
      itemDotAssetDefault: data.itemdotassetdefault || '',
      itemDotAssetHover: data.itemdotassethover || '',
      itemDotAssetSelect: data.itemdotassetselect || '',

      // Top Img (3/4)
      topImgWidth: data.topimgwidth || '24px',
      topImgHeight: data.topimgheight || '100px',
      topImgAsset: data.topimgasset || '',
    },
  };
}

function _handleSectionEnter(block) {
  const items = block.querySelectorAll('.item');
  const sectionMap = [];

  items.forEach((item) => {
    const sectionId = item.dataset.sectionid;
    if (!sectionId) return;
    const section = document.querySelector(`.section[data-sectionid="${sectionId}"]`)
      || document.getElementById(sectionId);
    if (section) {
      sectionMap.push({ item, section });
    }
  });

  const updateActive = () => {
    let activeItem = null;

    sectionMap.forEach(({ item, section }) => {
      const { top, bottom } = section.getBoundingClientRect();
      // Active only when section straddles the viewport top
      if (top <= 1 && bottom > 0) {
        activeItem = item;
      }
    });

    items.forEach((item) => item.classList.remove('enter'));

    if (activeItem) {
      activeItem.classList.add('enter');
    } else if (window.scrollY <= 0) {
      // Only at the very top of the page → go to top
      const goToTop = block.querySelector('.item-0');
      if (goToTop) goToTop.classList.add('enter');
    }
  };

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

const _handleNavShowUp = (block, config) => {
  const container = block.querySelector('.nav-hero-container');
  if (!container) return;
  const containerSection = block.closest('.nav-hero-item-container');
  const containerCollapse = block.querySelector('.container-collapse');

  // RWD default scroll thresholds (px)
  const SCROLL_THRESHOLDS = {
    mobile: 2000, // < 731
    tablet: 2500, // 731 – 1279px
    desktop: 3000, // >= 1280px
  };

  const { showMenuId } = config.basic;

  const getThreshold = () => {
    // If showMenuId is configured, use that element's offsetTop
    if (showMenuId) {
      const target = document.getElementById(showMenuId)
        || document.querySelector(`.section[data-sectionid="${showMenuId}"]`);
      // Only use offsetTop if the target is visible (not display: none)
      if (target && target.offsetHeight > 0) return target.offsetTop;
    }

    // Fallback to RWD default values
    const rwdType = window.getRwdType ? window.getRwdType() : 'desktop';
    if (rwdType === 'desktop') return SCROLL_THRESHOLDS.desktop;
    if (rwdType === 'tablet') return SCROLL_THRESHOLDS.tablet;
    return SCROLL_THRESHOLDS.mobile;
  };

  const update = () => {
    const threshold = getThreshold();
    if (window.scrollY >= threshold) {
      container.classList.add('is-show');
    } else {
      container.classList.remove('is-show');

      // reset nav is-open
      containerSection.classList.remove('show');
      containerCollapse.classList.remove('is-open');
      setTimeout(() => {
        containerCollapse.classList.add('is-close');
      }, 0);
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
};

const _setContainerStyle = (containerEl, config) => {
  if (!containerEl) return;
  containerEl.classList.add(`style-layout-${config.basic.styleLayout}`);

  const toKebabCase = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

  const setCssVariables = (group) => {
    Object.entries(group).forEach(([key, value]) => {
      // Exclude styleLayout from CSS variables as it's used for class name
      if (value !== '' && key !== 'styleLayout') {
        containerEl.style.setProperty(`--${toKebabCase(key)}`, value);
      }
    });
  };

  setCssVariables(config.basic);
  setCssVariables(config.advanced);
};

const _handleIsHiddenEvent = (containerEl) => {
  // HO TO USE:
  // document.body.dispatchEvent(new Event('nav-hero-show'));
  // document.body.dispatchEvent(new Event('nav-hero-hidden'));

  document.body.addEventListener('nav-hero-hidden', () => {
    // Dynamically query the element in case the DOM was updated/re-rendered
    const navHero = containerEl.querySelector('.nav-hero');
    if (navHero) {
      navHero.classList.add('is-hidden');
    }
  });

  document.body.addEventListener('nav-hero-show', () => {
    const navHero = containerEl.querySelector('.nav-hero');
    if (navHero) {
      navHero.classList.remove('is-hidden');
    }
  });

  // Also listen on document as a fallback, just in case other scripts dispatch on document
  document.addEventListener('nav-hero-hidden', () => {
    const navHero = containerEl.querySelector('.nav-hero');
    if (navHero) navHero.classList.add('is-hidden');
  });
  document.addEventListener('nav-hero-show', () => {
    const navHero = containerEl.querySelector('.nav-hero');
    if (navHero) navHero.classList.remove('is-hidden');
  });
};

// ── Entry point ───────────────────────────────────────────────
export default async function decorate(block) {
  try {
    const data = block.dataset;
    // eslint-disable-next-line no-console
    console.log('data: ', data);
    const config = _getDialogConfig(data);
    // eslint-disable-next-line no-console
    console.log(config);

    // gen style 3/4 custom html
    DEFAULT_CONFIG.customizeHtml = {
      customTopImgHtml: _renderCustomTopImg(config),
      customItemTopHtml: _renderCustomItemTop(config),
      customItemDotHtml: _renderCustomItemDot(config),
      itemDotWidth: config.advanced.itemDotWidth,
      itemDotHeight: config.advanced.itemDotHeight,
      bgColorStyle: config.basic.bgColor ? `style="--bgcolor: "${config.basic.bgColor}";"` : '',
    };

    // You can use the config object from here on out
    const isUE = isAuthorUe();

    const itemEls = [...block.querySelectorAll('.nav-hero-item-wrapper')];
    const items = await Promise.all(
      itemEls.map(async (itemEl) => getBlockConfigs(
        itemEl.querySelector('.nav-hero-item'),
        DEFAULT_CONFIG,
        'nav-hero-item',
      )),
    );

    const containerStyle = _genContainerStyle(config);
    block.innerHTML = _renderShell(config, containerStyle);

    const listEl = block.querySelector('.container-items');
    const containerEl = listEl.closest('.nav-hero-item-container');
    _setContainerStyle(containerEl, config);

    if (isUE) {
      _decorateUE(listEl, itemEls, items, config);

      // Listen for live UE updates
      block.addEventListener(
        'asus-l4--section-nav-hero',
        async ({ detail }) => {
          const itemConfig = await getBlockConfigs(
            detail,
            DEFAULT_CONFIG,
            'nav-hero-item',
          );
          const index = [...listEl.querySelectorAll('.nav-hero-item')]
            .indexOf(detail);
          detail.innerHTML = _renderItemHtml(itemConfig, index);
        },
      );
    } else {
      _decorateFrontend(listEl, items, config);
    }

    _handleItemClick(block);
    _handleCollapseClick(block);
    _handleSectionEnter(block);
    _handleNavShowUp(block, config);
    _handleIsHiddenEvent(containerEl);

    setTimeout(() => {
      containerEl.querySelector('.nav-hero').classList.remove('is-hidden');
    }, 500);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating nav-hero: ', error);
  }
}
