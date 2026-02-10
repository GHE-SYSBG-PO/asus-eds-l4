import {
  getBlockConfigs,
  getFieldValue,
  handleDecide,
} from '../../scripts/utils.js';

// 默认值
const DEFAULT_CONFIG = {
  desktopAlignment: 'center',
  tabletAlignment: 'center',
  mobileAlignment: 'center',
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
};

// 处理category的外部class
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

// 将原来的动画逻辑提取为独立函数
const setupAnimation = (block) => {
  const containers = block.querySelectorAll('.text-block-animation');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        let time = 100;
        const spans = entry.target.querySelectorAll('span');
        spans.forEach((span) => {
          time += 100;
          setTimeout(() => {
            if (span && span.style) {
              span.style.opacity = 1;
              span.style.transform = 'translateZ(0px) translateY(0px)';
            }
          }, time);
        });
        const imgs = entry.target.querySelectorAll('img');
        imgs.forEach((img) => {
          time += 100;
          setTimeout(() => {
            if (img && img.style) {
              img.style.opacity = 1;
              img.style.transform = 'translateZ(0px) translateY(0px)';
            }
          }, time);
        });
        const divs = entry.target.querySelectorAll('div');
        divs.forEach((div) => {
          time += 100;
          setTimeout(() => {
            if (div && div.style) {
              div.style.opacity = 1;
              div.style.transform = 'translateZ(0px) translateY(0px)';
            }
          }, time);
        });
      }
    });
  });

  containers.forEach((item) => {
    observer.observe(item);
  });
};

// 执行动画
const handleMotion = (block) => {
  // 检查文档是否已经加载完成
  if (document.readyState === 'loading') {
    // 如果还在加载中，添加事件监听器
    block.addEventListener('DOMContentLoaded', () => {
      setupAnimation(block);
    });
  } else {
    // 如果已经加载完成，直接执行动画设置
    setTimeout(() => {
      setupAnimation(block);
    }, 0);
  }
};

export default async function decorate(block) {
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
  const titleFontColor = v('titleFontColor') ? `style='--text-block-title-color: ${v('titleFontColor')};--text-block-title-gradient: '';'` : '';
  const bodyFontColor = v('bodyFontColor') ? `style='--text-block-body-color: ${v('bodyFontColor')};'` : '';
  const disclaimerFontColor = v('disclaimerFontColor') ? `style='--text-block-disclaimer-color: ${v('disclaimerFontColor')};'` : '';
  let motion = '';
  let ctaFontColor = '';

  if (v('ctaLinkType') === 'text-link' && v('ctaFontColor')) {
    const [start, end = start] = v('ctaFontColor').split(',');
    ctaFontColor = `style='--text-block-cta-start: ${start}; --text-block-cta-end: ${end};'`;
  }
  if (v('motion') === 'on') {
    motion = 'text-block-animation';
    handleMotion(block);
  }
  try {
    if (v('categoryFontColor')) {
      categoryFontColor = `style='--text-block-category-color: ${v('categoryFontColor')};'`;
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
    // eslint-disable-next-line no-console
    // console.error('Error:', error);
  }

  const category = `
    <div class='flex ${categoryClass}'>
      ${icon1}
      <div class='break-all flex-1 text-block-category ${v('categoryFont')}' ${categoryFontColor}>${v('categoryRichtext', 'html') || ''}</div>
      ${icon2}
    </div>
  `;

  const title = `
    <div class='${v('titleRichtext') && 'mt-[10px]'} break-all text-block-title ${dBlockAlignment} ${tBlockAlignment} ${mBlockAlignment} ${v('titleFont')}' ${titleFontColor}>
      ${v('titleRichtext', 'html')}
    </div>
  `;

  const body = `
    <div class='${v('bodyRichtext') && 'mt-[18px]'} break-all text-block-body ${dBlockAlignment} ${tBlockAlignment} ${mBlockAlignment} ${v('bodyFontDT')} ${v('bodyFontM')}' ${bodyFontColor}>
      ${v('bodyRichtext', 'html')}
    </div>
  `;

  const disclaimer = `
    <div class='${v('disclaimerRichtext') && 'mt-[16px]'} break-all text-block-disclaimer ro-rg-13 ${dBlockAlignment} ${tBlockAlignment} ${mBlockAlignment}' ${disclaimerFontColor}>
      ${v('disclaimerRichtext', 'html')}
    </div>
  `;

  const cta = `
    <div class='${v('ctaVisible') === 'hide' ? '' : 'mt-[16px]'} break-all ${dBlockAlignment} ${tBlockAlignment} ${mBlockAlignment}'>
      <a href="${v('ctaHyperlink')}" class="text-block-cta ${v('ctaFontDT')} ${v('ctaFontM')}" ${ctaFontColor} target="_blank">
          ${v('ctaText')}
        </a>
    </div>
  `;

  const wrap = `
    <div class='flex flex-col ${motion} ${dAlignment} ${tAlignment} ${mAlignment}'>
      ${category}
      ${title}
      ${body}
      ${disclaimer}
      ${v('ctaVisible') === 'hide' ? '' : cta}
    </div>
  `;

  block.innerHTML = wrap;
}
