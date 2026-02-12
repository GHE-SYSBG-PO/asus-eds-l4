import {
  getBlockConfigs, getFieldValue, nestBlockExecuteJs,
} from '../../scripts/utils.js';

// DEFAULT
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
  // Fetch configuration settings
  const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'container-col');
  // Simplify value retrieval
  const v = getFieldValue(config);
  // Execute nested block JavaScript
  nestBlockExecuteJs(block);

  ['hAlignD', 'hAlignT', 'hAlignM', 'vAlignD', 'vAlignT', 'vAlignM'].forEach((item) => {
    if (v(item)) {
      block.classList.add(v(item));
    }
  });
  // Define margin, width, and max-width configurations
  const data = [
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
