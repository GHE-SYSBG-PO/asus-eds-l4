/* eslint-disable max-len */
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
function addTextContent(wrap, v) {
  const alignmentClass = v('textAlignment') || 'text-left';
  let html = '';

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
    wrap.innerHTML += `<div class="flex z-1 w-full">
      <div class="featureksp-grid-item-text-content" class="grid gap-[4px] md:gap-[8px]">${html}</div>
    </div>`;

    // 文本内容宽度
    if (v('layoutStyle') === 'media') {
      const textBlock = wrap.querySelector('.featureksp-grid-item-text-content');
      ['layoutVariantD', 'layoutVariantT', 'layoutVariantM'].forEach((item) => {
        if (['left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(v(item))) {
          if (item === 'layoutVariantD') {
            textBlock.style.setProperty('--featureksp-grid-item-text-content-width-lg', v('itemTextWidthD') || '50%');
          }
          if (item === 'layoutVariantT') {
            textBlock.style.setProperty('--featureksp-grid-item-text-content-width-md', v('itemTextWidthT') || '50%');
          }
          if (item === 'layoutVariantM') {
            textBlock.style.setProperty('--featureksp-grid-item-text-content-width-sm', v('itemTextWidthM') || '50%');
          }
        }
      });
    }
  }
}

// media布局表
const mediaLayoutVariant = {
  layoutVariantD: {
    left: 'lg:justify-start lg:items-center',
    right: 'lg:justify-end lg:items-center',
    center: 'lg:justify-center lg:items-center',
    top: 'lg:justify-center lg:items-start',
    bottom: 'lg:justify-center lg:items-end',
    topLeft: 'lg:justify-start lg:items-start',
    topRight: 'lg:justify-end lg:items-start',
    bottomLeft: 'lg:justify-start lg:items-end',
    bottomRight: 'lg:justify-end lg:items-end',
  },
  layoutVariantT: {
    left: 'md:justify-start md:items-center',
    right: 'md:justify-end md:items-center',
    center: 'md:justify-center md:items-center',
    top: 'md:justify-center md:items-start',
    bottom: 'md:justify-center md:items-end',
    topLeft: 'md:justify-start md:items-start',
    topRight: 'md:justify-end md:items-start',
    bottomLeft: 'md:justify-start md:items-end',
    bottomRight: 'md:justify-end md:items-end',
  },
  layoutVariantM: {
    left: 'justify-start items-center',
    right: 'justify-end items-center',
    center: 'justify-center items-center',
    top: 'justify-center items-start',
    bottom: 'justify-center items-end',
    topLeft: 'justify-start items-start',
    topRight: 'justify-end items-start',
    bottomLeft: 'justify-start items-end',
    bottomRight: 'justify-end items-end',
  },
};

// icon布局表
const iconLayoutVariant = {
  layoutVariantD: {
    right: 'lg:justify-start lg:items-center lg:flex-row',
    top: 'lg:justify-start lg:items-center lg:flex-col-reverse',
    bottom: 'lg:justify-start lg:items-center lg:flex-col',
  },
  layoutVariantT: {
    right: 'md:justify-start md:items-center md:flex-row',
    top: 'md:justify-start md:items-center md:flex-col-reverse',
    bottom: 'md:justify-start md:items-center md:flex-col',
  },
  layoutVariantM: {
    right: 'justify-start items-center flex-row',
    top: 'justify-start items-center flex-col-reverse',
    bottom: 'justify-start items-center flex-col',
  },
};

// 处理文本区域位置
const handleLayoutVariant = (wrap, v, layoutVariant) => {
  ['layoutVariantD', 'layoutVariantT', 'layoutVariantM'].forEach((key) => {
    const val = v(key);
    if (val) {
      wrap.classList.add(...layoutVariant[key][val].split(' '));
    }
  });
};

// 处理背景图片
const handleBgAsset = (wrap, v) => {
  if (['icon', 'text'].includes(v('layoutStyle')) || (v('layoutStyle') === 'media' && v('mediaType') === 'image')) {
    const config = {
      bgAssetD: 'featureksp-grid-item-bg-asset-lg hidden',
      bgAssetT: 'featureksp-grid-item-bg-asset-md hidden',
      bgAssetM: 'featureksp-grid-item-bg-asset-sm hidden',
    };
    Object.entries(config).forEach(([key, classes]) => {
      if (v(key, 'html')) {
        wrap.innerHTML += `<div class="absolute z-0 ${classes}">${v(key, 'html')}</div>`;
      }
    });
    // 图片高度100%
    wrap.querySelectorAll('img').forEach((img) => {
      img.classList.add('h-full');
    });
    if (v('layoutStyle') === 'media' && v('mediaType') === 'image') {
      const altText = v('mediaImageAltText');
      if (altText) {
        const imgs = wrap.querySelectorAll('img');
        imgs.forEach((img) => {
          img.setAttribute('alt', altText);
        });
      }
      const containerRatio = v('mediaContainerRatio');
      if (containerRatio) {
        const imgs = wrap.querySelectorAll('img');
        imgs.forEach((img) => {
          img.style.aspectRatio = containerRatio;
        });
      }
    }
  }
};

// 处理媒体
const handleMedia = (wrap, v) => {
  ['mediaColumnSpanD', 'mediaColumnSpanT'].forEach((key) => {
    const classes = v(key);
    if (classes) {
      wrap.classList.add(classes);
    }
  });
  wrap.classList.add('justify-center', 'items-center');
  const textBlock = wrap.querySelector('.featureksp-grid-item-text-content');
  const textBlockParent = textBlock.parentElement;
  handleLayoutVariant(textBlockParent, v, mediaLayoutVariant);
};
// 处理图标
const handleIcon = (wrap, v) => {
  ['iconColumnSpanD', 'iconColumnSpanT'].forEach((key) => {
    const classes = v(key);
    if (classes) {
      wrap.classList.add(classes);
    }
  });
  wrap.classList.add('justify-center', 'items-center');
  try {
    const textBlock = wrap.querySelector('.featureksp-grid-item-text-content');
    const textBlockParent = textBlock.parentElement;
    textBlockParent.classList.add('gap-[28px]');
    if (v('iconAsset', 'html')) {
      const temp = textBlockParent.innerHTML;
      textBlockParent.innerHTML = `<div class="w-[80px] h-[80px] shrink-0 flex justify-center items-center">${v('iconAsset', 'html')}</div>${temp}`;
    }
    ['layoutVariantD', 'layoutVariantT', 'layoutVariantM'].forEach((key) => {
      const val = v(key);
      // 只有右上下
      if (['right', 'top', 'bottom'].includes(val)) {
        handleLayoutVariant(textBlockParent, v, iconLayoutVariant);
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error:', error);
  }
};
// 处理文字
const handleText = (wrap, v) => {
  ['textColumnSpanD', 'textColumnSpanT'].forEach((key) => {
    const classes = v(key);
    if (classes) {
      wrap.classList.add(classes);
    }
  });
  wrap.classList.add('justify-center', 'items-center');
};

// 处理锚点
const handleAnchor = (wrap, v) => {
  if (v('anchorVisibilityToggle') === 'true') {
    if (v('layoutStyle') === 'icon') {
      if (['bottom', 'right', 'bottomRight'].includes(v('layoutVariantD'))) {
        wrap.classList.add('lg:pb-[80px]');
      }
      if (['bottom', 'right', 'bottomRight'].includes(v('layoutVariantT'))) {
        wrap.classList.add('md:pb-[80px]');
      }
      if (['bottom', 'right', 'bottomRight'].includes(v('layoutVariantM'))) {
        wrap.classList.add('pb-[80px]');
      }
    }
    // 处理锚点
    const anchor = document.createElement('a');
    anchor.href = v('anchorSectionId') ? `#${v('anchorSectionId')}` : '#';
    anchor.setAttribute('aria-label', `Anchor to section ${v('anchorSectionId')}`);
    anchor.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="17" fill="white" fill-opacity="0.8" stroke="#2F2F2F" stroke-width="2"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M25.2731 13.9609C25.7752 14.463 25.7752 15.2771 25.2731 15.7792L18.9091 22.1432C18.407 22.6453 17.593 22.6453 17.0909 22.1432L10.7269 15.7792C10.2248 15.2771 10.2248 14.463 10.7269 13.9609C11.229 13.4588 12.0431 13.4588 12.5452 13.9609L18 19.4158L23.4548 13.9609C23.9569 13.4588 24.771 13.4588 25.2731 13.9609Z" fill="#2F2F2F"/>
      </svg>
    `;
    anchor.classList.add('absolute', 'right-[20px]', 'bottom-[20px]', 'z-9');
    wrap.appendChild(anchor);
  }
};

// DEFAULT
const DEFAULT_CONFIG = {
  anchorVisibilityToggle: 'true',
  anchorStyle: 'svg',
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
        const itemConfig = await getBlockConfigs(wrap, DEFAULT_CONFIG, 'featureksp-grid-item');
        const v = getFieldValue(itemConfig);
        // 每一项的通用配置
        inlineStyle = '';
        // 添加初始class
        wrap.classList.add('featureksp-grid-item-block', 'overflow-clip', 'p-[40px]');
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
        wrap.classList.add('col-span-12', 'wrap-anywhere', 'col-span-12', 'flex', 'relative');
        console.log('itemConfig', itemConfig);
        // 先清空
        wrap.innerHTML = '';
        // 通用配置
        handleBgAsset(wrap, v);
        addTextContent(wrap, v);
        if (v('layoutRowSpanD')) {
          wrap.classList.add(v('layoutRowSpanD'));
        }
        // 处理锚点
        handleAnchor(wrap, v);
        // 选择样式
        const layoutStyle = v('layoutStyle');
        if (layoutStyle === 'media') {
          handleMedia(wrap, v);
        } else if (layoutStyle === 'icon') {
          handleIcon(wrap, v);
        } else if (layoutStyle === 'text') {
          handleText(wrap, v);
        }
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
