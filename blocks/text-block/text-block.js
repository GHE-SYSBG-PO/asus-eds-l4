import {
  getBlockConfigs,
  getFieldValue,
  handleDecide,
  processInlineIdSyntax,
  handleMotion,
  getProductLine,
} from '../../scripts/utils.js';
import { buildButtonHtml } from '../../components/button/button.js';

const FONTS = {
  asus: {
    categoryFontD: 'tt-md-20-lg',
    categoryFontT: 'tt-md-20-md',
    categoryFontM: 'tt-md-16-sm',
    titleFontD: 'tt-md-40-lg',
    titleFontT: 'tt-md-40-md',
    titleFontM: 'tt-md-40-sm',
    bodyFontD: 'ro-rg-20-lg',
    bodyFontT: 'ro-rg-20-md',
    bodyFontM: 'ro-rg-18-sm',
    disclaimerFont: 'ro-rg-13',
    ctaFontD: 'ro-md-20-sh-lg',
    ctaFontT: 'ro-md-20-sh-md',
    ctaFontM: 'ro-md-18-sh-sm',
  },
  proart: {
    categoryFontD: 'tt-md-20-lg',
    categoryFontT: 'tt-md-20-md',
    categoryFontM: 'tt-md-16-sm',
    titleFontD: 'tt-md-40-lg',
    titleFontT: 'tt-md-40-md',
    titleFontM: 'tt-md-40-sm',
    bodyFontD: 'ro-rg-20-lg',
    bodyFontT: 'ro-rg-20-md',
    bodyFontM: 'ro-rg-18-sm',
    disclaimerFont: 'ro-rg-13',
    ctaFontD: 'ro-md-20-sh-lg',
    ctaFontT: 'ro-md-20-sh-md',
    ctaFontM: 'ro-md-18-sh-sm',
  },
  rog: {
    categoryFontD: 'tg-bd-20-lg',
    categoryFontT: 'tg-bd-20-md',
    categoryFontM: 'tg-bd-16-sm',
    titleFontD: 'tg-bd-40-lg',
    titleFontT: 'tg-bd-40-md',
    titleFontM: 'tg-bd-40-sm',
    bodyFontD: 'rc-rg-20-lg',
    bodyFontT: 'rc-rg-20-md',
    bodyFontM: 'rc-rg-18-sm',
    disclaimerFont: 'rc-rg-13',
    ctaFontD: 'rc-bd-20-sh-lg',
    ctaFontT: 'rc-bd-20-sh-md',
    ctaFontM: 'rc-bd-18-sh-sm',
  },
  tuf: {
    categoryFontD: 'dp-cb-20-lg',
    categoryFontT: 'dp-cb-20-md',
    categoryFontM: 'dp-cb-16-sm',
    titleFontD: 'dp-cb-40-lg',
    titleFontT: 'dp-cb-40-md',
    titleFontM: 'dp-cb-40-sm',
    bodyFontD: 'ro-rg-20-lg',
    bodyFontT: 'ro-rg-20-md',
    bodyFontM: 'ro-rg-18-sm',
    disclaimerFont: 'ro-rg-13',
    ctaFontD: 'ro-md-20-sh-lg',
    ctaFontT: 'ro-md-20-sh-md',
    ctaFontM: 'ro-md-18-sh-sm',
  },
};

const PRODUCT_LINE = getProductLine();

// DEFAULT
const DEFAULT_CONFIG = {
  desktopAlignment: 'center',
  tabletAlignment: 'center',
  mobileAlignment: 'center',
  motion: 'off',
  ctaVisible: 'show',
  categoryFontD: FONTS[PRODUCT_LINE].categoryFontD,
  categoryFontT: FONTS[PRODUCT_LINE].categoryFontT,
  categoryFontM: FONTS[PRODUCT_LINE].categoryFontM,
  titleFontD: FONTS[PRODUCT_LINE].titleFontD,
  titleFontT: FONTS[PRODUCT_LINE].titleFontT,
  titleFontM: FONTS[PRODUCT_LINE].titleFontM,
  bodyFontD: FONTS[PRODUCT_LINE].bodyFontD,
  bodyFontT: FONTS[PRODUCT_LINE].bodyFontT,
  bodyFontM: FONTS[PRODUCT_LINE].bodyFontM,
  ctaFontD: FONTS[PRODUCT_LINE].ctaFontD,
  ctaFontT: FONTS[PRODUCT_LINE].ctaFontT,
  ctaFontM: FONTS[PRODUCT_LINE].ctaFontM,
};

const handleCategoryClass = (num) => {
  switch (num) {
    case 1:
      return 'items-center';
    case 2:
      return 'items-center flex-row-reverse';
    case 3:
      return 'flex-col';
    case 4:
      return 'flex-col flex-col-reverse';
    case 5:
      return 'flex-col flex-col-reverse md:items-center';
    case 6:
      return 'flex-col md:items-center';
    default:
      return 'items-center';
  }
};

export default async function decorate(block) {
  try {
    // console.log('执行text-block', block);
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'text-block');
    const v = getFieldValue(config);
    // console.log('执行text-block-config', config);

    const dAlignment = v('desktopAlignment') === 'left' ? 'lg:items-start' : 'lg:items-center';
    const tAlignment = v('tabletAlignment') === 'left' ? 'md:items-start' : 'md:items-center';
    const mAlignment = v('mobileAlignment') === 'left' ? 'items-start' : 'items-center';
    const dBlockAlignment = v('desktopAlignment') === 'left' ? 'lg:text-left' : 'lg:text-center';
    const tBlockAlignment = v('tabletAlignment') === 'left' ? 'md:text-left' : 'md:text-center';
    const mBlockAlignment = v('mobileAlignment') === 'left' ? 'text-left' : 'text-center';

    let icon1 = '';
    let icon2 = '';
    let categoryClass = '';
    let categoryFontColor = '';
    let titleFontColor = '';
    const bodyFontColor = v('bodyFontColor') ? `style='--text-block-body-color: #${v('bodyFontColor')};'` : '';
    const disclaimerFontColor = v('disclaimerFontColor') ? `style='--text-block-disclaimer-color: #${v('disclaimerFontColor')};'` : '';
    let motion = '';
    let ctaFontColor = '';

    if (v('titleFontColor')) {
      const [start, end = start] = v('titleFontColor').split(',');
      titleFontColor = `style='--text-block-title-start: #${start}; --text-block-title-end: #${end};'`;
    }
    if (v('ctaLinkType') === 'text-link' && v('ctaFontColor')) {
      const [start, end = start] = v('ctaFontColor').split(',');
      ctaFontColor = `style='--text-block-cta-start: #${start}; --text-block-cta-end: #${end};'`;
    }
    if (v('motion') === 'on') {
      motion = 'g-block-animation';
      handleMotion(block);
    }
    try {
      if (v('categoryFontColor')) {
        categoryFontColor = `style='--text-block-category-color: #${v('categoryFontColor')};'`;
      }
      await handleDecide(v('categoryIcon') === 'yes');
      await handleDecide(v('categoryIcon1'));
      icon1 = `
        <div class='w-[36px] h-[36px] flex items-center justify-center'>${v('categoryIcon1', 'html')}</div>
      `;
      categoryClass = handleCategoryClass(v('categoryIconPosition'));
      await handleDecide(v('categoryIconNum') === 2 && v('categoryIcon2'));
      icon2 = `
        <div class='w-[36px] h-[36px] flex items-center justify-center'>${v('categoryIcon2', 'html')}</div>
      `;
      categoryClass = handleCategoryClass(7);
    } catch (error) {
      // console.warn('Error:', error);
    }

    const category = `
      <div class='flex ${categoryClass}'>
        ${icon1}
        <div class='break-all flex-1 text-block-category ${v('categoryFontD')} ${v('categoryFontT')} ${v('categoryFontM')}' ${categoryFontColor}>
          ${v('categoryRichtext', 'html') || ''}
        </div>
        ${icon2}
      </div>
    `;

    const title = `
      <div class='${v('titleRichtext') && 'mt-[10px]'} break-all text-block-title ${dBlockAlignment} ${tBlockAlignment} ${mBlockAlignment} ${v('titleFontD')} ${v('titleFontT')} ${v('titleFontM')}' ${titleFontColor}>
        ${v('titleRichtext', 'html')}
      </div>
    `;

    const body = `
      <div class='${v('bodyRichtext') && 'mt-[18px]'} break-all text-block-body ${dBlockAlignment} ${tBlockAlignment} ${mBlockAlignment} ${v('bodyFontD')} ${v('bodyFontT')} ${v('bodyFontM')}' ${bodyFontColor}>
        ${v('bodyRichtext', 'html')}
      </div>
    `;

    const disclaimer = `
      <div class='${v('disclaimerRichtext') && 'mt-[16px]'} break-all text-block-disclaimer ${FONTS[PRODUCT_LINE].disclaimerFont} ${dBlockAlignment} ${tBlockAlignment} ${mBlockAlignment}' ${disclaimerFontColor}>
        ${v('disclaimerRichtext', 'html')}
      </div>
    `;

    const ctaLink = `
      <a href="${v('ctaHyperlink')}" class="text-block-cta ${v('ctaFontD')} ${v('ctaFontT')} ${v('ctaFontM')}" ${ctaFontColor} target="_blank">
        ${v('ctaText')}
      </a>
    `;
    let catButton = '';
    if (v('ctaLinkType') === 'button' && v('ctaHyperlink')) {
      catButton = buildButtonHtml(v).replace(
        /<a/g,
        `<a onclick="window.open('${v('ctaHyperlink')}', '_blank')"`,
      );
    }
    const cta = `
      <div class='${v('ctaVisible') === 'hide' ? '' : 'mt-[16px]'} break-all ${dBlockAlignment} ${tBlockAlignment} ${mBlockAlignment}'>
        ${v('ctaLinkType') === 'text-link' ? ctaLink : v('ctaLinkType') === 'button' ? catButton : ''}
      </div>
    `;

    const wrap = `
      <div class='flex flex-col ${motion} ${dAlignment} ${tAlignment} ${mAlignment} ${v('colorGroup')}'>
        ${category}
        ${title}
        ${body}
        ${disclaimer}
        ${v('ctaVisible') === 'hide' ? '' : cta}
      </div>
    `;

    block.innerHTML = wrap;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating text-block block:', error);
    block.innerHTML = '<div class="error-message">Failed to load text-block block</div>';
  }

  processInlineIdSyntax(block);
}
