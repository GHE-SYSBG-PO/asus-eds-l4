export default async function decorate(block) {
  const tabParentDom = block.closest('.section');
  if (tabParentDom.dataset.sectionStatus === 'loading') return block;
  window.location.reload();
}
