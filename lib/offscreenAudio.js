/**
 * OffScreenAudio class - used by Service Worker.
 *
 * @listens `timer:start` message.
 * @fires   `audio:play` message.
 *
 * @copyright © Nick Freear, 28-August-2024.
 * @see https://developer.chrome.com/docs/extensions/reference/api/offscreen
 */

let creating; // A global promise to avoid concurrency issues

export class OffScreenAudio {
  get _browser () { return globalThis.browser || globalThis.chrome; }
  get _runtime () { return this._browser.runtime; }
  get _offscreen () { return this._browser.offscreen; }

  get _offscreenPage () { return '/pages/off_screen.html'; }

  get hasOffscreenApi () {
    return this._offscreen && this._offscreen.createDocument;
  }

  async _setupOffscreenDocument (path) {
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const offscreenUrl = this._runtime.getURL(path);
    const existingContexts = await this._runtime.getContexts({
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
      creating = this._offscreen.createDocument({
        url: path,
        reasons: ['AUDIO_PLAYBACK'], // ['CLIPBOARD'],
        justification: 'to play a sound when the timer stops'
      });
      await creating;
      creating = null;
    }
  }

  addStartListener () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === 'timer:start') {
        this.play();
      }
    });
  }

  async play () {
    if (this.hasOffscreenApi) {
      await this._setupOffscreenDocument(this._offscreenPage);
    } else {
      console.debug('Offscreen API not supported.');
      return;
    }

    // Send message to offscreen document
    const send = this._runtime.sendMessage({
      type: 'audio:play',
      target: 'offscreen',
      data: '...'
    });
    send.then((msg) => console.debug('OffScreenAudio.play:', msg));
  }
}

// ----------------------
// LEGACY - NOT IN USE.

const BROWSER = globalThis.browser || globalThis.chrome;
const OFFSCREEN_PAGE = '/pages/off_screen.html';

// let creating; // A global promise to avoid concurrency issues

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
