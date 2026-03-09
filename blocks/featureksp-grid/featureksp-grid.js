// import {
//   getBlockConfigs,
//   getFieldValue,
// } from '../../scripts/utils.js';

// // 初始化视频播放控制
// function initVideoControls() {
//   const videos = document.querySelectorAll('.featureksp-grid-item .media-video');
//   videos.forEach(() => {
//     // 可以在这里添加自定义视频控制逻辑
//   });
// }

// // 设置统一高度
// function setUnifiedHeight(grid) {
//   const gridItems = grid.querySelectorAll('.featureksp-grid-item');
//   let maxHeight = 0;

//   // 计算最大高度
//   gridItems.forEach((item) => {
//     const height = item.offsetHeight;
//     if (height > maxHeight) {
//       maxHeight = height;
//     }
//   });

//   // 应用最大高度
//   gridItems.forEach((item) => {
//     item.style.minHeight = `${maxHeight}px`;
//   });
// }

// // 添加文本内容
// function addTextContent(gridItem, v) {
//   const textContainer = document.createElement('div');
//   textContainer.className = 'text-container';

//   // 应用文本宽度
//   if (v('textWidth')) {
//     textContainer.style.width = v('textWidth');
//   }

//   // 添加顶部富文本
//   if (v('topRichtext', 'html')) {
//     const topText = document.createElement('div');
//     topText.className = 'top-richtext';
//     topText.innerHTML = v('topRichtext', 'html');
//     textContainer.appendChild(topText);
//   }

//   // 添加标题富文本
//   if (v('titleRichtext', 'html')) {
//     const titleText = document.createElement('div');
//     titleText.className = 'title-richtext';
//     titleText.innerHTML = v('titleRichtext', 'html');
//     textContainer.appendChild(titleText);
//   }

//   // 添加底部富文本
//   if (v('bottomRichtext', 'html')) {
//     const bottomText = document.createElement('div');
//     bottomText.className = 'bottom-richtext';
//     bottomText.innerHTML = v('bottomRichtext', 'html');
//     textContainer.appendChild(bottomText);
//   }

//   if (textContainer.children.length > 0) {
//     gridItem.appendChild(textContainer);
//   }
// }

// // 创建媒体内容
// function createMediaContent(gridItem, v) {
//   const mediaContainer = document.createElement('div');
//   mediaContainer.className = 'media-container';

//   // 应用媒体容器比例
//   if (v('mediaContainerRatio')) {
//     mediaContainer.style.aspectRatio = v('mediaContainerRatio');
//   }

//   if (v('mediaType') === 'image' && v('image')) {
//     // 处理图片
//     const img = document.createElement('img');
//     img.src = v('image');
//     img.alt = v('imageAltText') || '';
//     img.className = 'media-image';
//     mediaContainer.appendChild(img);
//   } else if (v('mediaType') === 'video' && v('video')) {
//     // 处理视频
//     const video = document.createElement('video');
//     video.src = v('video');
//     video.alt = v('videoAltText') || '';
//     video.className = 'media-video';

//     // 应用视频配置
//     if (v('autoPlay') === 'on') {
//       video.autoplay = true;
//     }
//     if (v('loop') === 'on') {
//       video.loop = true;
//     }
//     if (v('pausePlayBtn') === 'show') {
//       video.controls = true;
//     }

//     mediaContainer.appendChild(video);
//   }

//   // 应用垂直对齐
//   if (v('verticalAlignment')) {
//     mediaContainer.style.alignSelf = v('verticalAlignment');
//   }

//   gridItem.appendChild(mediaContainer);

//   // 添加文本内容
//   addTextContent(gridItem, v);
// }

// // 创建图标内容
// function createIconContent(gridItem, v) {
//   if (v('iconAsset')) {
//     const iconContainer = document.createElement('div');
//     iconContainer.className = 'icon-container';

//     const img = document.createElement('img');
//     img.src = v('iconAsset');
//     img.alt = '';
//     img.className = 'icon-image';

//     iconContainer.appendChild(img);
//     gridItem.appendChild(iconContainer);
//   }

//   // 添加文本内容
//   addTextContent(gridItem, v);
// }

// // 创建文本内容
// function createTextContent(gridItem, v) {
//   addTextContent(gridItem, v);
// }

// // 创建网格项
// function createGridItem(itemConfig) {
//   const v = getFieldValue(itemConfig);
//   const gridItem = document.createElement('div');
//   gridItem.className = 'featureksp-grid-item';

//   // 应用列跨度
//   if (v('columnSpan')) {
//     gridItem.style.gridColumn = `span ${v('columnSpan')}`;
//   }

//   // 应用行跨度
//   if (v('rowSpan')) {
//     gridItem.style.gridRow = `span ${v('rowSpan')}`;
//   }

//   // 应用背景颜色
//   if (v('bgColor')) {
//     gridItem.style.backgroundColor = v('bgColor');
//   }

//   // 应用背景资产
//   if (v('bgAsset')) {
//     gridItem.style.backgroundImage = `url(${v('bgAsset')})`;
//     gridItem.style.backgroundSize = 'cover';
//     gridItem.style.backgroundPosition = 'center';
//   }

//   // 应用对齐方式
//   if (v('alignment')) {
//     gridItem.style.textAlign = v('alignment');
//   }

//   // 应用布局变体
//   if (v('layoutVariant')) {
//     // 将驼峰命名转换为 kebab-case
//     const kebabCaseVariant = v('layoutVariant').replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
//     gridItem.classList.add(`layout-${kebabCaseVariant}`);
//   }

//   // 应用样式类型
//   if (v('itemlayoutStyle')) {
//     gridItem.classList.add(`style-${v('itemlayoutStyle')}`);
//   }

//   // 处理不同类型的内容
//   switch (v('itemlayoutStyle')) {
//     case 'media':
//       createMediaContent(gridItem, v);
//       break;
//     case 'icon':
//       createIconContent(gridItem, v);
//       break;
//     case 'text':
//       createTextContent(gridItem, v);
//       break;
//     default:
//       createTextContent(gridItem, v);
//   }

//   // 处理锚点
//   if (v('visibilityToggle') === 'show' && v('sectionId')) {
//     const anchor = document.createElement('a');
//     anchor.href = `#${v('sectionId')}`;
//     anchor.className = 'featureksp-grid-anchor';
//     anchor.setAttribute('aria-label', `Anchor to section ${v('sectionId')}`);
//     gridItem.appendChild(anchor);
//   }

//   return gridItem;
// }

// export default async function decorate(block) {
//   try {
//     // 获取网格容器配置
//     const config = await getBlockConfigs(block, {}, 'featureksp-grid');
//     const c = getFieldValue(config);

//     // 添加颜色组类
//     if (c('colorGroup')) {
//       block.classList.add(c('colorGroup'));
//     }

//     // 添加基础类
//     block.classList.add('featureksp-grid-block');

//     // 创建网格容器
//     const grid = document.createElement('div');
//     grid.className = 'featureksp-grid';

//     // 应用边框样式
//     if (c('borderColor') || c('borderWidth')) {
//       grid.style.borderColor = c('borderColor') || '';
//       grid.style.borderWidth = c('borderWidth') || '';
//       grid.style.borderStyle = 'solid';
//     }

//     // 应用边框半径
//     if (c('radiusTL') || c('radiusTR') || c('radiusBR') || c('radiusBL')) {
//       grid.style.borderRadius = `${c('radiusTL') || 0} ${c('radiusTR') || 0} ${c('radiusBR') || 0} ${c('radiusBL') || 0}`;
//     }

//     // 获取所有包装器
//     const wrappers = block.querySelectorAll(':scope > div');

//     // 移除配置项的 div
//     if (wrappers.length) {
//       wrappers[0].remove();
//     }

//     // 处理每个包装器
//     const gridItems = [];
//     Array.from(wrappers).forEach(async (wrap) => {
//       try {
//         const itemConfig = await getBlockConfigs(wrap, {}, 'featureksp-grid-item');
//         const gridItem = createGridItem(itemConfig);
//         if (gridItem) {
//           gridItems.push(gridItem);
//           grid.appendChild(gridItem);
//         }
//       } catch (error) {
//         // eslint-disable-next-line no-console
//         console.error('Error decorating grid item:', error);
//       }
//     });

//     // 替换原始内容
//     block.innerHTML = '';
//     block.appendChild(grid);

//     // 设置统一高度
//     setTimeout(() => {
//       setUnifiedHeight(grid);
//     }, 500);
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.error('Error decorating featureksp-grid block:', error);
//     block.innerHTML = '<div class="error-message">Failed to load featureksp-grid block</div>';
//   }
// }

// // 页面加载完成后初始化
// if (typeof window !== 'undefined') {
//   window.addEventListener('DOMContentLoaded', initVideoControls);
// }
