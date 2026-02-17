import {
  getBlockConfigs,
  getFieldValue,
  getBlockRepeatConfigs,
} from '../../scripts/utils.js';

/**
 * Unifies the height of title containers based on the tallest content.
 * Sets a minimum height for all title containers to ensure consistent layout.
 * @param {HTMLElement} block - The parent block element containing the title containers.
 */
const setUnifiedHeight = (block) => {
  // Select all title headings and their parent containers
  const titleHeadings = block.querySelectorAll('.chart-advanced .title > h4');
  const titleContainers = block.querySelectorAll('.chart-advanced .title');

  /**
   * Calculates the maximum height among all title headings.
   * @returns {number} The maximum height in pixels.
   */
  const getMaxHeight = () => Array.from(titleHeadings).reduce((max, heading) => {
    const contentHeight = heading.scrollHeight;
    return contentHeight > max ? contentHeight : max;
  }, 0);

  /**
   * Applies or removes minimum height to title containers based on screen width.
   * @param {number} height - The height to apply as minimum height.
   */
  const applyMinHeight = (height) => {
    const shouldApply = window.innerWidth >= 730;
    titleContainers.forEach((container) => {
      container.style.minHeight = shouldApply ? `${height}px` : '';
    });
  };

  /**
   * Throttles a function to limit its execution rate.
   * @param {Function} func - The function to throttle.
   * @param {number} delay - The delay in milliseconds.
   * @returns {Function} The throttled function.
   */
  const throttle = (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return (...args) => {
      const currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  /**
   * Handles window resize events to update title container heights dynamically.
   */
  const handleResize = () => {
    const newMaxHeight = getMaxHeight();
    applyMinHeight(newMaxHeight);
  };

  // Initial setup
  const initialMaxHeight = getMaxHeight();
  applyMinHeight(initialMaxHeight);

  // Add throttled resize event listener
  window.addEventListener('resize', throttle(handleResize, 300));
};

// DEFAULT
const DEFAULT_CONFIG = {
  wrapLine: 'on',
  titleFont: 'tt-bd-28',
  infoFont: 'ro-rg-18-sh',
  lineWidth: '100%',
};

export default async function decorate(block) {
  try {
    const wrapper = block.querySelectorAll(':scope > div');
    // Process each wrapper asynchronously
    Array.from(wrapper).forEach(async (wrap) => {
      try {
        const config = await getBlockConfigs(wrap, DEFAULT_CONFIG, 'small-card');
        const v = getFieldValue(config);

        const titleFontColor = v('titleFontColor') ? `--chart-advanced-title-color: #${v('titleFontColor')}` : '';
        const infoFontColor = v('infoFontColor') ? `--chart-advanced-info-color: #${v('infoFontColor')}` : '';
        const lineColor = v('lineColor') ? `--chart-advanced-line-bg-color: #${v('lineColor')}` : '';
        // Retrieve repeated item configurations
        const [items = []] = getBlockRepeatConfigs(wrap);
        const itemHtml = items.map((val) => {
          try {
            return `
              <div class="flex items-center gap-[20px]">
                <div class="w-[46px] h-[46px] flex items-center justify-center shrink-0">${val.iconAssets.html}</div>
                <span class="${v('infoFont')} chart-advanced-info" style="${infoFontColor}">${val.infoRichtext.text}</span> 
              </div>
            `;
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error:', error);
            return '';
          }
        }).join('');

        wrap.classList.add(`${v('chartColumnWidth') ? 'md:flex-none' : 'md:flex-1'}`, 'chat-column-width');
        wrap.style.setProperty('--chart-advanced-chat-column-width', `${v('chartColumnWidth')}%`);
        wrap.innerHTML = `
          <div class="title"><h4 class="break-all ${v('titleFont')} chart-advanced-title" style="${titleFontColor}">${v('titleRichtext', 'html')}</h4></div>
          <div class="h-[1px] mx-auto my-[16px] line-bg" style="width: ${v('lineWidth')}; ${lineColor}"></div>
          <div class="break-all flex ${v('wrapLine') === 'on' ? 'flex-wrap' : 'flex-col'} content-start items-start gap-[16px]">
            ${itemHtml}
          </div>
        `;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error decorating wrapper:', error);
      }
    });

    block.classList.add('flex', 'flex-col', 'md:flex-row', 'md:flex-nowrap', 'gap-[40px]', 'w-full', 'chart-advanced');
    setTimeout(() => {
      setUnifiedHeight(block);
    }, 500);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating chart-advanced block:', error);
    block.innerHTML = '<div class="error-message">Failed to load chart-advanced block</div>';
  }
}
