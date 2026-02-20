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
  radius: '',
  imageAlt: '',

  videoAutoPlay: false,
  loop: false,
  pauseAndPlayBtn: false,
  pausePlayBtnColor: '',
  pausePlayBtnPosition: 'top-left',

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
  maxD: '',
  minD: '',
  maxT: '',
  minT: '',
  maxM: '',
  minM: '',
  alignmentAdvanced: 'left',
};

/**
 * Reads configuration from the block's DOM structure.
 * @param {HTMLElement} block The block element.
 * @returns {object} A configuration object.
 */
function extractValue(div) {
  // 1️⃣ If it contains picture → extract image URL
  const img = div.querySelector('img');
  if (img) {
    return img.getAttribute('src') || null;
  }

  // 2️⃣ If it contains <p>
  const p = div.querySelector(':scope > p');
  if (p) {
    return p.textContent.trim();
  }

  // 3️⃣ Fallback: direct text
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

function getCardHTML(data) {
  let content = '';
  switch (data.cardType) {
    case 'img_txt_integrated_top':
      content = `
      <div class="block block__scroll-item block-1 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" data-blocktype="img" style="transform: translateY(0px); opacity: 1;" easing="easeOutExpo">
          <div class="block-content">
            <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space"><span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">1AI for organizing multimedia</span>
                </h3>
                <div class="content__info ro-rg-18 small_ro-rg-16 info--1">StoryCube is an AI-powered digital asset-management tool, which can automatically organize your photos and videos.</div>
                <a class="content__link ro-md-20-sh small_ro-md-16-sh wdga link--1 wd__link__arrow asus-icon-chevronright " 
                  aria-label="Learn more about AI for organizing multimedia (opens in new window)" 
                  href="https://www.asus.com/proart/software-solutions/storycube/" 
                  target="_blank" rel="noopener noreferrer" 
                  data-galabel="sections AI Experience Learn more about AI for organizing multimedia" 
                  data-eventname="ai2025s4_item1_learn_more_clicked">
                <span>Learn more about StoryCube</span></a>
            </div>
          </div>
          <div class="block-img">
            <img class="img img__bg" 
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=" 
                alt="A screen shot picture of user interface of software StoryCube, showing people and scenes are categorized automatically into folders in AI album.">
          </div>
      </div>`;
      break;
    case 'img_txt_integrated_bottom':
      content = `
        <div class="block block__scroll-item block-1 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" 
          data-blocktype="img" style="transform: translateY(0px); opacity: 1;" easing="easeOutExpo">
          <div class="block-img">
            <img class="img img__bg" 
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                alt="A screen shot picture of user interface of software StoryCube, showing people and scenes are categorized automatically into folders in AI album.">
          </div>
          <div class="block-content">
            <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space">
                  <span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">2AI for organizing multimedia</span>
                </h3>
                <div class="content__info ro-rg-18 small_ro-rg-16 info--1">StoryCube is an AI-powered digital asset-management tool, which can automatically organize your photos and videos.</div>
                <a class="content__link ro-md-20-sh small_ro-md-16-sh wdga link--1 wd__link__arrow asus-icon-chevronright  " 
                  aria-label="Learn more about AI for organizing multimedia (opens in new window)" 
                  href="https://www.asus.com/proart/software-solutions/storycube/" target="_blank" rel="noopener noreferrer" 
                  data-galabel="sections AI Experience Learn more about AI for organizing multimedia" 
                  data-eventname="ai2025s4_item1_learn_more_clicked"><span>Learn more about StoryCube</span></a>
            </div>
          </div>
      </div>`;
      break;

    case 'txt_img_attached_top':
      content = `
        <div class="block block__scroll-item block-1 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" 
            data-blocktype="img" style="transform: translateY(0px); opacity: 1;" easing="easeOutExpo">
            <div class="block-img">
              <img class="img img__bg" 
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                  alt="A screen shot picture of user interface of software StoryCube, showing people and scenes are categorized automatically into folders in AI album.">
            </div>
            <div class="block-content">
              <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                  <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space">
                    <span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">2AI for organizing multimedia</span>
                  </h3>
                  <div class="content__info ro-rg-18 small_ro-rg-16 info--1">StoryCube is an AI-powered digital asset-management tool, which can automatically organize your photos and videos.</div>
                  <a class="content__link ro-md-20-sh small_ro-md-16-sh wdga link--1 wd__link__arrow asus-icon-chevronright  " 
                    aria-label="Learn more about AI for organizing multimedia (opens in new window)" 
                    href="https://www.asus.com/proart/software-solutions/storycube/" target="_blank" rel="noopener noreferrer" 
                    data-galabel="sections AI Experience Learn more about AI for organizing multimedia" 
                    data-eventname="ai2025s4_item1_learn_more_clicked"><span>Learn more about StoryCube</span></a>
              </div>
            </div>
        </div>`;
      break;

    default:
      break;
  }
  return content;
}

async function renderCard(block) {

  const data = await fillSequentialConfig(block);
  console.log('Extracted chunk, Final Card Data:', data);


  const smallCardsContainer = document.createElement('div');
  smallCardsContainer.className = 'small-cards-container';

  const cardHTML = Array.isArray(data)
    ? data.map((item) => getCardHTML(item)).join('')
    : getCardHTML(data);

  const html = `<div class="outer-view" id="CMD">
    <section class="wd__section section__aiApplication2025-outer-s4 aiApplication2025-outer wd__sections theme-white " id="section__aiApplication2025-outer-s4">
        <div class="sectionnNavPosition"></div>
        <div class="section_content">
          <div class="row">
              <div class="col l12 m12 s12">
                <div class="wdblockimg">
                    <div class="wdblockimg__container block__scroll">
                      <div class="swiper">
                          <div class="swiper-button-prev"></div>
                          <div class="swiper-button-next"></div>
                          <div class="swiper-wrapper">
                            ${cardHTML}
                          </div>
                      </div>
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

  // Replace in DOM
  const [mainWrapper] = block.children;
  mainWrapper.replaceChildren(...smallCardsContainer.children);
}

export default async function decorate(block) {

  try {
    await loadSwiper();
    // block.innerHTML = '';
    await renderCard(block);

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
