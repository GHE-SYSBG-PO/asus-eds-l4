import {
  getBlockConfigs,
  getFieldValue,
  getBlockRepeatConfigs,
} from '../../scripts/utils.js';

// 统一高度，标题以最高为基准，设置其他容器的高度
const setUnifiedHeight = (block) => {
  const containers = block.querySelectorAll('.chart-advanced .title>h4');
  const parentContainers = block.querySelectorAll('.chart-advanced .title'); // 获取父容器

  // 获取容器内最高的高度
  let maxHeight = 0;
  containers.forEach((container) => {
    // 使用 scrollHeight 获取包含滚动内容在内的总高度
    const containerContentHeight = container.scrollHeight;
    if (containerContentHeight > maxHeight) {
      maxHeight = containerContentHeight;
    }
  });
  // console.log('最高容器内容的高度:', maxHeight);

  // 给所有 .title 容器设置最小高度
  const setMinHeight = () => {
    if (window.innerWidth >= 730) {
      parentContainers.forEach((parentContainer) => {
        parentContainer.style.minHeight = `${maxHeight}px`;
      });
    } else {
      // 屏幕宽度小于730时，移除所有 .title 的最小高度
      parentContainers.forEach((parentContainer) => {
        parentContainer.style.minHeight = '';
      });
    }
  };

  // 初始设置
  setMinHeight();

  // 节流函数
  function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return (...args) => {
      const currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            func.apply(this, args);
            lastExecTime = Date.now();
          },
          delay - (currentTime - lastExecTime),
        );
      }
    };
  }

  // 窗口大小改变时的处理函数
  const handleResize = () => {
    // 检查屏幕宽度是否大于等于730px
    if (window.innerWidth >= 730) {
      let newMaxHeight = 0;
      containers.forEach((container) => {
        const containerContentHeight = container.scrollHeight;
        if (containerContentHeight > newMaxHeight) {
          newMaxHeight = containerContentHeight;
        }
      });
      // console.log('窗口调整后最高容器内容的高度:', newMaxHeight);

      maxHeight = newMaxHeight;
      // 更新所有 .title 容器的最小高度
      parentContainers.forEach((parentContainer) => {
        parentContainer.style.minHeight = `${newMaxHeight}px`;
      });
    } else {
      // 屏幕宽度小于730时，移除所有 .title 的最小高度
      parentContainers.forEach((parentContainer) => {
        parentContainer.style.minHeight = '';
      });
    }
  };

  // 添加带节流的resize事件监听器
  window.addEventListener('resize', throttle(handleResize, 300));
};

// 默认值
const DEFAULT_CONFIG = {
  wrapLine: 'on',
  titleFont: 'tt-bd-28',
  infoFont: 'ro-rg-18-sh',
  lineWidth: '100%',
};

export default async function decorate(block) {
  const wrapper = block.querySelectorAll(':scope > div');
  // console.log('执行chart-advanced', block);
  let config = {};
  let v = '';
  let itemHtml = '';
  let lineColor = '';
  let titleFontColor = '';
  let infoFontColor = '';
  // 创建所有异步操作的 Promise 数组
  // 每个chat
  Array.from(wrapper).forEach(async (wrap) => {
    config = await getBlockConfigs(wrap, DEFAULT_CONFIG, 'chart-advanced-item');
    v = getFieldValue(config);
    console.log('执行chart-advanced-config', config);

    if (v('titleFontColor')) {
      titleFontColor = `--chart-advanced-title-color: #${v('titleFontColor')}`;
    }
    if (v('infoFontColor')) {
      infoFontColor = `--chart-advanced-info-color: #${v('infoFontColor')}`;
    }
    if (v('lineColor')) {
      lineColor = `--chart-advanced-line-bg-color: #${v('lineColor')}`;
    }
    console.log('wrap', wrap)
    // 获取有重复项的数组
    const [item = []] = getBlockRepeatConfigs(wrap);
    console.log('item', item)
    item.forEach((val) => {
      // console.log(val);
      try {
        itemHtml += `
          <div class="flex items-center gap-[20px]">
            <div class="w-[46px] h-[46px] flex items-center justify-center shrink-0">${val.iconAssets.html}</div>
            <span class="${v('infoFont')} chart-advanced-info" style="${infoFontColor}">${val.infoRichtext.text}</span> 
          </div>
        `;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', error);
      }
    });

    wrap.classList.add(`${v('chartColumnWidth') ? 'md:flex-none' : 'md:flex-1'}`, 'chat-column-width');
    wrap.style.setProperty('--chart-advanced-chat-column-width', `${v('chartColumnWidth')}%`);
    wrap.innerHTML = `
      <div class="title"><h4 class="break-all ${v('titleFont')} chart-advanced-title" style="${titleFontColor}">${v('titleRichtext', 'html')}</h4></div>
      <div class="h-[1px] mx-auto my-[16px] line-bg" style="width: ${v('lineWidth')}; ${lineColor}"></div>
      <div class="break-all flex ${v('wrapLine') === 'on' ? 'flex-wrap' : 'flex-col'} content-start items-start gap-[16px]">
        ${itemHtml}
      </div>
    `;
  });

  block.classList.add('flex', 'flex-col', 'md:flex-row', 'md:flex-nowrap', 'gap-[40px]', 'w-full', 'chart-advanced');
  setTimeout(() => {
    setUnifiedHeight(block);
  }, 500);
}
