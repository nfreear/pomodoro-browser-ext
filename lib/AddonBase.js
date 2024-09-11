/**
 * AddonBase base class - add cross-browser support, simplify storage and state.
 *
 * @copyright © Nick Freear and contributors, 04-September-2024.
 */

export const DEFAULTS = {
  blockList: [],
  comment: { text: '' },
  duration: 10, // minutes.
  emoji: '🌲',
  emojiId: 'evergreen_tree',
  isRunning: false
  // , log: []
};

export class AddonBase {
  get _defaults () { return DEFAULTS; }

  constructor () {
    console.assert(this._browser, 'browser or chrome');
    console.assert(this._runtime, 'runtime');
    console.assert(this._browser.storage, 'storage');
    console.assert(this._storage, 'storage.local');
    console.assert(this._action, 'action');
    console.assert(this._notifications, 'notifications');
  }

  /** Expose the WebExtension APIs as getters.
   */
  get _browser () { return globalThis.browser || globalThis.chrome; }

  get _runtime () { return this._browser.runtime; }
  get _storage () { return this._browser.storage.local; }
  get _action () { return this._browser.action; }
  get _notifications () { return this._browser.notifications; }

  get _scripting () { return this._browser.scripting; }
  get _webNavigation () { return this._browser.webNavigation; }
  get _tabs () { return this._browser.tabs; }

  get _offscreen () { return this._browser.offscreen; } // Chromium-only.

  get hasOffscreenApi () { // Chromium-only.
    return this._offscreen && this._offscreen.createDocument;
  }

  /** Store and expose state.
   */

  async _isRunning () {
    const { isRunning } = await this._fromStorage();
    return isRunning;
  }

  async _fromStorage (withDefault = true) {
    const dataObj = await this._storage.get();
    if (withDefault) {
      return { ...DEFAULTS, ...dataObj };
    }
    return dataObj;
  }

  async _store (dataObj) {
    await this._storage.set(dataObj);
  }

  /**
   * @see https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript#20618517
   */
  _formatTime (timer) {
    let minutes = parseInt(timer / 60, 10);
    let seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    this._value = `${minutes}:${seconds}`;
    return this._value;
  }

  _attachTemplate (elem, templateHtml, attachShadow = true) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateHtml, 'text/html');

    const template = doc.querySelector('template');
    const docFragment = template.content.cloneNode(true);

    if (attachShadow) {
      elem.attachShadow({ mode: 'open' }).appendChild(docFragment);
    } else {
      elem.appendChild(docFragment);
    }
  }
}

export default AddonBase;
