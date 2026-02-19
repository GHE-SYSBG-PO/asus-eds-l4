export default async function decorate(block) {
  try {
    const wrapper = block.querySelector('.small-cards.block');

    wrapper.innerHTML = '<div>Test</div>';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating chart-advanced block:', error);
    block.innerHTML = '<div class="error-message">Failed to load chart-advanced block</div>';
  }
}
