/**
 * Offscreen page.
 *
 * @copyright © Nick Freear, 28-August-2024.
 */

const BROWSER = globalThis.browser || globalThis.chrome;

const AUDIO = document.querySelector('#audio');

BROWSER.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'audio:play') {
    AUDIO.play();
    console.debug('OP - audio:play received:', msg);
    sendResponse('offscreen page - audio:play received');
  }
});

console.debug('>> offscreen-page.js');
