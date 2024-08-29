/**
 *
 * © NDF, 28-August-2024.
 * @see https://developer.chrome.com/docs/extensions/reference/api/offscreen
 */

const BROWSER = globalThis.browser || globalThis.chrome;
const OFFSCREEN_PAGE = '/pages/off_screen.html';

let creating; // A global promise to avoid concurrency issues

async function setupOffscreenDocument (path) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = BROWSER.runtime.getURL(path);
  const existingContexts = await BROWSER.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = BROWSER.offscreen.createDocument({
      url: path,
      reasons: ['AUDIO_PLAYBACK'], // ['CLIPBOARD'],
      justification: 'to play a sound when the timer stops'
    });
    await creating;
    creating = null;
  }
}

function hasOffscreenApi () {
  return BROWSER.offscreen && BROWSER.offscreen.createDocument;
}

export async function offscreenAudio () {
  if (!hasOffscreenApi()) {
    return console.debug('Offscreen API not supported.');
  }
  await setupOffscreenDocument(OFFSCREEN_PAGE);

  // Send message to offscreen document
  const send = BROWSER.runtime.sendMessage({
    type: 'audio:play',
    target: 'offscreen',
    data: '...'
  });
  send.then((msg) => console.debug('offscreenAudio:', msg));
}
