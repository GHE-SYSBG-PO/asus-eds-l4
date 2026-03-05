export default async function decorate(block) {
  try {
    console.log(block);
    const config = block.dataset;
    console.log(config);
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating section:', error);
    block.innerHTML = '<div class="error-message">Failed to load section</div>';
  }
}
