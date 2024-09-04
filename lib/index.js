/*!
  PopupTimer class.
*/

import AddonBase from './AddonBase.js';

const AUDIO_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/68/Bicycle-bell-1.wav';

class PopupTimer /* was: TimerDisplay */ extends AddonBase {
  async attachDOM () {
    this._formElem = document.querySelector('#popupTimerForm');

    console.assert(this._formElem);
    console.assert(this._form('timer'));
    console.assert(this._storage);

    const { comment } = await this._storage.get();
    this._form('comment').value = comment ? comment.text : '';
  }

  get _browser () { return globalThis.browser || globalThis.chrome; }
  get _runtime () { return this._browser.runtime; }
  get _storage () { return this._browser.storage.local; }

  _form (name) {
    console.assert(this._formElem.elements[name], name);
    return this._formElem.elements[name];
  }

  connect () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => this._onMessage(msg));
  }

  _onMessage (msg) {
    if (msg.type === 'timer:ping') {
      this._form('timer').value = msg.value;

      console.debug('PT ~ timer:ping:', msg.value);
    }

    if (msg.type === 'timer:stopped') {
      this._form('stop').disabled = 'disabled';
      this._form('start').disabled = null;

      this._form('timer').value = '00:00';
    }
  }

  handleUserEvents () {
    this._formElem.addEventListener('submit', (ev) => {
    // WAS: this._startButton.addEventListener('click', (ev) => {
      ev.preventDefault();
      this._form('start').disabled = 'disabled';
      this._form('stop').disabled = null;

      this._postMessage('timer:start');
      // this._playAudio();
      // WAS: chrome.runtime.sendMessage({ type: 'timer:start' });

      console.debug('PT ~ submit:', 'sending timer:start');
    });

    this._formElem.addEventListener('reset', (ev) => {
    // WAS: this._form.addEventListener('click', (ev) => {
      ev.preventDefault();
      this._postMessage('timer:stop', 'reset');
      // WAS: chrome.runtime.sendMessage({ type: 'timer:stop' });

      console.debug('PT ~ reset:', 'sending timer:stop');
    });

    this._form('comment').addEventListener('input', async (ev) => {
      const comment = {
        text: ev.target.value,
        timeISO: new Date().toISOString()
      };
      await this._storage.set({ comment });

      console.debug('input:', comment, ev.target, ev);
    });
  }

  _postMessage (type, reason = null) {
    this._runtime.sendMessage({ type, reason });
  }

  _playAudio () {
    const myAudio = new Audio();
    myAudio.src = AUDIO_URL;
    // myAudio.src = "https://upload.wikimedia.org/wikipedia/commons/5/55/En-us-house-noun.ogg";
    myAudio.play();
  }
}

const popupTimer = new PopupTimer();

popupTimer.attachDOM();
popupTimer.connect();
popupTimer.handleUserEvents();

const CLASS_NAME = / Gecko\//.test(navigator.userAgent) ? 'is-gecko' : 'not-gecko';
document.body.classList.add(CLASS_NAME);

console.debug('>> index.js:', CLASS_NAME, globalThis);
