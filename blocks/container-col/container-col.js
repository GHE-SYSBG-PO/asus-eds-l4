import {
  getBlockConfigs, getFieldValue, nestBlockExecuteJs,
} from '../../scripts/utils.js';

// 默认值
const DEFAULT_CONFIG = {
  hAlignD: 'lg:items-start',
  hAlignT: 'md:items-start',
  hAlignM: 'items-start',
  vAlignD: 'lg:justify-start',
  vAlignT: 'md:justify-start',
  vAlignM: 'justify-start',
  marginLeftD: '',
  marginLeftT: '',
  marginLeftM: '',
  marginRightD: '',
  marginRightT: '',
  marginRightM: '',
  marginTopD: '',
  marginTopT: '',
  marginTopM: '',
  widthD: '',
  widthT: '',
  widthM: '',
  backgroundColor: '',
  maxWidthD: '',
  maxWidthT: '',
  maxWidthM: '',
  clip: 'on',
};
export default async function decorate(block) {
  // console.log('执行container-col', block);
  // 获取配置
  const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'container-col');
  // console.log('config', config);
  // 简化取值
  const v = getFieldValue(config);
  // 嵌套block执行js
  nestBlockExecuteJs(block);

  ['hAlignD', 'hAlignT', 'hAlignM', 'vAlignD', 'vAlignT', 'vAlignM'].forEach((item) => {
    if (v(item)) {
      block.classList.add(v(item));
    }
  });
  const data = [
    // 添加 marginLeft 配置
    {
      key: 'marginLeftD',
      className: 'lg:ml-(--container-col-margin-left-lg)',
      variableName: '--container-col-margin-left-lg',
      value: v('marginLeftD'),
    },
    {
      key: 'marginLeftT',
      className: 'md:ml-(--container-col-margin-left-md)',
      variableName: '--container-col-margin-left-md',
      value: v('marginLeftT'),
    },
    {
      key: 'marginLeftM',
      className: 'ml-(--container-col-margin-left)',
      variableName: '--container-col-margin-left',
      value: v('marginLeftM'),
    },
    // 添加 marginRight 配置
    {
      key: 'marginRightD',
      className: 'lg:mr-(--container-col-margin-right-lg)',
      variableName: '--container-col-margin-right-lg',
      value: v('marginRightD'),
    },
    {
      key: 'marginRightT',
      className: 'md:mr-(--container-col-margin-right-md)',
      variableName: '--container-col-margin-right-md',
      value: v('marginRightT'),
    },
    {
      key: 'marginRightM',
      className: 'mr-(--container-col-margin-right)',
      variableName: '--container-col-margin-right',
      value: v('marginRightM'),
    },
    // 添加 marginTop 配置
    {
      key: 'marginTopD',
      className: 'lg:mt-(--container-col-margin-top-lg)',
      variableName: '--container-col-margin-top-lg',
      value: v('marginTopD'),
    },
    {
      key: 'marginTopT',
      className: 'md:mt-(--container-col-margin-top-md)',
      variableName: '--container-col-margin-top-md',
      value: v('marginTopT'),
    },
    {
      key: 'marginTopM',
      className: 'mt-(--container-col-margin-top)',
      variableName: '--container-col-margin-top',
      value: v('marginTopM'),
    },
    // 添加 width 配置
    {
      key: 'widthD',
      className: 'lg:w-(--container-col-width-lg)',
      variableName: '--container-col-width-lg',
      value: v('widthD'),
    },
    {
      key: 'widthT',
      className: 'md:w-(--container-col-width-md)',
      variableName: '--container-col-width-md',
      value: v('widthT'),
    },
    {
      key: 'widthM',
      className: 'w-(--container-col-width)',
      variableName: '--container-col-width',
      value: v('widthM'),
    },
    // 添加 maxWidth 配置
    {
      key: 'maxWidthD',
      className: 'lg:max-w-(--container-col-max-width-lg)',
      variableName: '--container-col-max-width-lg',
      value: v('maxWidthD'),
    },
    {
      key: 'maxWidthT',
      className: 'md:max-w-(--container-col-max-width-md)',
      variableName: '--container-col-max-width-md',
      value: v('maxWidthT'),
    },
    {
      key: 'maxWidthM',
      className: 'max-w-(--container-col-max-width)',
      variableName: '--container-col-max-width',
      value: v('maxWidthM'),
    },
  ];
  block.classList.add('container-col-bg');
  data.forEach((item) => {
    block.classList.add(item.className);
    block.style.setProperty(item.variableName, item.value);
  });
  if (v('backgroundColor')) {
    block.style.backgroundColor = `${v('backgroundColor')}`;
  }
  if (v('clip') === 'on') {
    block.classList.add('overflow-hidden');
  }
  block.classList.add('flex', 'flex-col', 'break-all', 'h-full');
}
