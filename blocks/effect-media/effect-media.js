import {
  getBlockConfigs,
  getFieldValue,
} from '../../scripts/utils.js';
import { loadAnime } from '../../scripts/scripts.js';

// DEFAULT
const DEFAULT_CONFIG = {
  imageAlt: '',
  assetsD: '',
  widthD: '',
  widthValueD: '',
  heightD: '',
  heightValueD: '',
  objectPositionD: '',
  maxD: '',
  minD: '',
  desktopAlignment: 'center',
  tabletAlignment: 'center',
  mobileAlignment: 'center',
  titleRichtext: '',
  titleFont: 'tt-md-40',
  titleFontColor: '',
};

/**
 * Build size style object
 */
const getSizeStyles = (config) => {
  const styles = {};
  // Width handling
  if (config.widthUnit === 'px' && config.widthValue) {
    styles.width = `${config.widthValue}px`;
  } else if (config.widthUnit === '%' && config.widthValue) {
    styles.width = `${config.widthValue}%`;
  } else if (config.widthUnit === 'auto') {
    styles.width = 'auto';
  }

  // Height handling
  if (config.heightUnit === 'px' && config.heightValue) {
    styles.height = `${config.heightValue}px`;
  } else if (config.heightUnit === '%' && config.heightValue) {
    styles.height = `${config.heightValue}%`;
  } else if (config.heightUnit === 'auto') {
    styles.height = 'auto';
  }

  return styles;
};

/**
 * Build max/min width style object
 */
const getMinMaxWidthStyles = (config) => {
  const styles = {};

  if (config.maxWidth) {
    styles.maxWidth = config.maxWidth;
  }

  if (config.minWidth) {
    styles.minWidth = config.minWidth;
  }

  return styles;
};

/**
 * Get configuration for the current device
 */
const getDeviceConfig = (device, v) => {
  if (device === 'D') {
    return {
      assets: v('assetsD', 'text') || '',
      widthUnit: v('widthD', 'text') || 'auto',
      widthValue: v('widthValueD', 'text') || '',
      heightUnit: v('heightD', 'text') || 'auto',
      heightValue: v('heightValueD', 'text') || '',
      ratio: v('ratioD', 'text'),
      ratioValueCustomized: v('ratioValueCustomizedD', 'text') || '',
      objectPosition: v('objectPositionD', 'text') || 'center',
      maxWidth: v('maxD', 'text') || '',
      minWidth: v('minD', 'text') || '',
    };
  }
};

const getObjectPositionStyle = (objectPosition) => {
  const positionMap = {
    left: 'left',
    right: 'right',
    center: 'center',
    top: 'top',
    bottom: 'bottom',
  };
  return positionMap[objectPosition] || 'center';
};


export default async function decorate(block) {
  try {
    // console.log('执行text-block', block);
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'text-block');
    const v = getFieldValue(config);
    // console.log('执行text-block-config', config);
// Get basic configuration
    const imageAlt = v('imageAlt', 'text') || '';
    // Get configurations for each device
    const configD = getDeviceConfig('D', v);

    // Build object position styles
    const objectPositionD = getObjectPositionStyle(configD.objectPosition);
    const dAlignment = v('desktopAlignment') === 'left' ? 'lg:items-start' : 'lg:items-center';
    const tAlignment = v('tabletAlignment') === 'left' ? 'md:items-start' : 'md:items-center';
    const mAlignment = v('mobileAlignment') === 'left' ? 'items-start' : 'items-center';
    const dBlockAlignment = v('desktopAlignment') === 'left' ? 'lg:text-left' : 'lg:text-center';
    const tBlockAlignment = v('tabletAlignment') === 'left' ? 'md:text-left' : 'md:text-center';
    const mBlockAlignment = v('mobileAlignment') === 'left' ? 'text-left' : 'text-center';

    // Build style objects for each device
    const stylesD = {
      ...getSizeStyles(configD),
      ...getMinMaxWidthStyles(configD),
    };

    // Create image element
    const createImageElement = (device, configObj, styles, objectPosition) => {
      const { assets } = configObj;
      if (!assets) return '';

      // Build base style
      const baseStyle = `position: relative; overflow-hidden; ${containerRadiusStyle} ${stylesToInline(styles)}`;

      let dClass = 'hidden lg:block';
      if (device === 'M') {
        dClass = 'md:hidden lg:hidden';
      }
      if (device === 'T') {
        dClass = 'hidden md:block lg:hidden';
      }
      return `
        <div class="device-${device} ${dClass}" style="${baseStyle}">
          <img
            src="${assets}"
            alt="${imageAlt}"
            class="w-full h-full object-cover"
            style="object-position: ${objectPosition};"
          />
        </div>
      `;
    };

    // Render content based on media type
    let mediaContent = createImageElement('D', configD, stylesD, objectPositionD);
    
    const titleFontColor = v('titleFontColor') ? `style='--text-block-title-color: #${v('titleFontColor')};--text-block-title-gradient: '';'` : '';
    
    const title = `
      <div class='${v('titleRichtext') && 'mt-[10px]'} break-all text-block-title ${dBlockAlignment} ${tBlockAlignment} ${mBlockAlignment} ${v('titleFont')}' ${titleFontColor}>
        ${v('titleRichtext', 'html')}
      </div>
    `;

    const wrap = `
      <div class="media-block-container relative">
        ${mediaContent}
      </div>
      <div class='flex flex-col  ${dAlignment} ${tAlignment} ${mAlignment}'>
        ${title}
      </div>
    `;

    block.innerHTML = wrap;

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating text-block block:', error);
    block.innerHTML = '<div class="error-message">Failed to load text-block block</div>';
  }
}
