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
};

export default async function decorate(block) {
  const wrapper = block.querySelectorAll(':scope > div');
  // console.log('执行chart-advanced', block);
  let config = {};
  let v = '';
  let containerHtml = '';
  let itemHtml = '';
  // // 创建所有异步操作的 Promise 数组
  // // 每个chat
  // const promises = Array.from(wrapper).map(async (wrap) => {
  //   // 获取有重复项的数组
  //   const [item = []] = getBlockRepeatConfigs(wrap);
  //   item.forEach((val) => {
  //     // console.log(val);
  //     try {
  //       itemHtml += `
  //         <div class="flex items-center gap-[20px]">
  //           <div class="w-[46px] h-[46px] flex items-center justify-center shrink-0">${val.iconAssets.html}</div>
  //           <span class="ro-rg-18 chart-advanced-info">${val.infoRichtext.text}</span> 
  //         </div>
  //       `;
  //     } catch (error) {
  //       // eslint-disable-next-line no-console
  //       console.error('Error:', error);
  //     }
  //   });
  //   config = await getBlockConfigs(wrap, DEFAULT_CONFIG, 'chart-advanced-item');
  //   v = getFieldValue(config);
  //   // console.log('执行chart-advanced-config', config);
  //   wrap.classList.add(`${v('chartColumnWidth') ? 'md:flex-none' : 'md:flex-1'}`, 'chat-column-width');
  //   wrap.style.setProperty('--chart-advanced-chat-column-width', `${v('chartColumnWidth')}%`);
  //   wrap.innerHTML = `
  //     <div class="title"><h4 class="break-all tt-bd-28 chart-advanced-title">${v('titleRichtext')}</h4></div>
  //     <div class="h-[1px] bg-[#181818] w-full my-[16px]"></div>
  //     <div class="bg-green-300 break-all flex flex-col content-start items-start gap-[16px]">
  //       ${itemHtml}
  //     </div>
  //   `;
  //   return wrap.outerHTML;
  // });

  // // 等待所有异步操作完成
  // const htmlParts = await Promise.all(promises);
  // containerHtml = htmlParts.join('');

  // block.classList.add('flex', 'flex-col', 'md:flex-row', 'md:flex-nowrap', 'gap-[40px]', 'w-full', 'chart-advanced')
  // block.innerHTML = containerHtml;
  // setTimeout(() => {
  //   setUnifiedHeight(block);
  // }, 500);
}
