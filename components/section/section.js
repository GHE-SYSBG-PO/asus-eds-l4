import { loadCSS } from '../../scripts/aem.js';

export default function buildSecitonClass(block) {
  loadCSS(`${window.hlx.codeBasePath}/components/section/section.css`);
  const config = block.dataset;
  const sectionid = config.sectionid || '';
  const bgcolor = config.bgcolor || '';
  const paddingleft = config.paddingleft || '';
  const paddingright = config.paddingright || '';

  block.classList.add('section-block');
  if (sectionid) {
    block.id = sectionid;
  }
  if (bgcolor) {
    block.style.setProperty('--section-bg-color', `#${bgcolor}`);
  }
  if (paddingleft) {
    block.style.setProperty('--section-padding-left', paddingleft);
  }
  if (paddingright) {
    block.style.setProperty('--section-padding-right', paddingright);
  }
}
