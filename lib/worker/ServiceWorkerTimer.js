import AddonBase from '../AddonBase.js';

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
 * @copyright © Nick Freear and contributors, 26-July-2024.
 */
export class ServiceWorkerTimer extends AddonBase {
  #intervalId = null;
  #duration;
  #timer;
  #value;
  #port;
  #stopCallbackFunc;

  constructor () {
    super();
    /* this._intervalId = null;
    this._duration = null;
    this._timer = null;
    this._value = null; */
    console.debug('ServiceWorkerTimer:', this);
  }

  async #getDurationSeconds () {
    const { duration } = await super._fromStorage();
    return parseInt(duration) * 60;
  }

  initialize () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => this.#onMessage(msg));

    this._runtime.onConnect.addListener((port) => {
      console.debug('sw.js ~ WT ~ onConnect:', port);
      console.assert(port.name === 'MyTimer');

      /* port.onDisconnect.addEventListener((port) => {
        console.debug('sw.js -', 'onDisconnect:', port);
        console.assert(port.name === 'MyTimer');

        this._port = null;
      }); */

      this.#port = port;
    });

    this._runtime.onInstalled.addListener(async (details) => {
      const isRunning = await super._isRunning();
      if (isRunning) {
        this.#stop(details.reason || 'install');
      }
      console.debug('SWT ~ onInstalled:', details);
    });
  }

  async #onMessage (msg) {
    // WAS: chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    /* if (msg.type === 'timer:getStatus') {
      this._postMessage({ type: 'timer:status', running: this._running, value: this._value });
      // WAS: sendResponse({ type: 'status', running: this._running, value: this._value });

      console.debug('WT ~ timer:getStatus');
    } */

    if (msg.type === this.ev.timerStop && this.#intervalId) {
      await this.#stop(msg.reason);
    }

    if (msg.type === this.ev.timerStart) { // Was: && !this._running) {
      this.#timer = await this.#getDurationSeconds();

      await super._store({ isRunning: true });

      this.#intervalId = setInterval(() => this.#onInterval(), 1000);

      const value = super._formatTime(this.#timer);

      this.#postMessage({ type: this.ev.timerStarted, value, duration: this.#duration });
      this.#postMessage({ type: this.ev.timerPing, value, duration: this.#duration });

      await this.#createNotification(`Timer started: ${value}`);

      console.debug('WT ~ Sending timer:started', value);
    } // IF.
  }

  #onInterval () {
    const value = this._formatTime(this.#timer);

    if (--this.#timer < 0) {
      // timer = this._duration;
      this.#stop('reached zero');
    }

    this.#postMessage({ type: this.ev.timerPing, value, duration: this.#duration });
  }

  /**
   * @see https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript#20618517
   */
  // Was: _formatTime (timer) {}

  async #stop (reason) {
    clearInterval(this.#intervalId);

    await super._store({ isRunning: false });

    this.#intervalId = null;

    this.#postMessage({ type: this.ev.timerStopped, value: '00:00', reason });
    // WAS: chrome.runtime.sendMessage({ type: 'timer:stopped', value: '00:00' });

    await this.#createNotification('Timer stopped!');

    if (this.#hasStopCallbackFunc) {
      await this.#stopCallbackFunc(reason);
    }

    console.debug('WT ~ Sending timer:stopped');
  }

  #postMessage (data) {
    this._runtime.sendMessage(data);

    if (this.#port) {
      this.#port.postMessage(data);
    }
  }

  async #createNotification (message) {
    return await this._notifications.create('my-pomodoro-timer', {
      type: 'basic',
      iconUrl: this._runtime.getURL('assets/icon-128.png'),
      title: 'My Pomodoro',
      message
    });
  }

  get #hasStopCallbackFunc () {
    return this.#stopCallbackFunc && typeof this.#stopCallbackFunc === 'function';
  }

  addStopCallback (callbackFunc) {
    this.#stopCallbackFunc = callbackFunc;
  }
}

export default ServiceWorkerTimer;
