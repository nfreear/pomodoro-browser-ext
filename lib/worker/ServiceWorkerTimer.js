/**
 * ServiceWorkerTimer class.
 *
 * @listens `timer:start` message.
 * @listens `timer:stop` message.
 * @fires   `timer:ping` message
 * @fires   `timer:started` message.
 * @fires   `timer:stopped` message.
 *
 * @copyright © Nick Freear, 26-July-2024.
 */

// import { offscreenAudio } from '../offscreenAudio.js';

const DURATION = {
  default: 10
};

export class ServiceWorkerTimer {
  constructor () {
    this._running = false;
    this._intervalId = null;
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

    if (msg.type === 'timer:stop' && this._intervalId) {
      await this._stop(msg.reason);
    }

    if (msg.type === 'timer:start' && !this._running) {
      this._timer = await this._getDurationSeconds();

      this._running = true;

      this._intervalId = setInterval(() => this._onInterval(), 1000);

      const value = this._formatTime(this._timer);

      this._postMessage({ type: 'timer:started', value, duration: this._duration });
      this._postMessage({ type: 'timer:ping', value, duration: this._duration });

      await this._createNotification(`Timer started: ${value}`);
      // await this._playAudio();

      console.debug('WT ~ Sending timer:started', value);
    } // IF.
  }

  _onInterval () {
    const value = this._formatTime(this._timer);

    if (--this._timer < 0) {
      // timer = this._duration;
      this._stop('zero');
    }

    this._postMessage({ type: 'timer:ping', value, duration: this._duration });
    // WAS: chrome.runtime.sendMessage({ type: 'timer:ping', value: this._value, duration: this._duration });

    // console.debug('Sending timer:ping', value);
  }

  /**
   * @see https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript#20618517
   */
  _formatTime (timer) {
    let minutes = parseInt(timer / 60, 10);
    let seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    this._value = `${minutes}:${seconds}`;
    return this._value;
  }

  async _stop (reason) {
    clearInterval(this._intervalId);

    this._running = false;
    this._intervalId = null;

    this._postMessage({ type: 'timer:stopped', value: '00:00', reason });
    // WAS: chrome.runtime.sendMessage({ type: 'timer:stopped', value: '00:00' });

    await this._createNotification('Timer stopped!');
    // await this._playAudio();

    if (this._hasStopCallbackFunc) {
      await this._stopCallbackFunc(reason);
    }

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

  /* async _playAudio () {
    await offscreenAudio();
  } */

  get _hasStopCallbackFunc () {
    return this._stopCallbackFunc && typeof this._stopCallbackFunc === 'function';
  }

  addStopCallback (callbackFunc) {
    this._stopCallbackFunc = callbackFunc;
  }
}
