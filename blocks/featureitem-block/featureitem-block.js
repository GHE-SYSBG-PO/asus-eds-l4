import {
  getBlockConfigs,
  handleMotion,
  getFieldValue,
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

function adjustTopTextHeights(block) {
  const items = [...block.querySelectorAll('.featureitem-block-item')];
  if (!items.length) return;

  const rows = groupByRow(items);

  // 第一步：清空所有 .featureitem-block-h 和 .featureitem-block-m 的高度
  items.forEach((item) => {
    const topText = item.querySelector('.featureitem-block-h');
    const middleText = item.querySelector('.featureitem-block-m');
    if (topText) {
      topText.style.height = ''; // 重置为默认高度
    }
    if (middleText) {
      middleText.style.height = ''; // 重置为默认高度
    }
  });

  // 第二步：计算每一行中 .featureitem-block-h 和 .featureitem-block-m 的最大高度（包括 data-top-text-space="hide" 的元素）
  rows.forEach((row) => {
    let maxTopHeight = 0;
    let maxMiddleHeight = 0;

    row.forEach((item) => {
      const topText = item.querySelector('.featureitem-block-h');
      const middleText = item.querySelector('.featureitem-block-m');

      if (topText) {
        const height = topText.offsetHeight;
        if (height > maxTopHeight) {
          maxTopHeight = height;
        }
      }

      if (middleText) {
        const height = middleText.offsetHeight;
        if (height > maxMiddleHeight) {
          maxMiddleHeight = height;
        }
      }
    });

    // 第三步：过滤掉带有 data-top-text-space="hide"的元素，仅对可见元素设置高度
    const visibleTopItems = row.filter((item) => {
      const topText = item.querySelector('.featureitem-block-h');
      return topText && topText.getAttribute('data-top-text-space') !== 'hide';
    });

    if (visibleTopItems.length) {
      // 给每个可见的 .featureitem-block-h 设置相同的高度
      visibleTopItems.forEach((item) => {
        const topText = item.querySelector('.featureitem-block-h');
        if (topText) {
          topText.style.height = `${maxTopHeight}px`;
        }
      });
    }

    const visibleMiddleItems = row.filter((item) => item.querySelector('.featureitem-block-m'));

    if (visibleMiddleItems.length) {
      // 给每个可见的 .featureitem-block-m 设置相同的高度
      visibleMiddleItems.forEach((item) => {
        const middleText = item.querySelector('.featureitem-block-m');
        if (middleText) {
          middleText.style.height = `${maxMiddleHeight}px`;
        }
      });
    }
  });
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
  desktopAlignment: 'lg:justify-start',
  tabletAlignment: 'md:justify-start',
  mobileAlignment: 'sm:justify-start',
  motion: 'off',
  topTextToggle: 'show',
  bottomTextToggle: 'show',
  topTextD: FONTS[PRODUCT_LINE].topTextD,
  topTextT: FONTS[PRODUCT_LINE].topTextT,
  topTextM: FONTS[PRODUCT_LINE].topTextM,
  topTextWidth: 'auto',
  bottomTextD: FONTS[PRODUCT_LINE].bottomTextD,
  bottomTextT: FONTS[PRODUCT_LINE].bottomTextT,
  bottomTextM: FONTS[PRODUCT_LINE].bottomTextM,
  bottomTextWidth: 'auto',
  highlightTextD: FONTS[PRODUCT_LINE].highlightTextD,
  highlightTextT: FONTS[PRODUCT_LINE].highlightTextT,
  highlightTextM: FONTS[PRODUCT_LINE].highlightTextM,
  highlightTextWidth: 'auto',
};

// 模式一：没有图片  模式二：有图底下有小字  模式三：有图底下没有小字
const handleMode = async (wrapper) => {
  let mode = 1;
  const wrappers = Array.from(wrapper);

  try {
    const configs = await Promise.all(
      wrappers.map(async (wrap) => {
        if (wrap.children.length < 2) return null;
        return getBlockConfigs(wrap, DEFAULT_CONFIG, 'featureitem-block-item');
      }),
    );
    configs.some((itemConfig) => {
      if (!itemConfig) return;
      const v = getFieldValue(itemConfig);
      if (v('type') === 'icon' && v('iconSource')) {
        mode = 3;
        if (v('bottomTextRichtext')) {
          mode = 2;
          return true;
        }
      }
      return false;
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error handling mode:', error);
  }

  return mode;
};

// 3种模式的html结构
const handleHtml = (mode, c, v) => {
  const desktopAlignment = c('desktopAlignment') === 'lg:justify-start' ? 'lg:text-left' : 'lg:text-center';
  const tabletAlignment = c('tabletAlignment') === 'md:justify-start' ? 'md:text-left' : 'md:text-center';
  const mobileAlignment = c('mobileAlignment') === 'sm:justify-start' ? 'sm:text-left' : 'sm:text-center';
  const alignment = `${c('desktopAlignment')} ${c('tabletAlignment')} ${c('mobileAlignment')}`;
  const textAlignment = `${desktopAlignment} ${tabletAlignment} ${mobileAlignment}`;
  const topText = `${v('topTextD')} ${v('topTextT')} ${v('topTextM')}`;
  const topTextColor = v('topTextColor') ? `--featureitem-block-top-text-color: #${v('topTextColor')};` : '';
  const topTextWidth = `width: ${v('topTextWidth')};`;
  const highlightText = `${v('highlightTextD')} ${v('highlightTextT')} ${v('highlightTextM')}`;
  const highlightTextColor = v('highlightTextColor') ? `--featureitem-block-highlight-text-color: #${v('highlightTextColor')};` : '';
  const highlightTextWidth = `width: ${v('highlightTextWidth')};`;
  const bottomText = `${v('bottomTextD')} ${v('bottomTextT')} ${v('bottomTextM')}`;
  const bottomTextColor = v('bottomTextColor') ? `--featureitem-block-bottom-text-color: #${v('bottomTextColor')};` : '';
  const bottomTextWidth = `width: ${v('bottomTextWidth')};`;
  const bottomTextToggle = `${v('bottomTextToggle')}`;
  const iconWidthHeight = `${v('type') === 'icon' ? 'max-w-[168px] max-g-[136px]' : ''}`;
  if (mode === 1) {
    return `
      <div class="w-max- featureitem-block-h featureitem-block-top-text break-all flex flex-col justify-end" ${topText} ${textAlignment}" style="${topTextWidth} ${topTextColor}" data-top-text-space="${v('topTextToggle')}">
        ${v('topTextRichtext', 'html')}
      </div>
      <div class="break-all featureitem-block-highlight-text ${highlightText} ${textAlignment}" style="${highlightTextWidth} ${highlightTextColor}">
        ${v('highlightText', 'html')}
      </div>
      <div class="break-all featureitem-block-bottom-text-color ${bottomText} ${textAlignment}" style="${bottomTextWidth} ${bottomTextColor}" data-bottom-text-space="${bottomTextToggle}">
        ${v('bottomTextRichtext', 'html')}
      </div>
    `;
  }
  if (mode === 2) {
    return `
      <div class="featureitem-block-h flex flex-col justify-end" data-top-text-space="${v('type') === 'icon' ? '' : v('topTextToggle')}">
        <div class="break-all featureitem-block-top-text ${topText} ${textAlignment}" style="${topTextWidth} ${topTextColor}">
          ${v('type') === 'icon' ? '' : v('topTextRichtext', 'html')}
        </div>
        <div class="flex ${alignment}">
          <div class="break-all featureitem-block-highlight-text ${highlightText} ${textAlignment} ${iconWidthHeight}" style="${highlightTextWidth} ${highlightTextColor}">
            ${v('type') === 'icon' ? v('iconSource', 'html') : v('highlightText', 'html')}
          </div>
        </div>
      </div>
      <div class="break-all featureitem-block-bottom-text-color ${bottomText} ${textAlignment}" style="${bottomTextWidth} ${bottomTextColor}" data-bottom-text-space="${bottomTextToggle}">
        ${v('bottomTextRichtext', 'html')}
      </div>
    `;
  }
  if (mode === 3) {
    return `
      <div class="featureitem-block-h break-all featureitem-block-top-text ${topText} ${textAlignment}" style="${topTextWidth} ${topTextColor}" data-top-text-space="${v('type') === 'icon' ? '' : v('topTextToggle')}">
        ${v('type') === 'icon' ? '' : v('topTextRichtext', 'html')}
      </div>
      <div class="flex ${alignment}">
        <div class="featureitem-block-m break-all featureitem-block-highlight-text flex items-center ${highlightText} ${textAlignment} ${iconWidthHeight}" style="${highlightTextWidth} ${highlightTextColor}">
          ${v('type') === 'icon' ? v('iconSource', 'html') : v('highlightText', 'html')}
        </div>
      </div>
      <div class="break-all featureitem-block-bottom-text-color ${bottomText} ${textAlignment}" style="${bottomTextWidth} ${bottomTextColor}" data-bottom-text-space="${bottomTextToggle}">
        ${v('bottomTextRichtext', 'html')}
      </div>
    `;
  }
};

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, {}, 'featureitem-block');
    const c = getFieldValue(config);
    // console.log('config', config);
    if (c('motion') === 'on') {
      block.classList.add('g-block-animation');
      handleMotion(block.parentNode);
    }
    if (c('colorGroup')) {
      block.classList.add(c('colorGroup'));
    }

    // 在 block 外层套一层 div
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'featureitem-block-wrapper'; // 可自定义类名
    wrapperDiv.innerHTML = block.innerHTML; // 将 block 的内容复制到新 div 中
    block.innerHTML = ''; // 清空原 block 内容
    block.appendChild(wrapperDiv); // 将新 div 添加回 block
    wrapperDiv.classList.add('flex', 'flex-wrap', 'gap-[40px]', c('desktopAlignment'), c('tabletAlignment'), c('mobileAlignment'));

    const wrapper = wrapperDiv.querySelectorAll(':scope > div');
    const mode = await handleMode(wrapper);
    // console.log('mode', mode);

    Array.from(wrapper).forEach(async (wrap) => {
      try {
        if (wrap.children.length < 2) {
          wrap.remove();
          return;
        }
        const itemConfig = await getBlockConfigs(wrap, DEFAULT_CONFIG, 'featureitem-block-item');
        const v = getFieldValue(itemConfig);
        // console.log('itemConfig', itemConfig);
        wrap.classList.add('featureitem-block-item');
        wrap.innerHTML = handleHtml(mode, c, v);
        // console.log('wrap', wrap);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error decorating wrapper:', error);
      }
    });
    // console.log('block', block);

    // 确保在页面加载完成后执行
    if (document.readyState === 'complete') {
      setTimeout(() => {
        adjustTopTextHeights(block);
      }, 200);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          adjustTopTextHeights(block);
        }, 200);
      });
    }

    // 监听窗口大小变化并重新调整
    const update = debounce(() => adjustTopTextHeights(block), 200);
    window.addEventListener('resize', update);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating featureitem-block block:', error);
    block.innerHTML = '<div class="error-message">Failed to load featureitem-block block</div>';
  }
}
