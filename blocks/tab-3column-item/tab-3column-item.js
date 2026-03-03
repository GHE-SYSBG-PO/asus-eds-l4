export default async function decorate(block) {
  const tabParentDom = block.parentNode.parentNode;
  if (tabParentDom.dataset.sectionStatus === 'loading') return block;
  tabParentDom.parentNode.dispatchEvent(
    new CustomEvent('asus-l4--section-tab-3column', {
      detail: block,
    }),
  );
}
