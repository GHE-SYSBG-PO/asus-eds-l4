import { loadScript, loadCSS } from '../../scripts/aem.js';
/**
 * Swiper Dynamic Loader
 * Loads Swiper library on-demand to improve initial page load performance
 */
let swiperPromise = null;
let swiperCSSLoaded = false;
/**
 * Dynamically loads Swiper library from CDN
 * @returns {Promise<Object>} Promise that resolves with Swiper constructor
 */
export default async function loadSwiper() {
  // Return immediately if Swiper is already loaded
  if (window.Swiper) {
    return window.Swiper;
  }

  // Return existing promise if load is in progress
  if (!swiperPromise) {
    console.log(
      `Swiper: Starting dynamic load (JS + CSS) [Call ID: ${Date.now()}]`,
    );

    swiperPromise = (async () => {
      try {
        await Promise.all([
          // Load CSS once
          !swiperCSSLoaded
            ? loadCSS(
              `${window.hlx.codeBasePath}/vendor/swiper/swiper-bundle.min.css`,
            ).then(() => {
              swiperCSSLoaded = true;
              console.log('Swiper CSS loaded');
            })
            : Promise.resolve(),
          // Load JS
          loadScript(
            `${window.hlx.codeBasePath}/vendor/swiper/swiper-bundle.min.js`,
            {
              crossorigin: 'anonymous',
              referrerpolicy: 'no-referrer',
            },
          ),
        ]);
        console.log('Swiper loaded dynamically (CSS + JS)');
        return window.Swiper;
      } catch (error) {
        console.error('Failed to load Swiper library:', error);
        swiperPromise = null; // Reset on error so retry is possible
        throw error;
      }
    })(); // IIFE (Immediately Invoked Function Expression) creates promise synchronously
  }

  return swiperPromise;
}
