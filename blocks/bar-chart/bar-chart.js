import {
  getBlockConfigs,
  getFieldValue,
  getBlockRepeatConfigs,
  getProductLine,
  getThemeMode,
} from '../../scripts/utils.js';

// Product and device/theme-specific defaults
const PRODUCT_DEFAULTS = {
  fonts: {
    titleFont: {
      asus: { D: 'tt-md-32', T: 'tt-md-28', M: 'tt-md-24' },
      proart: { D: 'tt-md-32', T: 'tt-md-28', M: 'tt-md-24' },
      rog: { D: 'tg-bd-32', T: 'tg-bd-28', M: 'tg-bd-24' },
      tuf: { D: 'dp-cb-32', T: 'dp-cb-28', M: 'dp-cb-24' },
    },
  },
  colors: {
    arrowColor: {
      asus: { light: '181818', dark: 'F5F5F5' },
      proart: { light: '181818', dark: 'F5F5F5' },
      rog: { light: '181818', dark: 'F5F5F5' },
      tuf: { light: '181818', dark: 'F5F5F5' },
    },
  },
};

/**
 * Get product-specific default value for device-based properties
 * @param {string} category - Category (fonts/colors)
 * @param {string} fieldName - Field name (e.g., 'titleFont')
 * @param {string} product - Product line (asus/proart/rog/tuf)
 * @param {string} deviceOrTheme - Device (D/T/M) or theme (light/dark)
 * @param {*} fallback - Fallback value if not found
 * @returns {*} Product-specific default or fallback
 */
const getProductDefault = (category, fieldName, product, deviceOrTheme, fallback) => PRODUCT_DEFAULTS[category]?.[fieldName]?.[product]?.[deviceOrTheme] || fallback;

/**
 * Get value with theme-aware fallbacks
 * @param {Function} v - Value getter function from getFieldValue
 * @param {string} fieldName - Base field name (e.g., 'arrowColor')
 * @param {*} defaultValue - Final fallback value
 * @returns {*} The resolved value
 */
const getThemeAwareValue = (v, fieldName, defaultValue) => v(`${fieldName}Advanced.${fieldName}`)
  || v(fieldName)
  || defaultValue;

// DEFAULT CONFIGURATION
const DEFAULT_CONFIG = {
  style: '5',
  titleRichtext: '',
  disclaimerRichtext: '',
  motion: 'off',
  itemTextWidth: 30,
  barWidth: 60,
  arrowNumWidth: 10,
  itemBarWidth: 80,
  titleFont: 'tt-bd-28',
  titleFontColor: '',
  disclaimerFont: 'ro-rg-14',
  disclaimerFontColor: '',
  itemTextFont: 'tt-nr-16-sh',
  itemTextFontColor: '',
  radiusTL: '',
  radiusTR: '',
  radiusBR: '',
  radiusBL: '',
  arrowNumRichtext: '',
  arrowTextRichtext: '',
  arrowStyle: 'svg',
  arrowColor: '',
  arrowAsset: '',
  arrowNumFontColor: '',
  arrowTextFontDT: 'tt-nr-18-sh',
  arrowTextFontM: 'tt-nr-16-sh',
  arrowTextFontColor: '',
};

const curDevice = window.innerWidth >= 1280 ? 'D' : ((window.innerWidth >= 730 && window.innerWidth < 1280) ? 'T' : 'M');

/**
 * Prefix hex color values with #
 */
const prefixHex = (color) => {
  if (!color || typeof color !== 'string') return '';
  return color.startsWith('#') ? color : `#${color}`;
};

/**
 * Generate border radius CSS custom property
 */
const getRadiusStyle = (tl, tr, br, bl) => {
  if (!tl && !tr && !br && !bl) return '';
  const radiusVal = `${tl || 0}px ${tr || 0}px ${br || 0}px ${bl || 0}px`;
  return `--bar-radius: ${radiusVal};`;
};

/**
 * Build arrow SVG HTML
 */
const buildArrowSVG = (colors) => {
  const [color1, color2] = colors;
  const isGradient = color2 && color2 !== color1;

  if (isGradient) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 228" class="bar-chart__arrow-icon">
        <defs>
          <linearGradient id="arrow-gradient" x1="26" y1="35" x2="26" y2="227.395" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="${color1}" />
            <stop offset="1" stop-color="${color2}" stop-opacity="0" />
          </linearGradient>
        </defs>
        <mask id="mask0_arrow" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="4" y="35" width="44" height="189">
          <rect x="4" y="35" width="44" height="189" fill="url(#arrow-gradient)"/>
        </mask>
        <g mask="url(#mask0_arrow)">
          <path d="M14 35H38V225H14V35Z" fill="${color1}"/>
        </g>
        <path d="M25.9991 0L48.5157 35.75H3.48242L25.9991 0Z" fill="${color1}"/>
      </svg>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 228" class="bar-chart__arrow-icon">
      <mask id="mask0_arrow" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="4" y="35" width="44" height="189">
        <rect x="4" y="35" width="44" height="189" fill="url(#paint0_linear_arrow)"/>
      </mask>
      <g mask="url(#mask0_arrow)">
        <path d="M14 35H38V225H14V35Z" fill="${color1}"/>
      </g>
      <path d="M25.9991 0L48.5157 35.75H3.48242L25.9991 0Z" fill="${color1}"/>
      <defs>
        <linearGradient id="paint0_linear_arrow" x1="26" y1="35" x2="26" y2="227.395" gradientUnits="userSpaceOnUse">
          <stop stop-color="${color1}"/>
          <stop offset="1" stop-color="${color1}"/>
        </linearGradient>
      </defs>
    </svg>
  `;
};

/**
 * Build arrow block HTML
 */
const buildArrowBlock = (v, productLine, theme) => {
  const variant = v('style');
  const hasArrow = [2, 4, 6].includes(variant);

  if (!hasArrow) return '';

  const arrowNumColor = v('arrowNumFontColor') ? `style="--arrow-num-color: ${prefixHex(v('arrowNumFontColor'))};"` : '';
  const arrowTextColor = v('arrowTextFontColor') ? `style="--arrow-text-color: ${prefixHex(v('arrowTextFontColor'))};"` : '';

  let arrowIcon = '';
  if (v('arrowStyle') === 'svg') {
    // Get arrow color with product+theme-specific defaults
    const defaultArrowColor = getProductDefault('colors', 'arrowColor', productLine, theme, '');
    const arrowColor = getThemeAwareValue(v, 'arrowColor', defaultArrowColor);

    const colorStr = typeof arrowColor === 'string' ? arrowColor : '';
    const colors = colorStr.split(',').map((c) => prefixHex(c.trim())).filter((c) => c);
    if (colors.length > 0) {
      arrowIcon = buildArrowSVG(colors);
    }
  } else if (v('arrowStyle') === 'png' && v('arrowAsset')) {
    arrowIcon = `<img src="${v('arrowAsset')}" alt="arrow" class="bar-chart__arrow-icon" />`;
  }

  return `
    <div class="bar-chart__arrow-block" ${curDevice !== 'M' ? `style="width:${v('arrowNumWidth')}%;"` : ''};">
      ${arrowIcon}
      <div class="bar-chart__arrow-content">
        <div class="bar-chart__arrow-num tt-bd-48" ${arrowNumColor}>
          ${v('arrowNumRichtext', 'html')}
        </div>
        <div class="bar-chart__arrow-text ${curDevice === 'M' ? v('arrowTextFontM') : v('arrowTextFontDT')}" ${arrowTextColor}>
          ${v('arrowTextRichtext', 'html')}
        </div>
      </div>
    </div>
  `;
};

/**
 * Build individual bar item HTML
 */
const buildBarItem = (item, v, index, motionEnabled, calculatedBarWidth = null) => {
  const variant = v('style');
  const isStacked = [3, 4, 5, 6].includes(variant);
  const isLarge = [5, 6].includes(variant);

  // Parse bar color (supports gradient)
  // Handle both richtext object and plain string
  const colorValue = item.barRowColor?.text || item.barRowColor || '';
  const colorStr = typeof colorValue === 'string' ? colorValue : '';
  const [color1, color2] = colorStr.split(',').map((c) => prefixHex(c.trim())).filter((c) => c);
  const isGradient = color2 && color2 !== color1;

  let barBgStyle = '';
  if (isGradient) {
    barBgStyle = `background: linear-gradient(90deg, ${color1} 0%, ${color2} 100%);`;
  } else if (color1) {
    barBgStyle = `background: ${color1};`;
  }

  // Bar text color
  // Handle both richtext object and plain string
  const textColorValue = item.barRowTextColor?.text || item.barRowTextColor || '';
  const barTextColor = textColorValue ? `color: ${prefixHex(textColorValue)};` : '';

  // Border radius
  const radiusStyle = getRadiusStyle(
    v('radiusTL'),
    v('radiusTR'),
    v('radiusBR'),
    v('radiusBL'),
  );

  // Item text color
  const itemTextColor = v('itemTextFontColor') ? `color: ${prefixHex(v('itemTextFontColor'))};` : '';

  const barLength = item.barRowLength?.text || 0;
  const initialWidth = motionEnabled ? '0%' : `${barLength}%`;

  if (isStacked) {
    // Variants 3, 4 - text inside bar
    // Variants 5, 6 - text outside bar
    if (isLarge) {
      // Variants 5, 6 - text on top of bar, bar text OUTSIDE to the right
      return `
        <div class="bar-chart__bar-item bar-chart__bar-item--stacked bar-chart__bar-item--large bar-chart__bar-item--external-text" data-index="${index}">
          <div class="bar-chart__item-text ${v('itemTextFont')}" ${itemTextColor}>
            ${item.barRowItemText.text || ''}
          </div>
          <div class="bar-chart__bar-container">
            <div class="bar-chart__bar-fill"
                 data-length="${barLength}"
                 style="${barBgStyle} ${radiusStyle} width: ${initialWidth};">
            </div>
            <span class="bar-chart__bar-text bar-chart__bar-text--external tt-md-14" style="${barTextColor}">${item.barRowBarText?.text || ''}</span>
          </div>
        </div>
      `;
    }

    // Variants 3, 4 - text inside bar
    return `
      <div class="bar-chart__bar-item bar-chart__bar-item--stacked" data-index="${index}">
        <div class="bar-chart__item-text ${v('itemTextFont')}" ${itemTextColor}>
          ${item.barRowItemText.text || ''}
        </div>
        <div class="bar-chart__bar-container">
          <div class="bar-chart__bar-fill"
               data-length="${barLength}"
               style="${barBgStyle} ${radiusStyle} width: ${initialWidth};">
            <span class="bar-chart__bar-text tt-md-14" style="${barTextColor}">${item.barRowBarText?.text || ''}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Variants 1, 2 - text next to bar
  // Use calculated width if provided, otherwise fall back to configured barWidth
  const barContainerWidth = calculatedBarWidth || `${v('barWidth') || 60}%`;

  return `
    <div class="bar-chart__bar-item bar-chart__bar-item--side-by-side" data-index="${index}">
      <div class="bar-chart__item-text ${v('itemTextFont')}"
           style="${curDevice !== 'M' ? `width:${v('itemTextWidth')}%` : ''}; ${itemTextColor}">
        ${item.barRowItemText.text || ''}
      </div>
      <div class="bar-chart__bar-container" style="${curDevice !== 'M' ? `width:${barContainerWidth}` : ''};">
        <div class="bar-chart__bar-fill"
             data-length="${barLength}"
             style="${barBgStyle} ${radiusStyle} width: ${initialWidth};">
          <span class="bar-chart__bar-text tt-md-14" style="${barTextColor}">${item.barRowBarText?.text || ''}</span>
        </div>
      </div>
    </div>
  `;
};

/**
 * Setup scroll-triggered animation
 */
const setupAnimation = (block) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const barItems = entry.target.querySelectorAll('.bar-chart__bar-item');
        let delay = 0;

        barItems.forEach((item) => {
          const barFill = item.querySelector('.bar-chart__bar-fill');
          if (barFill) {
            const targetLength = barFill.getAttribute('data-length');
            setTimeout(() => {
              barFill.style.width = `${targetLength}%`;
            }, delay);
            delay += 150; // Stagger animation
          }
        });

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px',
  });

  observer.observe(block);
};

/**
 * Handle animation execution
 */
const handleMotion = (block) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupAnimation(block);
    });
  } else {
    setTimeout(() => {
      setupAnimation(block);
    }, 0);
  }
};

/**
 * Main decorate function
 */
export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'bar-chart');
    const v = getFieldValue(config);
    const [barItems = []] = getBlockRepeatConfigs(block);

    // Detect product line and theme from DOM using utility functions
    const productLine = getProductLine();
    const theme = getThemeMode();

    const variant = v('style');
    const hasArrow = [2, 4, 6].includes(variant);
    const isStacked = [3, 4, 5, 6].includes(variant);
    const isLarge = [5, 6].includes(variant);

    // Alignment classes based on variant
    const titleAlign = [1, 2].includes(variant) ? 'text-center' : 'text-left';
    const disclaimerAlign = [1, 2].includes(variant) ? 'text-center' : 'text-left';

    // CSS variable for colors - try nested path first, then fallback to root
    const titleFontColor = v('titleAdvanced.titleFontColor') || v('titleFontColor') || '';
    const disclaimerFontColor = v('disclaimerAdvanced.disclaimerFontColor') || v('disclaimerFontColor') || '';
    const titleColor = titleFontColor ? `style="--bar-chart-title-color: ${prefixHex(titleFontColor)};"` : '';
    const disclaimerColor = disclaimerFontColor ? `style="--bar-chart-disclaimer-color: ${prefixHex(disclaimerFontColor)};"` : '';

    // Motion class
    const motionClass = v('motion') === 'on' ? 'bar-chart--animated' : '';
    const motionEnabled = v('motion') === 'on';

    // Width calculations
    const arrowWidth = v('arrowNumWidth') || 10;
    const itemTextWidth = v('itemTextWidth') || 30;

    // Calculate bars width: For variants with arrow, subtract arrow width from 100
    const barsWidth = hasArrow ? `${100 - arrowWidth}%` : '100%';

    // Calculate bar-container width for side-by-side: 100 - itemTextWidth
    const barContainerWidth = `${100 - itemTextWidth}%`;

    // Build bar items HTML with calculated barContainerWidth
    const barsHtml = barItems.map((item, index) => {
      // Override barWidth for side-by-side variants with calculated width
      if (!isStacked) {
        const itemClone = { ...item };
        return buildBarItem(itemClone, v, index, motionEnabled, barContainerWidth);
      }
      return buildBarItem(item, v, index, motionEnabled);
    }).join('');

    // Build arrow block if needed
    const arrowHtml = buildArrowBlock(v, productLine, theme);

    // Get title font with product+device-specific defaults
    const defaultTitleFont = getProductDefault('fonts', 'titleFont', productLine, curDevice, 'tt-bd-28');
    const titleFont = getThemeAwareValue(v, 'titleFont', defaultTitleFont);
    const disclaimerFont = v('disclaimerAdvanced.disclaimerFont') || v('disclaimerFont') || 'ro-rg-14';

    // Assemble complete HTML
    const html = `
      <div class="bar-chart bar-chart--variant-${variant} ${motionClass} ${isStacked ? 'bar-chart--stacked' : 'bar-chart--side-by-side'} ${isLarge ? 'bar-chart--large' : 'bar-chart--small'}">
        <div class="bar-chart__title ${titleAlign} ${titleFont}" ${titleColor}>
          ${v('titleRichtext', 'html')}
        </div>
        <div class="bar-chart__content" style="${hasArrow ? 'display: flex;' : ''}">
          <div class="bar-chart__bars" ${curDevice !== 'M' ? `style="width:${barsWidth};"` : ''};">
            ${barsHtml}
          </div>
          ${arrowHtml}
        </div>
        ${v('disclaimerRichtext') ? `
          <div class="bar-chart__disclaimer ${disclaimerAlign} ${disclaimerFont}" ${disclaimerColor}>
            ${v('disclaimerRichtext', 'html')}
          </div>
        ` : ''}
      </div>
    `;

    block.innerHTML = html;

    // Setup animation if enabled
    if (v('motion') === 'on') {
      handleMotion(block);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating bar-chart block:', error);
    block.innerHTML = '<div class="error-message">Failed to load bar-chart block</div>';
  }
}
