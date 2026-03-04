import {
  nestBlockExecuteJs,
} from '../../scripts/utils.js';

export default async function decorate(block) {
  // Execute nested block JavaScript
  await nestBlockExecuteJs(block, false);
  const tabParentDom = block.parentNode.parentNode;
  if (tabParentDom.dataset.sectionStatus === 'loading') return block;
  tabParentDom.parentNode.dispatchEvent(
    new CustomEvent('asus-l4--section-tab-3column', {
      detail: block,
    }),
  );
}
