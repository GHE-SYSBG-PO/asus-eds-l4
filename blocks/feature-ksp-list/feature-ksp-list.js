// import {
//   getBlockConfigs,
//   getFieldValue,
//   getProductLine,
// } from '../../scripts/utils.js';

// // DEFAULT CONFIGURATION
// const DEFAULT_CONFIG = {
//   lineVisibility: 'hide',
//   lineWidth: '1',
//   bgColorDefault: '',
//   bgColorHover: '',
//   bgColorPressed: '',
//   cardAlignment: 'left',
//   ctaVisibility: 'show',
//   motion: false,
//   titleFont: {
//     asus: 'ro-md-16-sh',
//     proart: 'ro-md-16-sh',
//     rog: 'rc-md-16-sh',
//     tuf: 'ro-md-16-sh',
//   },
//   infoFont: {
//     asus: 'ro-rg-12',
//     proart: 'ro-rg-12',
//     rog: 'rc-rg-12',
//     tuf: 'ro-rg-12',
//   },
//   ctaFont: {
//     asus: 'ro-md-16-sh',
//     proart: 'ro-md-16-sh',
//     rog: 'rc-md-16-sh',
//     tuf: 'ro-md-16-sh',
//   },
// };

// /**
//  * Prefix hex color values with #
//  */
// const prefixHex = (color) => {
//   if (!color || typeof color !== 'string') return '';
//   return color.startsWith('#') ? color : `#${color}`;
// };

// /**
//  * Setup scroll-triggered animation
//  */
// const setupAnimation = (block) => {
//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         const items = entry.target.querySelectorAll('.feature-ksp-list__item');
//         items.forEach((item, index) => {
//           setTimeout(() => {
//             item.classList.add('feature-ksp-list__item--visible');
//           }, index * 100);
//         });
//         observer.unobserve(entry.target);
//       }
//     });
//   }, {
//     threshold: 0.2,
//     rootMargin: '0px',
//   });

//   observer.observe(block);
// };

// /**
//  * Handle animation execution
//  */
// const handleMotion = (block) => {
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//       setupAnimation(block);
//     });
//   } else {
//     setTimeout(() => {
//       setupAnimation(block);
//     }, 0);
//   }
// };

// /**
//  * Main decorate function
//  */
// export default async function decorate(block) {
//   try {
//     const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'feature-ksp-list');
//     const v = getFieldValue(config);

//     // Parse items directly from block DOM
//     // First 9 divs are layout config, rest are items
//     const LAYOUT_FIELDS_COUNT = 9;
//     const allRows = Array.from(block.children);
//     const itemRows = allRows.slice(LAYOUT_FIELDS_COUNT);

//     const items = itemRows.map((row) => {
//       const cells = Array.from(row.children);
//       const getValue = (index) => {
//         const cell = cells[index];
//         if (!cell) return '';
//         // Check for image
//         const img = cell.querySelector('img');
//         if (img) return img.src;
//         // Get text content
//         const p = cell.querySelector('p');
//         return p ? p.textContent.trim() : cell.textContent.trim();
//       };

//       return {
//         asset: getValue(0),
//         title: getValue(1),
//         info: getValue(2),
//         ctaText: getValue(3),
//         ctaSectionId: getValue(4),
//         titleFont: getValue(5),
//         titleFontColor: getValue(6),
//         infoFont: getValue(7),
//         infoFontColor: getValue(8),
//         ctaFont: getValue(9),
//         ctaFontColor: getValue(10),
//         ctaIconAsset: getValue(11),
//       };
//     });

//     // Detect product line from DOM using utility functions
//     const productLine = getProductLine();

//     // Get configuration values
//     const lineVisible = v('lineVisibility') === 'show';
//     const lineColor = v('lineColor') || '';
//     const lineWidth = v('lineWidth') || '1';

//     // Parse line color (support gradient with comma-separated colors) - only if authored
//     const colorStr = typeof lineColor === 'string' ? lineColor : '';
//     const colors = colorStr.split(',').map((c) => prefixHex(c.trim())).filter((c) => c);
//     const isGradient = colors.length > 1 && colors[0] !== colors[1];

//     const bgColorDefault = v('bgColorDefault');
//     const bgColorHover = v('bgColorHover');
//     const bgColorPressed = v('bgColorPressed');
//     const cardAlignment = v('cardAlignment') || 'left';
//     const ctaVisible = v('ctaVisibility') === 'show';
//     const motionEnabled = v('motion');

//     // Get product-specific font defaults
//     const defaultTitleFont = DEFAULT_CONFIG.titleFont[productLine] || 'ro-md-16-sh';
//     const defaultInfoFont = DEFAULT_CONFIG.infoFont[productLine] || 'ro-rg-12';
//     const defaultCtaFont = DEFAULT_CONFIG.ctaFont[productLine] || 'ro-md-16-sh';

//     // Build items HTML
//     const itemsHtml = items.map((item, index) => {
//       const asset = item.asset || '';
//       const title = item.title || '';
//       const info = item.info || '';
//       const ctaText = item.ctaText || '';
//       const ctaSectionId = item.ctaSectionId || '';
//       const titleFont = item.titleFont || defaultTitleFont;
//       const titleFontColor = item.titleFontColor || '';
//       const infoFont = item.infoFont || defaultInfoFont;
//       const infoFontColor = item.infoFontColor || '';
//       const ctaFont = item.ctaFont || defaultCtaFont;
//       const ctaFontColor = item.ctaFontColor || '';
//       const ctaIconAsset = item.ctaIconAsset || '';

//       const titleStyle = titleFontColor ? `color: ${prefixHex(titleFontColor)};` : '';
//       const infoStyle = infoFontColor ? `color: ${prefixHex(infoFontColor)};` : '';

//       // Parse CTA color (support gradient with comma-separated colors)
//       const ctaColorStr = typeof ctaFontColor === 'string' ? ctaFontColor : '';
//       const ctaColors = ctaColorStr.split(',').map((c) => prefixHex(c.trim())).filter((c) => c);
//       const isCtaGradient = ctaColors.length > 1 && ctaColors[0] !== ctaColors[1];

//       let ctaStyle = '';
//       if (isCtaGradient) {
//         // Use gradient for text
//         const gradient = `linear-gradient(90deg, ${ctaColors.join(', ')})`;
//         ctaStyle = `background: ${gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`;
//       } else if (ctaColors[0]) {
//         // Use solid color
//         ctaStyle = `color: ${ctaColors[0]};`;
//       }

//       return `
//         <div class="feature-ksp-list__item"
//              data-index="${index}"
//              ${ctaSectionId ? `data-section-id="${ctaSectionId}"` : ''}>
//           ${asset ? `
//             <div class="feature-ksp-list__icon">
//               <img src="${asset}" alt="" loading="lazy" />
//             </div>
//           ` : ''}
//           <div class="feature-ksp-list__content">
//             ${title ? `<div class="feature-ksp-list__title ${titleFont}" style="${titleStyle}">${title}</div>` : ''}
//             ${info ? `<div class="feature-ksp-list__info ${infoFont}" style="${infoStyle}">${info}</div>` : ''}
//             ${ctaVisible && ctaText ? `
//               <div class="feature-ksp-list__cta ${ctaFont}" style="${ctaStyle}">
//                 ${ctaText}
//                 ${ctaIconAsset ? `<img src="${ctaIconAsset}" alt="" class="feature-ksp-list__cta-icon" />` : ''}
//               </div>
//             ` : ''}
//           </div>
//         </div>
//       `;
//     }).join('');

//     // Assemble CSS variables
//     const cssVars = [];
//     if (bgColorDefault) cssVars.push(`--ksp-bg-default: ${prefixHex(bgColorDefault)}`);
//     if (bgColorHover) cssVars.push(`--ksp-bg-hover: ${prefixHex(bgColorHover)}`);
//     if (bgColorPressed) cssVars.push(`--ksp-bg-pressed: ${prefixHex(bgColorPressed)}`);
//     if (lineVisible) {
//       if (isGradient) {
//         // Use gradient for line
//         cssVars.push(`--ksp-line-gradient: linear-gradient(90deg, ${colors.join(', ')})`);
//       } else if (colors[0]) {
//         // Use solid color for line
//         cssVars.push(`--ksp-line-color: ${colors[0]}`);
//       }
//       cssVars.push(`--ksp-line-width: ${lineWidth}px`);
//     }
//     const styleAttr = cssVars.length > 0 ? `style="${cssVars.join('; ')}"` : '';

//     const html = `
//       <div class="feature-ksp-list ${lineVisible ? 'feature-ksp-list--with-line' : ''} ${motionEnabled ? 'feature-ksp-list--animated' : ''}"
//            ${styleAttr}>
//         <div class="feature-ksp-list__grid ${cardAlignment === 'center' ? 'feature-ksp-list__grid--center' : ''}">
//           ${itemsHtml}
//         </div>
//       </div>
//     `;

//     block.innerHTML = html;

//     // Setup animation if enabled
//     if (motionEnabled) {
//       handleMotion(block);
//     }

//     // Setup click handlers for anchor navigation
//     const itemElements = block.querySelectorAll('[data-section-id]');
//     itemElements.forEach((itemEl) => {
//       itemEl.style.cursor = 'pointer';
//       itemEl.addEventListener('click', () => {
//         const sectionId = itemEl.getAttribute('data-section-id');
//         if (sectionId) {
//           const targetSection = document.getElementById(sectionId);
//           if (targetSection) {
//             targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
//           }
//         }
//       });
//     });
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.error('Error decorating feature-ksp-list block:', error);
//     block.innerHTML = '<div class="error-message">Failed to load feature-ksp-list block</div>';
//   }
// }
