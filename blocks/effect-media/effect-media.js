import {
  getBlockConfigs,
  getFieldValue,
} from '../../scripts/utils.js';
import { loadAnime } from '../../scripts/scripts.js';

// DEFAULT
const DEFAULT_CONFIG = {
  ImageSrc: '',
  imageAlt: '',
  widthD: '',
  heightD: '',
  fontDesktop: '',
  fontTablet: '',
  fontMobile: '',
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
  const widthStyle = imgWidthD ? `lg:w-[${imgWidthD}]` : 'lg:w-full';
  const heightStyle = imgHeightD ? `lg:h-[${imgHeightD}]` : 'lg:h-full';

  const imgStyle = `w-full h-full ${widthStyle} ${heightStyle}`;

  return imgStyle;
};


export default async function decorate(block) {
  try {
    // console.log('执行text-block', block);
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'effect-media');
    const v = getFieldValue(config);

    const ImageSrc = v('Image', 'reference');


    const fontSizeD = getFontSize('D', v);
    const fontSizeT = getFontSize('T', v);
    const fontSizeM = getFontSize('M', v);

    const imageStyle = getImageStyle(v('imgWidthD', 'text'), v('imgHeightD', 'text'));

    const htmlImg = `
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${imageStyle}">
        <img
          src="${assets}"
          alt="${imageAlt}"
          class="absolute left-0 top-0 w-full h-full object-cover"
        />
      </div>
    `;

    const htmlText = `
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <p class="relative ${fontSizeD} ${fontSizeT} ${fontSizeM}">${config.text}</p>
      </div>
    `;

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating text-block block:', error);
    block.innerHTML = '<div class="error-message">Failed to load text-block block</div>';
  }
}
