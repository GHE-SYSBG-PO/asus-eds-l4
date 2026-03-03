export default function decorate(block) {
  try {
    const [col1, col2] = [...block.children];
    const config = block.dataset;
    if (col1) {
      Object.entries(config).forEach(([key, value]) => {
        col1.dataset[key] = value;
      });
    }
    block.append(col1, col2);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating feature-accordion block:', error);
    block.innerHTML = '<div class="error-message">Failed to load feature-accordion block</div>';
  }
}
