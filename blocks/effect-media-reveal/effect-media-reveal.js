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
  titleRichtext: '',
  motion: 'off',
  titleFont: 'tt-md-40',
};

// 将原来的动画逻辑提取为独立函数
const setupAnimation = (block) => {

};

export default async function decorate(block) {
  // console.log('执行text-block', block);
  const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'effect-media-reveal');
  const v = getFieldValue(config);
  // console.log('执行text-block-config', config);

  const title = `
    <div class='${v('titleRichtext') && 'mt-[10px]'} break-all text-block-title  ${v('titleFont')}'>
      ${v('titleRichtext', 'html')}
    </div>
  `;

  const wrap = `
    <div class='flex flex-col'>
      ${title}
    </div>
  `;

  block.innerHTML = wrap;
}
