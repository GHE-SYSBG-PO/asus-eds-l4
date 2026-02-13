import { getBlockConfigs, getFieldValue } from '../../scripts/utils.js';

// 1. 定義預設配置
const DEFAULT_CONFIG = {
  title: 'Default Title',
  description: 'Default Description',
  styleLayout: 'left', // left, center, right
};

export default async function decorate(block) {
  // 2. 透過 L4 Utils 讀取配置 (這是核心)
  const config = await getBlockConfigs(block, DEFAULT_CONFIG, 'starter-block');
  const v = getFieldValue(config);

  // 3. 提取資料
  const title = v('title');
  const desc = v('description');
  const layout = v('styleLayout');

  // 4. 清空原有內容並重建 DOM
  block.innerHTML = '';

  // 使用 Template Literal 建構 HTML
  const html = `
    <div class="starter-wrapper layout-${layout}">
      <h2 class="starter-title">${title}</h2>
      <div class="starter-desc">${desc}</div>
    </div>
  `;

  block.innerHTML = html;
}
