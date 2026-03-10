import {
  getBlockConfigs,
  getFieldValue,
} from '../../scripts/utils.js';

// 初始化视频播放控制
// function initVideoControls() {
//   const videos = document.querySelectorAll('.featureksp-grid-item .media-video');
//   videos.forEach((video) => {
//     const playBtn = video.parentElement.querySelector('.play-btn');
//     const pauseBtn = video.parentElement.querySelector('.pause-btn');
//     const replayBtn = video.parentElement.querySelector('.replay-btn');

//     if (playBtn) {
//       playBtn.addEventListener('click', () => {
//         video.play();
//         playBtn.style.display = 'none';
//         pauseBtn.style.display = 'flex';
//       });
//     }

//     if (pauseBtn) {
//       pauseBtn.addEventListener('click', () => {
//         video.pause();
//         pauseBtn.style.display = 'none';
//         playBtn.style.display = 'flex';
//       });
//     }

//     if (replayBtn) {
//       replayBtn.addEventListener('click', () => {
//         video.currentTime = 0;
//         video.play();
//         replayBtn.style.display = 'none';
//         pauseBtn.style.display = 'flex';
//       });
//     }

//     video.addEventListener('ended', () => {
//       if (replayBtn) {
//         replayBtn.style.display = 'flex';
//         pauseBtn.style.display = 'none';
//       }
//     });
//   });
// }

// // 创建媒体内容
// function createMediaContent(gridItem, v) {
//   const mediaContainer = document.createElement('div');
//   mediaContainer.className = 'media-container';

//   // 应用媒体容器比例
//   if (v('mediaContainerRatio')) {
//     mediaContainer.style.aspectRatio = v('mediaContainerRatio');
//   }

//   if (v('mediaType') === 'image' && (v('mediaBgAssetD') || v('mediaBgAssetT') || v('mediaBgAssetM'))) {
//     // 处理图片
//     const img = document.createElement('img');
//     // 根据设备选择不同的图片
//     const isDesktop = window.innerWidth >= 1024;
//     const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

//     if (isDesktop && v('mediaBgAssetD')) {
//       img.src = v('mediaBgAssetD');
//     } else if (isTablet && v('mediaBgAssetT')) {
//       img.src = v('mediaBgAssetT');
//     } else if (v('mediaBgAssetM')) {
//       img.src = v('mediaBgAssetM');
//     }

//     img.alt = v('mediaImageAltText') || '';
//     img.className = 'media-image';
//     mediaContainer.appendChild(img);
//   } else if (v('mediaType') === 'video' && (v('mediaBgAssetD') || v('mediaBgAssetT') || v('mediaBgAssetM'))) {
//     // 处理视频
//     const video = document.createElement('video');
//     // 根据设备选择不同的视频
//     const isDesktop = window.innerWidth >= 1024;
//     const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

//     if (isDesktop && v('mediaBgAssetD')) {
//       video.src = v('mediaBgAssetD');
//     } else if (isTablet && v('mediaBgAssetT')) {
//       video.src = v('mediaBgAssetT');
//     } else if (v('mediaBgAssetM')) {
//       video.src = v('mediaBgAssetM');
//     }

//     video.alt = v('mediaImageAltText') || '';
//     video.className = 'media-video';

//     // 应用视频配置
//     if (v('mediaVideoAutoPlay') === 'true') {
//       video.autoplay = true;
//       video.muted = true;
//     }
//     if (v('mediaVideoloop') === 'true') {
//       video.loop = true;
//     }
//     if (v('mediaVideoPauseAndPlayBtn') === 'true') {
//       // 创建播放/暂停按钮
//       const controlsContainer = document.createElement('div');
//       controlsContainer.className = 'video-controls';

//       const playBtn = document.createElement('button');
//       playBtn.className = 'play-btn';
//       playBtn.innerHTML = '<svg viewBox="0 0 36 36" fill="currentColor"><path d="M8 5v14l11-7z" transform="translate(6,6)"></path></svg>';
//       controlsContainer.appendChild(playBtn);

//       const pauseBtn = document.createElement('button');
//       pauseBtn.className = 'pause-btn';
//       pauseBtn.innerHTML = '<svg viewBox="0 0 36 36" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" transform="translate(6,6)"/></svg>';
//       pauseBtn.style.display = 'none';
//       controlsContainer.appendChild(pauseBtn);

//       if (v('mediaVideoReplayBtn') === 'true' && v('mediaVideoloop') !== 'true') {
//         const replayBtn = document.createElement('button');
//         replayBtn.className = 'replay-btn';
//         replayBtn.innerHTML = '<svg viewBox="0 0 36 36" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="translate(6,6)"></path></svg>';
//         replayBtn.style.display = 'none';
//         controlsContainer.appendChild(replayBtn);
//       }

//       mediaContainer.appendChild(controlsContainer);
//     }

//     mediaContainer.appendChild(video);
//   }

//   // 应用垂直对齐
//   if (v('mediaVerticalAlignment')) {
//     mediaContainer.style.alignSelf = v('mediaVerticalAlignment');
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
//   // 应用背景图片
//   if (v('mediaBgAssetD') || v('mediaBgAssetT') || v('mediaBgAssetM')) {
//     const isDesktop = window.innerWidth >= 1024;
//     const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

//     if (isDesktop && v('mediaBgAssetD')) {
//       gridItem.style.backgroundImage = `url(${v('mediaBgAssetD')})`;
//     } else if (isTablet && v('mediaBgAssetT')) {
//       gridItem.style.backgroundImage = `url(${v('mediaBgAssetT')})`;
//     } else if (v('mediaBgAssetM')) {
//       gridItem.style.backgroundImage = `url(${v('mediaBgAssetM')})`;
//     }

//     gridItem.style.backgroundSize = 'cover';
//     gridItem.style.backgroundPosition = 'center';
//   }

//   // 添加文本内容
//   addTextContent(gridItem, v);
// }

const getRadiusStyle = (tl, tr, br, bl) => {
  // If none are configured, return empty (use CSS default)
  if (tl === '' && tr === '' && br === '' && bl === '') return '';
  const radiuses = [];
  if (tl !== '') radiuses.push(`border-top-left-radius:${tl}px`);
  if (tr !== '') radiuses.push(`border-top-right-radius:${tr}px`);
  if (br !== '') radiuses.push(`border-bottom-right-radius:${br}px`);
  if (bl !== '') radiuses.push(`border-bottom-left-radius:${bl}px`);
  if (radiuses.length === 4) {
    return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  }
  if (radiuses.length > 0) {
    return `${radiuses.join(';')};`;
  }
  return '';
};

// 添加文本内容
function addTextContent(block, v) {
  const alignmentClass = v('textAlignment') || 'text-left';
  let html = '';

  // // 应用文本宽度
  // if (v('textWidth')) {
  //   textContainer.style.width = v('textWidth');
  // } else {
  //   textContainer.style.width = '50%'; // 默认 50%
  // }

  // 添加顶部富文本
  if (v('textTopRichtext', 'html') && v('layoutStyle') !== 'icon') {
    html += `<div class="${alignmentClass}">${v('textTopRichtext', 'html')}</div>`;
  }

  // 添加标题富文本
  if (v('textTitleRichtext', 'html')) {
    html += `<div class="${alignmentClass}">${v('textTitleRichtext', 'html')}</div>`;
  }

  // 添加底部富文本
  if (v('textBottomRichtext', 'html')) {
    html += `<div class="${alignmentClass}">${v('textBottomRichtext', 'html')}</div>`;
  }

  // 使用 innerHTML 添加内容
  if (html) {
    block.innerHTML += `<div class="grid gap-[4px] md:gap-[8px]">${html}</div>`;
  }
}

// 处理文本区域位置
const handleLayoutVariant = (block, v) => {
  console.log('处理文本区域位置', block);
  if (v('layoutVariantD')) {
    block.classList.add(v('layoutVariantD'));
  }
  if (v('layoutVariantT')) {
    block.classList.add(v('layoutVariantT'));
  }
  if (v('layoutVariantM')) {
    block.classList.add(v('layoutVariantM'));
  }
};

// 处理媒体
const handleMedia = (block, v) => {
  if (v('mediaColumnSpanD')) {
    block.classList.add(v('mediaColumnSpanD'));
  }
  if (v('mediaColumnSpanT')) {
    block.classList.add(v('mediaColumnSpanT'));
  }
  handleLayoutVariant(block, v);
};
// 处理图标
const handleIcon = (block, v) => {
  if (v('iconColumnSpanD')) {
    block.classList.add(v('iconColumnSpanD'));
  }
  if (v('iconColumnSpanT')) {
    block.classList.add(v('iconColumnSpanT'));
  }
  handleLayoutVariant(block, v);
};
// 处理文字
const handleText = (block, v) => {
  if (v('textColumnSpanD')) {
    block.classList.add(v('textColumnSpanD'));
  }
  if (v('textColumnSpanT')) {
    block.classList.add(v('textColumnSpanT'));
  }
  block.classList.add('justify-center', 'items-center');
};

// 处理锚点
const handleAnchor = (block, v) => {
  console.log(block, v);
//   // 处理锚点
//   if (v('anchorVisibilityToggle') === 'true' && v('anchorSectionId')) {
//     const anchor = document.createElement('a');
//     anchor.href = `#${v('anchorSectionId')}`;
//     anchor.className = 'featureksp-grid-anchor';
//     anchor.setAttribute('aria-label', `Anchor to section ${v('anchorSectionId')}`);
//     gridItem.appendChild(anchor);
//   }
};

export default async function decorate(block) {
  try {
    // 获取网格容器配置
    const config = await getBlockConfigs(block, {}, 'featureksp-grid');
    const c = getFieldValue(config);
    // 添加初始class
    block.classList.add('grid', 'grid-cols-12', 'gap-[20px]', 'grid-flow-row-dense');

    // 添加颜色组类
    if (c('colorGroup')) {
      block.classList.add(c('colorGroup'));
    }

    // 获取每一项item
    const wrappers = block.querySelectorAll(':scope > div');
    let inlineStyle = '';
    Array.from(wrappers).forEach(async (wrap) => {
      try {
        if (wrap.children.length < 2) {
          wrap.remove();
          return;
        }
        // 每一项各自配置
        const itemConfig = await getBlockConfigs(wrap, {}, 'featureksp-grid-item');
        const v = getFieldValue(itemConfig);
        // 每一项的通用配置
        inlineStyle = '';
        // 添加初始class
        wrap.classList.add('featureksp-grid-item-block', 'p-[40px]');
        if (c('borderColor')) {
          inlineStyle += `--featureksp-grid-item-border-color: #${c('borderColor')};`;
        }
        if (c('borderWidth')) {
          inlineStyle += `--featureksp-grid-item-border-width: ${c('borderWidth')}px;`;
        }
        if (v('layoutBgColor')) {
          inlineStyle += `--featureksp-grid-item-bg-color: #${v('layoutBgColor')};`;
        }
        wrap.style.cssText += getRadiusStyle(c('radiusTL'), c('radiusTR'), c('radiusBR'), c('radiusBL'));
        wrap.style.cssText += inlineStyle;

        // inlineStyle = '';
        // 添加初始class
        wrap.classList.add('col-span-12', 'wrap-anywhere', 'col-span-12', 'flex');
        console.log('itemConfig', itemConfig);
        // 先清空
        wrap.innerHTML = '';
        // 选择样式
        const layoutStyle = v('layoutStyle');
        if (layoutStyle === 'media') {
          handleMedia(wrap, v);
        } else if (layoutStyle === 'icon') {
          handleIcon(wrap, v);
        } else if (layoutStyle === 'text') {
          handleText(wrap, v);
        }
        // 通用配置
        addTextContent(wrap, v);
        if (v('layoutRowSpanD')) {
          wrap.classList.add(v('layoutRowSpanD'));
        }
        // 处理锚点
        handleAnchor(wrap, v);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error decorating grid item:', error);
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating featureksp-grid block:', error);
    block.innerHTML = '<div class="error-message">Failed to load featureksp-grid block</div>';
  }
}

// // 页面加载完成后初始化
// if (typeof window !== 'undefined') {
//   window.addEventListener('DOMContentLoaded', initVideoControls);
// }
