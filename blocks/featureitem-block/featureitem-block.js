import {
  getBlockConfigs,
} from '../../scripts/utils.js';

// function debounce(fn, delay = 200) {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => fn(...args), delay);
//   };
// }

// function groupByRow(items) {
//   const rows = [];
//   let currentTop = null;
//   let currentRow = [];

//   items.forEach((item) => {
//     const top = item.offsetTop;

//     if (currentTop === null) {
//       currentTop = top;
//     }

//     if (Math.abs(top - currentTop) < 5) {
//       currentRow.push(item);
//     } else {
//       rows.push(currentRow);
//       currentRow = [item];
//       currentTop = top;
//     }
//   });

//   if (currentRow.length) {
//     rows.push(currentRow);
//   }

//   return rows;
// }

// function detectAlignMode(row) {
//   let hasIcon = false;
//   let hasSubText = false;

//   row.forEach((item) => {
//     if (item.querySelector('.icon')) {
//       hasIcon = true;
//     }
//     if (item.querySelector('.subtext')) {
//       hasSubText = true;
//     }
//   });

//   if (!hasIcon) return 'align-text-top';
//   if (hasIcon && hasSubText) return 'align-baseline';
//   if (hasIcon && !hasSubText) return 'align-icon-middle';

//   return 'align-text-top';
// }

// function updateLayout(block) {
//   const items = [...block.querySelectorAll('.feature-item')];
//   if (!items.length) return;

//   const rows = groupByRow(items);
//   const middleRow = rows[Math.floor(rows.length / 2)];
//   if (!middleRow) return;

//   const mode = detectAlignMode(middleRow);

//   block.classList.remove(
//     'align-text-top',
//     'align-baseline',
//     'align-icon-middle',
//   );

//   block.classList.add(mode);
// }

// const FONTS = {
//   asus: {
//     categoryFontD: 'tt-md-20-lg',
//     categoryFontT: 'tt-md-20-md',
//     categoryFontM: 'tt-md-16-sm',
//     titleFontD: 'tt-md-40-lg',
//     titleFontT: 'tt-md-40-md',
//     titleFontM: 'tt-md-40-sm',
//     bodyFontD: 'ro-rg-20-lg',
//     bodyFontT: 'ro-rg-20-md',
//     bodyFontM: 'ro-rg-18-sm',
//     disclaimerFont: 'ro-rg-13',
//     ctaFontD: 'ro-md-20-sh-lg',
//     ctaFontT: 'ro-md-20-sh-md',
//     ctaFontM: 'ro-md-18-sh-sm',
//   },
//   proart: {
//     categoryFontD: 'tt-md-20-lg',
//     categoryFontT: 'tt-md-20-md',
//     categoryFontM: 'tt-md-16-sm',
//     titleFontD: 'tt-md-40-lg',
//     titleFontT: 'tt-md-40-md',
//     titleFontM: 'tt-md-40-sm',
//     bodyFontD: 'ro-rg-20-lg',
//     bodyFontT: 'ro-rg-20-md',
//     bodyFontM: 'ro-rg-18-sm',
//     disclaimerFont: 'ro-rg-13',
//     ctaFontD: 'ro-md-20-sh-lg',
//     ctaFontT: 'ro-md-20-sh-md',
//     ctaFontM: 'ro-md-18-sh-sm',
//   },
//   rog: {
//     categoryFontD: 'tg-bd-20-lg',
//     categoryFontT: 'tg-bd-20-md',
//     categoryFontM: 'tg-bd-16-sm',
//     titleFontD: 'tg-bd-40-lg',
//     titleFontT: 'tg-bd-40-md',
//     titleFontM: 'tg-bd-40-sm',
//     bodyFontD: 'rc-rg-20-lg',
//     bodyFontT: 'rc-rg-20-md',
//     bodyFontM: 'rc-rg-18-sm',
//     disclaimerFont: 'rc-rg-13',
//     ctaFontD: 'rc-bd-20-sh-lg',
//     ctaFontT: 'rc-bd-20-sh-md',
//     ctaFontM: 'rc-bd-18-sh-sm',
//   },
//   tuf: {
//     categoryFontD: 'dp-cb-20-lg',
//     categoryFontT: 'dp-cb-20-md',
//     categoryFontM: 'dp-cb-16-sm',
//     titleFontD: 'dp-cb-40-lg',
//     titleFontT: 'dp-cb-40-md',
//     titleFontM: 'dp-cb-40-sm',
//     bodyFontD: 'ro-rg-20-lg',
//     bodyFontT: 'ro-rg-20-md',
//     bodyFontM: 'ro-rg-18-sm',
//     disclaimerFont: 'ro-rg-13',
//     ctaFontD: 'ro-md-20-sh-lg',
//     ctaFontT: 'ro-md-20-sh-md',
//     ctaFontM: 'ro-md-18-sh-sm',
//   },
// };

// default
const DEFAULT_CONFIG = { };

export default async function decorate(block) {
  try {
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'featureitem-block');
    console.log('config', config);
    const wrapper = block.querySelectorAll(':scope > div');
    Array.from(wrapper).forEach(async (wrap) => {
      try {
        console.log('wrap', wrap.children);
        if (wrap.children.length < 2) return;
        const itemConfig = await getBlockConfigs(wrap, DEFAULT_CONFIG, 'chart-advanced-item');
        console.log('itemConfig', itemConfig);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error decorating wrapper:', error);
      }
    });
    // const rows = [...block.children];

    // rows.forEach((row) => {
    //   row.classList.add('feature-item');

    //   const img = row.querySelector('img');
    //   if (img) {
    //     img.classList.add('icon');
    //   }

    //   const paragraphs = row.querySelectorAll('p');
    //   if (paragraphs.length > 1) {
    //     paragraphs[1].classList.add('subtext');
    //   }
    // });

    // const update = debounce(() => updateLayout(block), 200);

    // requestAnimationFrame(() => {
    //   updateLayout(block);
    // });

    // window.addEventListener('resize', update);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating featureitem-block block:', error);
    block.innerHTML = '<div class="error-message">Failed to load featureitem-block block</div>';
  }
}
