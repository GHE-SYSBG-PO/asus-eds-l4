import {
  getBlockConfigs,
  getFieldValue,
  handleDecide,
  processInlineIdSyntax,
  handleMotion,
} from '../../scripts/utils.js';

// DEFAULT
const DEFAULT_CONFIG = {
  categoryRichtext: '',
  titleRichtext: '',
  bodyRichtext: '',
  disclaimerRichtext: '',
  motion: 'off',
  ctaText: '',
  ctaVisible: 'show',
  ctaLinkType: '',
  categoryIcon: '',
  categoryIconNum: '',
  categoryIconPosition: '',
  categoryIcon1: '',
  categoryIcon2: '',
  categoryFont: 'tt-md-20',
  categoryFontColor: '',
  titleFont: 'tt-md-40',
  titleFontColor: '',
  bodyFontDT: 'ro-rg-20-md',
  bodyFontM: 'ro-rg-20',
  bodyFontColor: '',
  disclaimerFontColor: '',
  ctaFontDT: 'ro-md-20-md',
  ctaFontM: 'ro-md-20',
  ctaFontColor: '',
  ctaHyperlink: '',
  col1Width: '',
  col1PaddingRight: '',
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
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'text-block-2-col');
    const v = getFieldValue(config);
    // console.log('执行text-block-config', config);

    let icon1 = '';
    let icon2 = '';
    let categoryClass = '';
    let categoryFontColor = '';
    let col1Width = '';
    let col1PaddingRight = '';
    let col1Style = '';

    const titleFontColor = v('titleFontColor') ? `style='--text-block-title-color: #${v('titleFontColor')};--text-block-title-gradient: '';'` : '';
    const bodyFontColor = v('bodyFontColor') ? `style='--text-block-body-color: #${v('bodyFontColor')};'` : '';
    const disclaimerFontColor = v('disclaimerFontColor') ? `style='--text-block-disclaimer-color: #${v('disclaimerFontColor')};'` : '';
    let motion = '';
    let ctaFontColor = '';

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

    try {
      if (v('col1Width')) {
        col1Width = `--text-block-col1-width: ${v('col1Width')}`;
      }

      if (v('col1PaddingRight')) {
        col1PaddingRight = `--text-block-col1-padding-right: ${v('col1PaddingRight')}`;
      }

      col1Style = [col1Width, col1PaddingRight].filter(Boolean).join(';');
      col1Style = col1Style ? `style='${col1Style};'` : '';

      console.log('col1Style', col1Style);  
    } catch (error) {
      // console.warn('Error:', error);
    }

    const category = `
      <div class='flex ${categoryClass}'>
        ${icon1}
        <div class='break-all flex-1 text-block-category ${v('categoryFont')}' ${categoryFontColor}>${v('categoryRichtext', 'html') || ''}</div>
        ${icon2}
      </div>
    `;

    const title = `
      <div class='${v('titleRichtext') && 'mt-[8px] md:mt-[10px] lg:mt-0'} break-all text-block-title ${v('titleFont')}' ${titleFontColor}>
        ${v('titleRichtext', 'html')}
      </div>
    `;

    const body = `
      <div class='${v('bodyRichtext') && 'mt-[12px] md:mt-[18px] lg:mt-0'} break-all text-block-body ${v('bodyFontDT')} ${v('bodyFontM')}' ${bodyFontColor}>
        ${v('bodyRichtext', 'html')}
      </div>
    `;

    const disclaimer = `
      <div class='${v('disclaimerRichtext') && 'mt-[14.4px] md:mt-[16px] lg:mt-[16px]'} break-all text-block-disclaimer ro-rg-13' ${disclaimerFontColor}>
        ${v('disclaimerRichtext', 'html')}
      </div>
    `;

    const cta = `
      <div class='${v('ctaVisible') === 'hide' ? '' : 'mt-[14.4px] md:mt-[16px] lg:mt-[16px]'} break-all'>
        <a href="${v('ctaHyperlink')}" class="text-block-cta ${v('ctaFontDT')} ${v('ctaFontM')}" ${ctaFontColor} target="_blank">
            ${v('ctaText')}
          </a>
      </div>
    `;

    const wrap = `
      <div class="content-category ${motion}">
        ${category}
      </div>

      <div class="lg:flex lg:flex-row content-main mt-0 md:mt-0 lg:mt-[12px]" ${col1Style}>
        <div class="main-title ${motion}">
          ${title}
        </div>

        <div class="main-body lg:flex-1 ${motion}">
          ${body}
          ${disclaimer}
          ${cta}
        </div>
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
