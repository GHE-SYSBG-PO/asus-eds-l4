import {
  getBlockConfigs,
  getFieldValue,
  isAuthorEnvironment,
} from '../../scripts/utils.js';
import { loadAnime } from '../../scripts/scripts.js';

// DEFAULT
const DEFAULT_CONFIG = {
  image: '',
  imgAlt: '',
  widthD: '',
  heightD: '',
  fontDesktop: '',
  fontTablet: '',
  fontMobile: '',
  textMaxWidthD: '',
  textMaxWidthT: '',
  textMaxWidthM: '',
  animationLength: '1.5',
};

/**
 * Get configuration for the current device
 */
const getFontSize = (device, v) => {
  if (device === 'D') {
    return v('fontDesktop', 'text') || 'tt-bd-96-lg';
  } if (device === 'T') {
    return v('fontTablet', 'text') || 'tt-bd-64-md';
  }

  // Mobile
  return v('fontMobile', 'text') || 'tt-bd-40-sm';
};

/**
 * Build image size dict
 */
const _getImageStyle = (imgWidthD, imgHeightD) => {
  const widthStyle = imgWidthD ? `lg:w-[${imgWidthD}]` : 'lg:w-[100vw]';
  const heightStyle = imgHeightD ? `lg:h-[${imgHeightD}]` : 'lg:h-[100vh]';

  const imgStyle = `w-full h-full ${widthStyle} ${heightStyle}`;

  return imgStyle;
};

const getAnimationType = (imageSrc) => {
  let animationType = 'type-1';

  if (!imageSrc) {
    animationType = 'type-2';
  }

  return animationType;
};

const _scrollTriggerAnimation = (block, AnimeJS) => {
  const { onScroll, createTimeline } = AnimeJS;

  const scrollContainer = block.querySelector('.scroll-container');
  const sceneImg = block.querySelector('.scene-1 .animation-img');
  const sceneText = block.querySelector('.scene-1 > div:last-child');

  const animationType = scrollContainer.classList.contains('type-1') ? 'type-1' : 'type-2';

  if (!scrollContainer) return;

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

  return textMaxWidth ? `${textMaxWidth}px` : '100%';
};

const _renderMediaHTML = (props) => {
  const {
    imageSrc,
    imgAlt,
    imageStyle,
    text,
    textColor,
    fonts,
    maxW,
  } = props;

  const htmlImg = imageSrc ? `
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${imageStyle}">
      <img
        src="${imageSrc}"
        alt="${imgAlt}"
        class="animation-img absolute left-0 top-0 w-full h-full object-cover"
      />
    </div>
  ` : '';

  const htmlText = text ? `
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="color: #${textColor}">
      <p class="relative text-center w-[100vw] lg:max-w-[${maxW.D}] md:max-w-[${maxW.T}] sm:max-w-[${maxW.M}] pl-[10%] pr-[10%] ${fonts.D} ${fonts.T} ${fonts.M}">${text}</p>
    </div>
  ` : '';

  return htmlImg + htmlText;
};

export default async function decorate(block) {
  try {
    // DEBUG: 印出實際的 HTML rows 順序
    // eslint-disable-next-line no-console
    console.log('effect-media rows:', [...block.children].map((r, i) => `[${i}] ${r.textContent.trim().substring(0, 60)}`));

    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'effect-media');
    const v = getFieldValue(config);

    // load anime
    const anime = await loadAnime();

    // clear block
    block.innerHTML = '';

    const imageSrc = v('image', 'text');
    const imgAlt = v('imgAlt', 'text');
    const text = v('text', 'text');
    const textColor = v('textColor', 'text') || 'fff';

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

    const imageStyle = _getImageStyle(v('imgWidthD', 'text'), v('imgHeightD', 'text'));
    const animationType = getAnimationType(imageSrc);

    const prop = {
      imageSrc,
      imgAlt,
      imageStyle,
      text,
      textColor,
      fonts,
      maxW,
    };

    // eslint-disable-next-line no-console
    console.log('prop: ', prop);

    const sceneContent = _renderMediaHTML(prop);

    block.innerHTML = `
      <div class="effect-media-container relative ${animationType} scroll-container w-[100vw] h-[250vh] left-1/2 -translate-x-1/2 lg:min-h-[${_getAnimationMinHeight('D')}] md:min-h-[${_getAnimationMinHeight('T')}] sm:min-h-[${_getAnimationMinHeight('M')}]">
        <div class="sticky top-0 w-[100vw] h-[100vh] scene-1">
          ${sceneContent}
        </div>
      </div>
    `;

    // handle animation
    if (!isAuthorEnvironment()) {
      _scrollTriggerAnimation(block, anime);
    }

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating effet-media: ', error);
    block.innerHTML = '<div class="error-message">Failed to load effet-media block</div>';
  }
}
