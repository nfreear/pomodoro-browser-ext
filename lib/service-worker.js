/*!
  WorkerTimer class.

  © NDF, 26-July-2024.
*/

const DURATION = {
  default: 10
};

class WorkerTimer {
  constructor () {
    this._running = false;
    this._intId = null;
    this._duration = null;
    this._timer = null;
    this._value = null;
    console.debug('sw.js ~ WorkerTimer');
  }

  get _browser () { return globalThis.browser || globalThis.chrome; }

  get _runtime () { return this._browser.runtime; }
  get _storage () { return this._browser.storage.local; }
  get _notifications () { return this._browser.notifications; }

  get isRunning () {
    return this._running;
  }

  async _getDurationSeconds () {
    console.assert(this._storage);

    const { duration } = await this._storage.get('duration');
    return parseInt(duration || DURATION.default) * 60;
  }

  initialize () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => this._onMessage(msg));

    this._runtime.onConnect.addListener((port) => {
      console.debug('sw.js ~ WT ~ onConnect:', port);
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

      console.debug('WT ~ timer:getStatus');
    }

    if (msg.type === 'timer:stop' && this._intId) {
      await this._stop();
    }

    if (msg.type === 'timer:start' && !this._running) {
      this._timer = await this._getDurationSeconds();

      this._running = true;

      this._intId = setInterval(() => {
        const value = this._formatTime();

        if (--this._timer < 0) {
          // timer = this._duration;
          this._stop();
        }

        this._postMessage({ type: 'timer:ping', value, duration: this._duration });
        // WAS: chrome.runtime.sendMessage({ type: 'timer:ping', value: this._value, duration: this._duration });

        // console.debug('Sending timer:ping', value);
      },
      1000);

      const value = this._formatTime();

      this._postMessage({ type: 'timer:started', value, duration: this._duration });
      this._postMessage({ type: 'timer:ping', value, duration: this._duration });

      await this._createNotification(`Timer started: ${value}`);

      console.debug('WT ~ Sending timer:started', value);
    } // IF.
  }

  /**
   * @see https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript#20618517
   */
  _formatTime () {
    let minutes = parseInt(this._timer / 60, 10);
    let seconds = parseInt(this._timer % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    this._value = `${minutes}:${seconds}`;
    return this._value;
  }

  async _stop () {
    clearInterval(this._intId);

    this._running = false;
    this._intId = null;

    this._postMessage({ type: 'timer:stopped', value: '00:00' });
    // WAS: chrome.runtime.sendMessage({ type: 'timer:stopped', value: '00:00' });

    await this._createNotification('Timer stopped!');

    console.debug('WT ~ Sending timer:stopped');
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
      message
    });
  }
}

const workerTimer = new WorkerTimer();

workerTimer.initialize();

// ========================

const BROWSER = globalThis.browser || globalThis.chrome;

const tabBlockList = [];

BROWSER.webNavigation.onDOMContentLoaded.addListener(async ({ tabId, url }) => {
  let exec = false;
  const _storage = BROWSER.storage.local;
  const { blockList } = await _storage.get('blockList');

  console.debug('SW ~ browser.webNav.onDOMCLoaded:', blockList, tabId, url);

  const isBlocked = (blockList || []).findIndex((pattern) => {
    const RE = new RegExp(pattern);
    return RE.test(url);
  });

  console.debug('SW ~ Should block?', tabId, url, isBlocked);

  if (isBlocked !== -1 && workerTimer.isRunning) {
    exec = true;

    BROWSER.scripting.executeScript({
      target: { tabId },
      files: ['lib/content-script.js']
    });
  }

  if (isBlocked !== -1) {
    tabBlockList.push({ tabId, url, exec });
  }

  // Storage test.
  const { updated } = await _storage.get('updated');
  const data = await _storage.get('onDOMCLoaded');
  // const { blockList } = await _storage.get('blockList');

  console.debug('SW ~ Storage ~ get:', updated, blockList, data);

  _storage.set({ updated: new Date() });
  _storage.set({ onDOMCLoaded: { tabId, url } });
});

BROWSER.tabs.onActivated.addListener(({ tabId }) => {
  const found = tabBlockList.find((it) => it.tabId === tabId);

  console.debug('SW ~ tabs.onActivated:', tabId, found, tabBlockList);

  if (found && !found.exec && workerTimer.isRunning) {
    BROWSER.scripting.executeScript({
      target: { tabId },
      files: ['lib/content-script.js']
    });
  }
});

console.debug('>>service-worker.js');

// End.
