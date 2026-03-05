export default async function decorate(block) {
  try {
    console.log(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating section:', error);
    block.innerHTML = '<div class="error-message">Failed to load section</div>';
  }
}
