import {
  getBlockConfigs,
  isAuthorUe,
} from '../../scripts/utils.js';

const DEFAULT_CONFIG = {
  itemName: '',
  sectionId: '',
};

// ── Shared item template ──────────────────────────────────────
const _renderItemHtml = (config, index) => {
  const name = config?.itemName?.text || 'GO TO TOP';
  const sectionId = config?.sectionId?.text || '';
  const gaLabel = config ? name.toLowerCase() : 'go to top';
  const eventName = config ? `sidenav_item_${index}_clicked` : 'sidenav_goto_top_clicked';

  return `
    <li class="item-container">
      <button class="item wdga item-${index}" aria-label="${name}" data-galabel="${gaLabel}" data-eventname="${eventName}" data-sectionid="${sectionId}">
        <div class="item-label">
          <div class="label-triangle"></div>
          <div class="label-name"><span>${name}</span></div>
        </div>
        <div class="item-dot">
          <div class="dot-decorator-1"></div>
          <div class="dot-decorator-2"></div>
          <div class="dot-decorator-3"></div>
          <div class="dot-decorator-4"></div>
        </div>
      </button>
    </li>
  `;
};

// ── Outer shell (shared by UE & Frontend) ─────────────────────
const _renderShell = () => `
  <div class="nav-hero-container">
    <div class="container-bg"></div>
    <div class="container-collapse is-close" tabindex="0" role="button">
      <div class="collapse-open">
        <span class="visuallyhidden">Open side navigation</span>
        <div class="img-icon"></div>
      </div>
      <div class="collapse-close">
        <span class="visuallyhidden">Close side navigation</span>
        <div class="img-icon"></div>
      </div>
    </div>
    <ul class="container-items"></ul>
  </div>
`;

// ── UE authoring mode ─────────────────────────────────────────
function _decorateUE(listEl, itemEls, items) {
  // GO TO TOP (no config = default)
  listEl.appendChild(
    document.createRange().createContextualFragment(_renderItemHtml(null, 0)),
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
function _decorateFrontend(listEl, items) {
  // GO TO TOP (no config = default)
  listEl.appendChild(
    document.createRange().createContextualFragment(_renderItemHtml(null, 0)),
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
        const targetSection = document.querySelector(`[data-sectionid="${sectionId}"]`) || document.getElementById(sectionId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
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

function _getDialogConfig(data) {
  return {
    basic: {
      styleLayout: data.stylelayout || '1',
      // Bar Bg
      bgColor: data.bgcolor || '',
      opacity: data.opacity || '',
      radius: data.radius || '',
      width: data.width || '24px',

      // Item Top (1/2)
      iconColor: data.iconcolor || '',

      // Item Dot (1/2)
      itemDotBorderColorDefault: data.itemdotbordercolordefault || '',
      itemDotBorderColorHover: data.itemdotbordercolorhover || '',
      itemDotBorderColorSelect: data.itemdotbordercolorselect || '',
      itemDotBgColorDefault: data.itemdotbgcolordefault || '',
      itemDotBgColorHover: data.itemdotbgcolorhover || '',
      itemDotBgColorSelect: data.itemdotbgcolorselect || '',

      // Item Label (1/2)
      itemLabelBgColor: data.itemlabelbgcolor || '',
      itemLabelRadius: data.itemlabelradius || '',

      // Item Top (3/4)
      itemTopStyle: data.itemtopstyle || 'default',
      itemTopIconColor: data.itemtopiconcolor || '',

      // Item Dot (3/4)
      itemDotStyle: data.itemdotstyle || 'default',
      borderColorDefault: data.bordercolordefault || '',
      borderColorHover: data.bordercolorhover || '',
      borderColorSelect: data.bordercolorselect || '',
      bgColorDefault: data.bgcolordefault || '',
      bgColorHover: data.bgcolorhover || '',
      bgColorSelect: data.bgcolorselect || '',

      // Top Img (3/4)
      topImgStyle: data.topimgstyle || 'default',
      topImgColor: data.topimgcolor || '',
    },
    advanced: {
      // Item Top (3/4)
      itemTopWidth: data.itemtopwidth || '',
      itemTopHeight: data.itemtopheight || '',
      itemTopAsset: data.itemtopasset || '',

      // Item Dot (3/4)
      itemDotWidth: data.itemdotwidth || '',
      itemDotHeight: data.itemdotheight || '',
      itemDotAssetDefault: data.itemdotassetdefault || '',
      itemDotAssetHover: data.itemdotassethover || '',
      itemDotAssetSelect: data.itemdotassetselect || '',

      // Top Img (3/4)
      topImgWidth: data.topimgwidth || '',
      topImgHeight: data.topimgheight || '',
      topImgAsset: data.topimgasset || '',
    },
  };
}

// ── Entry point ───────────────────────────────────────────────
export default async function decorate(block) {
  try {
    const data = block.dataset;
    const config = _getDialogConfig(data);

    console.log(config);

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

    block.innerHTML = _renderShell();
    // if (colorGroup) block.classList.add(colorGroup);

    const listEl = block.querySelector('.container-items');

    if (isUE) {
      _decorateUE(listEl, itemEls, items);

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
      _decorateFrontend(listEl, items);
    }

    _handleItemClick(block);
    _handleCollapseClick(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating nav-hero: ', error);
  }
}
