export default function decorate(block) {
  try {
    console.log('first block', block, block.children);
    // Exit early if there are fewer than 2 children
    // if (!block.children || block.children.length < 2) return;
    const [col1, col2] = [...block.children];

    const config = block.dataset;
    // eslint-disable-next-line no-console
    console.log('config', config);
    // Set default values for layout variations
    block.append(col1, col2);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating feature-accordion block:', error);
    block.innerHTML = '<div class="error-message">Failed to load feature-accordion block</div>';
  }
}
