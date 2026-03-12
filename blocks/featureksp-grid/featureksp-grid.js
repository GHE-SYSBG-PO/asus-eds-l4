/* eslint-disable max-len */
import {
  getBlockConfigs,
  getFieldValue,
  isAuthorUe,
  getProductLine,
} from '../../scripts/utils.js';

const FONTS = {
  asus: {
    topTextStyleFontD: 'ro-rg-20-sh-lg',
    topTextStyleFontT: 'ro-rg-18-sh-md',
    topTextStyleFontM: 'ro-rg-16-sh-sm',
    titleTextStyleFontD: 'tt-bd-40-lg',
    titleTextStyleFontT: 'tt-bd-32-md',
    titleTextStyleFontM: 'tt-bd-28-sm',
    bottomTextStyleFontD: 'ro-rg-20-sh-lg',
    bottomTextStyleFontT: 'ro-rg-18-sh-md',
    bottomTextStyleFontM: 'ro-rg-16-sh-sm',
  },
  proart: {
    topTextStyleFontD: 'ro-rg-20-sh-lg',
    topTextStyleFontT: 'ro-rg-18-sh-md',
    topTextStyleFontM: 'ro-rg-16-sh-sm',
    titleTextStyleFontD: 'tt-bd-40-lg',
    titleTextStyleFontT: 'tt-bd-32-md',
    titleTextStyleFontM: 'tt-bd-28-sm',
    bottomTextStyleFontD: 'ro-rg-20-sh-lg',
    bottomTextStyleFontT: 'ro-rg-18-sh-md',
    bottomTextStyleFontM: 'ro-rg-16-sh-sm',
  },
  rog: {
    topTextStyleFontD: 'rc-rg-20-lg',
    topTextStyleFontT: 'rc-rg-18-md',
    topTextStyleFontM: 'rc-rg-16-sm',
    titleTextStyleFontD: 'tg-bd-40-lg',
    titleTextStyleFontT: 'tg-bd-32-md',
    titleTextStyleFontM: 'tg-bd-28-sm',
    bottomTextStyleFontD: 'rc-rg-20-lg',
    bottomTextStyleFontT: 'rc-rg-18-md',
    bottomTextStyleFontM: 'rc-rg-16-sm',
  },
  tuf: {
    topTextStyleFontD: 'ro-rg-20-sh-lg',
    topTextStyleFontT: 'ro-rg-18-sh-md',
    topTextStyleFontM: 'ro-rg-16-sh-sm',
    titleTextStyleFontD: 'dp-cb-40-lg',
    titleTextStyleFontT: 'dp-cb-32-md',
    titleTextStyleFontM: 'dp-cb-28-sm',
    bottomTextStyleFontD: 'ro-rg-20-sh-lg',
    bottomTextStyleFontT: 'ro-rg-18-sh-md',
    bottomTextStyleFontM: 'ro-rg-16-sh-sm',
  },
};

const PRODUCT_LINE = getProductLine();
// DEFAULT
const DEFAULT_CONFIG = {
  anchorVisibilityToggle: 'true',
  anchorStyle: 'svg',
  topTextStyleFontD: FONTS[PRODUCT_LINE].topTextStyleFontD,
  topTextStyleFontT: FONTS[PRODUCT_LINE].topTextStyleFontT,
  topTextStyleFontM: FONTS[PRODUCT_LINE].topTextStyleFontM,
  titleTextStyleFontD: FONTS[PRODUCT_LINE].titleTextStyleFontD,
  titleTextStyleFontT: FONTS[PRODUCT_LINE].titleTextStyleFontT,
  titleTextStyleFontM: FONTS[PRODUCT_LINE].titleTextStyleFontM,
  bottomTextStyleFontD: FONTS[PRODUCT_LINE].bottomTextStyleFontD,
  bottomTextStyleFontT: FONTS[PRODUCT_LINE].bottomTextStyleFontT,
  bottomTextStyleFontM: FONTS[PRODUCT_LINE].bottomTextStyleFontM,
};

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

function prefixHex(colors) {
  if (colors === null || colors === undefined || colors === '') return '';

  if (Array.isArray(colors)) {
    return colors.map((c) => prefixHex(c)).filter((c) => c);
  }

  const c = String(colors).trim();
  if (!c) return '';
  if (c.startsWith('#')) return c;
  return `#${c}`;
}

// 添加文本内容
function addTextContent(wrap, v) {
  const alignmentClass = v('textAlignment') || 'text-left';
  let html = '';

  // 添加顶部富文本
  if (v('textTopRichtext', 'html') && v('layoutStyle') !== 'icon') {
    const fontD = v('topTextStyleFontD');
    const fontT = v('topTextStyleFontT');
    const fontM = v('topTextStyleFontM');
    const color = prefixHex(v('topTextStyleFontColor'));
    // 使用新变量或直接设置颜色
    const colorStyle = color ? `style="--featureksp-grid-text-color: ${color};"` : '';
    html += `<div class="${alignmentClass} ${fontD} ${fontT} ${fontM} featureksp-grid-item-text-top" ${colorStyle}>${v('textTopRichtext', 'html')}</div>`;
  }

  // 添加标题富文本
  if (v('textTitleRichtext', 'html')) {
    const fontD = v('titleTextStyleFontD');
    const fontT = v('titleTextStyleFontT');
    const fontM = v('titleTextStyleFontM');
    const color = prefixHex(v('titleTextStyleFontColor'));
    const colorStyle = color ? `style="--featureksp-grid-text-color: ${color};"` : '';
    html += `<div class="${alignmentClass} ${fontD} ${fontT} ${fontM} featureksp-grid-item-text-title" ${colorStyle}>${v('textTitleRichtext', 'html')}</div>`;
  }

  // 添加底部富文本
  if (v('textBottomRichtext', 'html')) {
    const fontD = v('bottomTextStyleFontD');
    const fontT = v('bottomTextStyleFontT');
    const fontM = v('bottomTextStyleFontM');
    const color = prefixHex(v('bottomTextStyleFontColor'));
    const colorStyle = color ? `style="--featureksp-grid-text-color: ${color};"` : '';
    html += `<div class="${alignmentClass} ${fontD} ${fontT} ${fontM} featureksp-grid-item-text-bottom" ${colorStyle}>${v('textBottomRichtext', 'html')}</div>`;
  }

  // 使用 innerHTML 添加内容
  if (html) {
    wrap.innerHTML += `<div class="flex z-3 w-full">
      <div class="featureksp-grid-item-text-content grid gap-[4px] md:gap-[8px]">${html}</div>
    </div>`;

    // 文本内容宽度
    if (v('layoutStyle') === 'media') {
      const textBlock = wrap.querySelector('.featureksp-grid-item-text-content');
      ['layoutVariantD', 'layoutVariantT', 'layoutVariantM'].forEach((item) => {
        if (['left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(v(item))) {
          if (item === 'layoutVariantD') {
            textBlock.style.setProperty('--featureksp-grid-text-content-width-lg', v('itemTextWidthD') || '50%');
          }
          if (item === 'layoutVariantT') {
            textBlock.style.setProperty('--featureksp-grid-text-content-width-md', v('itemTextWidthT') || '50%');
          }
          if (item === 'layoutVariantM') {
            textBlock.style.setProperty('--featureksp-grid-text-content-width-sm', v('itemTextWidthM') || '50%');
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

/**
 * Generate video control button position style
 */
const getButtonPositionClass = (position) => {
  const positionMap = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };
  return positionMap[position] || 'bottom-4 right-4';
};

/**
 * Get current device
 */
const getDevice = () => {
  const isTablet = window.innerWidth >= 731 && window.innerWidth < 1279.5;
  const isDesktop = window.innerWidth >= 1280;
  return isTablet ? 'T' : (isDesktop ? 'D' : 'M');
};

/**
 * Get configuration for the current device
 */
const getDeviceConfig = (device, v) => {
  if (device === 'D') {
    return {
      assets: v('bgAssetD', 'text') || '',
    };
  } if (device === 'T') {
    return {
      assets: v('bgAssetT', 'text') || v('bgAssetD', 'text') || '',
    };
  }
  // Mobile
  return {
    assets: v('bgAssetM', 'text') || v('bgAssetT', 'text') || v('bgAssetD', 'text') || '',
  };
};

// 处理视频
const handleVideo = (wrap, v) => {
  const mediaVideoAutoPlay = v('mediaVideoAutoPlay') === 'true';
  const mediaVideoloop = v('mediaVideoloop') === 'true';
  const mediaVideoPauseAndPlayBtn = v('mediaVideoPauseAndPlayBtn') === 'true';
  const mediaVideoPauseAndPlayBtnPosition = getButtonPositionClass(v('mediaVideoPauseAndPlayBtnPosition'));

  const configD = getDeviceConfig('D', v);
  const configT = getDeviceConfig('T', v);
  const configM = getDeviceConfig('M', v);
  // Create video element
  const createVideoElement = (defaultConfig) => {
    const { assets: defaultAssets } = defaultConfig;
    if (!defaultAssets) return '';

    // Determine initial button display state
    const initialPlayBtnDisplay = mediaVideoAutoPlay ? 'none' : 'flex';
    const initialPauseBtnDisplay = mediaVideoAutoPlay ? 'flex' : 'none';

    // Build control buttons
    let controlButtons = '';
    controlButtons = `
        <div class="featureksp-grid-controls absolute top-[20px] right-[20px] ${mediaVideoPauseAndPlayBtnPosition} z-10">
          <button
            class="featureksp-grid-play-btn rounded-full flex items-center justify-center transition-all"
            style="display: ${initialPlayBtnDisplay};  border: 1px solid #ffffff;"
          >
            <svg viewBox="0 0 36 36" fill="#ffffff" >
              <path d="M8 5v14l11-7z" transform="translate(6,6)"></path>
            </svg>
          </button>
          <button
            class="featureksp-grid-pause-btn rounded-full flex items-center justify-center transition-all"
            style="display: ${initialPauseBtnDisplay};  border: 1px solid #ffffff;"
          >
            <svg viewBox="0 0 36 36" fill="#ffffff">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" transform="translate(6,6)"/>
            </svg>
          </button>
        </div>
        ${!mediaVideoloop ? `<div class="featureksp-grid-controls absolute ${mediaVideoPauseAndPlayBtnPosition} z-10">
            <button
          class="featureksp-grid-replay-btn  rounded-full flex items-center justify-center transition-all"
          style="display: ${initialPauseBtnDisplay};  border: 1px solid #ffffff;display:none"
        >
          <svg viewBox="0 0 36 36" fill="#ffffff">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="translate(6,6)"/>
          </svg>
        </button>
        </div>` : ''}
    `;

    let videoAttrs = '';
    if (mediaVideoAutoPlay) {
      videoAttrs += 'autoplay muted ';
    }
    if (mediaVideoloop) {
      videoAttrs += 'loop ';
    }

    // eslint-disable-next-line no-nested-ternary
    const curDevice = window.innerWidth >= 1280 ? 'D' : ((window.innerWidth >= 731 && window.innerWidth < 1279.5) ? 'T' : 'M');
    const mediaContainerRatio = v('mediaContainerRatio') ? `aspect-ratio: ${v('mediaContainerRatio')};` : '';

    return `
      <div class="featureksp-grid-container device-${curDevice}" style="overflow-hidden; ${mediaContainerRatio}">
        <video
          data-src-m="${configM.assets || ''}"
          data-src-t="${configT.assets || ''}"
          data-src-d="${configD.assets || ''}"
          data-object-position-m="center"
          data-object-position-t="center"
          data-object-position-d="center"
          src="${defaultAssets}"
          class="w-full h-auto object-cover"
          style="object-position: center;"
          ${videoAttrs}
          playsinline
        ></video>
      </div>
      ${controlButtons}
    `;
  };

  // Render content based on media type
  let mediaContent = '';
  // Video: create a single video element, switch source dynamically via JS
  const device = getDevice();
  if (device === 'D') {
    mediaContent = createVideoElement(configD);
  } else if (device === 'T') {
    mediaContent = createVideoElement(configT);
  } else {
    mediaContent = createVideoElement(configM);
  }

  wrap.innerHTML += `${mediaContent}`;

  // Add video control logic and responsive source switching
  setTimeout(() => {
    const videoElement = wrap.querySelector('video');
    const container = wrap;
    if (!container) {
      return false;
    }
    const existingControlsDiv = container.querySelector('.featureksp-grid-controls');
    if (!videoElement || !container) return;

    // Disable native controls
    videoElement.removeAttribute('controls');
    videoElement.controls = false;

    const playBtn = container.querySelector('.featureksp-grid-play-btn');
    const pauseBtn = container.querySelector('.featureksp-grid-pause-btn');
    const controlsDiv = container.querySelector('.featureksp-grid-controls');
    const replayBtnElement = container.querySelector('.featureksp-grid-replay-btn');

    // Button event binding
    const bindButtonEvents = (playBtnEl, pauseBtnEl) => {
      if (playBtnEl) {
        playBtnEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          videoElement.play();
        });
      }

      if (pauseBtnEl) {
        pauseBtnEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          videoElement.pause();
        });
      }
    };

    // If initial buttons exist, bind events directly
    if (playBtn && pauseBtn) {
      bindButtonEvents(playBtn, pauseBtn);
    }

    // Play/pause event listeners (unified control for button show/hide)
    const handlePlay = () => {
      const currentPlayBtn = container.querySelector('.featureksp-grid-play-btn');
      const currentPauseBtn = container.querySelector('.featureksp-grid-pause-btn');
      if (currentPlayBtn) currentPlayBtn.style.display = 'none';
      if (currentPauseBtn) currentPauseBtn.style.display = 'flex';
      if (replayBtnElement) replayBtnElement.style.display = 'none';
      const { duration } = videoElement;
      if (mediaVideoPauseAndPlayBtn === true || (mediaVideoPauseAndPlayBtn === false && duration > 5)) {
        existingControlsDiv.style.display = 'block';
      }
    };

    const handlePause = () => {
      const currentPlayBtn = container.querySelector('.featureksp-grid-play-btn');
      const currentPauseBtn = container.querySelector('.featureksp-grid-pause-btn');
      if (currentPlayBtn) currentPlayBtn.style.display = 'flex';
      if (currentPauseBtn) currentPauseBtn.style.display = 'none';
    };

    // Bind video event listeners
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    // Replay button event binding
    if (replayBtnElement) {
      replayBtnElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        videoElement.currentTime = 0;
        videoElement.play();
      });
    }

    // Responsive video source switching function
    const updateVideoSource = () => {
      const isTablet = window.innerWidth >= 731 && window.innerWidth < 1279.5;
      const isDesktop = window.innerWidth >= 1280;

      const srcD = videoElement.getAttribute('data-src-d');
      const srcT = videoElement.getAttribute('data-src-t');
      const srcM = videoElement.getAttribute('data-src-m');
      const posD = videoElement.getAttribute('data-object-position-d');
      const posT = videoElement.getAttribute('data-object-position-t');
      const posM = videoElement.getAttribute('data-object-position-m');

      let newSrc = '';
      let newObjectPosition = '';

      if (isDesktop) {
        if (srcD) newSrc = srcD;
        if (posD) newObjectPosition = posD;
      } else if (isTablet) {
        if (srcT) newSrc = srcT;
        if (posT) newObjectPosition = posT;
      } else {
        if (srcM) newSrc = srcM;
        if (posM) newObjectPosition = posM;
      }

      // Switch video source
      if (newSrc && newSrc !== videoElement.src) {
        const { currentTime } = videoElement;
        const wasPlaying = !videoElement.paused;

        videoElement.src = newSrc;

        // Restore playback state
        if (currentTime > 0) {
          videoElement.currentTime = currentTime;
          if (wasPlaying) {
            videoElement.play().catch((err) => {
              // eslint-disable-next-line no-console
              console.warn('Video playback failed:', err);
            });
          }
        }
      }

      if (newSrc === '') {
        videoElement.src = '';
      }

      if (newObjectPosition) {
        videoElement.style.objectPosition = newObjectPosition;
      }

      if (mediaVideoPauseAndPlayBtn === false) {
        const currentControlsDiv = container.querySelector('.featureksp-grid-controls');

        if (currentControlsDiv) {
          currentControlsDiv.style.display = 'none';
        }
      } else {
        const currentControlsDiv = container.querySelector('.featureksp-grid-controls');
        if (currentControlsDiv) {
          currentControlsDiv.style.display = 'flex';
        }
      }
    };

    // Listen for window resize
    let resizeTimer;
    if (!isAuthorUe()) {
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateVideoSource, 200);
      });
    }

    // Requirements:
    // 1. When mediaVideoPauseAndPlayBtn is configured as true: all videos show play/pause buttons
    // 2. When mediaVideoPauseAndPlayBtn is configured as false: only videos longer than 5 seconds force display of buttons

    // Only when configured as 'false' and video is longer than 5 seconds, dynamically add buttons
    const needToAddButtonsDynamically = mediaVideoPauseAndPlayBtn === false;

    // When mediaVideoPauseAndPlayBtn is false initially, dynamically add/hide buttons
    const addButtonsIfNeeded = () => {
      if (!needToAddButtonsDynamically) return;

      const { duration } = videoElement;

      if (duration > 5) {
        // Video is longer than 5 seconds, need to show buttons
        existingControlsDiv.style.display = 'flex';

        // Reset button state: show play button, hide pause button
        const currentPlayBtn = existingControlsDiv.querySelector('.featureksp-grid-play-btn');
        const currentPauseBtn = existingControlsDiv.querySelector('.featureksp-grid-pause-btn');
        if (currentPlayBtn) currentPlayBtn.style.display = 'flex';
        if (currentPauseBtn) currentPauseBtn.style.display = 'none';
      } else {
        // Video is not longer than 5 seconds, no need to show buttons
        // eslint-disable-next-line no-lonely-if
        if (existingControlsDiv) {
          existingControlsDiv.style.display = 'none';
        }
      }
    };

    videoElement.addEventListener('loadedmetadata', addButtonsIfNeeded);

    updateVideoSource();

    // Play end event (when mediaVideoloop === false, show replay button after video ends)
    if (replayBtnElement && !mediaVideoloop) {
      videoElement.addEventListener('ended', () => {
        replayBtnElement.style.display = 'flex';
        if (controlsDiv) controlsDiv.style.display = 'none';
      });
    }
  }, 100);
};

// 处理背景图片或者视频
const handleBgAsset = (wrap, v) => {
  if (['icon', 'text'].includes(v('layoutStyle')) || (v('layoutStyle') === 'media' && v('mediaType') === 'image')) {
    const config = {
      bgAssetD: 'hidden lg:block',
      bgAssetT: 'hidden md:block lg:hidden',
      bgAssetM: 'md:hidden lg:hidden',
    };
    Object.entries(config).forEach(([key, classes]) => {
      if (v(key, 'html')) {
        wrap.innerHTML += `<div class="absolute z-0 ${classes}">
          <img
            src="${v(key)}"
            class="object-cover"
            style="object-position: center;"
          />
        </div>`;
      }
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
      // 图片高度100%
      wrap.querySelectorAll('img').forEach((img) => {
        img.classList.add('w-full', 'h-auto');
      });
    } else { // 'icon', 'text'
      // 图片高度100%
      wrap.querySelectorAll('img').forEach((img) => {
        img.classList.add('h-full', 'w-auto');
      });
    }
  } else if (v('layoutStyle') === 'media' && v('mediaType') === 'video') {
    // 处理视频
    handleVideo(wrap, v);
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
    anchor.classList.add('featureksp-grid-anchor', 'absolute', 'right-[20px]', 'bottom-[20px]', 'z-[9]', 'transition-all', 'duration-300');

    const style = v('anchorStyle') || 'svg';
    anchor.setAttribute('data-anchor-style', style);

    let inlineStyle = '';
    if (style === 'svg') {
      const anchorColorDefault = prefixHex(v('anchorColorDefault'));
      const anchorColorHover = prefixHex(v('anchorColorHover'));
      const anchorColorPress = prefixHex(v('anchorColorPress'));
      const anchorBgColorDefault = prefixHex(v('anchorBgColorDefault'));
      const anchorBgColorHover = prefixHex(v('anchorBgColorHover'));
      const anchorBgColorPress = prefixHex(v('anchorBgColorPress'));
      const borderWidthDefault = v('borderWidthDefault');
      const borderWidthHover = v('borderWidthHover');
      const borderWidthPress = v('borderWidthPress');
      const borderColorDefault = prefixHex(v('borderColorDefault'));
      const borderColorHover = prefixHex(v('borderColorHover'));
      const borderColorPress = prefixHex(v('borderColorPress'));

      if (anchorColorDefault) inlineStyle += `--featureksp-grid-anchor-color-default: ${anchorColorDefault};`;
      if (anchorColorHover) inlineStyle += `--featureksp-grid-anchor-color-hover: ${anchorColorHover};`;
      if (anchorColorPress) inlineStyle += `--featureksp-grid-anchor-color-press: ${anchorColorPress};`;
      if (anchorBgColorDefault) inlineStyle += `--featureksp-grid-anchor-bg-default: ${anchorBgColorDefault};`;
      if (anchorBgColorHover) inlineStyle += `--featureksp-grid-anchor-bg-hover: ${anchorBgColorHover};`;
      if (anchorBgColorPress) inlineStyle += `--featureksp-grid-anchor-bg-press: ${anchorBgColorPress};`;
      if (borderWidthDefault) inlineStyle += `--featureksp-grid-anchor-border-width-default: ${borderWidthDefault}px;`;
      if (borderWidthHover) inlineStyle += `--featureksp-grid-anchor-border-width-hover: ${borderWidthHover}px;`;
      if (borderWidthPress) inlineStyle += `--featureksp-grid-anchor-border-width-press: ${borderWidthPress}px;`;
      if (borderColorDefault) inlineStyle += `--featureksp-grid-anchor-border-color-default: ${borderColorDefault};`;
      if (borderColorHover) inlineStyle += `--featureksp-grid-anchor-border-color-hover: ${borderColorHover};`;
      if (borderColorPress) inlineStyle += `--featureksp-grid-anchor-border-color-press: ${borderColorPress};`;

      anchor.innerHTML = `
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" class="featureksp-grid-anchor-bg-circle" />
          <path fill-rule="evenodd" clip-rule="evenodd" d="M25.2731 13.9609C25.7752 14.463 25.7752 15.2771 25.2731 15.7792L18.9091 22.1432C18.407 22.6453 17.593 22.6453 17.0909 22.1432L10.7269 15.7792C10.2248 15.2771 10.2248 14.463 10.7269 13.9609C11.229 13.4588 12.0431 13.4588 12.5452 13.9609L18 19.4158L23.4548 13.9609C23.9569 13.4588 24.771 13.4588 25.2731 13.9609Z" class="anchor-icon-path" />
        </svg>
      `;
    } else {
      const anchorDefaultAsset = v('anchorDefaultAsset');
      const anchorHoverAsset = v('anchorHoverAsset');
      const anchorPressAsset = v('anchorPressAsset');

      anchor.innerHTML = `
        <div class="anchor-png-wrapper w-[36px] h-[36px] relative">
          ${anchorPressAsset ? `<img src="${anchorPressAsset}" alt="anchor press" class="anchor-png-press absolute inset-0 w-full h-full object-contain" />` : ''}
          ${anchorHoverAsset ? `<img src="${anchorHoverAsset}" alt="anchor hover" class="anchor-png-hover absolute inset-0 w-full h-full object-contain" />` : ''}
          <img src="${anchorDefaultAsset}" alt="anchor" class="anchor-png-default absolute inset-0 w-full h-full object-contain" />
        </div>
      `;
    }

    if (inlineStyle) anchor.style.cssText = inlineStyle;
    wrap.appendChild(anchor);
  }
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
          inlineStyle += `--featureksp-grid-border-color: ${prefixHex(c('borderColor'))};`;
        }
        if (c('borderWidth')) {
          inlineStyle += `--featureksp-grid-border-width: ${c('borderWidth')}px;`;
        }
        if (v('layoutBgColor')) {
          inlineStyle += `--featureksp-grid-bg-color: ${prefixHex(v('layoutBgColor'))};`;
        }

        // 使用 v() 获取合并了默认值的 radius
        wrap.style.cssText += getRadiusStyle(v('radiusTL'), v('radiusTR'), v('radiusBR'), v('radiusBL'));
        // 处理标题和顶部/底部文本颜色（使用全局变量默认值）
        const titleFontColor = prefixHex(v('titleTextStyleFontColor'));
        if (titleFontColor) {
          inlineStyle += `--featureksp-grid-title-color: ${titleFontColor};`;
        }

        const topFontColor = prefixHex(v('topTextStyleFontColor'));
        if (topFontColor) {
          inlineStyle += `--featureksp-grid-top-text-color: ${topFontColor};`;
        }

        const bottomFontColor = prefixHex(v('bottomTextStyleFontColor'));
        if (bottomFontColor) {
          inlineStyle += `--featureksp-grid-bottom-text-color: ${bottomFontColor};`;
        }

        wrap.style.cssText += inlineStyle;

        // 添加初始class
        wrap.classList.add('col-span-12', 'wrap-anywhere', 'col-span-12', 'flex', 'relative');
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
