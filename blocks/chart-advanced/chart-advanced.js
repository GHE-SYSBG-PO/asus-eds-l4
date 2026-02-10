import {
  getBlockConfigs,
  getFieldValue,
  getBlockRepeatConfigs,
} from '../../scripts/utils.js';

// 统一高度，标题以最高为基准，设置其他容器的高度
const setUnifiedHeight = (block) => {
  const containers = block.querySelectorAll('.new-chart-advanced h4');
  const parentContainers = block.querySelectorAll('.new-chart-advanced'); // 获取父容器

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

  // 给所有 .new-chart-advanced 容器设置最小高度
  const setMinHeight = () => {
    if (window.innerWidth >= 730) {
      parentContainers.forEach((parentContainer) => {
        parentContainer.style.minHeight = `${maxHeight}px`;
      });
    } else {
      // 屏幕宽度小于730时，移除所有 .new-chart-advanced 的最小高度
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
      // 更新所有 .new-chart-advanced 容器的最小高度
      parentContainers.forEach((parentContainer) => {
        parentContainer.style.minHeight = `${newMaxHeight}px`;
      });
    } else {
      // 屏幕宽度小于730时，移除所有 .new-chart-advanced 的最小高度
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
  // console.log('执行chart-advanced', wrapper);
  let config = {};
  // let v = '';
  let containerHtml = '';
  // 创建所有异步操作的 Promise 数组
  // 每个chat
  const promises = Array.from(wrapper).map(async (wrap) => {
    // 获取两个有重复项的数组
    const [item] = getBlockRepeatConfigs(wrap);
    // console.log(item);
    config = await getBlockConfigs(wrap, DEFAULT_CONFIG, 'chart-advanced-item');
    // v = getFieldValue(config);
    // console.log('执行chart-advanced-config', config);
    // return `
    //   <div class="md:flex-1"">
    //     <div class="new-chart-advanced bg-red-600"><h4 class="break-all">Media andEntertainmentMediaand Entertainment 55555555555555555555555555555555555</h4></div>
    //     <div class="h-[3px] bg-black w-full my-[10px]"></div>
    //     <div class="bg-green-300 break-all flex flex-col content-start items-start">
    //       <div class="flex items-center">
    //         <img class="mr-[10px] my-[10px]" style="width: 40px; height: 18px;" src="https://img1.baidu.com/it/u=593588352,2241402332&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=208" />
    //         <span>66666666666666</span> 
    //       </div>
    //       <div class="flex items-center">
    //         <img class="mr-[10px] my-[10px]" style="width: 40px; height: 18px;" src="https://img1.baidu.com/it/u=593588352,2241402332&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=208" />
    //         <span>wq</span> 
    //       </div>
    //       <div class="flex items-center">
    //         <img class="mr-[10px] my-[10px]" style="width: 40px; height: 18px;" src="https://img1.baidu.com/it/u=593588352,2241402332&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=208" />
    //         <span>wq</span> 
    //       </div>
    //       <div class="flex items-center">
    //         <img class="mr-[10px] my-[10px]" style="width: 40px; height: 18px;" src="https://img1.baidu.com/it/u=593588352,2241402332&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=208" />
    //         <span>wqjiwqoj</span> 
    //       </div>
    //       <div class="flex items-center">
    //         <img class="mr-[10px] my-[10px]" style="width: 40px; height: 18px;" src="https://img1.baidu.com/it/u=593588352,2241402332&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=208" />
    //         <span>wqjiwqoj</span> 
    //       </div>
    //     </div>
    //   </div>
    // `;
  });

  // // 等待所有异步操作完成
  // const htmlParts = await Promise.all(promises);
  // containerHtml = htmlParts.join('');

  // const wrap = `
  //   <div class="flex flex-col md:flex-row md:flex-nowrap gap-[20px] w-full">
  //     ${containerHtml}
  //   </div>
  // `;

  // block.innerHTML = wrap;
}
