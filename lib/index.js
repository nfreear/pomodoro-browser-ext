/*!
  PopupTimer class.
*/

import AddonBase from './AddonBase.js';
import Icons from './Icons.js';

const AUDIO_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/68/Bicycle-bell-1.wav';

class PopupTimer /* was: TimerDisplay */ extends AddonBase {
  attachDOM () {
    this._formElem = document.querySelector('#popupTimerForm');
    this._emojiSvgElem = document.querySelector('#emojiSVG');

    console.assert(this._formElem);
    console.assert(this._form('timer'));
    console.assert(this._emojiSvgElem);
  }

  async initializeState () {
    const { comment, duration, emojiId, isRunning } = await super._fromStorage();

    this._form('comment').value = comment ? comment.text : '';

    if (isRunning) {
      this._form('start').disabled = 'disabled';
    } else {
      this._form('stop').disabled = 'disabled';
      this._form('timer').value = super._formatTime(duration * 60);
    }

    await this._importShowEmojiSVG(emojiId);
    console.debug('PT ~ state:', isRunning, emojiId, duration);
  }

  _form (name) {
    console.assert(this._formElem.elements[name], name);
    return this._formElem.elements[name];
  }

  listen () {
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

      console.debug('PT ~ submit:', 'sending timer:start');
    });

    this._formElem.addEventListener('reset', (ev) => {
      ev.preventDefault();
      this._postMessage('timer:stop', 'reset');

      console.debug('PT ~ reset:', 'sending timer:stop');
    });

    this._form('comment').addEventListener('input', async (ev) => {
      const comment = {
        text: ev.target.value,
        timeISO: new Date().toISOString()
      };
      await super._store({ comment });

      console.debug('input:', comment, ev.target, ev);
    });
  }

  _postMessage (type, reason = null) {
    this._runtime.sendMessage({ type, reason });
  }

  _playAudio_OLD () {
    const myAudio = new Audio();
    myAudio.src = AUDIO_URL;
    // myAudio.src = "https://upload.wikimedia.org/wikipedia/commons/5/55/En-us-house-noun.ogg";
    myAudio.play();
  }

  async _importShowEmojiSVG (emojiId) {
    const icons = new Icons();
    await icons.importEmojiSVG();
    this._emojiSvgElem.innerHTML = icons.findEmojiSVG(emojiId);
  }
}

const popupTimer = new PopupTimer();

popupTimer.attachDOM();
popupTimer.initializeState();
popupTimer.listen();
popupTimer.handleUserEvents();

const CLASS_NAME = / Gecko\//.test(navigator.userAgent) ? 'is-gecko' : 'not-gecko';
document.body.classList.add(CLASS_NAME);

console.debug('>> index.js:', CLASS_NAME, globalThis);
