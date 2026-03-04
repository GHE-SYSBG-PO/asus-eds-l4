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
  try {
    console.log('block', block)
    // Fetch configuration settings
    const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'container-2cols-item');
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
        className: 'lg:ml-(--container-2cols-item-margin-left-lg)',
        variableName: '--container-2cols-item-margin-left-lg',
        value: v('marginLeftD'),
      },
      {
        key: 'marginLeftT',
        className: 'md:ml-(--container-2cols-item-margin-left-md)',
        variableName: '--container-2cols-item-margin-left-md',
        value: v('marginLeftT'),
      },
      {
        key: 'marginLeftM',
        className: 'ml-(--container-2cols-item-margin-left)',
        variableName: '--container-2cols-item-margin-left',
        value: v('marginLeftM'),
      },
      {
        key: 'marginRightD',
        className: 'lg:mr-(--container-2cols-item-margin-right-lg)',
        variableName: '--container-2cols-item-margin-right-lg',
        value: v('marginRightD'),
      },
      {
        key: 'marginRightT',
        className: 'md:mr-(--container-2cols-item-margin-right-md)',
        variableName: '--container-2cols-item-margin-right-md',
        value: v('marginRightT'),
      },
      {
        key: 'marginRightM',
        className: 'mr-(--container-2cols-item-margin-right)',
        variableName: '--container-2cols-item-margin-right',
        value: v('marginRightM'),
      },
      {
        key: 'marginTopD',
        className: 'lg:mt-(--container-2cols-item-margin-top-lg)',
        variableName: '--container-2cols-item-margin-top-lg',
        value: v('marginTopD'),
      },
      {
        key: 'marginTopT',
        className: 'md:mt-(--container-2cols-item-margin-top-md)',
        variableName: '--container-2cols-item-margin-top-md',
        value: v('marginTopT'),
      },
      {
        key: 'marginTopM',
        className: 'mt-(--container-2cols-item-margin-top)',
        variableName: '--container-2cols-item-margin-top',
        value: v('marginTopM'),
      },
      {
        key: 'widthD',
        className: 'lg:w-(--container-2cols-item-width-lg)',
        variableName: '--container-2cols-item-width-lg',
        value: v('widthD'),
      },
      {
        key: 'widthT',
        className: 'md:w-(--container-2cols-item-width-md)',
        variableName: '--container-2cols-item-width-md',
        value: v('widthT'),
      },
      {
        key: 'widthM',
        className: 'w-(--container-2cols-item-width)',
        variableName: '--container-2cols-item-width',
        value: v('widthM'),
      },
      {
        key: 'maxWidthD',
        className: 'lg:max-w-(--container-2cols-item-max-width-lg)',
        variableName: '--container-2cols-item-max-width-lg',
        value: v('maxWidthD'),
      },
      {
        key: 'maxWidthT',
        className: 'md:max-w-(--container-2cols-item-max-width-md)',
        variableName: '--container-2cols-item-max-width-md',
        value: v('maxWidthT'),
      },
      {
        key: 'maxWidthM',
        className: 'max-w-(--container-2cols-item-max-width)',
        variableName: '--container-2cols-item-max-width',
        value: v('maxWidthM'),
      },
    ];
    block.classList.add('container-2cols-item-bg');
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating container-2cols-item block:', error);
    block.innerHTML = '<div class="error-message">Failed to load container-2cols-item block</div>';
  }
}
