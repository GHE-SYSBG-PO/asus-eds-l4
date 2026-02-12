import { getBlockConfigs, getFieldValue } from '../../scripts/utils.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_CONFIG = {
  mediaType: '',
  radius: '',
  imageAlt: '',
  videoAutoPlay: '',
  loop: '',
  pauseAndPlayBtn: '',
  pausePlayBtnColor: '',
  pausePlayBtnPosition: '',
  assetsD: '',
  widthD: '',
  widthValueD: '',
  heightD: '',
  heightValueD: '',
  ratioD: '',
  ratioValueCustomizedD: '',
  objectPositionD: '',
  assetsT: '',
  widthT: '',
  widthValueT: '',
  heightT: '',
  heightValueT: '',
  ratioT: '',
  ratioValueCustomizedT: '',
  objectPositionT: '',
  assets: '',
  widthM: '',
  widthValueM: '',
  heightM: '',
  heightValueM: '',
  ratioM: '',
  ratioValueCustomizedM: '',
  objectPositionM: '',
  maxD: '',
  minD: '',
  maxT: '',
  minT: '',
  maxM: '',
  minM: '',
};

/**
 * 生成对象定位样式
 */
const getObjectPositionStyle = (objectPosition) => {
  const positionMap = {
    left: 'left',
    right: 'right',
    center: 'center',
    top: 'top',
    bottom: 'bottom',
  };
  return positionMap[objectPosition] || 'center';
};

/**
 * 生成视频控制按钮位置样式
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
 * 获取当前device
 */
const getDevice = () => {
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = window.innerWidth >= 1024;
  return isTablet ? 'T' : (isDesktop ? 'D' : 'M');
};
/**
 * 构建尺寸样式对象
 */
const getSizeStyles = (config) => {
  const styles = {};
  // 宽度处理
  if (config.widthUnit === 'px' && config.widthValue) {
    styles.width = `${config.widthValue}px`;
  } else if (config.widthUnit === '%' && config.widthValue) {
    styles.width = `${config.widthValue}%`;
  } else if (config.widthUnit === 'auto') {
    styles.width = 'auto';
  }

  // 高度处理
  if (config.heightUnit === 'px' && config.heightValue) {
    styles.height = `${config.heightValue}px`;
  } else if (config.heightUnit === '%' && config.heightValue) {
    styles.height = `${config.heightValue}%`;
  } else if (config.heightUnit === 'auto') {
    styles.height = 'auto';
  }

  // 宽高比处理
  const ratio = config.ratioValueCustomized || config.ratio;
  if (ratio && ratio !== 'customized' && ratio !== '') {
    styles.aspectRatio = ratio.replace(':', '/');
  }

  return styles;
};

/**
 * 构建最大/最小宽度样式对象
 */
const getMinMaxWidthStyles = (config) => {
  const styles = {};

  if (config.maxWidth) {
    styles.maxWidth = config.maxWidth;
  }

  if (config.minWidth) {
    styles.minWidth = config.minWidth;
  }

  return styles;
};

/**
 * 构建圆角样式
 */
const getRadiusStyle = (radius) => {
  if (!radius) return '';

  // 如果是数字，直接返回带px的样式
  if (typeof radius === 'number') {
    return `${radius}px`;
  }

  // 如果是字符串且只包含数字，也是数字类型
  const numRadius = parseFloat(radius);
  if (!Number.isNaN(numRadius)) {
    // 检查是否已经包含单位
    if (radius.includes('px') || radius.includes('%') || radius.includes('rem') || radius.includes('em')) {
      return radius;
    }
    return `${radius}px`;
  }

  // 如果是非数字字符串，直接返回
  return radius;
};

/**
 * 获取当前设备的配置
 */
const getDeviceConfig = (device, v) => {
  if (device === 'D') {
    return {
      assets: v('assetsD', 'text') || '',
      widthUnit: v('widthD', 'text') || 'auto',
      widthValue: v('widthValueD', 'text') || '',
      heightUnit: v('heightD', 'text') || 'auto',
      heightValue: v('heightValueD', 'text') || '',
      ratio: v('ratioD', 'text'),
      ratioValueCustomized: v('ratioValueCustomizedD', 'text') || '',
      objectPosition: v('objectPositionD', 'text') || 'center',
      maxWidth: v('maxD', 'text') || '',
      minWidth: v('minD', 'text') || '',
    };
  } if (device === 'T') {
    return {
      assets: v('assetsT', 'text') || '',
      widthUnit: v('widthT', 'text') || 'auto',
      widthValue: v('widthValueT', 'text') || '',
      heightUnit: v('heightT', 'text') || 'auto',
      heightValue: v('heightValueT', 'text') || '',
      ratio: v('ratioT', 'text'),
      ratioValueCustomized: v('ratioValueCustomizedT', 'text') || '',
      objectPosition: v('objectPositionT', 'text') || 'center',
      maxWidth: v('maxT', 'text') || '',
      minWidth: v('minT', 'text') || '',
    };
  }
  // Mobile
  return {
    assets: v('assets', 'text') || '',
    widthUnit: v('widthM', 'text') || 'auto',
    widthValue: v('widthValueM', 'text') || '',
    heightUnit: v('heightM', 'text') || 'auto',
    heightValue: v('heightValueM', 'text') || '',
    ratio: v('ratioM', 'text'),
    ratioValueCustomized: v('ratioValueCustomizedM', 'text') || '',
    objectPosition: v('objectPositionM', 'text') || 'center',
    maxWidth: v('maxM', 'text') || '',
    minWidth: v('minM', 'text') || '',
  };
};

/**
 * 将样式对象转换为行内样式字符串
 */
const stylesToInline = (styles) => Object.entries(styles)
  .map(([key, value]) => {
    // 将 camelCase 转换为 kebab-case
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${kebabKey}: ${value}`;
  })
  .join('; ');

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'media-block');
    const v = getFieldValue(config);

    // 获取基础配置
    const mediaType = v('mediaType', 'text') || 'image';
    const radius = v('radius', 'text') || '0px';
    const imageAlt = v('imageAlt', 'text') || '';
    const videoAutoPlay = v('videoAutoPlay', 'text') === 'true';
    const loop = v('loop', 'text') === 'true';
    const pauseAndPlayBtn = v('pauseAndPlayBtn', 'text') === 'true';
    const pausePlayBtnColor = v('pausePlayBtnColor', 'text') || '#ffffff';
    const pausePlayBtnPosition = getButtonPositionClass(v('pausePlayBtnPosition', 'text'));
    // 获取各设备配置
    const configD = getDeviceConfig('D', v);
    const configT = getDeviceConfig('T', v);
    const configM = getDeviceConfig('M', v);

    // 构建对象定位样式
    const objectPositionD = getObjectPositionStyle(configD.objectPosition);
    const objectPositionT = getObjectPositionStyle(configT.objectPosition);
    const objectPositionM = getObjectPositionStyle(configM.objectPosition);

    // 构建圆角样式
    const radiusStyle = getRadiusStyle(radius);
    const containerRadiusStyle = radiusStyle ? `border-radius: ${radiusStyle};` : '';

    // 构建各设备的样式对象
    const stylesM = {
      ...getSizeStyles(configM),
      ...getMinMaxWidthStyles(configM),
    };
    const stylesT = {
      ...getSizeStyles(configT),
      ...getMinMaxWidthStyles(configT),
    };
    const stylesD = {
      ...getSizeStyles(configD),
      ...getMinMaxWidthStyles(configD),
    };

    // 创建图片元素
    const createImageElement = (device, configObj, styles, objectPosition) => {
      const { assets } = configObj;
      if (!assets) return '';

      // 构建基础样式
      const baseStyle = `position: relative; overflow-hidden; ${containerRadiusStyle} ${stylesToInline(styles)}`;

      let dClass = 'hidden lg:block';
      if (device === 'M') {
        dClass = 'md:hidden lg:hidden';
      }
      if (device === 'T') {
        dClass = 'hidden md:block lg:hidden';
      }
      return `
        <div class="device-${device} ${dClass}" style="${baseStyle}">
          <img
            src="${assets}"
            alt="${imageAlt}"
            class="w-full h-full object-cover"
            style="object-position: ${objectPosition};"
          />
        </div>
      `;
    };

    // 创建视频元素
    const createVideoElement = (defaultConfig, defaultStyles, defaultObjectPosition) => {
      const { assets: defaultAssets } = defaultConfig;
      if (!defaultAssets) return '';

      // 确定初始按钮显示状态
      const initialPlayBtnDisplay = videoAutoPlay ? 'none' : 'flex';
      const initialPauseBtnDisplay = videoAutoPlay ? 'flex' : 'none';

      // 构建控制按钮
      let controlButtons = '';
      controlButtons = `
          <div class="media-block-controls absolute ${pausePlayBtnPosition} z-10">
            <button
              class="media-block-play-btn rounded-full flex items-center justify-center transition-all"
              style="display: ${initialPlayBtnDisplay};  border: 1px solid ${pausePlayBtnColor};"
            >
              <svg viewBox="0 0 36 36" fill="${pausePlayBtnColor}" >
                <path d="M8 5v14l11-7z" transform="translate(6,6)"></path>
              </svg>
            </button>
            <button
              class="media-block-pause-btn rounded-full flex items-center justify-center transition-all"
              style="display: ${initialPauseBtnDisplay};  border: 1px solid ${pausePlayBtnColor};"
            >
              <svg viewBox="0 0 36 36" fill="${pausePlayBtnColor}">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" transform="translate(6,6)"/>
              </svg>
            </button>
          </div>
          ${
  !loop && `<button
            class="media-block-replay-btn absolute ${pausePlayBtnPosition} z-10 rounded-full flex items-center justify-center transition-all"
            style="display: ${initialPauseBtnDisplay};  border: 1px solid ${pausePlayBtnColor};display:none"
          >
            <svg viewBox="0 0 36 36" fill="${pausePlayBtnColor}">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="translate(6,6)"/>
            </svg>
          </button>`
}
        `;

      let videoAttrs = '';
      if (videoAutoPlay) {
        videoAttrs += 'autoplay muted ';
      }
      if (loop) {
        videoAttrs += 'loop ';
      }

      // eslint-disable-next-line no-nested-ternary
      const curDevice = window.innerWidth >= 1024 ? 'D' : ((window.innerWidth >= 768 && window.innerWidth < 1024) ? 'T' : 'M');

      return `
        <div class="device-${curDevice} media-block-video-container relative" style="position: relative; overflow-hidden; ${containerRadiusStyle} ${stylesToInline(defaultStyles)}">
          <video
            data-src-m="${configM.assets || ''}"
            data-src-t="${configT.assets || ''}"
            data-src-d="${configD.assets || ''}"
            data-object-position-m="${objectPositionM}"
            data-object-position-t="${objectPositionT}"
            data-object-position-d="${objectPositionD}"
            src="${defaultAssets}"
            class="w-full h-full object-cover"
            style="object-position: ${defaultObjectPosition};"
            ${videoAttrs}
            playsinline
          ></video>
          ${controlButtons}
        </div>
      `;
    };

    // 根据媒体类型渲染内容
    let mediaContent = '';

    if (mediaType === 'image') {
      // 图片：为每个设备创建独立的图片元素
      mediaContent += createImageElement('M', configM, stylesM, objectPositionM);
      mediaContent += createImageElement('T', configT, stylesT, objectPositionT);
      mediaContent += createImageElement('D', configD, stylesD, objectPositionD);
    } else if (mediaType === 'video') {
      // 视频：创建单个视频元素，通过 JS 动态切换源
      const device = getDevice();
      if (device === 'D') {
        mediaContent = createVideoElement(configD, stylesD, objectPositionD);
      } else if (device === 'T') {
        mediaContent = createVideoElement(configT, stylesT, objectPositionT);
      } else {
        mediaContent = createVideoElement(configM, stylesM, objectPositionM);
      }
    }

    // 构建最终的 HTML
    block.innerHTML = `
      <div class="media-block-container relative">
        ${mediaContent}
      </div>
    `;

    // move attrs
    const assetsDHtml = v('assetsD', 'html');
    if (assetsDHtml) {
      const domD = block.querySelector('device-D');
      if (domD) {
        moveInstrumentation(assetsDHtml, domD);
      }
    }

    const assetsTHtml = v('assetsT', 'html');
    if (assetsTHtml) {
      const domT = block.querySelector('device-T');
      if (domT) {
        moveInstrumentation(assetsTHtml, domT);
      }
    }

    const assetsMHtml = v('assetsM', 'html');
    if (assetsMHtml) {
      const domM = block.querySelector('device-M');
      if (domM) {
        moveInstrumentation(assetsMHtml, domM);
      }
    }

    // 添加视频控制逻辑和响应式源切换
    if (mediaType === 'video') {
      setTimeout(() => {
        const videoElement = block.querySelector('video');
        const container = block.querySelector('.media-block-video-container');
        if (!container) {
          return false;
        }
        const existingControlsDiv = container.querySelector('.media-block-controls');
        if (!videoElement || !container) return;

        // 禁用原生 controls
        videoElement.removeAttribute('controls');
        videoElement.controls = false;

        const playBtn = container.querySelector('.media-block-play-btn');
        const pauseBtn = container.querySelector('.media-block-pause-btn');
        const controlsDiv = container.querySelector('.media-block-controls');
        const replayBtnElement = container.querySelector('.media-block-replay-btn');

        // 按钮事件绑定
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

        // 如果初始按钮存在，直接绑定事件
        if (playBtn && pauseBtn) {
          bindButtonEvents(playBtn, pauseBtn);
        }

        // 播放/暂停事件监听器（统一控制按钮显示/隐藏）
        const handlePlay = () => {
          const currentPlayBtn = container.querySelector('.media-block-play-btn');
          const currentPauseBtn = container.querySelector('.media-block-pause-btn');
          if (currentPlayBtn) currentPlayBtn.style.display = 'none';
          if (currentPauseBtn) currentPauseBtn.style.display = 'flex';
          if (replayBtnElement) replayBtnElement.style.display = 'none';
          const { duration } = videoElement;
          if (pauseAndPlayBtn === true || (pauseAndPlayBtn === false && duration > 5)) {
            existingControlsDiv.style.display = 'block';
          }
        };

        const handlePause = () => {
          const currentPlayBtn = container.querySelector('.media-block-play-btn');
          const currentPauseBtn = container.querySelector('.media-block-pause-btn');
          if (currentPlayBtn) currentPlayBtn.style.display = 'flex';
          if (currentPauseBtn) currentPauseBtn.style.display = 'none';
        };

        // 绑定视频事件监听器
        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);

        // 重播按钮事件绑定
        if (replayBtnElement) {
          replayBtnElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            videoElement.currentTime = 0;
            videoElement.play();
          });
        }

        // 响应式视频源切换函数
        const updateVideoSource = () => {
          const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
          const isDesktop = window.innerWidth >= 1024;

          const srcD = videoElement.getAttribute('data-src-d');
          const srcT = videoElement.getAttribute('data-src-t');
          const srcM = videoElement.getAttribute('data-src-m');
          const posD = videoElement.getAttribute('data-object-position-d');
          const posT = videoElement.getAttribute('data-object-position-t');
          const posM = videoElement.getAttribute('data-object-position-m');

          let newSrc = '';
          let newObjectPosition = '';
          let newStyles = {};

          if (isDesktop) {
            if (srcD) newSrc = srcD;
            if (posD) newObjectPosition = posD;
            newStyles = stylesD;
          } else if (isTablet) {
            if (srcT) newSrc = srcT;
            if (posT) newObjectPosition = posT;
            newStyles = stylesT;
          } else {
            if (srcM) newSrc = srcM;
            if (posM) newObjectPosition = posM;
            newStyles = stylesM;
          }

          // 切换视频源
          if (newSrc && newSrc !== videoElement.src) {
            const { currentTime } = videoElement;
            const wasPlaying = !videoElement.paused;

            videoElement.src = newSrc;

            // 恢复播放状态
            if (currentTime > 0) {
              videoElement.currentTime = currentTime;
              if (wasPlaying) {
                videoElement.play().catch((err) => {
                  // eslint-disable-next-line no-console
                  console.warn('视频播放失败:', err);
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

          // 更新容器尺寸样式
          const containerStyleStr = containerRadiusStyle + stylesToInline(newStyles);
          container.style.cssText = containerStyleStr;

          if (pauseAndPlayBtn === false) {
            const currentControlsDiv = container.querySelector('.media-block-controls');

            if (currentControlsDiv) {
              currentControlsDiv.style.display = 'none';
            }
          } else {
            const currentControlsDiv = container.querySelector('.media-block-controls');
            if (currentControlsDiv) {
              currentControlsDiv.style.display = 'flex';
            }
          }
        };

        // 监听窗口大小变化
        let resizeTimer;
        window.addEventListener('resize', () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(updateVideoSource, 200);
        });

        // 需求：
        // 1. 当 pauseAndPlayBtn 配置为 true 时：所有视频都显示播放/暂停按钮
        // 2. 当 pauseAndPlayBtn 配置为 false 时：只有视频超过5秒时，才强制显示按钮

        // 只有当配置为 'false' 且视频超过5秒时，才需要动态添加按钮
        const needToAddButtonsDynamically = pauseAndPlayBtn === false;

        // 初始化pauseAndPlayBtn为false时，动态添加/隐藏按钮
        const addButtonsIfNeeded = () => {
          if (!needToAddButtonsDynamically) return;

          const { duration } = videoElement;

          if (duration > 5) {
            // 视频超过5秒，需要显示按钮
            existingControlsDiv.style.display = 'flex';

            // 重置按钮状态：显示播放按钮，隐藏暂停按钮
            const currentPlayBtn = existingControlsDiv.querySelector('.media-block-play-btn');
            const currentPauseBtn = existingControlsDiv.querySelector('.media-block-pause-btn');
            if (currentPlayBtn) currentPlayBtn.style.display = 'flex';
            if (currentPauseBtn) currentPauseBtn.style.display = 'none';
          } else {
            // 视频不超过5秒，不需要显示按钮
            // eslint-disable-next-line no-lonely-if
            if (existingControlsDiv) {
              existingControlsDiv.style.display = 'none';
            }
          }
        };

        videoElement.addEventListener('loadedmetadata', addButtonsIfNeeded);

        updateVideoSource();

        // 播放结束事件（当 loop === false 时，视频播放结束后显示重播按钮）
        if (replayBtnElement && !loop) {
          videoElement.addEventListener('ended', () => {
            replayBtnElement.style.display = 'flex';
            if (controlsDiv) controlsDiv.style.display = 'none';
          });
        }
      }, 100);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating media block:', error);
    block.innerHTML = '<div class="error-message">Failed to load media block</div>';
  }
}
