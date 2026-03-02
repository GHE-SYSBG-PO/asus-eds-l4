export default async function decorate(block) {
  const tabParentDom = block.parentNode.parentNode.parentNode;
  if (tabParentDom.dataset.sectionStatus === 'loading') return block;
  // submit item dom data to tab-3column
  tabParentDom.dispatchEvent(
    new CustomEvent('asus-l4--section-tab-3column', {
      detail: block,
    }),
  );
}
