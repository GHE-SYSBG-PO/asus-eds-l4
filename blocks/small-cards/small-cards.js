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


async function renderCard(block) {
  const helpMeChooseContainer = document.createElement('div');
  helpMeChooseContainer.className = 'small-cards-container';

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
                            </div>
                            <div class="block block__scroll-item block-1 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" data-blocktype="img" style="transform: translateY(0px); opacity: 1;" easing="easeOutExpo">
                                <div class="block-content">
                                  <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                                      <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space"><span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">1AI for organizing multimedia</span>
                                      </h3>
                                      <div class="content__info ro-rg-18 small_ro-rg-16 info--1">StoryCube is an AI-powered digital asset-management tool, which can automatically organize your photos and videos.</div>
                                      <a class="content__link ro-md-20-sh small_ro-md-16-sh wdga link--1 wd__link__arrow asus-icon-chevronright  " 
                                      aria-label="Learn more about AI for organizing multimedia (opens in new window)" 
                                      href="https://www.asus.com/proart/software-solutions/storycube/" 
                                      target="_blank" rel="noopener noreferrer" 
                                      data-galabel="sections AI Experience Learn more about AI for organizing multimedia" data-eventname="ai2025s4_item1_learn_more_clicked"><span>Learn more about StoryCube</span></a>
                                  </div>
                                </div>
                                <div class="block-img"><img class="img img__bg" 
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=" 
                                alt="">
                                </div>
                            </div>
                            <div class="block block__scroll-item block-1 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" 
                                  data-blocktype="img" style="transform: translateY(0px); opacity: 1;" easing="easeOutExpo">
                                <div class="block-content">
                                  <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                                      <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space">
                                        <span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">1AI for organizing multimedia</span>
                                      </h3>
                                      <div class="content__info ro-rg-18 small_ro-rg-16 info--1">StoryCube is an AI-powered digital asset-management tool, which can automatically organize your photos and videos.</div>
                                      <a class="content__link ro-md-20-sh small_ro-md-16-sh wdga link--1 wd__link__arrow asus-icon-chevronright  " 
                                        aria-label="Learn more about AI for organizing multimedia (opens in new window)" 
                                        href="https://www.asus.com/proart/software-solutions/storycube/" target="_blank" rel="noopener noreferrer" 
                                        data-galabel="sections AI Experience Learn more about AI for organizing multimedia" 
                                        data-eventname="ai2025s4_item1_learn_more_clicked">
                                        <span>Learn more about StoryCube</span>
                                      </a>
                                  </div>
                                </div>
                                <div class="block-img">
                                  <img class="img img__bg" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=" 
                                  alt="A screen shot picture of user interface of software StoryCube, showing people and scenes are categorized automatically into folders in AI album.">
                                </div>
                            </div>
                            <div class="block block__scroll-item block-1 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" 
                                  data-blocktype="img" style="transform: translateY(0px); opacity: 1;" easing="easeOutExpo">
                                <div class="block-content">
                                  <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                                      <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space">
                                        <span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">1AI for organizing multimedia</span>
                                      </h3>
                                      <div class="content__info ro-rg-18 small_ro-rg-16 info--1">StoryCube is an AI-powered digital asset-management tool, which can automatically organize your photos and videos.</div>
                                      <a class="content__link ro-md-20-sh small_ro-md-16-sh wdga link--1 wd__link__arrow asus-icon-chevronright  " 
                                        aria-label="Learn more about AI for organizing multimedia (opens in new window)" 
                                        href="https://www.asus.com/proart/software-solutions/storycube/" target="_blank" rel="noopener noreferrer" 
                                        data-galabel="sections AI Experience Learn more about AI for organizing multimedia" 
                                        data-eventname="ai2025s4_item1_learn_more_clicked"><span>Learn more about StoryCube</span></a>
                                  </div>
                                </div>
                                <div class="block-img">
                                  <img class="img img__bg" 
                                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=" 
                                  alt="A screen shot picture of user interface of software StoryCube, showing people and scenes are categorized automatically into folders in AI album.">
                                </div>
                            </div>
                            <div class="block block__scroll-item block-1 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" 
                                  data-blocktype="img" style="transform: translateY(0px); opacity: 1;" easing="easeOutExpo">
                                <div class="block-content">
                                  <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                                      <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space">
                                        <span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">1AI for organizing multimedia</span>
                                      </h3>
                                      <div class="content__info ro-rg-18 small_ro-rg-16 info--1">StoryCube is an AI-powered digital asset-management tool, which can automatically organize your photos and videos.</div>
                                      <a class="content__link ro-md-20-sh small_ro-md-16-sh wdga link--1 wd__link__arrow asus-icon-chevronright  " 
                                        aria-label="Learn more about AI for organizing multimedia (opens in new window)" 
                                        href="https://www.asus.com/proart/software-solutions/storycube/" target="_blank" rel="noopener noreferrer" 
                                        data-galabel="sections AI Experience Learn more about AI for organizing multimedia" 
                                        data-eventname="ai2025s4_item1_learn_more_clicked"><span>Learn more about StoryCube</span></a>
                                  </div>
                                </div>
                                <div class="block-img"><img class="img img__bg" 
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=" 
                                alt="A screen shot picture of user interface of software StoryCube, showing people and scenes are categorized automatically into folders in AI album.">
                                </div>
                            </div>
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
                            </div>
                            <div class="block block__scroll-item block-21 block-imgstyle-extend column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" 
                                  data-blocktype="aiNoise" easing="easeOutExpo" style="transform: translateY(0px); opacity: 1;">
                                <div class="block-content">
                                  <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                                      <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space"><span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">AI for the clearest audio</span>
                                      </h3>
                                      <div class="content__info ro-rg-18 small_ro-rg-16 info--1">ASUS AI Noise Cancelation leverages a massive deep-learning database to reduce background noise in meetings and calls, for crystal-clear audio.</div>
                                      <div class="modal-button-container outer-container normal" data-type="outer">
                                        <button class="click-button outer-btn wdga modal-button" type="button" data-trigger-open="inner__conference" 
                                                aria-label="Learn more for AI for the clearest audio" data-galabel="Sections Conference wdblockimg item-2" 
                                                data-eventname="conference_item2_button_clicked" data-modal-section="section__conference-inner-s3">
                                            <span class="modal-inner-text ro-md-20-sh small_ro-md-18-sh">Learn more</span>
                                        </button>
                                      </div>
                                  </div>
                                </div>
                                <div class="ai__noise__container" id="conferenceS1span3__aiNoiseContainer">
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
                                        <div class="nav__aria_data hide" 
                                              data-desc-start="Pause the simulated home sounds without noise cancelation." 
                                              data-desc-stop="Play the simulated home sounds without noise cancelation." 
                                              data-desc-ai="Flip the switch below this test recording to enable or disable the ASUS AI Noise Canceling Technology and experience its power and accuracy for yourself."></div>
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
                                            <svg viewBox="0 0 324 324" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                              <linearGradient gradientUnits="userSpaceOnUse" x1="50.33" x2="273.67" y1="50.33" y2="273.67" id="Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_a_21">
                                                  <stop offset="0" stop-color="var(--voice-start)"></stop>
                                                  <stop offset="1" stop-color="var(--voice-end)"></stop>
                                              </linearGradient>
                                              <linearGradient id="Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_b_21" x1="108.23" x2="215.77" href="#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_a_21" y1="88.2" y2="195.75"></linearGradient>
                                              <linearGradient id="Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_c_21" x1="110.96" x2="213.04" href="#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_a_21" y1="132.72" y2="234.79"></linearGradient>
                                              <path d="M162 320C74.88 320 4 249.12 4 162S74.88 4 162 4s158 70.88 158 158-70.88 158-158 158z" fill="var(--voice-bgcolor)"></path>
                                              <path d="M162 320C74.88 320 4 249.12 4 162S74.88 4 162 4s158 70.88 158 158-70.88 158-158 158zm0-307C79.82 13 13 79.82 13 162s66.82 149 149 149 149-66.86 149-149S244.18 13 162 13z" fill="url(#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_a_21)"></path>
                                              <path d="M162 233.67a38.37 38.37 0 0 1-38.33-38.32V88.6a38.33 38.33 0 0 1 76.66 0v106.75A38.37 38.37 0 0 1 162 233.67zm0-174.43a29.39 29.39 0 0 0-29.36 29.36v106.75a29.36 29.36 0 1 0 58.72 0V88.6A29.39 29.39 0 0 0 162 59.24z" fill="url(#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_b_21)"></path>
                                              <path d="M211.39 132.74a4 4 0 0 0-4 4v58.14a45.35 45.35 0 0 1-90.7 0v-58.11a4 4 0 0 0-8.07 0v58.14a53.48 53.48 0 0 0 48 53.14v32.4h10.76v-32.4a53.48 53.48 0 0 0 48-53.14v-58.14a4 4 0 0 0-3.99-4.03z" fill="url(#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_c_21)"></path>
                                              <path d="M0 0h324v324H0z" fill="none"></path>
                                            </svg>
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
                                </div>
                            </div>
                            <div class="block block__scroll-item block-21 block-imgstyle-extend column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" 
                                  data-blocktype="aiNoise" easing="easeOutExpo" style="transform: translateY(0px); opacity: 1;">
                                <div class="ai__noise__container" id="conferenceS1span3__aiNoiseContainer">
                                  <div class="nav__replay">
                                      <div class="wd__play__btn video__play__btn">
                                        <button class="wd__play__btn-button is-hidden" aria-label="replay the ai noise animation" tabindex="-1" id="aiApplication_s4_noise_replay_btn" aria-hidden="true" data-eventname="undefined">
                                            <svg class="svg-step svg_button_replay" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.63 30.88" aria-hidden="true">
                                              <path class="cls-1" d="m15.44,28.37c-7.13,0-12.94-5.8-12.94-12.94S8.3,2.5,15.44,2.5c3.52,0,6.86,1.45,9.29,3.97l-2.73,2.29,8.63,3.25-1.71-9.06-2.27,1.91C23.73,1.77,19.7,0,15.44,0,6.92,0,0,6.92,0,15.44s6.92,15.44,15.44,15.44c7.3,0,13.66-5.18,15.12-12.33l-2.45-.5c-1.22,5.98-6.55,10.33-12.67,10.33h0Z">
                                              </path>
                                            </svg>
                                            <div class="img__icon" aria-hidden="true"></div>
                                        </button>
                                      </div>
                                  </div>
                                  <div class="nav__noise">
                                      <div class="wdga nav__item nav__1" data-index="1" data-status="off" data-gaid="noiseCancelBtn1" role="button" tabindex="0" 
                                          aria-label="Play the simulated home sounds without noise cancelation.">
                                        <div class="nav__aria_data hide" data-desc-start="Pause the simulated home sounds without noise cancelation." data-desc-stop="Play the simulated home sounds without noise cancelation." data-desc-ai="Flip the switch below this test recording to enable or disable the ASUS AI Noise Canceling Technology and experience its power and accuracy for yourself."></div>
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
                                            <svg viewBox="0 0 324 324" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                              <linearGradient gradientUnits="userSpaceOnUse" x1="50.33" x2="273.67" y1="50.33" y2="273.67" id="Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_a_21">
                                                  <stop offset="0" stop-color="var(--voice-start)"></stop>
                                                  <stop offset="1" stop-color="var(--voice-end)"></stop>
                                              </linearGradient>
                                              <linearGradient id="Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_b_21" x1="108.23" x2="215.77" href="#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_a_21" y1="88.2" y2="195.75"></linearGradient>
                                              <linearGradient id="Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_c_21" x1="110.96" x2="213.04" href="#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_a_21" y1="132.72" y2="234.79"></linearGradient>
                                              <path d="M162 320C74.88 320 4 249.12 4 162S74.88 4 162 4s158 70.88 158 158-70.88 158-158 158z" fill="var(--voice-bgcolor)"></path>
                                              <path d="M162 320C74.88 320 4 249.12 4 162S74.88 4 162 4s158 70.88 158 158-70.88 158-158 158zm0-307C79.82 13 13 79.82 13 162s66.82 149 149 149 149-66.86 149-149S244.18 13 162 13z" fill="url(#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_a_21)"></path>
                                              <path d="M162 233.67a38.37 38.37 0 0 1-38.33-38.32V88.6a38.33 38.33 0 0 1 76.66 0v106.75A38.37 38.37 0 0 1 162 233.67zm0-174.43a29.39 29.39 0 0 0-29.36 29.36v106.75a29.36 29.36 0 1 0 58.72 0V88.6A29.39 29.39 0 0 0 162 59.24z" fill="url(#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_b_21)"></path>
                                              <path d="M211.39 132.74a4 4 0 0 0-4 4v58.14a45.35 45.35 0 0 1-90.7 0v-58.11a4 4 0 0 0-8.07 0v58.14a53.48 53.48 0 0 0 48 53.14v32.4h10.76v-32.4a53.48 53.48 0 0 0 48-53.14v-58.14a4 4 0 0 0-3.99-4.03z" fill="url(#Item_21_conferenceS1span3_aiNoiseSwitcher_gradient_c_21)"></path>
                                              <path d="M0 0h324v324H0z" fill="none"></path>
                                            </svg>
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
                                </div>
                                <div class="block-content">
                                  <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                                      <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space"><span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">AI for the clearest audio</span>
                                      </h3>
                                      <div class="content__info ro-rg-18 small_ro-rg-16 info--1">ASUS AI Noise Cancelation leverages a massive deep-learning database to reduce background noise in meetings and calls, for crystal-clear audio.</div>
                                      <div class="modal-button-container outer-container normal" data-type="outer">
                                        <button class="click-button outer-btn wdga modal-button" type="button" data-trigger-open="inner__conference" 
                                                aria-label="Learn more for AI for the clearest audio" data-galabel="Sections Conference wdblockimg item-2" 
                                                data-eventname="conference_item2_button_clicked" data-modal-section="section__conference-inner-s3">
                                            <span class="modal-inner-text ro-md-20-sh small_ro-md-18-sh">Learn more</span>
                                        </button>
                                      </div>
                                  </div>
                                </div>
                            </div>
                            <div class="block block__scroll-item block-3 block-imgstyle-scale column-span-2  column-span-medium-2 theme-white small-cards-list swiper-slide" 
                                  data-blocktype="img" easing="easeOutExpo" style="transform: translateY(0px); opacity: 1;">
                                <div class="block-content">
                                  <div class="wd__content   large__text-left medium__text-left small__text-center  sections-wdcontent">
                                      <h3 class="content__title tt-md-32 medium_tt-md-28 small_tt-md-32 no-top-space"><span class="tt-md-32 medium_tt-md-28 small_tt-md-32 content__title-0">Best online meeting experience</span>
                                      </h3>
                                      <div class="content__info ro-rg-18 small_ro-rg-16 info--1">AI camera makes sure that you always look your best during virtual conferences.</div>
                                      <div class="modal-button-container outer-container normal" data-type="outer">
                                        <button class="click-button outer-btn wdga modal-button" type="button" data-trigger-open="inner__conference" 
                                                aria-label="Learn more for AI Camera" data-galabel="Sections conference wdblockimg item-3" 
                                                data-eventname="conference_item3_button_clicked" data-modal-section="section__conference-inner-s1">
                                            <span class="modal-inner-text ro-md-20-sh small_ro-md-18-sh">Learn more</span>
                                        </button>
                                      </div>
                                  </div>
                                </div>
                                <div class="block-img">
                                  <img class="img img__bg" 
                                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                                  alt="A video call scenario photo shows the webcam effect with background blur.">
                                </div>
                            </div>
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

  helpMeChooseContainer.innerHTML = html;

  // Replace in DOM
  const [quoteWrapper] = block.children;
  // const blockquote = document.createElement('div');
  // blockquote.textContent = quoteWrapper.textContent.trim();
  // quoteWrapper.replaceChildren('Hello World');

  quoteWrapper.replaceChildren(...helpMeChooseContainer.children);
}

export default async function decorate(block) {

  try {
    await loadSwiper();
    // block.innerHTML = '';
    await renderCard(block);

    // setTimeout(async () => {
    await initializeSwiperCarousel(block);
    await loadNoUiSliderJquery();
    await loadNoUiSlider();
    await loadNoUiSliderCSS();
    // }, 100);
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
