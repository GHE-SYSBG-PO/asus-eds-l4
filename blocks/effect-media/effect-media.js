import {
  getBlockConfigs,
  getFieldValue,
  getProductLine,
  isAuthorUe,
} from '../../scripts/utils.js';
import { loadAnime } from '../../scripts/scripts.js';

// ── Constants ─────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  image: '',
  imgAlt: '',
  bgColor: '',
  fontDesktop: '',
  fontTablet: '',
  fontMobile: '',
  fontColor: '',
  textMaxWidthD: '',
  textMaxWidthT: '',
  textMaxWidthM: '',
  animationLength: 1.5,
};

/** Font-family prefix per product line */
const PRODUCT_FONT_PREFIX = {
  rog: 'tg-bd',
  tuf: 'dp-cb',
  proart: 'tt-bd',
  asus: 'tt-bd',
};

/** Base viewport heights used to compute minimum scroll container height */
const BASE_VIEWPORT_HEIGHT = { D: 1024, T: 768, M: 736 };

/** Default font sizes when no value is configured */
const DEFAULT_FONT_SIZE = { D: '96', T: '64', M: '40' };

/** Config key mapping for font size per device */
const FONT_SIZE_KEY = { D: 'fontDesktop', T: 'fontTablet', M: 'fontMobile' };

/** Config key mapping for text max-width per device */
const MAX_WIDTH_KEY = { D: 'textMaxWidthD', T: 'textMaxWidthT', M: 'textMaxWidthM' };

// ── Scroll animation timing ───────────────────────────────────
const ANIMATION = {
  IMG_DURATION: 400,
  TEXT_DURATION: 300,
  TEXT_OFFSET: 250, // delay before text starts fading (type-1 only)
};

// ── Helpers ───────────────────────────────────────────────────

/**
 * Get the configured font size for a device, falling back to defaults.
 * @param {'D'|'T'|'M'} device
 * @param {Function} v - field value accessor
 * @returns {string} numeric font size string, e.g. '96'
 */
const getFontSize = (device, v) => v(FONT_SIZE_KEY[device], 'text') || DEFAULT_FONT_SIZE[device];

/**
 * Get the configured text max-width for a device.
 * @param {'D'|'T'|'M'} device
 * @param {Function} v - field value accessor
 * @returns {string} e.g. '1260px' or ''
 */
const getTextMaxWidth = (device, v) => {
  const val = v(MAX_WIDTH_KEY[device], 'text');
  return val ? `${val}px` : '';
};

/**
 * Build RWD font class string based on current product line.
 * @param {string} dSize - desktop font size
 * @param {string} tSize - tablet font size
 * @param {string} mSize - mobile font size
 * @returns {string} e.g. 'tt-bd-96 tt-bd-64-md tt-bd-40-sm'
 */
const getTextFontClass = (dSize, tSize, mSize) => {
  const prefix = PRODUCT_FONT_PREFIX[getProductLine()] || PRODUCT_FONT_PREFIX.asus;
  return `${prefix}-${dSize} ${prefix}-${tSize}-md ${prefix}-${mSize}-sm`;
};

/**
 * Determine animation type based on whether an image is present.
 */
const getAnimationType = (imageSrc) => (imageSrc ? 'type-1' : 'type-2');

/**
 * Compute minimum scroll-container height for a given device.
 * @param {'D'|'T'|'M'} device
 * @returns {string} e.g. '1536px'
 */
const getAnimationMinHeight = (device) => `${DEFAULT_CONFIG.animationLength * BASE_VIEWPORT_HEIGHT[device]}px`;

// ── Scroll-triggered animation ────────────────────────────────

const initScrollAnimation = (block, AnimeJS) => {
  const { onScroll, createTimeline } = AnimeJS;

  const scrollContainer = block.querySelector('.scroll-container');
  if (!scrollContainer) return;

  const sceneImg = block.querySelector('.scene-1 .animation-img');
  const sceneText = block.querySelector('.scene-1 > div:last-child');
  const isType1 = scrollContainer.classList.contains('type-1');

  const scrollObserver = onScroll({
    target: scrollContainer,
    enter: 'top top',
    leave: 'bottom bottom',
    sync: true,
  });

  const tl = createTimeline({
    autoplay: scrollObserver,
    defaults: { ease: 'linear' },
  });

  if (isType1) {
    if (sceneImg) {
      tl.add(sceneImg, {
        opacity: [0, 1],
        duration: ANIMATION.IMG_DURATION,
      }, 0);
    }

    if (sceneText) {
      tl.add(sceneText, {
        opacity: [1, 0],
        scale: [1, 3],
        duration: ANIMATION.TEXT_DURATION,
      }, ANIMATION.TEXT_OFFSET);
    }
  } else if (sceneText) {
    tl.add(sceneText, {
      opacity: [1, 0],
      scale: [1, 3],
      duration: ANIMATION.TEXT_DURATION,
    }, 0);
  }
};

// ── Render ─────────────────────────────────────────────────────

const renderMediaHTML = (props) => {
  const {
    imageSrc,
    imgAlt,
    text,
    fontColorStyle,
    fonts,
    maxW,
  } = props;

  const maxWidthDesktop = maxW.D ? `--max-w-desktop: ${maxW.D};` : '';
  const maxWidthTablet = maxW.T ? `--max-w-tablet: ${maxW.T};` : '';
  const maxWidthMobile = maxW.M ? `--max-w-mobile: ${maxW.M};` : '';

  const textFontClass = getTextFontClass(fonts.D, fonts.T, fonts.M);

  const htmlImg = imageSrc ? `
    <div class="absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 img-container">
      <img
        src="${imageSrc}"
        alt="${imgAlt}"
        class="animation-img absolute left-0 top-0 w-full h-full object-cover"
      />
    </div>
  ` : '';

  const htmlText = text ? `
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-container">
      <p class="ani-text relative text-center ml-auto mr-auto w-[87.5%] ${textFontClass}" style="${fontColorStyle}${maxWidthDesktop}${maxWidthTablet}${maxWidthMobile}">${text}</p>
    </div>
  ` : '';

  return htmlImg + htmlText;
};

// ── Entry point ───────────────────────────────────────────────

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'effect-media');
    const v = getFieldValue(config);
    const isUE = isAuthorUe();

    const anime = await loadAnime();

    block.innerHTML = '';

    // --- Field values ---
    const imageSrc = v('image', 'text');
    const imgAlt = v('imgAlt', 'text');
    const text = v('text', 'text');
    const fontColor = v('fontColor', 'text');
    const fontColorStyle = fontColor ? `--base-text-color: #${fontColor};` : '';

    const bgColor = v('bgColor', 'text') || '';
    const bgColorStyle = bgColor ? `background-color: #${bgColor};` : '';

    const colorGroup = v('colorGroup', 'text') || '';
    if (colorGroup) block.classList.add(colorGroup);

    const fonts = {
      D: getFontSize('D', v),
      T: getFontSize('T', v),
      M: getFontSize('M', v),
    };

    const maxW = {
      D: getTextMaxWidth('D', v),
      T: getTextMaxWidth('T', v),
      M: getTextMaxWidth('M', v),
    };

    const animationType = getAnimationType(imageSrc);
    const sceneContent = renderMediaHTML({
      imageSrc, imgAlt, text, fontColorStyle, fonts, maxW,
    });

    // --- Layout ---
    const heightMultiplier = DEFAULT_CONFIG.animationLength * 100;
    let containerHeight = `--container-height: calc(${heightMultiplier} * var(--cmdvh));`;
    let animationPosition = 'sticky top-0';
    const isUeType = isUE ? 'is-ue' : '';

    if (isUE) {
      containerHeight = '--container-height: calc(100 * var(--cmdvh));';
      animationPosition = 'relative';
    }

    const minH = `lg:min-h-[${getAnimationMinHeight('D')}] md:min-h-[${getAnimationMinHeight('T')}] sm:min-h-[${getAnimationMinHeight('M')}]`;
    const containerClass = `effect-media-container relative ${animationType} scroll-container left-1/2 -translate-x-1/2 ${minH} ${isUeType}`;

    block.innerHTML = `
      <div class="${containerClass}" style="${bgColorStyle}${containerHeight}">
        <div class="${animationPosition} w-full scene-1">
          ${sceneContent}
        </div>
      </div>
    `;

    // --- Animation ---
    if (!isUE) {
      initScrollAnimation(block, anime);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating effect-media: ', error);
    block.innerHTML = '<div class="error-message">Failed to load effect-media block</div>';
  }
}
