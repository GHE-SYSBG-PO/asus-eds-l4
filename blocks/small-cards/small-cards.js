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

/**
 * Default font sizes for different product lines.
 */
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

/**
 * Default configuration for a card.
 */
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
 * Generates the style string for noise canceling animation colors.
 * @param {string} noiseWaveColor The hex color for noise wave.
 * @param {string} voiceWaveColor The hex color for voice wave.
 * @returns {string} The CSS style string.
 */
function getNoiseCancelingStyle(noiseWaveColor, voiceWaveColor) {
  let style = '';
  if (noiseWaveColor) {
    const rgb = hexToRgb(noiseWaveColor);
    if (rgb) style += `--themecolor-middle: ${rgb};`;
  }
  if (voiceWaveColor) {
    const rgb = hexToRgb(voiceWaveColor);
    if (rgb) style += `--themecolor-main: ${rgb}; --themecolor-filter: ${rgb};`;
  }
  return style;
}

/**
 * Generates the HTML for noise canceling animation.
 * @param {string} style The CSS style string.
 * @param {string} noiseCancelingAsset The asset URL for noise canceling.
 * @param {string} imageAlt The alt text for the image.
 * @returns {string} The HTML string.
 */
function getNoiseCancelingHTML(style, noiseCancelingAsset, imageAlt) {
  return `
      <div class="wditems__content wditems__content__0 theme-white" id="SectionID-tab-1" style="${style} background-color: var(--ai-noise-container-bg);">
        <div class="item__media item__media--aiNoise">
          <div class="ai__noise__container" id="conferenceS1span3__aiNoiseContainer">
            <div class="nav__replay">
                  <div class="wd__play__btn video__play__btn">
                    <button class="wd__play__btn-button is-hidden" aria-label="replay the ai noise animation" tabindex="-1" id="aiApplication_s4_noise_replay_btn" aria-hidden="true" data-eventname="undefined">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 1C27.3927 1 35 8.60729 35 18C35 27.3927 27.3927 35 18 35C8.60729 35 1 27.3927 1 18C1 8.60729 8.60729 1 18 1Z" fill="white" fill-opacity="0.75" stroke="#2F2F2F" stroke-width="2"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.1758 8.48584C18.3567 8.37745 18.5816 8.37174 18.7676 8.47119L23.042 10.7573C23.2369 10.8618 23.3584 11.0655 23.3584 11.2866C23.3582 11.5077 23.2369 11.7116 23.042 11.8159L18.7676 14.1011C18.5818 14.2004 18.3566 14.1956 18.1758 14.0874C17.9951 13.9791 17.8841 13.7833 17.8838 13.5728V12.5239C15.0283 12.8384 12.7833 15.3162 12.7832 18.3374C12.7835 22.1779 16.3986 25.1363 20.3145 23.9067C20.9766 23.6975 21.7315 23.2087 22.3965 22.5669C23.0609 21.9256 23.5831 21.1815 23.8271 20.5142C24.4052 18.936 24.3091 17.4555 23.7959 16.189L23.7949 16.187C23.5679 15.6223 23.7868 14.9662 24.3193 14.6694L24.4307 14.6147C24.9782 14.3775 25.5663 14.5994 25.873 15.0444L25.9307 15.1372L25.9619 15.1997C26.7287 17.0262 26.8693 19.1723 26.042 21.4038C25.1902 23.6897 23.3326 25.4777 21.0391 26.2026H21.0371C15.4901 27.9416 10.4007 23.7201 10.4004 18.3374C10.4005 14.0044 13.691 10.4303 17.8838 10.1021V9.00049C17.8838 8.78971 17.995 8.59427 18.1758 8.48584Z" fill="#2F2F2F" stroke-width="2"/>
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
                              <path class="svg-circle" d="M42.6,2.5c22.1,0,40,17.9,40,40s-17.9,40-40,40s-40-17.9-40-40S20.5,2.5,42.6,2.5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2px" stroke="#2f2f2f"></path>
                              <g class="svg-step svg-pause-all">
                                <path class="svg-line svg-pause" d="M50,28.2c1.1,0,2,0.9,2,2v24c0,1.1-0.9,2-2,2s-2-0.9-2-2v-24C48,29.1,48.9,28.2,50,28.2z" fill-rule="evenodd" stroke="#2f2f2f" stroke-width="2"></path>
                                <path class="svg-line svg-pause" d="M35,28.2c1.1,0,2,0.9,2,2v24c0,1.1-0.9,2-2,2s-2-0.9-2-2v-24C33,29.1,33.9,28.2,35,28.2z" fill-rule="evenodd" stroke="#2f2f2f" stroke-width="2"></path>
                              </g>
                              <g class="svg-step svg-triangle svg-play">
                                <path class="triangle" d="M55.7,41.5c0.3,0.4,0.3,1,0,1.5c-0.1,0.2-0.3,0.4-0.5,0.5L35.3,56.1c-0.2,0.1-0.5,0.2-0.7,0.2c-0.8,0-1.4-0.7-1.5-1.5v-25 c0-0.3,0.1-0.5,0.2-0.7c0.1-0.2,0.3-0.4,0.5-0.5c0.2-0.1,0.5-0.2,0.7-0.2c0.3,0,0.5,0.1,0.7,0.1L55.2,41 C55.4,41.2,55.6,41.4,55.7,41.5" stroke="#2f2f2f" stroke-width="2"></path>
                              </g>
                              <g class="svg-step svg-stop">
                                <path class="st0" d="M45.8,42.1l10.4-10.4c0.8-0.8,0.8-2.2,0-3.2c-0.8-0.8-2.2-0.8-3.2,0L42.6,38.9L32.2,28.5 c-0.8-0.8-2.2-0.8-3.2,0c-0.8,0.8-0.8,2.2,0,3.2l10.4,10.4L29,52.5c-0.8,0.8-0.8,2.2,0,3.2c0.8,0.8,2.2,0.8,3.2,0l10.4-10.4 L53,55.7c0.8,0.8,2.2,0.8,3.2,0c0.8-0.8,0.8-2.2,0-3.2L45.8,42.1z" stroke="#2f2f2f" stroke-width="2"></path>
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
                  <button class="aiNoiseSwitcher_btn img__switcher switcher_button wdga" id="Item_21_conferenceS1span3_aiNoiseSwitcher" role="switch" data-status="false" data-on="AI noise cancelation, pressed, on" data-off="AI noise cancelation, pressed, off" aria-checked="false">
                    <label class="hide" for="Item_21_conferenceS1span3_aiNoiseSwitcher">AI noise cancelation, pressed, off</label>
                  </button>
                  <audio class="noise__audio" aria-hidden="true">
                    <source src="" type="audio/mpeg">
                  </audio>
              </div>
          </div>
        </div>
      </div>`;
}

/**
 * Generates the HTML for video content.
 * @param {string} asset The video asset URL.
 * @param {boolean|string} videoAutoPlay Whether video should autoplay.
 * @param {boolean|string} loop Whether video should loop.
 * @param {boolean|string} navReplay Whether to show replay button.
 * @param {boolean|string} pauseAndPlayBtn Whether to show pause/play buttons.
 * @param {string} pausePlayBtnColor Color of the buttons.
 * @param {string} pausePlayBtnPosition Position of the buttons.
 * @returns {string} The HTML string.
 */
function getVideoHTML(asset, videoAutoPlay, loop, navReplay, pauseAndPlayBtn, pausePlayBtnColor, pausePlayBtnPosition) {
  const isVideoAutoPlay = String(videoAutoPlay).toLowerCase() === 'true';
  const isLoop = String(loop).toLowerCase() === 'true';
  const isNavReplay = String(navReplay).toLowerCase() === 'true';
  const isPauseAndPlayBtn = String(pauseAndPlayBtn).toLowerCase() === 'true';

  const initialPlayBtnDisplay = isVideoAutoPlay ? 'none' : 'flex';
  const initialPauseBtnDisplay = isVideoAutoPlay ? 'flex' : 'none';
  const btnColor = pausePlayBtnColor || 'ffffff';
  const positionClass = getButtonPositionClass(pausePlayBtnPosition);
  const controlsDisplay = isPauseAndPlayBtn ? 'flex' : 'none';

  return `
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
}

/**
 * Generates the HTML for image content.
 * @param {string} asset The image asset URL.
 * @param {string} imageAlt The alt text for the image.
 * @returns {string} The HTML string.
 */
function getImageHTML(asset, imageAlt) {
  return `
        <div class="block-img">
          <img class="img img__bg"
              src="${asset}"
              alt="${imageAlt}">
        </div>`;
}

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

  switch (mediaType) {
    case 'noise_canceling': {
      content = getNoiseCancelingHTML(getNoiseCancelingStyle(noiseWaveColor, voiceWaveColor), noiseCancelingAsset, imageAlt);
      break;
    }
    case 'video':
      content = getVideoHTML(asset, videoAutoPlay, loop, navReplay, pauseAndPlayBtn, pausePlayBtnColor, pausePlayBtnPosition);
      break;
    default:
      if (asset) {
        content = getImageHTML(asset, imageAlt);
      }
      break;
  }

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
 * Generates the HTML for the card content (title, info, CTA).
 * @param {object} data The card data.
 * @param {string} titleFont The font class for the title.
 * @returns {string} The HTML string for the card content.
 */
function getCardContentHTML(data, titleFont) {
  const {
    ctaVisible,
    ctaFontDT,
    ctaFontM,
    ctaFontColor,
    ctaLinkType,
    styleLayoutCTA,
    cardIndex,
    ctaText,
    ctaHyperlink,
    alignmentAdvanced,
    titleFontColor,
    title,
    infoFontColor,
    info,
  } = data;

  let ctaHTML = '';
  if (ctaVisible === 'show') {
    const fontClass = `${ctaFontDT} small_${ctaFontM}`;
    const style = ctaFontColor ? `style="background: none; -webkit-text-fill-color: initial; color: #${ctaFontColor}"` : 'style="background: none; -webkit-text-fill-color: initial; color: var(--link-font-color-start)"';

    if (ctaLinkType === 'button' && styleLayoutCTA) {
      ctaHTML = `<div class="btn-placeholder" data-card-index="${cardIndex || 0}"></div>`;
    } else {
      ctaHTML = `<a class="${fontClass} asus-icon-chevronright text-block-cta" 
                  aria-label="${ctaText} (opens in new window)" 
                  href="${ctaHyperlink}" target="_blank" rel="noopener noreferrer" 
                  ${style}><span>${ctaText}</span></a>`;
    }
  }

  return `
          <div class="block-content">
            <div class="wd__content" style="text-align: ${alignmentAdvanced};">
                <h3>
                  <span class="${titleFont}" style="color: ${titleFontColor ? `#${titleFontColor}` : 'var(--swiper-slide-title-color)'}">${title}</span>
                </h3>
                <div style="color: ${infoFontColor ? `#${infoFontColor}` : 'var(--swiper-slide-info-color)'};font-size:18px;">${info}</div>
                ${ctaHTML}
            </div>
          </div>`;
}

/**
 * Generates the HTML for the anchor icon.
 * @param {object} data The card data.
 * @returns {string} The HTML string for the anchor icon.
 */
function getAnchorHTML(data) {
  const {
    isAnchorVisible,
    anchorStyle,
    anchorColorDefault,
    anchorColorHover,
    anchorColorPress,
    anchorBgColorDefault,
    anchorBgColorHover,
    anchorBgColorPress,
    anchorBorderWidthDefault,
    anchorBorderWidthHover,
    anchorBorderWidthPress,
    anchorBorderColorDefault,
    anchorBorderColorHover,
    anchorBorderColorPress,
    anchorAssetDefault,
    anchorAssetHover,
    anchorAssetPress,
  } = data;

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
  return iconHTML;
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
  const blockContent = getCardContentHTML(data, titleFont);

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

  const iconHTML = getAnchorHTML(data);

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
 * Builds the small cards container.
 * @param {object} data The card data.
 * @param {object} config The alignment configuration.
 * @returns {HTMLElement} The small cards container element.
 */
function buildSmallCardsContainer(data, config) {
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
    arrowBorderWidthDefault,
    arrowBorderWidthHover,
    arrowBorderWidthPress,
    arrowBorderWidthDisable,
    arrowBorderColorDefault,
    arrowBorderColorHover,
    arrowBorderColorPress,
    arrowBorderColorDisable,
  } = config;

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
      <section>
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
  return smallCardsContainer;
}

/**
 * Processes button placeholders in the container.
 * @param {HTMLElement} container The container element.
 * @param {object|Array} data The card data.
 */
async function processButtonPlaceholders(container, data) {
  const placeholders = container.querySelectorAll('.btn-placeholder');
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
}

/**
 * Adds event listeners for video controls.
 * @param {HTMLElement} container The container element.
 */
function addVideoEventListeners(container) {
  const videoContainers = container.querySelectorAll('.media-block-video-container');
  videoContainers.forEach((videoContainer) => {
    const video = videoContainer.querySelector('video');
    const playBtn = videoContainer.querySelector('.media-block-play-btn');
    const pauseBtn = videoContainer.querySelector('.media-block-pause-btn');
    const replayBtn = videoContainer.querySelector('.media-block-replay-btn');
    const controlsDiv = videoContainer.querySelector('.media-block-controls');
    const pauseAndPlayBtn = videoContainer.getAttribute('data-pause-and-play-btn') === 'true';

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
}

/**
 * Finalizes the block structure by adding styles and appending the container.
 * @param {HTMLElement} block The block element.
 * @param {HTMLElement} smallCardsContainer The container element.
 * @param {object|Array} data The card data.
 * @param {object} config The alignment configuration.
 */
function finalizeBlockStructure(block, smallCardsContainer, data, config) {
  const slideCount = Array.isArray(data) ? data.length : 1;

  const style = document.createElement('style');
  style.textContent = `
    @media (min-width: 768px) {
      .small-cards-containers .swiper-wrapper {
        justify-content: ${slideCount <= 2 && config.tabletAlignment === 'center' ? 'center' : 'flex-start'};
      }
    }
    @media (min-width: 1025px) {
      .small-cards-containers .swiper-wrapper {
        justify-content: ${slideCount <= 3 && config.desktopAlignment === 'center' ? 'center' : 'flex-start'};
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
 * Renders the cards in the block.
 * @param {HTMLElement} block The block element.
 */
async function renderCard(block) {

  const data = await fillSequentialConfig(block);

  console.log('Extracted chunk, Final Card Data:', data);

  const smallCardsContainer = buildSmallCardsContainer(data, alignmentConfig);

  await processButtonPlaceholders(smallCardsContainer, data);

  addVideoEventListeners(smallCardsContainer);

  finalizeBlockStructure(block, smallCardsContainer, data, alignmentConfig);
}

/**
 * Decorates the block.
 * @param {HTMLElement} block The block element.
 */
export default async function decorate(block) {

  try {
    await loadSwiper();
    await loadAnimationFun();
    await loadGsapFun();
    await loadScrollTriggerFun();
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }
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

    initScrollAnimations(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating small cards block:', error);
  }
}

let loadFeature; let loadAnimation;
let loadGsapJS; let loadScrollTriggerJS;

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
 * Loads the GSAP library.
 * @returns {Promise} A promise that resolves when the script is loaded.
 */
function loadGsapFun() {
  if (!loadGsapJS) {
    loadGsapJS = loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    ).catch((err) => {
      console.error('Failed to load GSAP JS:', err);
      throw err;
    });
  }
  return loadGsapJS;
}

/**
 * Loads the GSAP ScrollTrigger plugin.
 * @returns {Promise} A promise that resolves when the script is loaded.
 */
function loadScrollTriggerFun() {
  if (!loadScrollTriggerJS) {
    loadScrollTriggerJS = loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
    ).catch((err) => {
      console.error('Failed to load GSAP ScrollTrigger JS:', err);
      throw err;
    });
  }
  return loadScrollTriggerJS;
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
  });

  return swiper;
}

/**
 * Initializes transition for a single item.
 * @param {number} index Index of the item.
 * @param {HTMLElement} element The DOM element.
 */
function initItemTransition(index, element) {
  // Initial state
  window.gsap.set(element, { y: 50, opacity: 0 });

  const tl = window.gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      end: '+=300',
      scrub: 1,
    },
  });

  tl.to(element, {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: 'expo.out',
  });
}

/**
 * Handles overall scroll animation for a container.
 * @param {jQuery} $container The container element.
 */
function handleOverallScroll($container) {
  const items = $container.find('.block__scroll-item');

  // Initial state
  window.gsap.set(items, { y: 50, opacity: 0 });

  const tl = window.gsap.timeline({
    scrollTrigger: {
      trigger: $container[0],
      start: 'top 90%',
      end: 'center 50%',
      toggleActions: 'play reverse play reverse',
    },
  });

  tl.to(items, {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: 'expo.out',
  });
}

/**
 * Handles individual scroll animation for a container.
 * @param {jQuery} $container The container element.
 */
function handleIndividualScroll($container) {
  const $items = $container.find('.block__scroll-item');

  $items.each(function initItem(index) {
    initItemTransition(index, this);
  });
}

/**
 * Initializes scroll animations for block items.
 * @param {HTMLElement} block The block element.
 */
function initScrollAnimations(block) {
  const $ = window.jQuery;
  if (!$) return;

  const $block = $(block);
  const $scrollBlocks = $block.find('.outer-view .block__scroll');

  $scrollBlocks.each(function () {
    const $container = $(this);
    const scrollType = $container.attr('data-scrolltype') || 'eachone';

    if (scrollType === 'overall') {
      handleOverallScroll($container);
    } else {
      handleIndividualScroll($container);
    }
  });
}
