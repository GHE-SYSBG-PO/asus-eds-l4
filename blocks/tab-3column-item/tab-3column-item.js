export default async function decorate(block) {
  const tabParentDom = block.parentNode.parentNode;
  if (tabParentDom.dataset.sectionStatus === 'loading') return block;
}
