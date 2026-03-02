import {
  getBlockConfigs,
  getFieldValue,
} from '../../scripts/utils.js';
import { loadAnime } from '../../scripts/scripts.js';

// DEFAULT
const DEFAULT_CONFIG = {
  image: '',
  imageAlt: '',
  widthD: '',
  heightD: '',
  fontDesktop: '',
  fontTablet: '',
  fontMobile: '',
  animationLength: '1.5'
};

/**
 * Get configuration for the current device
 */
const getFontSize = (device, v) => {
  if (device === 'D') {
    return  v('fontDesktop', 'text') || 'tt-bd-96-lg';
  } if (device === 'T') {
    return v('fontTablet', 'text') || 'tt-bd-64-md';
  }

  // Mobile
  return v('fontMobile', 'text') || 'tt-bd-40-sm';
};


/**
 * Build image size dict
 */
const getImageStyle = (imgWidthD, imgHeightD) => {
  const widthStyle = imgWidthD ? `lg:w-[${imgWidthD}]` : 'lg:w-[100vw]';
  const heightStyle = imgHeightD ? `lg:h-[${imgHeightD}]` : 'lg:h-[100vh]';

  const imgStyle = `w-full h-full ${widthStyle} ${heightStyle}`;

  return imgStyle;
};

const getAnimationType = (ImageSrc) => {
  let animationType = 'type-1';

  if (!ImageSrc) {
    animationType = 'type-2';
  }

  return animationType;
};

const _scrollTriggerAnimation = (block, AnimeJS) => {
  const { animate, onScroll, createTimeline } = AnimeJS;

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
    console.log('Effet Media: type-1 - image with Text');
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
    console.log('Effet Media: type-2 - only Text');

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
    'D': 1024,
    'T': 768,
    'M': 736
  };

  const baseLengthIndex = DEFAULT_CONFIG.animationLength;

  return `${baseLengthIndex * baseHeight[device]}px`;
};

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'effect-media');
    const v = getFieldValue(config);

    const anime = await loadAnime();

    block.innerHTML = '';

    const ImageSrc = v('image', 'text');
    const imageAlt = v('imageAlt', 'text');

    const text = v('text', 'text');

    const fontSizeD = getFontSize('D', v);
    const fontSizeT = getFontSize('T', v);
    const fontSizeM = getFontSize('M', v);

    const textColor = v('textColor', 'text') || 'fff';

    const animationType = getAnimationType(ImageSrc);

    const imageStyle = getImageStyle(v('imgWidthD', 'text'), v('imgHeightD', 'text'));

    const htmlImg = ImageSrc ? `
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${imageStyle}">
        <img
          src="${ImageSrc}"
          alt="${imageAlt}"
          class="animation-img absolute left-0 top-0 w-full h-full object-cover"
        />
      </div>
    ` : '';

    const htmlText = `
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="color: #${textColor}">
        <p class="relative text-center w-[100vw] pl-[10%] pr-[10%] ${fontSizeD} ${fontSizeT} ${fontSizeM}">${text}</p>
      </div>
    `;

    block.innerHTML = `
      <div class="effect-media-container relative ${animationType} scroll-container w-[100vw] h-[250vh] left-1/2 -translate-x-1/2 lg:min-h-[${_getAnimationMinHeight('D')}] md:min-h-[${_getAnimationMinHeight('T')}] sm:min-h-[${_getAnimationMinHeight('M')}]">
        <div class="sticky top-0 w-[100vw] h-[100vh] scene-1">
          ${htmlImg}
          ${htmlText}
        </div>
      </div>
    `;

    // handle animation - 傳入 anime 實例
    _scrollTriggerAnimation(block, anime);


  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating effet-media: ', error);
    block.innerHTML = '<div class="error-message">Failed to load effet-media block</div>';
  }
}
