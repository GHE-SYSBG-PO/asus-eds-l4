import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  try {
    // eslint-disable-next-line no-console
    console.log('feature-accordion-item', block, block.children);
    const fragmentUrl = '/language-master/en/components/id-18-feature-accordion/product-line/asus/media-block-fragment';
    const path = fragmentUrl.startsWith('http')
      ? new URL(fragmentUrl, window.location).pathname
      : fragmentUrl;

    const fragment = await loadFragment(path);
    console.log('fragment', fragment, fragment.childNodes);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating feature-accordion-item block:', error);
    block.innerHTML = '<div class="error-message">Failed to load feature-accordion-item block</div>';
  }
}
