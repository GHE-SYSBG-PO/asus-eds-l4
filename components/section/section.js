export default function buildSecitonClass(block) {
  console.log('block', block);
  const config = block.dataset;
  const sectionid = config.sectionid || '';
  const bgcolor = config.bgcolor || '';
  const paddingleft = config.paddingleft || '';
  const paddingright = config.paddingright || '';

  if (sectionid) {
    block.id = sectionid;
  }
  if (bgcolor) {
    block.style.backgroundColor = `#${bgcolor}`;
  }
  if (paddingleft) {
    block.style.paddingLeft = paddingleft;
  }
  if (paddingright) {
    block.style.paddingRight = paddingright;
  }
}
