import AddonBase from './AddonBase.js';
import Icons from './Icons.js';

const { Audio } = globalThis;
const AUDIO_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/68/Bicycle-bell-1.wav';

/**
 * Popup, and PopupTimer class.
 *
 * @copyright © Nick Freear and contributors, 02-August-2024.
 */
class PopupTimer /* was: TimerDisplay */ extends AddonBase {
  #formElem;
  #emojiSvgElem;

  attachDOM () {
    this.#formElem = document.querySelector('#popupTimerForm');
    this.#emojiSvgElem = document.querySelector('#emojiSVG');

    console.assert(this.#formElem);
    console.assert(this.#form('timer'));
    console.assert(this.#emojiSvgElem);
  }

  async initializeState () {
    const { comment, duration, emojiId, isRunning } = await super._fromStorage();

    this.#form('comment').value = comment ? comment.text : '';

    if (isRunning) {
      this.#form('start').disabled = 'disabled';
    } else {
      this.#form('stop').disabled = 'disabled';
      this.#form('timer').value = super._formatTime(duration * 60);
    }

    await this.#importShowEmojiSVG(emojiId);
    console.debug('PT ~ state:', isRunning, emojiId, duration);
  }

  #form (name) {
    console.assert(this.#formElem.elements[name], name);
    return this.#formElem.elements[name];
  }

  listen () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => this.#onMessage(msg));
  }

  #onMessage (msg) {
    if (msg.type === this.ev.timerPing) {
      this.#form('timer').value = msg.value;

      console.debug('PT ~ timer:ping:', msg.value);
    }

    if (msg.type === this.ev.timerStopped) {
      this.#form('stop').disabled = 'disabled';
      this.#form('start').disabled = null;

      this.#form('timer').value = '00:00';
    }
  }

  handleUserEvents () {
    this.#formElem.addEventListener('submit', (ev) => {
    // WAS: this._startButton.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.#form('start').disabled = 'disabled';
      this.#form('stop').disabled = null;

      this.#postMessage(this.ev.timerStart);

      console.debug('PT ~ submit:', 'sending timer:start');
    });

    this.#formElem.addEventListener('reset', (ev) => {
      ev.preventDefault();
      this.#postMessage(this.ev.timerStop, 'reset');

      console.debug('PT ~ reset:', 'sending timer:stop');
    });

    this.#form('comment').addEventListener('input', async (ev) => {
      const comment = {
        text: ev.target.value,
        timeISO: new Date().toISOString()
      };
      await super._store({ comment });

      console.debug('input:', comment, ev.target, ev);
    });
  }

  #postMessage (type, reason = null) {
    this._runtime.sendMessage({ type, reason });
  }

  #playAudio_OLD () {
    const myAudio = new Audio();
    myAudio.src = AUDIO_URL;
    // myAudio.src = "https://upload.wikimedia.org/wikipedia/commons/5/55/En-us-house-noun.ogg";
    myAudio.play();
  }

  async #importShowEmojiSVG (emojiId) {
    const icons = new Icons();
    await icons.importEmojiSVG();
    this.#emojiSvgElem.innerHTML = icons.findEmojiSVG(emojiId);
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
