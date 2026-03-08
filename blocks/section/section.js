import buildSecitonClass from '../../components/section/section.js';

export default async function decorate(block) {
  try {
    block.querySelectorAll(':scope > *').forEach((child) => {
      child.classList.add('l4-column-width-12');
    });

    buildSecitonClass(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating section:', error);
    block.innerHTML = '<div class="error-message">Failed to load section</div>';
  }
}
