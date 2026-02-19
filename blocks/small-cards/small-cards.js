export default function decorate(block) {
  /* eslint-disable-next-line no-console */
  console.log('Decorating small-cards block', block.children);
  const [quoteWrapper] = block.children;
  const blockquote = document.createElement('blockquote');
  blockquote.textContent = quoteWrapper.textContent.trim();
  quoteWrapper.replaceChildren('Hello World');
}
