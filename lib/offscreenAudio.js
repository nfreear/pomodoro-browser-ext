/**
 * OffScreenAudio class - used by Service Worker.
 *
 * @listens `timer:start` message.
 * @fires   `audio:play` message.
 *
 * @copyright © Nick Freear, 28-August-2024.
 * @see https://developer.chrome.com/docs/extensions/reference/api/offscreen
 */

import AddonBase from './AddonBase.js';

let creating; // A global promise to avoid concurrency issues

export class OffScreenAudio extends AddonBase {
  get _offscreenPage () { return '/pages/off_screen.html'; }

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
        reasons: ['AUDIO_PLAYBACK'],
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
