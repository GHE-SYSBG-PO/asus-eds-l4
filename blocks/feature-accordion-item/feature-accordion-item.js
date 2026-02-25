export default async function decorate(block) {
  try {
    // eslint-disable-next-line no-console
    console.log('feature-accordion-item', block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating feature-accordion-item block:', error);
    block.innerHTML = '<div class="error-message">Failed to load feature-accordion-item block</div>';
  }
}
