import {
  getBlockConfigs,
  getFieldValue,
  getBlockRepeatConfigs,
} from '../../scripts/utils.js';

// DEFAULT
const DEFAULT_CONFIG = {
  itemTextFont: 'ro-rg-13',
};

export default async function decorate(block) {
  try {
    const wrapper = block.querySelectorAll(':scope > div');

    Array.from(wrapper).forEach(async (wrap) => {
      try {
        const config = await getBlockConfigs(wrap, DEFAULT_CONFIG, 'footnoteitem');
        const v = getFieldValue(config);
        const [items = []] = getBlockRepeatConfigs(wrap);
        // eslint-disable-next-line no-console
        console.log('footnoteblock', block, config, v, items, 'end');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error decorating wrapper:', error);
      }
    });
    // block.innerHTML = '';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating footnote block:', error);
    block.innerHTML = '<div class="error-message">Failed to load footnote block</div>';
  }
}
