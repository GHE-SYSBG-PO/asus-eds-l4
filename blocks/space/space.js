import {
  getBlockConfigs,
  getFieldValue,
} from '../../scripts/utils.js';

// 默认值
const DEFAULT_CONFIG = {
  variant: '1',
  customValue: '',
  configLevel: 'basic',
};

// 样式映射
const VARIANT_CLASSES = {
  1: 'space-v1', // Section to section 单一背景色
  2: 'space-v2', // Section to section 两种背景色
  3: 'space-v3', // Section top
  4: 'space-v4', // Section bottom
  5: 'space-v5', // Text to image / Text to 物件
  6: 'space-v6', // Text to HL
};

export default async function decorate(block) {
  const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'space');
  const v = getFieldValue(config);
  const variant = v('variant') || '1';
  const customValue = v('customValue');

  // 清空现有内容
  block.innerHTML = '';

  const spaceDiv = document.createElement('div');
  spaceDiv.classList.add('space-item');

  if (variant === '7') {
    // Custom Variant (7)
    // 允许 user 输入 2-120 的值
    if (customValue) {
      spaceDiv.classList.add('space-v7');
      // Set inline style for custom height
      spaceDiv.style.height = `${customValue}px`;
    } else {
      // Fallback or empty if no value provided
      spaceDiv.style.height = '0px';
    }
  } else {
    // Standard Variants (1-6)
    const className = VARIANT_CLASSES[variant] || 'space-v1';
    spaceDiv.classList.add(className);
  }

  // Add data-variant for UE visual aid
  spaceDiv.dataset.variant = variant === '7' ? `7 (${customValue}px)` : variant;

  block.append(spaceDiv);
}
