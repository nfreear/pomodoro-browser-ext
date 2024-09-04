/**
 * ServiceWorkerTimer class.
 *
 * @listens `timer:start` message.
 * @listens `timer:stop` message.
 *
 * @fires   `timer:ping` message
 * @fires   `timer:started` message.
 * @fires   `timer:stopped` message.
 *
 * @copyright © Nick Freear, 26-July-2024.
 */

import AddonBase from '../AddonBase.js';

export class ServiceWorkerTimer extends AddonBase {
  constructor () {
    super();
    this._intervalId = null;
    this._duration = null;
    this._timer = null;
    this._value = null;
    console.debug('ServiceWorkerTimer:', this);
  }

  async _getDurationSeconds () {
    const { duration } = await super._fromStorage();
    return parseInt(duration) * 60;
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
    /* if (msg.type === 'timer:getStatus') {
      this._postMessage({ type: 'timer:status', running: this._running, value: this._value });
      // WAS: sendResponse({ type: 'status', running: this._running, value: this._value });

      console.debug('WT ~ timer:getStatus');
    } */

    if (msg.type === 'timer:stop' && this._intervalId) {
      await this._stop(msg.reason);
    }

    if (msg.type === 'timer:start') { // Was: && !this._running) {
      this._timer = await this._getDurationSeconds();

      await super._store({ isRunning: true });

      this._intervalId = setInterval(() => this._onInterval(), 1000);

      const value = super._formatTime(this._timer);

      this._postMessage({ type: 'timer:started', value, duration: this._duration });
      this._postMessage({ type: 'timer:ping', value, duration: this._duration });

      await this._createNotification(`Timer started: ${value}`);

      console.debug('WT ~ Sending timer:started', value);
    } // IF.
  }

  _onInterval () {
    const value = this._formatTime(this._timer);

    if (--this._timer < 0) {
      // timer = this._duration;
      this._stop('reached zero');
    }

    this._postMessage({ type: 'timer:ping', value, duration: this._duration });
  }

  /**
   * @see https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript#20618517
   */
  // Was: _formatTime (timer) {}

  async _stop (reason) {
    clearInterval(this._intervalId);

    await super._store({ isRunning: false });

    this._intervalId = null;

    this._postMessage({ type: 'timer:stopped', value: '00:00', reason });
    // WAS: chrome.runtime.sendMessage({ type: 'timer:stopped', value: '00:00' });

    await this._createNotification('Timer stopped!');

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

  get _hasStopCallbackFunc () {
    return this._stopCallbackFunc && typeof this._stopCallbackFunc === 'function';
  }

  addStopCallback (callbackFunc) {
    this._stopCallbackFunc = callbackFunc;
  }
}
