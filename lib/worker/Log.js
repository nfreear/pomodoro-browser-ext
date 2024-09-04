/**
 * Log class.
 *
 * @listens `timer:start` message.
 *
 * @copyright © Nick Freear, 29-August-2024.
 */

import AddonBase from '../AddonBase.js';

export class Log extends AddonBase {
  /*
   * Page-display mode.
   */
  attachDOM () {
    this._logElem = document.querySelector('#log');
  }

  /* Service Worker mode.
   */
  addStartListener () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === 'timer:start') {
        this.append({ type: msg.type, reason: msg.reason || null });
      }
    });
  }

  async append (entry) {
    const { log } = await super._fromStorage();
    const data = { time: Date.now(), timeISO: new Date().toISOString(), ...entry };
    log.push(data);
    await super._store({ log });
    console.debug('Log.append:', data);
  }

  async render () {
    const { log } = await super._fromStorage();

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

if (/render=/.test(import.meta.url)) { // Was: /autorun=/
  const myLog = new Log();

  myLog.attachDOM();
  myLog.render();

  printButton();
} /* else {
  // Service Worker mode.
  myLog.listen();
} */

console.debug('>> log.js:', import.meta);
