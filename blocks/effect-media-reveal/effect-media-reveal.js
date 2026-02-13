import {
  getBlockConfigs,
  getFieldValue,
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
