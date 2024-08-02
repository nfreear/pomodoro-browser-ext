/*!
  WorkerTimer class.

  © NDF, 26-July-2024.
*/

const BLOCK_LIST = [
  'http://localhost:8080/blocked.html',
  'https://example.org'
];

const DURATION = 60 * 10; // Was: 60 * 5;

chrome.webNavigation.onDOMContentLoaded.addListener(async ({ tabId, url }) => {
  console.debug('chrome.webNav.onDOMCLoaded:', tabId, url);

  const isBlocked = BLOCK_LIST.findIndex((pattern) => {
    const RE = new RegExp(pattern);
    return RE.test(url);
  });

  console.log('Is blocked?', tabId, url, isBlocked);

  if (isBlocked !== -1) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-script.js']
    });
  }
});

// ========================

class WorkerTimer {
  constructor () {
    this._running = false;
    this._intId = null;
    this._duration = DURATION;
    this._timer = null;
    this._value = null;
  }

  initialize () {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => this._onMessage(msg));

    chrome.runtime.onConnect.addListener((port) => {
      console.debug('sw.js -', 'onConnect:', port);
      console.assert(port.name === 'MyTimer');

      port.onDisconnect.addEventListener((port) => {
        console.debug('sw.js -', 'onDisconnect:', port);
        console.assert(port.name === 'MyTimer');

        this._port = null;
      });

      this._port = port;
    });

    /* chrome.runtime.Port.onDisconnect.addEventListener((port) => {
      console.debug('sw.js -', 'onDisconnect:', port);
      console.assert(port.name === 'MyTimer');

      this._port = null;
    }); */

    // chrome.runtime.onDisconnect

    /* this._port = chrome.runtime.connect({ name: 'MyTimer' });

    this._port.postMessage({ type: 'timer:init' });

    this._port.onMessage.addListener((msg) => this._onMessage(this._port, msg));
    */

    /* chrome.runtime.onConnect.addListener((port) => {
      console.assert(port.name === 'MyTimer');

      port.onMessage.addListener((msg) => this._onMessage(port, msg));
    });
    */
  }

  _onMessage (msg) {
    // WAS: chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'timer:getStatus') {
      this._postMessage({ type: 'timer:status', running: this._running, value: this._value });
      // WAS: sendResponse({ type: 'status', running: this._running, value: this._value });

      console.debug('timer:getStatus');
    }

    if (msg.type === 'timer:stop' && this._intId) {
      this._stop();
    }

    if (msg.type === 'timer:start' && !this._running) {
      this._timer = this._duration;

      this._running = true;

      this._intId = setInterval(() => {
        let minutes = parseInt(this._timer / 60, 10);
        let seconds = parseInt(this._timer % 60, 10);

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        this._value = `${minutes}:${seconds}`;

        if (--this._timer < 0) {
          // timer = this._duration;
          this._stop();
        }

        this._postMessage({ type: 'timer:ping', value: this._value, duration: this._duration });
        // WAS: chrome.runtime.sendMessage({ type: 'timer:ping', value: this._value, duration: this._duration });

        // console.debug('Sending timer:ping', value);
      },
      1000);

      console.debug('timer:start');
    } // IF.
  }

  _stop () {
    clearInterval(this._intId);

    this._running = false;
    this._intId = null;

    this._postMessage({ type: 'timer:stopped', value: '00:00' });

    // WAS: chrome.runtime.sendMessage({ type: 'timer:stopped', value: '00:00' });

    console.debug('Sending timer:stopped');
  }

  _postMessage (data) {
    chrome.runtime.sendMessage(data);

    if (this._port) {
      this._port.postMessage(data);
    }
  }
}

const workerTimer = new WorkerTimer();

workerTimer.initialize();

// End.
