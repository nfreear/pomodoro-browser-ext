/*!
  WorkerTimer class.

  © NDF, 26-July-2024.
*/

/* const BLOCK_LIST = [
  'http://localhost:8080/blocked.html',
  'https://example.org'
];

const DURATION = 60 * 10; // Was: 60 * 5;
*/

chrome.webNavigation.onDOMContentLoaded.addListener(async ({ tabId, url }) => {
  const _storage = chrome.storage.local;
  const { blockList } = await _storage.get('blockList');

  console.debug('chrome.webNav.onDOMCLoaded:', blockList, tabId, url);

  const isBlocked = blockList.findIndex((pattern) => {
    const RE = new RegExp(pattern);
    return RE.test(url);
  });

  console.log('Is blocked?', tabId, url, isBlocked);

  if (isBlocked !== -1) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-script.js']
    });

    /* chrome.scripting.insertCSS({
      target: { tabId },
      files: ['assets/content-style.css']
    }); */
  }

  // Storage test.
  const { updated } = await _storage.get('updated');
  const data = await _storage.get('onDOMCLoaded');
  // const { blockList } = await _storage.get('blockList');

  console.debug('Storage ~ get:', updated, blockList, data);

  _storage.set({ updated: new Date() });
  _storage.set({ onDOMCLoaded: { tabId, url } });
});

// ========================

class WorkerTimer {
  constructor () {
    this._running = false;
    this._intId = null;
    this._duration = null;
    this._timer = null;
    this._value = null;
  }

  get _runtime () { return chrome.runtime; }
  get _storage () { return chrome.storage.local; }
  get _notifications () { return chrome.notifications; }



  async _getDurationSeconds () {
    const { duration } = await this._storage.get('duration');
    return parseInt(duration || 10) * 60;
  }

  initialize () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => this._onMessage(msg));

    this._runtime.onConnect.addListener((port) => {
      console.debug('sw.js -', 'onConnect:', port);
      console.assert(port.name === 'MyTimer');

      /* port.onDisconnect.addEventListener((port) => {
        console.debug('sw.js -', 'onDisconnect:', port);
        console.assert(port.name === 'MyTimer');

        this._port = null;
      }); */

      this._port = port;
    });
  }

  async _onMessage (msg) {
    // WAS: chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'timer:getStatus') {
      this._postMessage({ type: 'timer:status', running: this._running, value: this._value });
      // WAS: sendResponse({ type: 'status', running: this._running, value: this._value });

      console.debug('timer:getStatus');
    }

    if (msg.type === 'timer:stop' && this._intId) {
      await this._stop();
    }

    if (msg.type === 'timer:start' && !this._running) {
      this._timer = await this._getDurationSeconds();

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

      await this._createNotification('Timer started!');

      console.debug('timer:start');
    } // IF.
  }

  async _stop () {
    clearInterval(this._intId);

    this._running = false;
    this._intId = null;

    this._postMessage({ type: 'timer:stopped', value: '00:00' });
    // WAS: chrome.runtime.sendMessage({ type: 'timer:stopped', value: '00:00' });

    await this._createNotification('Timer stopped!');

    console.debug('Sending timer:stopped');
  }

  _postMessage (data) {
    this._runtime.sendMessage(data);

    if (this._port) {
      this._port.postMessage(data);
    }
  }

  async _createNotification (message) {
    return await this._notifications.create('my-pomodoro-timer', {
      type: 'basic',
      iconUrl: this._runtime.getURL('assets/icon-128.png'),
      title: 'My Pomodoro',
      message,
    });
  }
}

const workerTimer = new WorkerTimer();

workerTimer.initialize();

console.debug('>>service-worker.js');

// End.
