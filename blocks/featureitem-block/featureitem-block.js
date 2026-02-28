import {
  getBlockConfigs,
  getProductLine,
} from '../../scripts/utils.js';

function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function groupByRow(items) {
  const rows = [];
  let currentTop = null;
  let currentRow = [];

  items.forEach((item) => {
    const top = item.offsetTop;

    if (currentTop === null) {
      currentTop = top;
    }

    if (Math.abs(top - currentTop) < 5) {
      currentRow.push(item);
    } else {
      rows.push(currentRow);
      currentRow = [item];
      currentTop = top;
    }
  });

  if (currentRow.length) {
    rows.push(currentRow);
  }

  return rows;
}

function detectAlignMode(row) {
  let hasIcon = false;
  let hasSubText = false;

  row.forEach((item) => {
    if (item.querySelector('.icon')) {
      hasIcon = true;
    }
    if (item.querySelector('.subtext')) {
      hasSubText = true;
    }
  });

  if (!hasIcon) return 'align-text-top';
  if (hasIcon && hasSubText) return 'align-baseline';
  if (hasIcon && !hasSubText) return 'align-icon-middle';

  return 'align-text-top';
}

function updateLayout(block) {
  const items = [...block.querySelectorAll('.feature-item')];
  if (!items.length) return;

  const rows = groupByRow(items);
  const middleRow = rows[Math.floor(rows.length / 2)];
  if (!middleRow) return;

  const mode = detectAlignMode(middleRow);

  block.classList.remove(
    'align-text-top',
    'align-baseline',
    'align-icon-middle',
  );

  block.classList.add(mode);
}

const FONTS = {
  asus: {
    topTextD: 'tt-nr-18-sh-lg',
    topTextT: 'tt-nr-18-sh-md',
    topTextM: 'tt-nr-18-sh-sm',
    bottomTextD: 'tt-nr-18-sh-lg',
    bottomTextT: 'tt-nr-18-sh-md',
    bottomTextM: 'tt-nr-18-sh-sm',
    highlightTextD: 'tt-nr-48-lg',
    highlightTextT: 'tt-nr-48-md',
    highlightTextM: 'tt-nr-48-sm',
  },
  proart: {
    topTextD: 'tt-nr-18-sh-lg',
    topTextT: 'tt-nr-18-sh-md',
    topTextM: 'tt-nr-18-sh-sm',
    bottomTextD: 'tt-nr-18-sh-lg',
    bottomTextT: 'tt-nr-18-sh-md',
    bottomTextM: 'tt-nr-18-sh-sm',
    highlightTextD: 'tt-nr-48-lg',
    highlightTextT: 'tt-nr-48-md',
    highlightTextM: 'tt-nr-48-sm',
  },
  rog: {
    topTextD: 'rc-rg-18-sh-lg',
    topTextT: 'rc-rg-18-sh-md',
    topTextM: 'rc-rg-18-sh-sm',
    bottomTextD: 'rc-rg-18-sh-lg',
    bottomTextT: 'rc-rg-18-sh-md',
    bottomTextM: 'rc-rg-18-sh-sm',
    highlightTextD: 'tg-bd-48-lg',
    highlightTextT: 'tg-bd-48-md',
    highlightTextM: 'tg-bd-48-sm',
  },
  tuf: {
    topTextD: 'ro-rg-18-sh-lg',
    topTextT: 'ro-rg-18-sh-md',
    topTextM: 'ro-rg-18-sh-sm',
    bottomTextD: 'ro-rg-18-sh-lg',
    bottomTextT: 'ro-rg-18-sh-md',
    bottomTextM: 'ro-rg-18-sh-sm',
    highlightTextD: 'dp-cb-48-lg',
    highlightTextT: 'dp-cb-48-md',
    highlightTextM: 'dp-cb-48-sm',
  },
};

const PRODUCT_LINE = getProductLine();

// default
const DEFAULT_CONFIG = {
  topTextToggle: 'show',
  bottomTextToggle: 'show',
  topTextD: FONTS[PRODUCT_LINE].topTextD,
  topTextT: FONTS[PRODUCT_LINE].topTextT,
  topTextM: FONTS[PRODUCT_LINE].topTextM,
  bottomTextD: FONTS[PRODUCT_LINE].bottomTextD,
  bottomTextT: FONTS[PRODUCT_LINE].bottomTextT,
  bottomTextM: FONTS[PRODUCT_LINE].bottomTextM,
  highlightTextD: FONTS[PRODUCT_LINE].highlightTextD,
  highlightTextT: FONTS[PRODUCT_LINE].highlightTextT,
  highlightTextM: FONTS[PRODUCT_LINE].highlightTextM,
};

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, {}, 'featureitem-block');
    console.log('config', config);
    const wrapper = block.querySelectorAll(':scope > div');

    Array.from(wrapper).forEach(async (wrap) => {
      try {
        if (wrap.children.length < 2) {
          wrap.remove();
          return;
        }
        console.log('wrap', wrap.children);
        const itemConfig = await getBlockConfigs(wrap, DEFAULT_CONFIG, 'featureitem-block-item');
        console.log('itemConfig', itemConfig);
        wrap.classList.add('feature-item');

        const img = wrap.querySelector('img');
        if (img) {
          img.classList.add('icon');
        }

        const paragraphs = wrap.querySelectorAll('p');
        if (paragraphs.length > 1) {
          paragraphs[1].classList.add('subtext');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error decorating wrapper:', error);
      }
    });

    const update = debounce(() => updateLayout(block), 200);

    requestAnimationFrame(() => {
      updateLayout(block);
    });

    window.addEventListener('resize', update);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating featureitem-block block:', error);
    block.innerHTML = '<div class="error-message">Failed to load featureitem-block block</div>';
  }
}
