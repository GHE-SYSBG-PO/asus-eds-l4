/* eslint-disable no-plusplus, max-len, no-unused-vars, quotes, no-multiple-empty-lines, no-use-before-define, no-console, padded-blocks */

import { loadScript, loadCSS } from '../../scripts/aem.js';
import { loadSwiper } from '../../scripts/scripts.js';
// import { getBlockConfigs, getFieldValue, handleDecide } from '../../scripts/utils.js';

const DEFAULT_CONFIG = {
  // Layout Tab
  // desktopAlignment: 'center',
  // tabletAlignment: 'center',
  // mobileAlignment: 'center',

  //  Base Tab
  cardType: '',
  mediaType: '',
  imageAlt: '',

  videoAutoPlay: false,
  loop: false,
  pauseAndPlayBtn: false,
  pausePlayBtnColor: '',
  pausePlayBtnPosition: 'top-left',

  noiseCancelingAsset: '',
  noiseWaveColor: '',
  voiceWaveColor: '',

  assets: '',

  title: '',
  info: '',
  ctaVisible: 'show',
  ctaText: 'Learn More',
  ctaLinkType: 'button',

  // Advanced Tab

  // Title
  titleFontD: '',
  titleFontT: '',
  titleFontM: '',
  titleFontColor: '',

  // Info
  infoFontColor: '',

  // Border
  borderColor: '',
  borderWidth: '',

  // Border Radius
  borderRadiusTopLeft: '',
  borderRadiusTopRight: '',
  borderRadiusBottomRight: '',
  borderRadiusBottomLeft: '',

  // CTA
  ctaFontDT: '',
  ctaFontM: '',
  ctaFontColor: '',
  ctaHyperlink: '',

  // Button Style
  gBtnLabel: '',
  gBtnFontDesktop: '',
  gBtnFontM: '',
  gBtnFontColorDefault: '',
  gBtnFontColorHover: '',
  gBtnFontColorActive: '',
  gBtnContainerBgColorDefault: '',
  gBtnContainerBgColorHover: '',
  gBtnContainerBgColorActive: '',
  gBtnContainerRadiusTL: '',
  gBtnContainerRadiusTR: '',
  gBtnContainerRadiusBR: '',
  gBtnContainerRadiusBL: '',
  gBtnBorderWidth: '',
  gBtnBorderColor: '',
  alignmentAdvanced: 'left',
};


/**
 * Get current device
 */
const getDevice = () => {
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
  const isDesktop = window.innerWidth > 1024;
  return isTablet ? 'T' : (isDesktop ? 'D' : 'M');
};

/**
 * Reads configuration from the block's DOM structure.
 * @param {HTMLElement} block The block element.
 * @returns {object} A configuration object.
 */
function extractValue(div) {
  // 1️ If it contains picture → extract image URL
  const img = div.querySelector('img');
  if (img) {
    return img.getAttribute('src') || null;
  }

  // 2 If it contains <p>
  const p = div.querySelector(':scope > p');
  if (p) {
    return p.textContent.trim();
  }

  // 3️ Fallback: direct text
  const text = div.textContent.trim();
  return text || null;
}

async function fillSequentialConfig(block) {
  const cfg = { ...DEFAULT_CONFIG };

  const fieldGroups = Array.from(block.querySelectorAll(':scope > div'));

  const flatValues = [];

  fieldGroups.forEach((group, index) => {
    if (index <= 2) return;

    Array.from(group.children).forEach((child) => {
      const value = extractValue(child);
      flatValues.push(value);
    });
  });

  console.log('Extracted sequence:', fieldGroups, flatValues);

  const keys = Object.keys(cfg);
  const configArray = [];
  const chunkSize = keys.length;

  for (let i = 0; i < flatValues.length; i += chunkSize) {
    const chunk = flatValues.slice(i, i + chunkSize);
    const chunkCfg = { ...DEFAULT_CONFIG };

    console.log("Extracted chunk:", chunk);

    keys.forEach((key, index) => {
      if (chunk[index] !== undefined) {
        chunkCfg[key] = chunk[index];
      }
    });
    configArray.push(chunkCfg);
  }
  return configArray;
}

function hexToRgb(hex) {
  if (!hex) return '';
  if (hex.includes(',')) return hex;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : hex;
}

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

function getMediaHTML(data) {
  const {
    mediaType, imageAlt, videoAutoPlay, loop, title, noiseWaveColor, voiceWaveColor, noiseCancelingAsset,
    pauseAndPlayBtn, pausePlayBtnColor, pausePlayBtnPosition,
  } = data;
  let content = '';

  const asset = getValueForDevice('assets', data) || data.assets;

  if (mediaType === 'noise_canceling') {
    let style = '';
    if (noiseWaveColor) {
      const rgb = hexToRgb(noiseWaveColor);
      if (rgb) style += `--themecolor-middle: ${rgb};`;
    }
    if (voiceWaveColor) {
      const rgb = hexToRgb(voiceWaveColor);
      if (rgb) style += `--themecolor-main: ${rgb}; --themecolor-filter: ${rgb};`;
    }

    content = `
             <div class="ai__noise__container" id="conferenceS1span3__aiNoiseContainer" style="${style}">
              <div class="nav__replay">
                  <div class="wd__play__btn video__play__btn">
                    <button class="wd__play__btn-button is-hidden" aria-label="replay the ai noise animation" tabindex="-1" id="aiApplication_s4_noise_replay_btn" aria-hidden="true" data-eventname="undefined">
                        <svg class="svg-step svg_button_replay"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 30.63 30.88" aria-hidden="true">
                          <path class="cls-1"
                              d="m15.44,28.37c-7.13,0-12.94-5.8-12.94-12.94S8.3,2.5,15.44,2.5c3.52,0,6.86,1.45,9.29,3.97l-2.73,2.29,8.63,3.25-1.71-9.06-2.27,1.91C23.73,1.77,19.7,0,15.44,0,6.92,0,0,6.92,0,15.44s6.92,15.44,15.44,15.44c7.3,0,13.66-5.18,15.12-12.33l-2.45-.5c-1.22,5.98-6.55,10.33-12.67,10.33h0Z">
                          </path>
                        </svg>
                        <div class="img__icon" aria-hidden="true"></div>
                    </button>
                  </div>
              </div>
              <div class="nav__noise">
                  <div class="wdga nav__item nav__1" data-index="1" data-status="off" data-gaid="noiseCancelBtn1" role="button" tabindex="0"
                    aria-label="Play the simulated home sounds without noise cancelation.">
                    <div class="nav__content">
                        <div class="img__icon" aria-hidden="true">
                          <svg class="svg_button_play" viewBox="0 0 85 85" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path class="svg-circle" d="M42.6,2.5c22.1,0,40,17.9,40,40s-17.9,40-40,40s-40-17.9-40-40S20.5,2.5,42.6,2.5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="undefined"></path>
                              <g class="svg-step svg-pause-all">
                                <path class="svg-line svg-pause" d="M50,28.2c1.1,0,2,0.9,2,2v24c0,1.1-0.9,2-2,2s-2-0.9-2-2v-24C48,29.1,48.9,28.2,50,28.2z" fill-rule="evenodd"></path>
                                <path class="svg-line svg-pause" d="M35,28.2c1.1,0,2,0.9,2,2v24c0,1.1-0.9,2-2,2s-2-0.9-2-2v-24C33,29.1,33.9,28.2,35,28.2z" fill-rule="evenodd"></path>
                              </g>
                              <g class="svg-step svg-triangle svg-play">
                                <path class="triangle" d="M55.7,41.5c0.3,0.4,0.3,1,0,1.5c-0.1,0.2-0.3,0.4-0.5,0.5L35.3,56.1c-0.2,0.1-0.5,0.2-0.7,0.2c-0.8,0-1.4-0.7-1.5-1.5v-25 c0-0.3,0.1-0.5,0.2-0.7c0.1-0.2,0.3-0.4,0.5-0.5c0.2-0.1,0.5-0.2,0.7-0.2c0.3,0,0.5,0.1,0.7,0.1L55.2,41 C55.4,41.2,55.6,41.4,55.7,41.5"></path>
                              </g>
                              <g class="svg-step svg-stop">
                                <path class="st0" d="M45.8,42.1l10.4-10.4c0.8-0.8,0.8-2.2,0-3.2c-0.8-0.8-2.2-0.8-3.2,0L42.6,38.9L32.2,28.5 c-0.8-0.8-2.2-0.8-3.2,0c-0.8,0.8-0.8,2.2,0,3.2l10.4,10.4L29,52.5c-0.8,0.8-0.8,2.2,0,3.2c0.8,0.8,2.2,0.8,3.2,0l10.4-10.4 L53,55.7c0.8,0.8,2.2,0.8,3.2,0c0.8-0.8,0.8-2.2,0-3.2L45.8,42.1z"></path>
                              </g>
                          </svg>
                        </div>
                    </div>
                  </div>
              </div>
              <div class="noise__voice__container" role="img"
                  aria-label="(Baby crying and dog barking) Flip the switch below this test recording to enable or disable the ASUS AI Noise Canceling Technology and experience its power and accuracy for yourself.">
                  <figure class="img img__noise grace-show show animated" role="presentation" aria-hidden="true">
                    <div class="img__voice">
                        <img src="${noiseCancelingAsset}" alt="${imageAlt}">
                    </div>
                    <canvas class="noise__left" width="800" height="400"></canvas>
                    <canvas class="noise__right" width="800" height="400"></canvas>
                  </figure>
              </div>
              <div class="noise__switcher" aria-hidden="true">
                  <p class="adaDesc noise_desc"></p>
                  <button class="aiNoiseSwitcher_btn img__switcher switcher_button wdga" id="Item_21_conferenceS1span3_aiNoiseSwitcher" role="switch" data-status="false" data-on="AI noise cancelation, pressed, on" data-off="AI noise cancelation, pressed, off" aria-checked="false">
                    <label class="hide" for="Item_21_conferenceS1span3_aiNoiseSwitcher">AI noise cancelation, pressed, off</label>
                  </button>
                  <audio class="noise__audio" aria-hidden="true">
                    <source src="" type="audio/mpeg">
                  </audio>
              </div>
            </div>`;
  } else if (mediaType === 'video') {
    const isVideoAutoPlay = String(videoAutoPlay).toLowerCase() === 'true';
    const isLoop = String(loop).toLowerCase() === 'true';
    const isPauseAndPlayBtn = String(pauseAndPlayBtn).toLowerCase() === 'true';

    const initialPlayBtnDisplay = isVideoAutoPlay ? 'none' : 'flex';
    const initialPauseBtnDisplay = isVideoAutoPlay ? 'flex' : 'none';
    const btnColor = pausePlayBtnColor || 'ffffff';
    const positionClass = getButtonPositionClass(pausePlayBtnPosition);
    const controlsDisplay = isPauseAndPlayBtn ? 'flex' : 'none';

    content = `
          <div class="block-img media-block-video-container relative" data-pause-and-play-btn="${isPauseAndPlayBtn}">
            <video class="img video__bg w-full h-full object-cover"
                src="${asset}"
                ${isVideoAutoPlay ? 'autoplay muted' : ''}
                ${isLoop ? 'loop' : ''}
                playsinline>
            </video>
            <div class="media-block-controls absolute ${positionClass} z-10" style="display: ${controlsDisplay}; gap: 10px;">
                <button class="media-block-play-btn rounded-full flex items-center justify-center transition-all" aria-label="Play" style="display: ${initialPlayBtnDisplay}; border: 1px solid #${btnColor};">
                    <svg viewBox="0 0 36 36" fill="#${btnColor}"><path d="M8 5v14l11-7z" transform="translate(6,6)"></path></svg>
                </button>
                <button class="media-block-pause-btn rounded-full flex items-center justify-center transition-all" aria-label="Pause" style="display: ${initialPauseBtnDisplay}; border: 1px solid #${btnColor};">
                    <svg viewBox="0 0 36 36" fill="#${btnColor}"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" transform="translate(6,6)"/></svg>
                </button>
            </div>
            ${!isLoop ? `<button class="media-block-replay-btn absolute ${positionClass} z-10 rounded-full flex items-center justify-center transition-all" aria-label="Replay" style="display: none; border: 1px solid #${btnColor};"><svg viewBox="0 0 36 36" fill="#${btnColor}"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="translate(6,6)"/></svg></button>` : ''}
          </div>`;
  } else {
    content = `
          <div class="block-img">
            <img class="img img__bg"
                src="${asset}"
                alt="${imageAlt}">
          </div>`;
  }

  console.log("H1, Generated media HTML:", title, asset, data);
  return content;
}

function getValueForDevice(fieldName, data) {
  const device = getDevice();
  return data[`${fieldName}${device}`] || '';
}

function getCardHTML(data) {
  const {
    cardType,
    title,
    info,
    ctaText,
    ctaHyperlink,
    titleFontColor,
    infoFontColor,
    borderColor,
    borderWidth,
    ctaVisible,
    ctaLinkType,
    ctaFontDT,
    ctaFontM,
    ctaFontColor,
    borderRadiusTopLeft,
    borderRadiusTopRight,
    borderRadiusBottomLeft,
    borderRadiusBottomRight,
    alignmentAdvanced,
  } = data;

  const titleFont = getValueForDevice('titleFont', data);

  let ctaHTML = '';
  if (ctaVisible === 'show') {
    const fontClass = `${ctaFontDT} small_${ctaFontM}`;
    const style = ctaFontColor ? `style="color: #${ctaFontColor}"` : '';

    if (ctaLinkType === 'button') {
      ctaHTML = `<button class="${fontClass}" 
                  aria-label="${ctaText}" 
                  onclick="window.open('${ctaHyperlink}', '_blank')"
                  ${style}><span>${ctaText}</span></button>`;
    } else {
      ctaHTML = `<a class="${fontClass}" 
                  aria-label="${ctaText} (opens in new window)" 
                  href="${ctaHyperlink}" target="_blank" rel="noopener noreferrer" 
                  ${style}><span>${ctaText}</span></a>`;
    }
  }

  const blockContent = `
          <div class="block-content">
            <div class="wd__content" style="text-align: ${alignmentAdvanced};">
                <h3 class="${titleFont}">
                  <span class="${titleFont}" style="color: #${titleFontColor}">${title}</span>
                </h3>
                <div style="color: #${infoFontColor}">${info}</div>
                ${ctaHTML}
            </div>
          </div>`;

  const getStyledBlockContent = (style) => {
    if (!style) return blockContent;
    return blockContent.replace('class="block-content"', `class="block-content" style="${style}"`);
  };

  let flexDirection = '';
  let cardBlockType = 'img_txt_integrated_top';
  let contentStyle = '';
  let showMedia = true;

  switch (cardType) {
    case 'img_txt_integrated_bottom':
      flexDirection = 'column-reverse';
      cardBlockType = 'img_txt_integrated_bottom';
      break;
    case 'img_txt_separate_bottom':
      flexDirection = 'column-reverse';
      contentStyle = 'margin-top: 10px;';
      cardBlockType = 'img_txt_separate_bottom';
      break;
    case 'text_only':
      showMedia = false;
      cardBlockType = 'text_only';
      break;
    case 'txt_img_attached_top':
      contentStyle = 'margin-bottom: 10px;';
      cardBlockType = 'txt_img_attached_top';
      break;
    case 'txt_img_attached_bottom':
      flexDirection = 'column-reverse';
      contentStyle = 'margin-top: 10px;';
      cardBlockType = 'txt_img_attached_bottom';
      break;
    case 'img_txt_integrated_top':
    default:
      break;
  }

  const mediaHTML = showMedia ? getMediaHTML(data) : '';
  const containerStyle = `transform: translateY(0px); opacity: 1; display: flex; flex-direction: ${flexDirection}; height: auto; position: relative; overflow: hidden;`;

  const iconHTML = `
    <div class="card-icon-down">
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>
  `;

  return `
      <div class="block block__scroll-item block-1 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide ${borderRadiusTopLeft} ${borderRadiusTopRight} ${borderRadiusBottomRight} ${borderRadiusBottomLeft} ${cardBlockType}" 
           data-blocktype="aiNoise" 
           style="${containerStyle}; 
           border: ${borderWidth ? `${borderWidth}px solid #${borderColor}` : 'none'};" 
           easing="easeOutExpo">
          ${getStyledBlockContent(contentStyle)}
          ${mediaHTML}
          ${iconHTML}
      </div>`;
}

function setEqualHeight(block) {
  const slides = block.querySelectorAll('.swiper-slide');
  let maxHeight = 0;

  slides.forEach((slide) => {
    slide.style.height = 'auto';
  });

  slides.forEach((slide) => {
    if (slide.offsetHeight > maxHeight) {
      maxHeight = slide.offsetHeight;
      console.log('New max height found:', maxHeight, slide, slide.offsetHeight);
    }
  });

  slides.forEach((slide) => {
    slide.style.height = `${maxHeight}px`;
  });
}

async function renderCard(block) {

  const data = await fillSequentialConfig(block);

  console.log('Extracted chunk, Final Card Data:', data);


  const smallCardsContainer = document.createElement('div');
  smallCardsContainer.className = 'small-cards-containers';

  const cardHTML = Array.isArray(data)
    ? data.map((item) => getCardHTML(item)).join('')
    : getCardHTML(data);

  const html = `<div class="cmd-content">
    <div class="outer-view" id="CMD">
      <section class="wd__section section__aiApplication2025-outer-s4 aiApplication2025-outer wd__sections theme-white " id="section__aiApplication2025-outer-s4">
          <div class="sectionnNavPosition"></div>
          <div class="section_content">
            <div class="row">
                <div class="col l12 m12 s12">
                  <div class="wdblockimg">
                      <div class="wdblockimg__container block__scroll">
                        <div class="swiper">
                            <div class="swiper-wrapper">
                              ${cardHTML}
                            </div>
                        </div>
                        <div class="swiper-button-prev"></div>
                        <div class="swiper-button-next"></div>
                        <div class="scroll-trigger-end"></div>
                      </div>
                  </div>
                </div>
            </div>
          </div>
      </section>
    </div>
  </div>`;

  smallCardsContainer.innerHTML = html;

  // Add event listeners for video controls
  const videoContainers = smallCardsContainer.querySelectorAll('.media-block-video-container');
  videoContainers.forEach((container) => {
    const video = container.querySelector('video');
    const playBtn = container.querySelector('.media-block-play-btn');
    const pauseBtn = container.querySelector('.media-block-pause-btn');
    const replayBtn = container.querySelector('.media-block-replay-btn');
    const controlsDiv = container.querySelector('.media-block-controls');
    const pauseAndPlayBtn = container.getAttribute('data-pause-and-play-btn') === 'true';

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        video.play();
      });
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        video.pause();
      });
    }
    if (replayBtn) {
      replayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        video.currentTime = 0;
        video.play();
      });
    }

    video.addEventListener('play', () => {
      if (playBtn) playBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'flex';
      if (replayBtn) replayBtn.style.display = 'none';
      if (controlsDiv) controlsDiv.style.display = 'flex';
    });

    video.addEventListener('pause', () => {
      if (playBtn) playBtn.style.display = 'flex';
      if (pauseBtn) pauseBtn.style.display = 'none';
    });

    video.addEventListener('ended', () => {
      if (replayBtn) {
        replayBtn.style.display = 'flex';
        if (controlsDiv) controlsDiv.style.display = 'none';
      } else {
        if (playBtn) playBtn.style.display = 'flex';
        if (pauseBtn) pauseBtn.style.display = 'none';
      }
    });

    const addButtonsIfNeeded = () => {
      if (pauseAndPlayBtn) return;

      const { duration } = video;
      if (duration > 5) {
        if (controlsDiv) controlsDiv.style.display = 'flex';
        if (playBtn) playBtn.style.display = 'flex';
        if (pauseBtn) pauseBtn.style.display = 'none';
      } else if (controlsDiv) {
        controlsDiv.style.display = 'none';
      }
    };

    video.addEventListener('loadedmetadata', addButtonsIfNeeded);

    if (video.readyState >= 1) {
      addButtonsIfNeeded();
    }
  });

  const style = document.createElement('style');
  style.textContent = `
    .small-cards-containers .swiper-button-prev,
    .small-cards-containers .swiper-button-next {
      background: linear-gradient(180deg, #4379B1 0%, #5977A1 100%);
      color: #FFFFFF;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      position: absolute;
      top: auto;
      bottom: -50px;
      z-index: 2;
    }
    .small-cards-containers .swiper-button-next {
      right: 10px;
    }
    .small-cards-containers .swiper-button-prev {
      right: 60px;
      left: auto;
    }
    .small-cards-containers .swiper-button-prev::after,
    .small-cards-containers .swiper-button-next::after {
      font-size: 12px;
    }
    .small-cards-containers .swiper-button-disabled {
      background: #CBCDD1;
      color: #0000006B;
      opacity: 0.42;
      pointer-events: none;
    }
    .small-cards-containers .card-icon-down {
      background: linear-gradient(180deg, #4379B1 0%, #5977A1 100%);
      color: #FFFFFF;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      position: absolute;
      bottom: 15px;
      right: 15px;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .small-cards-containers .absolute { position: absolute; }
    .small-cards-containers .relative { position: relative; }
    .small-cards-containers .z-10 { z-index: 10; }
    .small-cards-containers .top-4 { top: 1rem; }
    .small-cards-containers .left-4 { left: 1rem; }
    .small-cards-containers .right-4 { right: 1rem; }
    .small-cards-containers .bottom-4 { bottom: 1rem; }
    .small-cards-containers .media-block-play-btn,
    .small-cards-containers .media-block-pause-btn,
    .small-cards-containers .media-block-replay-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      background: transparent;
      cursor: pointer;
      padding: 0;
    }
    .small-cards-containers .media-block-play-btn svg,
    .small-cards-containers .media-block-pause-btn svg,
    .small-cards-containers .media-block-replay-btn svg {
      width: 36px;
      height: 36px;
      display: block;
    }
  `;
  smallCardsContainer.appendChild(style);

  block.appendChild(smallCardsContainer);

  Array.from(block.children).forEach((child) => {
    if (child !== smallCardsContainer) {
      child.style.display = 'none';
      Array.from(child.children).forEach((grandchild) => grandchild.remove());
    }
  });
}

export default async function decorate(block) {

  try {
    await loadSwiper();
    await loadNoUiSliderCSS();
    await loadNoUiSliderJquery();
    await renderCard(block); // Html structure and content
    await initializeSwiperCarousel(block);

    setTimeout(async () => {
      await loadNoUiSlider();

      setEqualHeight(block);
    }, 100);

    window.addEventListener('resize', () => {
      setEqualHeight(block);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating small cards block:', error);
    block.innerHTML = '<div class="error-message">Failed to load small cards block</div>';
  }

}

let noUiSliderPromisejs; let noUiSliderPromisecss; let
  noUiSliderPromisejsJquery;

function loadNoUiSliderJquery() {
  if (!noUiSliderPromisejsJquery) {
    noUiSliderPromisejsJquery = loadScript(
      '/blocks/small-cards/jquery.min.js',
    ).catch((err) => {
      console.error('Failed to load noUiSliderjs:', err);
      throw err;
    });
  }
  return noUiSliderPromisejsJquery;
}

function loadNoUiSlider() {
  if (!noUiSliderPromisejs) {
    noUiSliderPromisejs = loadScript(
      '/blocks/small-cards/features_init.js',
    ).catch((err) => {
      console.error('Failed to load noUiSliderjs:', err);
      throw err;
    });
  }
  return noUiSliderPromisejs;
}

function loadNoUiSliderCSS() {
  if (!noUiSliderPromisecss) {
    noUiSliderPromisecss = loadCSS(
      '/blocks/small-cards/features-all.css',
    ).catch((err) => {
      console.error('Failed to load noUiSlidercss:', err);
      throw err;
    });
  }
  return noUiSliderPromisecss;
}

setTimeout(() => {
  window.SingleCss = true;
  window.SingleJs = true;
  let scrollBarWidth = '0px';
  if (window.innerWidth > 1279) {
    scrollBarWidth = `${window.innerWidth - document.body.clientWidth}px`;
  }
  document.documentElement.style.setProperty('--global-scrollbar-width', scrollBarWidth);
}, 100);

// Initialize carousel functionality
/**
 * Initializes a Swiper carousel for the block.
 * @param {Element} block - The block element containing the carousel.
 * @returns {Swiper} - The initialized Swiper instance.
 */
async function initializeSwiperCarousel(block) {
  const swiperContainer = block.querySelector('.swiper');
  if (!swiperContainer) return;

  // Use modules explicitly (if using swiper modular build)
  const swiper = new window.Swiper(swiperContainer, {
    // Basic options
    slidesPerView: 'auto',
    spaceBetween: 20,
    snapToSlideEdge: true,
    watchOverflow: true,
    autoHeight: false,

    navigation: {
      nextEl: block.querySelector('.swiper-button-next'),
      prevEl: block.querySelector('.swiper-button-prev'),
    },
    pagination: {
      el: block.querySelector('.swiper-pagination'),
      clickable: false,
    },

    // Performance: consider enabling lazy loading or virtualization
    // (depending on your Swiper version)
    lazy: {
      loadPrevNext: true,
      loadPrevNextAmount: 1,
    },

    // Responsive behavior
    breakpoints: {
      768: {
        slidesPerView: 'auto',
        spaceBetween: 20,
        pagination: {
          enabled: true,
        },
      },
      1024: {
        slidesPerView: 'auto',
        spaceBetween: 20,
        allowTouchMove: true,
        navigation: {
          enabled: true,
        },
        pagination: {
          enabled: false,
        },
      },
    },
    // on: {
    //   beforeDestroy: () => {
    //     swiper.navigation.destroy();
    //     swiper.pagination.destroy();
    //   },
    //   afterInit: function() {
    //     const navContainer = this.navigation.nextEl?.parentNode;
    //     if (navContainer && this.isBeginning && this.isEnd) {
    //       navContainer.style.display = 'none';
    //     }
    //   },
    //   resize: function() {
    //     const navContainer = this.navigation.nextEl?.parentNode;
    //     if (navContainer) {
    //       // Show or hide based on whether both nav buttons are disabled
    //       navContainer.style.display = (this.isBeginning && this.isEnd) ? 'none' : '';
    //     }
    //   },
    // },
  });

  return swiper;
}
