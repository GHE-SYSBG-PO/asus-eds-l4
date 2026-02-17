import {
  getBlockConfigs,
  getFieldValue,
} from '../../scripts/utils.js';

const DEFAULT_CONFIG = {
};

export default async function decorate(block) {
  const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'footnote');
  const v = getFieldValue(config);
  console.log('v', v);

  block.innerHTML = '';

  // block.append();
}
