/**
 * Log class.
 *
 * @listens `timer:start` message.
 *
 * @copyright © Nick Freear, 29-August-2024.
 */

export class Log {
  constructor () {
    console.assert(this._browser.storage);
    console.assert(this._browser.storage.local);
  }

  /* Page-display mode.
   */
  attachDOM () {
    this._logElem = document.querySelector('#log');
  }

  get _browser () { return globalThis.browser || globalThis.chrome; }
  get _runtime () { return this._browser.runtime; }
  get _storage () { return this._browser.storage.local; }

  /* Service Worker mode.
   */
  addStartListener () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === 'timer:start') {
        this.append({ type: msg.type, reason: msg.reason || null });
      }
    });
  }

  async fromStorage () {
    console.assert(this._storage);
    const { log } = await this._storage.get('log');
    return log || [];
  }

  async append (entry) {
    const log = await this.fromStorage();
    const data = { time: Date.now(), timeISO: new Date().toISOString(), ...entry };
    log.push(data);
    await this._storage.set({ log });
    console.debug('Log.append:', data);
  }

  async render () {
    const log = await this.fromStorage();

    let startISOtime;
    let startTS;

    const listItems = [];

    log.forEach((it) => {
      switch (it.type) {
        case 'timer:start':
        case 'timer:started': // Drop-through.
          startTS = it.time;
          startISOtime = it.timeISO || it.time_fmt;
          break;
        case 'timer:stop':
        case 'timer:stopped': // Drop-through.
          listItems.push(`
            <li><time dt>${this._fmtDate(startISOtime)}</time><comma>,</comma>
            duration: <time dur>${this._duration(it.time, startTS)}</time><comma>,</comma>
            <q>${it.comment ? it.comment.text : ''}</q></li>`);
          break;
      }
    });

    this._logElem.innerHTML = listItems.join('\n');

    console.debug('Log:', log);
  }

  _formatTime (time) {
    let minutes = parseInt(time / 60, 10);
    let seconds = parseInt(time % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${minutes}:${seconds}`;
  }

  _duration (endTS, startTS) {
    return this._formatTime((endTS - startTS) / 1000);
  }

  _fmtDate (isoTime) {
    return new Date(isoTime).toString().replace(/:\d\d .+/, '');
  }
}

export function printButton () {
  const BUTTON = document.querySelector('#printButton');
  BUTTON.addEventListener('click', (ev) => window.print());
}

/**
 * Instantiate the class, and either display the log, or call "listen()".
 */
const myLog = new Log();

if (/render=/.test(import.meta.url)) { // Was: /autorun=/
  myLog.attachDOM();
  myLog.render();

  printButton();
} /* else {
  // Service Worker mode.
  myLog.listen();
} */

console.debug('>> log.js:', import.meta);
