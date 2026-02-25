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
}
