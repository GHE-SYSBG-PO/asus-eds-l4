/* eslint-disable no-lonely-if, no-plusplus, max-len, no-unused-vars, quotes, no-multiple-empty-lines, no-use-before-define, no-console, padded-blocks */

import MediaCarousel from './mediaCarousel.js';
import {
  loadScript, loadCSS, loadBlock, buildBlock, decorateBlock,
} from '../../scripts/aem.js';
import {
  loadSwiper,
} from '../../scripts/scripts.js';
import {
  getBlockFieldOrder,
} from '../../scripts/utils.js';

const LAYOUT_CONFIG_COUNT = 22;

const alignmentConfig = {
  desktopAlignment: 'center',
  tabletAlignment: 'center',
  mobileAlignment: 'center',

  // Swiper Arrow (Previous / Next)
  arrowStyle: '',
  arrowContainerBgColorDefault: '',
  arrowContainerBgColorHover: '',
  arrowContainerBgColorPress: '',
  arrowContainerBgColorDisable: '',
  arrowColorDefault: '',
  arrowColorHover: '',
  arrowColorPress: '',
  arrowColorDisable: '',
  arrowAssetDefault: '',
  arrowAssetHover: '',
  arrowAssetDisable: '',

  // Swiper Arrow (Previous / Next)
  arrowBorderWidthDefault: '0',
  arrowBorderWidthHover: '0',
  arrowBorderWidthPress: '0',
  arrowBorderWidthDisable: '0',
  arrowBorderColorDefault: '',
  arrowBorderColorHover: '',
  arrowBorderColorPress: '',
  arrowBorderColorDisable: '',
};

const PRODUCT_DEFAULTS = {
  asus: {
    titleFontD: 'tt-md-32',
    titleFontT: 'tt-md-28',
    titleFontM: 'tt-md-24',
  },
  proart: {
    titleFontD: 'tt-md-32',
    titleFontT: 'tt-md-28',
    titleFontM: 'tt-md-24',
  },
  rog: {
    titleFontD: 'tt-md-32',
    titleFontT: 'tt-md-28',
    titleFontM: 'tt-md-24',
  },
  tuf: {
    titleFontD: 'tt-md-32',
    titleFontT: 'tt-md-28',
    titleFontM: 'tt-md-24',
  },
};

const DEFAULT_CONFIG = {

  //  Base Tab
  cardType: 'img_txt_integrated_top',
  mediaType: 'image',
  imageAlt: 'ASUS Official Site',

  videoAutoPlay: false,
  loop: false,
  navReplay: false,
  pauseAndPlayBtn: false,
  pausePlayBtnColor: '2F2F2F',
  pausePlayBtnPosition: 'top-left',

  // Cards (Noise)
  noiseCancelingAsset: '',
  noiseWaveColor: 'b6c4d5',
  voiceWaveColor: '5a7ca9',

  // Cards (Image / Video)
  assets: '',

  // Cards
  bgColor: '',
  title: '',
  info: '',
  ctaVisible: 'hide',
  ctaText: 'Learn More',
  ctaLinkType: 'button',

  styleLayoutCTA: '1',
  linkTypeCTA: '',
  externalLinkCTA: '',
  innerPageLinkCTA: '',
  gBtnStyleCTA: '',
  // gBtnCustomizedCTA: '',
  gBtnLabelCTA: '',
  gBtnFontDesktopCTA: '',
  gBtnFontMCTA: '',
  gBtnFontColorDefaultCTA: '',
  gBtnFontColorHoverCTA: '',
  gBtnFontColorActiveCTA: '',
  gBtnContainerBgColorDefaultCTA: '',
  gBtnContainerBgColorHoverCTA: '',
  gBtnContainerBgColorActiveCTA: '',
  gBtnContainerRadiusTLCTA: '',
  gBtnContainerRadiusTRCTA: '',
  gBtnContainerRadiusBRCTA: '',
  gBtnContainerRadiusBLCTA: '',
  gBtnBorderWidthCTA: '',
  gBtnBorderColorCTA: '',

  iconStyleCTA: '',
  iconColorCTA: '',
  iconBgColorDefaultCTA: '',
  iconBgColorHoverCTA: '',
  iconBgColorActiveCTA: '',
  iconAssetDefaultCTA: '',
  iconAssetHoverCTA: '',
  iconAssetActiveCTA: '',
  labelCTA: '',
  // labelAdvancedCTA: '',
  fontDesktopCTA: '',
  fontMCTA: '',
  fontColorDefaultCTA: '',
  fontColorHoverCTA: '',
  fontColorActiveCTA: '',
  containerBgColorDefaultCTA: '',
  containerBgColorHoverCTA: '',
  containerBgColorActiveCTA: '',
  containerRadiusTLCTA: '',
  containerRadiusTRCTA: '',
  containerRadiusBRCTA: '',
  containerRadiusBLCTA: '',
  // containerAdvancedCTA: '',
  borderWidthCTA: '',
  borderColorCTA: '',






  // Anchor (Down arrow on cards)
  isAnchorVisible: 'false',
  sectionID: '#',
  anchorStyle: 'SVG',
  anchorColorDefault: '',
  anchorColorHover: '',
  anchorColorPress: '',
  anchorBgColorDefault: '',
  anchorBgColorHover: '',
  anchorBgColorPress: '',
  anchorAssetDefault: '',
  anchorAssetHover: '',
  anchorAssetPress: '',

  // Advanced Tab

  // Cards Title
  titleFontD: '',
  titleFontT: '',
  titleFontM: '',
  titleFontColor: '',

  // Cards Info
  infoFontColor: '',

  // Cards Border
  borderColor: '',
  borderWidth: '',

  // Cards Border Radius
  borderRadiusTopLeft: 'rounded-tl-lg',
  borderRadiusTopRight: 'rounded-tl-lg',
  borderRadiusBottomRight: 'rounded-tl-lg',
  borderRadiusBottomLeft: 'rounded-tl-lg',

  // CTA Link
  ctaFontDT: 'ro-md-20-md',
  ctaFontM: 'ro-md-18',
  ctaFontColor: '',
  ctaHyperlink: '',

  alignmentAdvanced: 'left',

  // Anchor (Down arrow on cards)
  anchorBorderWidthDefault: '1',
  anchorBorderWidthHover: '1',
  anchorBorderWidthPress: '1',
  anchorBorderColorDefault: '',
  anchorBorderColorHover: '',
  anchorBorderColorPress: '',
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

/**
 * Fills the sequential configuration from the block.
 * @param {HTMLElement} block The block element.
 * @returns {Promise<Array>} An array of configuration objects.
 */
async function fillSequentialConfig(block) {
  const product = block.closest('.l4-pdp')?.dataset.product || 'asus';
  const productDefaults = PRODUCT_DEFAULTS[product] || PRODUCT_DEFAULTS.asus;
  const finalDefaultConfig = { ...DEFAULT_CONFIG, ...productDefaults };
  const cfg = { ...finalDefaultConfig };
  const flatValues = [];
  const fieldGroups = Array.from(block.querySelectorAll(':scope > div'));
  const alignmentKeys = Object.keys(alignmentConfig);

  fieldGroups.forEach((group, index) => {
    if (index <= LAYOUT_CONFIG_COUNT) {
      const value = extractValue(group);
      alignmentConfig[alignmentKeys[index]] = value || alignmentConfig[alignmentKeys[index]];
      return;
    }

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
    const chunkCfg = { ...finalDefaultConfig };

    console.log("Extracted chunk:", chunk);

    keys.forEach((key, index) => {
      if (chunk[index] !== undefined) {
        chunkCfg[key] = chunk[index] || finalDefaultConfig[key];
      }
    });
    configArray.push(chunkCfg);
  }
  return configArray;
}

/**
 * Converts a hex color code to an RGB string.
 * @param {string} hex The hex color code.
 * @returns {string} The RGB string (e.g., "255, 255, 255").
 */
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

/**
 * Generates the HTML for the media content (image, video, or noise canceling animation).
 * @param {object} data The card data.
 * @returns {string} The HTML string for the media content.
 */
function getMediaHTML(data) {
  const {
    mediaType, imageAlt, videoAutoPlay, loop, navReplay, title, noiseWaveColor, voiceWaveColor, noiseCancelingAsset,
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
            <div class="ai__noise__container" id="conferenceS1span3__aiNoiseContainer" style="${style} background-color: var(--ai-noise-container-bg);">
            
        
        <div class="item__media item__media--aiNoise">
          <div class="ai__noise__container" id="conferenceS1span3__aiNoiseContainer">
            
            <div class="nav__replay">
              <div class="wd__play__btn video__play__btn">

                <button class="wd__play__btn-button is-hidden" aria-label="replay the ai noise animation" tabindex="-1" id="aiApplication_s4_noise_replay_btn" aria-hidden="true" data-eventname="undefined">
                  <svg class="svg-step svg_button_replay" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.63 30.88" aria-hidden="true">
                    <path class="cls-1" d="m15.44,28.37c-7.13,0-12.94-5.8-12.94-12.94S8.3,2.5,15.44,2.5c3.52,0,6.86,1.45,9.29,3.97l-2.73,2.29,8.63,3.25-1.71-9.06-2.27,1.91C23.73,1.77,19.7,0,15.44,0,6.92,0,0,6.92,0,15.44s6.92,15.44,15.44,15.44c7.3,0,13.66-5.18,15.12-12.33l-2.45-.5c-1.22,5.98-6.55,10.33-12.67,10.33h0Z">
                      </path></svg><div class="img__icon" aria-hidden="true"></div>
                </button>
                                
              </div>
            </div>
            <div class="nav__noise">
              <div class="wdga nav__item nav__1" data-index="1" data-status="off" data-gaid="noiseCancelBtn1" role="button" tabindex="0" aria-label="Play the simulated home sounds without noise cancelation.">
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

            <div class="noise__voice__container" role="img" aria-label="(Baby crying and dog barking) Flip the switch below this test recording to enable or disable the ASUS AI Noise Canceling Technology and experience its power and accuracy for yourself.">
              <figure class="img img__noise grace-show  show animated" role="presentation" aria-hidden="true">
                <div class="img__voice">
                  <svg viewBox="0 0 324 324" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                    <linearGradient gradientUnits="userSpaceOnUse" x1="50.33" x2="273.67" y1="50.33" y2="273.67" id="Item_1_conferenceS1span3_aiNoiseSwitcher_gradient_a_1">
                      <stop offset="0" stop-color="var(--voice-start)"></stop>
                      <stop offset="1" stop-color="var(--voice-end)"></stop>
                    </linearGradient>
                    <linearGradient id="Item_1_conferenceS1span3_aiNoiseSwitcher_gradient_b_1" x1="108.23" x2="215.77" href="#Item_1_conferenceS1span3_aiNoiseSwitcher_gradient_a_1" y1="88.2" y2="195.75"></linearGradient>
                    <linearGradient id="Item_1_conferenceS1span3_aiNoiseSwitcher_gradient_c_1" x1="110.96" x2="213.04" href="#Item_1_conferenceS1span3_aiNoiseSwitcher_gradient_a_1" y1="132.72" y2="234.79"></linearGradient>
                    <path d="M162 320C74.88 320 4 249.12 4 162S74.88 4 162 4s158 70.88 158 158-70.88 158-158 158z" fill="var(--voice-bgcolor)"></path>
                    <path d="M162 320C74.88 320 4 249.12 4 162S74.88 4 162 4s158 70.88 158 158-70.88 158-158 158zm0-307C79.82 13 13 79.82 13 162s66.82 149 149 149 149-66.86 149-149S244.18 13 162 13z" fill="url(#Item_1_conferenceS1span3_aiNoiseSwitcher_gradient_a_1)"></path>
                    <path d="M162 233.67a38.37 38.37 0 0 1-38.33-38.32V88.6a38.33 38.33 0 0 1 76.66 0v106.75A38.37 38.37 0 0 1 162 233.67zm0-174.43a29.39 29.39 0 0 0-29.36 29.36v106.75a29.36 29.36 0 1 0 58.72 0V88.6A29.39 29.39 0 0 0 162 59.24z" fill="url(#Item_1_conferenceS1span3_aiNoiseSwitcher_gradient_b_1)"></path>
                    <path d="M211.39 132.74a4 4 0 0 0-4 4v58.14a45.35 45.35 0 0 1-90.7 0v-58.11a4 4 0 0 0-8.07 0v58.14a53.48 53.48 0 0 0 48 53.14v32.4h10.76v-32.4a53.48 53.48 0 0 0 48-53.14v-58.14a4 4 0 0 0-3.99-4.03z" fill="url(#Item_1_conferenceS1span3_aiNoiseSwitcher_gradient_c_1)"></path>
                    <path d="M0 0h324v324H0z" fill="none"></path>
                  </svg>
                </div>
                <canvas class="noise__left" width="800" height="400"></canvas>
                <canvas class="noise__right" width="800" height="400"></canvas>
              </figure>
            </div>
            <div class="noise__switcher" aria-hidden="true">
              <button class="aiNoiseSwitcher_btn img__switcher switcher_button wdga" id="Item_1_conferenceS1span3_aiNoiseSwitcher" role="switch" data-status="false" data-on="AI noise cancelation, pressed, on" data-off="AI noise cancelation, pressed, off" aria-checked="false" tabindex="0">
                <label class="hide" for="Item_1_conferenceS1span3_aiNoiseSwitcher">AI noise cancelation, pressed, off</label>
              </button>
              <audio class="noise__audio" aria-hidden="true">
              </audio>
            </div>
          </div>
        </div>
      </div>`;
  } else if (mediaType === 'video') {
    const isVideoAutoPlay = String(videoAutoPlay).toLowerCase() === 'true';
    const isLoop = String(loop).toLowerCase() === 'true';
    const isNavReplay = String(navReplay).toLowerCase() === 'true';
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
            ${!isLoop && isNavReplay ? `<button class="media-block-replay-btn absolute ${positionClass} z-10 rounded-full flex items-center justify-center transition-all" aria-label="Replay" style="display: none; border: 1px solid #${btnColor};"><svg viewBox="0 0 36 36" fill="#${btnColor}"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="translate(6,6)"/></svg></button>` : ''}
          </div>`;
  } else {
    if (asset) {
      content = `
        <div class="block-img">
          <img class="img img__bg"
              src="${asset}"
              alt="${imageAlt}">
        </div>`;
    }
  }

  console.log("H1, Generated media HTML:", title, asset, data);
  return content;
}

/**
 * Retrieves a value from the data object based on the current device.
 * @param {string} fieldName The base field name.
 * @param {object} data The data object.
 * @returns {string} The value for the current device.
 */
function getValueForDevice(fieldName, data) {
  const device = getDevice();
  return data[`${fieldName}${device}`] || '';
}

/**
 * Generates the HTML for a single card.
 * @param {object} data The card data.
 * @returns {string} The HTML string for the card.
 */
function getCardHTML(data) {
  const {
    cardType,
    bgColor,
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
    isAnchorVisible,
    sectionID,
    anchorStyle,
    anchorColorDefault,
    anchorColorHover,
    anchorColorPress,
    anchorBgColorDefault,
    anchorBgColorHover,
    anchorBgColorPress,
    anchorAssetDefault,
    anchorAssetHover,
    anchorAssetPress,
    ctaFontDT,
    ctaFontM,
    ctaFontColor,
    borderRadiusTopLeft,
    borderRadiusTopRight,
    borderRadiusBottomLeft,
    borderRadiusBottomRight,
    alignmentAdvanced,
    anchorBorderWidthDefault,
    anchorBorderWidthHover,
    anchorBorderWidthPress,
    anchorBorderColorDefault,
    anchorBorderColorHover,
    anchorBorderColorPress,
    gBtnLabel,
    gBtnFontDesktop,
    gBtnFontM,
    gBtnFontColorDefault,
    gBtnFontColorHover,
    gBtnFontColorActive,
    gBtnContainerBgColorDefault,
    gBtnContainerBgColorHover,
    gBtnContainerBgColorActive,
    gBtnContainerRadiusTL,
    gBtnContainerRadiusTR,
    gBtnContainerRadiusBR,
    gBtnContainerRadiusBL,
    gBtnBorderWidth,
    gBtnBorderColor,
  } = data;

  const titleFont = getValueForDevice('titleFont', data);
  let ctaHTML = '';
  if (ctaVisible === 'show') {
    const fontClass = `${ctaFontDT} small_${ctaFontM}`;
    const style = ctaFontColor ? `style="background: none; -webkit-text-fill-color: initial; color: #${ctaFontColor}"` : 'style="background: none; -webkit-text-fill-color: initial; color: var(--link-font-color-start)"';

    if (ctaLinkType === 'button' && data.styleLayoutCTA) {
      ctaHTML = `<div class="btn-placeholder" data-card-index="${data.cardIndex || 0}"></div>`;
    } else {
      ctaHTML = `<a class="${fontClass} asus-icon-chevronright text-block-cta" 
                  aria-label="${ctaText} (opens in new window)" 
                  href="${ctaHyperlink}" target="_blank" rel="noopener noreferrer" 
                  ${style}><span>${ctaText}</span></a>`;
    }
  }

  const blockContent = `
          <div class="block-content">
            <div class="wd__content" style="text-align: ${alignmentAdvanced};">
                <h3>
                  <span class="${titleFont}" style="color: ${titleFontColor ? `#${titleFontColor}` : 'var(--swiper-slide-title-color)'}">${title}</span>
                </h3>
                <div style="color: ${infoFontColor ? `#${infoFontColor}` : 'var(--swiper-slide-info-color)'};font-size:18px;">${info}</div>
                ${ctaHTML}
            </div>
          </div>`;

  /**
   * Generates the styled block content HTML.
   * @param {string} style The inline style string.
   * @returns {string} The HTML string for the block content.
   */
  const getStyledBlockContent = (style) => {
    if (!style) return blockContent;
    return blockContent.replace('class="block-content"', `class="block-content" style="${style}"`);
  };

  let flexDirection = '';
  let cardBlockType = 'img_txt_integrated_top';
  const contentStyle = '';
  let showMedia = true;

  switch (cardType) {
    case 'img_txt_integrated_bottom':
      flexDirection = 'column-reverse';
      cardBlockType = 'img_txt_integrated_bottom';
      break;
    case 'img_txt_separate_bottom':
      flexDirection = 'column-reverse';
      cardBlockType = 'img_txt_separate_bottom';
      break;
    case 'text_only':
      showMedia = false;
      cardBlockType = 'text_only';
      break;
    case 'txt_img_attached_top':
      cardBlockType = 'txt_img_attached_top';
      break;
    case 'txt_img_attached_bottom':
      flexDirection = 'column-reverse';
      cardBlockType = 'txt_img_attached_bottom';
      break;
    case 'img_txt_integrated_top':
    default:
      break;
  }

  const mediaHTML = showMedia ? getMediaHTML(data) : '';
  const containerStyle = `transform: translateY(0px); opacity: 1; display: flex; flex-direction: ${flexDirection}; height: auto; position: relative; overflow: hidden;`;

  let iconHTML = '';
  if (isAnchorVisible === 'true') {
    let anchorStyleVars = '';
    if (anchorStyle === 'svg') {
      if (anchorColorDefault) anchorStyleVars += anchorColorDefault ? `--anchor-color-default: #${anchorColorDefault};` : '';
      if (anchorColorHover) anchorStyleVars += anchorColorHover ? `--anchor-color-hover: #${anchorColorHover};` : '';
      if (anchorColorPress) anchorStyleVars += anchorColorPress ? `--anchor-color-press: #${anchorColorPress};` : '';
      if (anchorBgColorDefault) anchorStyleVars += anchorBgColorDefault ? `--anchor-bg-default: #${anchorBgColorDefault};` : '';
      if (anchorBgColorHover) anchorStyleVars += anchorBgColorHover ? `--anchor-bg-hover: #${anchorBgColorHover};` : '';
      if (anchorBgColorPress) anchorStyleVars += anchorBgColorPress ? `--anchor-bg-press: #${anchorBgColorPress};` : '';
      if (anchorBorderWidthDefault) anchorStyleVars += anchorBorderWidthDefault ? `--anchor-border-width-default: ${anchorBorderWidthDefault}px;` : '';
      if (anchorBorderWidthHover) anchorStyleVars += anchorBorderWidthHover ? `--anchor-border-width-hover: ${anchorBorderWidthHover}px;` : '';
      if (anchorBorderWidthPress) anchorStyleVars += anchorBorderWidthPress ? `--anchor-border-width-press: ${anchorBorderWidthPress}px;` : '';
      if (anchorBorderColorDefault) anchorStyleVars += anchorBorderColorDefault ? `--anchor-border-color-default: #${anchorBorderColorDefault};` : '';
      if (anchorBorderColorHover) anchorStyleVars += anchorBorderColorHover ? `--anchor-border-color-hover: #${anchorBorderColorHover};` : '';
      if (anchorBorderColorPress) anchorStyleVars += anchorBorderColorPress ? `--anchor-border-color-press: #${anchorBorderColorPress};` : '';

      iconHTML = `
        <div class="card-icon-down anchor-svg" style="${anchorStyleVars}">
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
      `;
    } else if (anchorStyle === 'png') {
      iconHTML = `
        <div class="card-icon-down anchor-png">
            <img src="${anchorAssetDefault}" alt="anchor" class="anchor-default"/>
            ${anchorAssetHover ? `<img src="${anchorAssetHover}" alt="anchor hover" class="anchor-hover"/>` : ''}
            ${anchorAssetPress ? `<img src="${anchorAssetPress}" alt="anchor press" class="anchor-press"/>` : ''}
        </div>
      `;
    } else {
      // Fallback to default SVG style if no style is selected or matched
      iconHTML = `
        <div class="card-icon-down">
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
      `;
    }
  }

  const borderStyle = borderWidth ? `${borderWidth}px solid #${borderColor}` : 'var(--swiper-slide-border-width) solid var(--swiper-slide-border-color)';

  return `
      <div class="block block__scroll-item block-1 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide ${borderRadiusTopLeft} ${borderRadiusTopRight} ${borderRadiusBottomRight} ${borderRadiusBottomLeft} ${cardBlockType}" 
           data-blocktype="aiNoise" 
           style="${containerStyle}; 
           border: ${borderStyle};
           background-color: ${bgColor ? `#${bgColor}` : (cardType === 'img_txt_separate_bottom' ? 'transparent' : 'var(--swiper-slide-bg-color)')};" 
           easing="easeOutExpo">
          ${getStyledBlockContent(contentStyle)}
          ${mediaHTML}
          ${isAnchorVisible === 'true' ? iconHTML : ''}
      </div>`;
}

/**
 * Sets equal height for all slides in the block.
 * @param {HTMLElement} block The block element.
 */
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

/**
 * Renders the cards in the block.
 * @param {HTMLElement} block The block element.
 */
async function renderCard(block) {

  const data = await fillSequentialConfig(block);

  console.log('Extracted chunk, Final Card Data:', data);

  const {
    arrowStyle,
    arrowContainerBgColorDefault,
    arrowContainerBgColorHover,
    arrowContainerBgColorPress,
    arrowContainerBgColorDisable,
    arrowColorDefault,
    arrowColorHover,
    arrowColorPress,
    arrowColorDisable,
    arrowAssetDefault,
    arrowAssetHover,
    arrowAssetDisable,
    arrowBorderWidthDefault,
    arrowBorderWidthHover,
    arrowBorderWidthPress,
    arrowBorderWidthDisable,
    arrowBorderColorDefault,
    arrowBorderColorHover,
    arrowBorderColorPress,
    arrowBorderColorDisable,
  } = alignmentConfig;

  let arrowStyleVars = '';
  if (arrowStyle === 'svg') {
    if (arrowContainerBgColorDefault) arrowStyleVars += `--arrow-container-bg-default: #${arrowContainerBgColorDefault};`;
    if (arrowContainerBgColorHover) arrowStyleVars += `--arrow-container-bg-hover: #${arrowContainerBgColorHover};`;
    if (arrowContainerBgColorPress) arrowStyleVars += `--arrow-container-bg-press: #${arrowContainerBgColorPress};`;
    if (arrowContainerBgColorDisable) arrowStyleVars += `--arrow-container-bg-disable: #${arrowContainerBgColorDisable};`;

    if (arrowColorDefault) arrowStyleVars += `--arrow-color-default: #${arrowColorDefault};`;
    if (arrowColorHover) arrowStyleVars += `--arrow-color-hover: #${arrowColorHover};`;
    if (arrowColorPress) arrowStyleVars += `--arrow-color-press: #${arrowColorPress};`;
    if (arrowColorDisable) arrowStyleVars += `--arrow-color-disable: #${arrowColorDisable};`;

    if (arrowBorderWidthDefault) arrowStyleVars += `--arrow-border-width-default: ${arrowBorderWidthDefault}px;`;
    if (arrowBorderWidthHover) arrowStyleVars += `--arrow-border-width-hover: ${arrowBorderWidthHover}px;`;
    if (arrowBorderWidthPress) arrowStyleVars += `--arrow-border-width-press: ${arrowBorderWidthPress}px;`;
    if (arrowBorderWidthDisable) arrowStyleVars += `--arrow-border-width-disable: ${arrowBorderWidthDisable}px;`;

    if (arrowBorderColorDefault) arrowStyleVars += `--arrow-border-color-default: #${arrowBorderColorDefault};`;
    if (arrowBorderColorHover) arrowStyleVars += `--arrow-border-color-hover: #${arrowBorderColorHover};`;
    if (arrowBorderColorPress) arrowStyleVars += `--arrow-border-color-press: #${arrowBorderColorPress};`;
    if (arrowBorderColorDisable) arrowStyleVars += `--arrow-border-color-disable: #${arrowBorderColorDisable};`;
  }

  const smallCardsContainer = document.createElement('div');
  smallCardsContainer.className = 'small-cards-containers';
  if (arrowStyleVars) {
    smallCardsContainer.style.cssText = arrowStyleVars;
  }

  const cardHTML = Array.isArray(data)
    ? data.map((item, index) => getCardHTML({ ...item, cardIndex: index })).join('')
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
                            <div class="swiper-wrapper" style="background-color: ${'var(--swiper-wrapper-bg-color)'};">
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

  const placeholders = smallCardsContainer.querySelectorAll('.btn-placeholder');
  if (placeholders.length > 0) {
    const btnFieldOrder = await getBlockFieldOrder('btn');

    // eslint-disable-next-line no-restricted-syntax
    for (const placeholder of placeholders) {
      const cardIndex = parseInt(placeholder.dataset.cardIndex, 10);
      const cardData = Array.isArray(data) ? data[cardIndex] : data;

      if (cardData) {
        const btnContent = [];
        btnFieldOrder.forEach((fieldName) => {
          const cardFieldName = `${fieldName}CTA`;
          const value = cardData[cardFieldName];
          btnContent.push([value !== undefined && value !== null ? String(value) : '']);
        });

        const btnBlock = buildBlock('btn', btnContent);
        placeholder.replaceWith(btnBlock);
        decorateBlock(btnBlock);
        // eslint-disable-next-line no-await-in-loop
        await loadBlock(btnBlock);
      }
    }
  }

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

  const slideCount = Array.isArray(data) ? data.length : 1;

  const style = document.createElement('style');
  style.textContent = `
    @media (min-width: 768px) {
      .small-cards-containers .swiper-wrapper {
        justify-content: ${slideCount <= 2 && alignmentConfig.tabletAlignment === 'center' ? 'center' : 'flex-start'};
      }
    }
    @media (min-width: 1025px) {
      .small-cards-containers .swiper-wrapper {
        justify-content: ${slideCount <= 3 && alignmentConfig.desktopAlignment === 'center' ? 'center' : 'flex-start'};
      }
    }
  `;

  if (slideCount <= 3) {
    style.textContent += `
      @media (width > 1024px) {
        .small-cards-containers .swiper-button-prev,
        .small-cards-containers .swiper-button-next {
          display: none !important;
        }
      }
    `;
  }
  if (slideCount <= 2) {
    style.textContent += `
      @media (width >= 768px) and (width <= 1024px) {
        .small-cards-containers .swiper-button-prev,
        .small-cards-containers .swiper-button-next {
          display: none !important;
        }
      }
    `;
  }
  if (slideCount <= 1) {
    style.textContent += `
      @media (max-width: 767px) {
        .small-cards-containers .swiper-button-prev,
        .small-cards-containers .swiper-button-next {
          display: none !important;
        }
      }
    `;
  }

  smallCardsContainer.appendChild(style);

  block.appendChild(smallCardsContainer);

  Array.from(block.children).forEach((child) => {
    if (child !== smallCardsContainer) {
      child.style.display = 'none';
      Array.from(child.children).forEach((grandchild) => grandchild.remove());
    }
  });
}

/**
 * Decorates the block.
 * @param {HTMLElement} block The block element.
 */
export default async function decorate(block) {

  try {
    await loadSwiper();
    await loadFeatureCSS();
    await loadAnimationFun();
    await loadGsapFun();
    await renderCard(block); // Html structure and content
    await initializeSwiperCarousel(block);

    const instance = new MediaCarousel();
    instance.init();

    setTimeout(async () => {

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

let loadFeature; let
  loadAnimation; let loadGsapJS;

/**
 * Loads the noUiSlider jQuery plugin.
 * @returns {Promise} A promise that resolves when the script is loaded.
 */
function loadAnimationFun() {
  if (!loadAnimation) {
    loadAnimation = loadScript(
      'https://code.jquery.com/jquery-3.7.1.min.js',
    ).catch((err) => {
      console.error('Failed to load animation:', err);
      throw err;
    });
  }
  return loadAnimation;
}

/**
 * Loads the noUiSlider library.
 * @returns {Promise} A promise that resolves when the script is loaded.
 */
function loadGsapFun() {
  if (!loadGsapJS) {
    loadGsapJS = loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    ).catch((err) => {
      console.error('Failed to load Feature JS:', err);
      throw err;
    });
  }
  return loadGsapJS;
}

/**
 * Loads the noUiSlider CSS.
 * @returns {Promise} A promise that resolves when the CSS is loaded.
 */
function loadFeatureCSS() {
  if (!loadFeature) {
    loadFeature = loadCSS(
      '/blocks/small-cards/features-all.css',
    ).catch((err) => {
      console.error('Failed to load Feature CSS:', err);
      throw err;
    });
  }
  return loadFeature;
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
