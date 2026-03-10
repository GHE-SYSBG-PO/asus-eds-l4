import {
  nestBlockExecuteJs,
} from '../../scripts/utils.js';

export default async function decorate(block) {
  // Execute nested block JavaScript
  await nestBlockExecuteJs(block, false);
  const tabParentDom = block?.parentNode?.parentNode;
  if (!tabParentDom) return block;
  if (tabParentDom.dataset.sectionStatus === 'loading') return block;
  tabParentDom.parentNode?.dispatchEvent(
    new CustomEvent('asus-l4--section-nav-hero', {
      detail: block,
    }),
  );
}
