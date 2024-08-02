/*!
  TimerDisplay class.
*/

/* const startButton = document.querySelector('#start-button');
const stopButton = document.querySelector('#stop-button');
const myTimer = document.querySelector('#my-timer');
*/

// myTimer.value = '05:00';

class TimerDisplay {
  constructor () {
    const ROOT = document;
    this._startButton = ROOT.querySelector('#start-button');
    this._stopButton = ROOT.querySelector('#stop-button');
    this._timer = ROOT.querySelector('#my-timer');
  }

  connect () {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => this._onMessage(msg));

    // this._port = chrome.runtime.connect({ name: 'MyTimer' });

    /* chrome.runtime.onConnect.addListener((port) => {
      console.assert(port.name === 'MyTimer');

      this._port = port;

      this._port.onMessage.addListener((msg) => this._onMessage(msg));
    }); */
  }

  _onMessage (msg) {
    if (msg.type === 'timer:ping') {
      // const { value } = msg;

      this._timer.value = msg.value;

      console.debug('timer:ping:', msg.value);
    }

    if (msg.type === 'timer:stopped') {
      this._stopButton.disabled = 'disabled';
      this._startButton.disabled = null;

      this._timer.value = '00:00';
    }
  }

  handleButtonEvents () {
    this._startButton.addEventListener('click', (ev) => {
      // startButton.setAttribute('disabled', 'disabled');
      this._startButton.disabled = 'disabled';
      this._stopButton.disabled = null;

      this._postMessage('timer:start');
      // WAS: chrome.runtime.sendMessage({ type: 'timer:start' });

      console.debug('Click:', 'sending timer:start');
    });

    this._stopButton.addEventListener('click', (ev) => {
      this._postMessage('timer:stop');
      // WAS: chrome.runtime.sendMessage({ type: 'timer:stop' });

      console.debug('Click:', 'sending timer:stop');
    });
  }

  _postMessage (type) {
    chrome.runtime.sendMessage({ type });
  }
}

const timerDisplay = new TimerDisplay();

timerDisplay.connect();
timerDisplay.handleButtonEvents();

/* const PORT = chrome.runtime.connect({ name: 'MyTimer' });

startButton.addEventListener('click', (ev) => {
  // startButton.setAttribute('disabled', 'disabled');
  startButton.disabled = 'disabled';
  stopButton.disabled = null;

  PORT.postMessage({ type: 'timer:start' });
  // WAS: chrome.runtime.sendMessage({ type: 'timer:start' });

  console.debug('Click:', 'sending timer:start');
});

stopButton.addEventListener('click', (ev) => {
  PORT.postMessage({ type: 'timer:stop' });
  // WAS: chrome.runtime.sendMessage({ type: 'timer:stop' });

  console.debug('Click:', 'sending timer:stop');
});

PORT.onMessage.addListener((msg) => {
// WAS: chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'timer:ping') {
    // const { value } = msg;

    myTimer.value = msg.value;

    console.debug('timer:ping:', msg.value);
  }

  if (msg.type === 'timer:stopped') {
    stopButton.disabled = 'disabled';
    startButton.disabled = null;

    myTimer.value = '00:00';
  }
}); */

console.debug('>> index.js:');

/* (async () => {
  /* const src = chrome.runtime.getURL('src/my-timer.js');
  const { default: MyTimer } = await import(src);
  const isMain = true;
  const timer = new MyTimer(isMain);

 // , chrome.storage, chrome);
})(); */
