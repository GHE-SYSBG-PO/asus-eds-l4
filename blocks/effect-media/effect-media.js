import { loadAnime } from '../../scripts/scripts.js';
export default function decorate(block) {
  // Add effect-media class to the block
  block.classList.add('effect-media-container');

  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.classList.add('effect-media-wrapper');

  // Create effect-media content div
  const effectMedia = document.createElement('div');
  effectMedia.classList.add('effect-media');

  // Get image and text elements
  const rows = block.querySelectorAll(':scope > div');
  let imageElement = null;
  let textElement = null;

  rows.forEach((row, index) => {
    if (index === 0) {
      // First row is image
      imageElement = row;
      imageElement.classList.add('effect-media-image');
    } else if (index === 1) {
      // Second row is text
      textElement = row;
      textElement.classList.add('effect-media-text');
    }
  });

  // Append elements to effect-media
  if (imageElement) {
    effectMedia.appendChild(imageElement);
  }
  if (textElement) {
    effectMedia.appendChild(textElement);
  }

  wrapper.appendChild(effectMedia);
  block.appendChild(wrapper);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateAnimation = () => {
    const rect = wrapper.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const scrollRange = Math.max(rect.height - viewportHeight, 1);
    const progress = clamp((-rect.top) / scrollRange, 0, 1);

    let bgOpacity = 0;
    let textOpacity = 1;
    let textScale = 1;
    let textTranslate = 40;

    if (progress <= 0.4) {
      const t = progress / 0.4;
      textTranslate = 40 * (1 - t);
      bgOpacity = 0;
      textOpacity = 1;
      textScale = 1;
    } else if (progress <= 0.7) {
      const t = (progress - 0.4) / 0.3;
      textTranslate = 0;
      bgOpacity = t;
      textOpacity = 1;
      textScale = 1;
    } else {
      const t = (progress - 0.7) / 0.3;
      textTranslate = 0;
      bgOpacity = 1;
      textOpacity = 1 - t;
      textScale = 1 + (0.5 * t);
    }

    effectMedia.style.setProperty('--em-bg-opacity', `${bgOpacity}`);
    effectMedia.style.setProperty('--em-text-opacity', `${textOpacity}`);
    effectMedia.style.setProperty('--em-text-scale', `${textScale}`);
    effectMedia.style.setProperty('--em-text-translate', `${textTranslate}vh`);
  };

  let rafId = null;
  const onScroll = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      updateAnimation();
    });
  };

  updateAnimation();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}
