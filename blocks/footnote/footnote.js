// import { getBlockConfigs } from '../../scripts/utils.js';

// const DEFAULT_CONFIG = {
//   itemTextFont: 'ro-rg-13',
// };

export default async function decorate(block) {
  try {
    const wrappers = Array.from(block.querySelectorAll(':scope > div'));

    block.innerHTML = `
      <div class="footnotes">
        <ol class="footnote flex flex-col gap-[10] list-decimal pl-[25]"></ol>
      </div>
    `;
    const list = block.querySelector('.footnote');
    // const configs = await Promise.all(
    //   wrappers.map((wrap) => getBlockConfigs(wrap, DEFAULT_CONFIG, 'footnoteitem')),
    // );

    // eslint-disable-next-line no-console
    console.error('footnoteblock', list, wrappers);

    //     configs.forEach((config, idx) => {
    //       const v = getFieldValue(config);

    //       const index = idx + 1;
    //       const id = v('idText') || `footnote-${index}`;
    //       const text = v('textRichtext') || '';
    //       const showArrow = v('arrowConfig') !== 'off';

    //       const styleVars = [
    //         v('arrowDefaultColor') ? `--footnote-itemarrow-default-color:#${v('arrowDefaultColor')};` : '',
    //         v('arrowHoverColor') ? `--footnote-itemarrow-hover-color:#${v('arrowHoverColor')};` : '',
    //         v('arrowPressColor') ? `--footnote-itemarrow-press-color:#${v('arrowPressColor')};` : '',
    //       ].join('');

    //       console.log("stylevars",configs, styleVars)
    //       list.insertAdjacentHTML(
    //         'beforeend',
    //         `
    //         <li class="footnote-item ${DEFAULT_CONFIG.itemTextFont}"
    //             id="${id}"
    //             data-footnote-index="${index}"
    //             tabindex="0">
    //           ${text}
    //           ${showArrow
    //     ? `<a class="footnote-arrow" href="#" aria-label="back to ${id} contents">
    //                    <span class="ro-rg-18" style="${styleVars}">↑</span>
    //                  </a>`
    //     : ''
    // }
    //         </li>
    //       `,
    //       );
    //     });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating footnote block:', error);
    block.innerHTML = '<div class="error-message">Failed to load footnote block</div>';
  }
}
