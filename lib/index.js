/*!
  PopupTimer class.
*/

const AUDIO_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/68/Bicycle-bell-1.wav';

class PopupTimer /* was: TimerDisplay */ {
  attachDOM () {
    this._formElem = document.querySelector('#popupTimerForm');

    console.assert(this._formElem);
    console.assert(this._form('timer'));
  }

  get _browser () { return globalThis.browser || globalThis.chrome; }
  get _runtime () { return this._browser.runtime; }

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

  handleButtonEvents () {
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
      this._postMessage('timer:stop');
      // WAS: chrome.runtime.sendMessage({ type: 'timer:stop' });

      console.debug('PT ~ reset:', 'sending timer:stop');
    });
  }

  _postMessage (type) {
    this._runtime.sendMessage({ type });
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
popupTimer.handleButtonEvents();

console.debug('>> index.js:', globalThis);
