export default async function decorate(block) {
  const tabParentDom = block.closest('.section');
  if (tabParentDom.dataset.sectionStatus === 'loading') return block;
  tabParentDom.dispatchEvent(
    new CustomEvent('asus-l4--section-tab', {
      detail: block,
    }),
  );
}
