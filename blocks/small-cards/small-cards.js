export default async function decorate(block) {
  try {
    const wrap = `
      <div class='flex flex-col'> Test
      </div>
    `;

    block.innerHTML = wrap;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating text-block block:', error);
    block.innerHTML = '<div class="error-message">Failed to load text-block block</div>';
  }
}
