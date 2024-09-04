/**
 * AddonBase base class - add cross-browser support, and simplifies storage.
 *
 * @copyright © Nick Freear and contributors, 04-September-2024.
 */

export class AddonBase {
  constructor () {
    console.assert(this._browser, 'browser or chrome');
    console.assert(this._runtime, 'runtime');
    console.assert(this._browser.storage, 'storage');
    console.assert(this._storage, 'storage.local');
    console.assert(this._action, 'action');
    console.assert(this._notifications, 'notifications');
  }

  get _browser () { return globalThis.browser || globalThis.chrome; }

  get _runtime () { return this._browser.runtime; }
  get _storage () { return this._browser.storage.local; }
  get _action () { return this._browser.action; }
  get _notifications () { return this._browser.notifications; }
  get _offscreen () { return this._browser.offscreen; } // Chromium-only.

  get hasOffscreenApi () { // Chromium-only.
    return this._offscreen && this._offscreen.createDocument;
  }

  /** @TODO:
   */
  async fromStorage (withDefault = true) {
    return await this._storage.get();
  }
}

export default AddonBase;
