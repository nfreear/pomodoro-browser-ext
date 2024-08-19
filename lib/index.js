/*!
  PopupTimer class.
*/

class PopupTimer /* was: TimerDisplay */ {
  attachDOM () {
    const ROOT = document;
    this._startButton = ROOT.querySelector('#start-button');
    this._stopButton = ROOT.querySelector('#stop-button');
    this._timer = ROOT.querySelector('#my-timer');

    console.assert(this._startButton);
    console.assert(this._stopButton);
    console.assert(this._timer);
  }

  get _browser () { return globalThis.browser || globalThis.chrome; }
  get _runtime () { return this._browser.runtime; }

  connect () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => this._onMessage(msg));
  }

  _onMessage (msg) {
    if (msg.type === 'timer:ping') {
      // const { value } = msg;

      this._timer.value = msg.value;

      console.debug('PT ~ timer:ping:', msg.value);
    }

    if (msg.type === 'timer:stopped') {
      this._stopButton.disabled = 'disabled';
      this._startButton.disabled = null;

      this._timer.value = '00:00';
    }
  }

  handleButtonEvents () {
    this._startButton.addEventListener('click', (ev) => {
      this._startButton.disabled = 'disabled';
      this._stopButton.disabled = null;

      this._postMessage('timer:start');
      // WAS: chrome.runtime.sendMessage({ type: 'timer:start' });

      console.debug('PT ~ Click:', 'sending timer:start');
    });

    this._stopButton.addEventListener('click', (ev) => {
      this._postMessage('timer:stop');
      // WAS: chrome.runtime.sendMessage({ type: 'timer:stop' });

      console.debug('PT ~ Click:', 'sending timer:stop');
    });
  }

  _postMessage (type) {
    this._runtime.sendMessage({ type });
  }
}

const popupTimer = new PopupTimer();

popupTimer.attachDOM();
popupTimer.connect();
popupTimer.handleButtonEvents();

console.debug('>> index.js:');
