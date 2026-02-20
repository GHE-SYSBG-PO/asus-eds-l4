import { getBlockConfigs, getFieldValue } from '../../scripts/utils.js';

const DEFAULT_CONFIG = {
  itemTextFont: 'ro-rg-13',
};

/**
 * Smoothly scrolls to a target element while applying visible header offset.
 * @param {HTMLElement} target - The target element to scroll into view.
 * @returns {void}
 */
export const scrollToTargetWithHeaderOffset = (target) => {
  if (!target) return;

  const header = document.querySelector('nav');
  let headerOffset = 0;

  if (header) {
    const style = window.getComputedStyle(header);
    const rect = header.getBoundingClientRect();
    const isVisible = style.display !== 'none'
      && style.visibility !== 'hidden'
      && rect.height > 0
      && rect.bottom > 0;

    if (isVisible) {
      headerOffset = rect.height;
    }
  }

  const extraGap = 12;

  try {
    target.style.scrollMarginTop = `${headerOffset + extraGap}px`;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('error scrolling', e);
  }

  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }

  requestAnimationFrame(() => {
    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      try {
        target.focus({ preventScroll: true });
      } catch (e) {
        target.focus();
      }
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - extraGap;
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: 'smooth',
      });
      target.focus();
    }
  });
};

export default async function decorate(block) {
  try {
    const wrappers = Array.from(block.querySelectorAll(':scope > div'));

    const footnotesContainer = document.createElement('div');
    footnotesContainer.className = 'footnotes';

    const list = document.createElement('ol');
    list.className = 'footnote flex flex-col gap-[10] list-decimal pl-[25]';

    // console.log('footnotescontainer', footnotescontainer);
    // const list = fragment.querySelector('.footnote');
    const configs = await Promise.all(
      wrappers.map((wrap) => getBlockConfigs(wrap, DEFAULT_CONFIG, 'footnoteitem')),
    );

    // eslint-disable-next-line no-console
    console.log('footnoteblock', list, wrappers);

    configs.forEach((config, idx) => {
      const v = getFieldValue(config);

      const index = idx + 1;
      const id = v('idText') || `footnote-${index}`;
      const text = v('textRichtext') || '';
      const showArrow = v('arrowConfig') !== 'off';

      const styleVars = [
        v('arrowDefaultColor') ? `--footnote-itemarrow-default-color:#${v('arrowDefaultColor')};` : '',
        v('arrowHoverColor') ? `--footnote-itemarrow-hover-color:#${v('arrowHoverColor')};` : '',
        v('arrowPressColor') ? `--footnote-itemarrow-press-color:#${v('arrowPressColor')};` : '',
      ].join('');

      console.log('stylevars', configs, styleVars);
      list.insertAdjacentHTML(
        'beforeend',
        `
            <li class="footnote-item ${DEFAULT_CONFIG.itemTextFont}"
                id="${id}"
                data-footnote-index="${index}"
                tabindex="0">
              ${text}
              ${showArrow
    ? `<a class="footnote-arrow" href="#" aria-label="back to ${id} contents">
                       <span class="ro-rg-18" style="${styleVars}">↑</span>
                     </a>`
    : ''
}
            </li>
          `,
      );
    });

    console.log('block', block);
    footnotesContainer.append(list);
    block.append(...footnotesContainer.children);

    const arrowLinks = block.querySelectorAll('.footnote-arrow');
    arrowLinks?.forEach((arrow) => {
      arrow.addEventListener('click', (event) => {
        event.preventDefault();

        const footnoteItem = arrow.closest('.footnote-item');
        if (!footnoteItem) return;

        const sourceId = footnoteItem.id || '';
        const normalizedId = sourceId.startsWith('footnote-')
          ? sourceId.slice('footnote-'.length)
          : sourceId;
        const target = document.querySelector(`.footnote-${normalizedId}`);
        if (!target) return;

        scrollToTargetWithHeaderOffset(target);
      });
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating footnote block:', error);
    block.innerHTML = '<div class="error-message">Failed to load footnote block</div>';
  }
}
