/* eslint-disable no-plusplus, max-len, no-unused-vars, quotes, no-multiple-empty-lines, no-use-before-define, no-console, padded-blocks */

import { loadScript, loadCSS } from '../../scripts/aem.js';
import { loadSwiper } from '../../scripts/scripts.js';
// import { getBlockConfigs, getFieldValue, handleDecide } from '../../scripts/utils.js';

const DEFAULT_CONFIG = {
  // Layout Tab
  desktopAlignment: 'center',
  tabletAlignment: 'center',
  mobileAlignment: 'center',

  //  Base Tab
  cardType: '',
  mediaType: '',
  radius: '',
  imageAlt: '',

  videoAutoPlay: 'off',
  loop: 'off',
  pauseAndPlayBtn: 'hide',
  pausePlayBtnColor: '',
  pausePlayBtnPosition: 'BL',

  noiseCancelingAsset: '',
  noiseWaveColor: '',
  voiceWaveColor: '',
  assetsD: '',

  widthD: '',
  widthValueD: 'auto',
  heightD: '',
  heightValueD: 'auto',
  ratioD: '',
  ratioValueCustomizedD: '',
  objectPositionD: 'left',
  assetsT: '',
  widthT: '',
  widthValueT: 'auto',
  heightT: '',
  heightValueT: 'auto',
  ratioT: '',
  ratioValueCustomizedT: '',
  objectPositionT: 'left',
  assetsM: '',
  widthM: '',
  widthValueM: 'auto',
  heightM: '',
  heightValueM: 'auto',
  ratioM: '',
  ratioValueCustomizedM: '',
  objectPositionM: 'left',

  title: '',
  info: '',
  ctaVisible: 'show',
  ctaText: '',
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
  borderRadiusBottomLeft: '',
  borderRadiusBottomRight: '',

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
  mediaWidthD: '',
  mediaWidthT: '',
  mediaWidthM: '',
  alignmentAdvanced: 'left',

};

/**
 * Reads configuration from the block's DOM structure.
 * @param {HTMLElement} block The block element.
 * @returns {object} A configuration object.
 */
function extractText(div) {
  // Extract from <p> if present, else direct text
  const p = div.querySelector('p');
  return p ? p.textContent.trim() : div.textContent.trim();
}

function fillSequentialConfig(block) {
  // Clone so original defaults remain unchanged
  const cfg = { ...DEFAULT_CONFIG };

  // Get only the <div> groups representing card field sequences
  const fieldGroups = Array.from(block.querySelectorAll(':scope > div'));

  // Flatten all the child div text values in exact order
  const flatValues = [];
  fieldGroups.forEach((group) => {
    const children = Array.from(group.children);
    children.forEach((child) => {
      flatValues.push(extractText(child));
    });
  });

  console.log('Extracted values:', flatValues);
  // Override DEFAULT_CONFIG values sequentially
  const keys = Object.keys(cfg);
  console.log(' Keys:', keys);
  let idx = 0;
  keys.forEach((key) => {
    if (idx < flatValues.length) {
      cfg[key] = flatValues[idx] || cfg[key]; // override only if present
    }
    idx++;
  });

  return cfg;
}

export default async function decorate(block) {

  try {
    const newConfig = fillSequentialConfig(document.querySelector(".small-cards.block"));
    console.log("HHHHH", block, newConfig);

    await loadSwiper();

    setTimeout(async () => {
      await initializeSwiperCarousel(block);
      await loadNoUiSliderJquery();
      await loadNoUiSlider();
      await loadNoUiSliderCSS();
    }, 100);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating chart-advanced block:', error);
    block.innerHTML = '<div class="error-message">Failed to load chart-advanced block</div>';
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
      '/blocks/small-cards/features_all.css',
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
    slidesPerView: 1,
    spaceBetween: 8,
    snapToSlideEdge: true,
    watchOverflow: true,

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
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: {
          enabled: true,
        },
      },
      1024: {
        slidesPerView: 3,
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
