import {
  getBlockConfigs,
  getFieldValue,
  isAuthorUe,
} from '../../scripts/utils.js';
import { loadAnime } from '../../scripts/scripts.js';

// DEFAULT
const DEFAULT_CONFIG = {
  image: '',
  imgAlt: '',
  bgColor: '',
  imgWidthD: '',
  imgHeightD: '',
  fontDesktop: '',
  fontTablet: '',
  fontMobile: '',
  fontColor: '',
  textMaxWidthD: '',
  textMaxWidthT: '',
  textMaxWidthM: '',
  animationLength: 1.5,
};

/**
 * Get configuration for the current device
 */
const getFontSize = (device, v) => {
  if (device === 'D') {
    return v('fontDesktop', 'text') || '96';
  } if (device === 'T') {
    return v('fontTablet', 'text') || '64';
  }

  // Mobile
  return v('fontMobile', 'text') || '40';
};

/**
 * Build image size dict
 */
const getAnimationType = (imageSrc) => (imageSrc ? 'type-1' : 'type-2');

const _scrollTriggerAnimation = (block, AnimeJS) => {
  const { onScroll, createTimeline } = AnimeJS;

  const scrollContainer = block.querySelector('.scroll-container');
  if (!scrollContainer) return;

  const sceneImg = block.querySelector('.scene-1 .animation-img');
  const sceneText = block.querySelector('.scene-1 > div:last-child');
  const animationType = scrollContainer.classList.contains('type-1') ? 'type-1' : 'type-2';

  // 用 onScroll 綁定 scroll-container 作為觀察目標（sync: true = 滾動同步）
  const scrollObserver = onScroll({
    target: scrollContainer,
    enter: 'top top',
    leave: 'bottom bottom',
    sync: true,
  });

  // 建立 timeline，autoplay 綁定 scrollObserver
  const tl = createTimeline({
    autoplay: scrollObserver,
    defaults: { ease: 'linear' },
  });

  if (animationType === 'type-1') {
    // 圖片動畫：從 0ms 開始
    if (sceneImg) {
      tl.add(sceneImg, {
        opacity: [0, 1],
        duration: 400,
      }, 0);
    }

    // 文字動畫：從 400ms 開始
    if (sceneText) {
      tl.add(sceneText, {
        opacity: [1, 0],
        scale: [1, 3],
        duration: 300,
      }, 250);
    }
  } else if (animationType === 'type-2') {
    if (sceneText) {
      tl.add(sceneText, {
        opacity: [1, 0],
        scale: [1, 3],
        duration: 300,
      }, 0);
    }
  }
};

const _getAnimationMinHeight = (device) => {
  const baseHeight = {
    D: 1024,
    T: 768,
    M: 736,
  };

  const baseLengthIndex = DEFAULT_CONFIG.animationLength;

  return `${baseLengthIndex * baseHeight[device]}px`;
};

const _getTextMaxWidth = (device, v) => {
  const maxWidth = {
    D: 'textMaxWidthD',
    T: 'textMaxWidthT',
    M: 'textMaxWidthM',
  };

  const textMaxWidth = v(maxWidth[device], 'text');

  return textMaxWidth ? `${textMaxWidth}px` : '';
};

const _getTextFontClass = (dFontSize, tFontSize, mFontSize) => {
  const main = document.querySelector('main');
  const product = main ? main.dataset.product : 'asus';

  switch (product) {
    case 'rog':
      return `tg-bd-${dFontSize} tg-bd-${tFontSize}-md tg-bd-${mFontSize}-sm`;
    case 'tuf':
      return `dp-cb-${dFontSize} dp-cb-${tFontSize}-md dp-cb-${mFontSize}-sm`;
    case 'proart':
      return `tt-bd-${dFontSize} tt-bd-${tFontSize}-md tt-bd-${mFontSize}-sm`;
    case 'asus':
    default:
      return `tt-bd-${dFontSize} tt-bd-${tFontSize}-md tt-bd-${mFontSize}-sm`;
  }
};

const _renderMediaHTML = (props) => {
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

  const textFontClass = _getTextFontClass(fonts.D, fonts.T, fonts.M);

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

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'effect-media');
    const v = getFieldValue(config);
    const isUE = isAuthorUe();

    // load anime
    const anime = await loadAnime();

    // clear block
    block.innerHTML = '';

    const imageSrc = v('image', 'text');
    const imgAlt = v('imgAlt', 'text');
    const text = v('text', 'text');
    const fontColor = v('fontColor', 'text');
    const fontColorStyle = fontColor ? `--text-block-body-color: #${fontColor};` : '';

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
      D: _getTextMaxWidth('D', v),
      T: _getTextMaxWidth('T', v),
      M: _getTextMaxWidth('M', v),
    };

    const animationType = getAnimationType(imageSrc);

    const prop = {
      imageSrc,
      imgAlt,
      text,
      fontColorStyle,
      fonts,
      maxW,
    };

    const sceneContent = _renderMediaHTML(prop);

    // configure animation layout
    const containerHeightIndex = DEFAULT_CONFIG.animationLength * 100;
    let containerHeight = `--container-height:  calc(${containerHeightIndex} * var(--cmdvh));`;
    let animationPosition = 'sticky top-0';
    const isUeType = isUE ? 'is-ue' : '';

    if (isUE) {
      containerHeight = '--container-height: calc(100 * var(--cmdvh));';
      animationPosition = 'relative';
    }

    const minH = `lg:min-h-[${_getAnimationMinHeight('D')}] md:min-h-[${_getAnimationMinHeight('T')}] sm:min-h-[${_getAnimationMinHeight('M')}]`;
    const containerClass = `effect-media-container relative ${animationType} scroll-container left-1/2 -translate-x-1/2 ${minH} ${isUeType}`;

    block.innerHTML = `
      <div class="${containerClass}" style="${bgColorStyle}${containerHeight}">
        <div class="${animationPosition} w-full scene-1">
          ${sceneContent}
        </div>
      </div>
    `;

    // trigger scroll animation
    if (!isUE) {
      _scrollTriggerAnimation(block, anime);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating effect-media: ', error);
    block.innerHTML = '<div class="error-message">Failed to load effect-media block</div>';
  }
}
