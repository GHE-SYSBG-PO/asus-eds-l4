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
 * Generate object position style
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
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = window.innerWidth >= 1024;
  return isTablet ? 'T' : (isDesktop ? 'D' : 'M');
};
/**
 * Build size style object
 */
const getSizeStyles = (config) => {
  const styles = {};
  // Width handling
  if (config.widthUnit === 'px' && config.widthValue) {
    styles.width = `${config.widthValue}px`;
  } else if (config.widthUnit === '%' && config.widthValue) {
    styles.width = `${config.widthValue}%`;
  } else if (config.widthUnit === 'auto') {
    styles.width = 'auto';
  }

  // Height handling
  if (config.heightUnit === 'px' && config.heightValue) {
    styles.height = `${config.heightValue}px`;
  } else if (config.heightUnit === '%' && config.heightValue) {
    styles.height = `${config.heightValue}%`;
  } else if (config.heightUnit === 'auto') {
    styles.height = 'auto';
  }

  // Aspect ratio handling
  const ratio = config.ratioValueCustomized || config.ratio;
  if (ratio && ratio !== 'customized' && ratio !== '') {
    styles.aspectRatio = ratio.replace(':', '/');
  }

  return styles;
};

/**
 * Build max/min width style object
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
 * Build border-radius style
 */
const getRadiusStyle = (radius) => {
  if (!radius) return '';

  // If it is a number, return style with px directly
  if (typeof radius === 'number') {
    return `${radius}px`;
  }

  // If it is a string and only contains numbers, it is also a number type
  const numRadius = parseFloat(radius);
  if (!Number.isNaN(numRadius)) {
    // Check if unit is already included
    if (radius.includes('px') || radius.includes('%') || radius.includes('rem') || radius.includes('em')) {
      return radius;
    }
    return `${radius}px`;
  }

  // If it is a non-numeric string, return directly
  return radius;
};

/**
 * Get configuration for the current device
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
 * Convert style object to inline style string
 */
const stylesToInline = (styles) => Object.entries(styles)
  .map(([key, value]) => {
    // Convert camelCase to kebab-case
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${kebabKey}: ${value}`;
  })
  .join('; ');

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'media-block');
    const v = getFieldValue(config);

    // Get basic configuration
    const mediaType = v('mediaType', 'text') || 'image';
    const radius = v('radius', 'text') || '0px';
    const imageAlt = v('imageAlt', 'text') || '';
    const videoAutoPlay = v('videoAutoPlay', 'text') === 'true';
    const loop = v('loop', 'text') === 'true';
    const pauseAndPlayBtn = v('pauseAndPlayBtn', 'text') === 'true';
    const pausePlayBtnColor = v('pausePlayBtnColor', 'text') || '#ffffff';
    const pausePlayBtnPosition = getButtonPositionClass(v('pausePlayBtnPosition', 'text'));
    // Get configurations for each device
    const configD = getDeviceConfig('D', v);
    const configT = getDeviceConfig('T', v);
    const configM = getDeviceConfig('M', v);

    // Build object position styles
    const objectPositionD = getObjectPositionStyle(configD.objectPosition);
    const objectPositionT = getObjectPositionStyle(configT.objectPosition);
    const objectPositionM = getObjectPositionStyle(configM.objectPosition);

    // Build border-radius style
    const radiusStyle = getRadiusStyle(radius);
    const containerRadiusStyle = radiusStyle ? `border-radius: ${radiusStyle};` : '';

    // Build style objects for each device
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

    // Create image element
    const createImageElement = (device, configObj, styles, objectPosition) => {
      const { assets } = configObj;
      if (!assets) return '';

      // Build base style
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

    // Create video element
    const createVideoElement = (defaultConfig, defaultStyles, defaultObjectPosition) => {
      const { assets: defaultAssets } = defaultConfig;
      if (!defaultAssets) return '';

      // Determine initial button display state
      const initialPlayBtnDisplay = videoAutoPlay ? 'none' : 'flex';
      const initialPauseBtnDisplay = videoAutoPlay ? 'flex' : 'none';

      // Build control buttons
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

    // Render content based on media type
    let mediaContent = '';

    if (mediaType === 'image') {
      // Image: create independent image elements for each device
      mediaContent += createImageElement('M', configM, stylesM, objectPositionM);
      mediaContent += createImageElement('T', configT, stylesT, objectPositionT);
      mediaContent += createImageElement('D', configD, stylesD, objectPositionD);
    } else if (mediaType === 'video') {
      // Video: create a single video element, switch source dynamically via JS
      const device = getDevice();
      if (device === 'D') {
        mediaContent = createVideoElement(configD, stylesD, objectPositionD);
      } else if (device === 'T') {
        mediaContent = createVideoElement(configT, stylesT, objectPositionT);
      } else {
        mediaContent = createVideoElement(configM, stylesM, objectPositionM);
      }
    }

    // Build final HTML
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

    // Add video control logic and responsive source switching
    if (mediaType === 'video') {
      setTimeout(() => {
        const videoElement = block.querySelector('video');
        const container = block.querySelector('.media-block-video-container');
        if (!container) {
          return false;
        }
        const existingControlsDiv = container.querySelector('.media-block-controls');
        if (!videoElement || !container) return;

        // Disable native controls
        videoElement.removeAttribute('controls');
        videoElement.controls = false;

        const playBtn = container.querySelector('.media-block-play-btn');
        const pauseBtn = container.querySelector('.media-block-pause-btn');
        const controlsDiv = container.querySelector('.media-block-controls');
        const replayBtnElement = container.querySelector('.media-block-replay-btn');

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

          // Update container size styles
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

        // Listen for window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(updateVideoSource, 200);
        });

        // Requirements:
        // 1. When pauseAndPlayBtn is configured as true: all videos show play/pause buttons
        // 2. When pauseAndPlayBtn is configured as false: only videos longer than 5 seconds force display of buttons

        // Only when configured as 'false' and video is longer than 5 seconds, dynamically add buttons
        const needToAddButtonsDynamically = pauseAndPlayBtn === false;

        // When pauseAndPlayBtn is false initially, dynamically add/hide buttons
        const addButtonsIfNeeded = () => {
          if (!needToAddButtonsDynamically) return;

          const { duration } = videoElement;

          if (duration > 5) {
            // Video is longer than 5 seconds, need to show buttons
            existingControlsDiv.style.display = 'flex';

            // Reset button state: show play button, hide pause button
            const currentPlayBtn = existingControlsDiv.querySelector('.media-block-play-btn');
            const currentPauseBtn = existingControlsDiv.querySelector('.media-block-pause-btn');
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

        // Play end event (when loop === false, show replay button after video ends)
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
