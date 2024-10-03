/**
 * Log class.
 *
 * @listens `timer:start` message.
 *
 * @copyright © Nick Freear, 29-August-2024.
 */

import AddonBase from '../AddonBase.js';
import Icons from '../Icons.js';

export class Log extends AddonBase {
  /*
   * Page-display mode.
   */
  attachDOM () {
    this._logElem = document.querySelector('#logTable tbody');
    // Was: this._logElem = document.querySelector('#log');
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
        case 'timer:stopped': { // Drop-through.
          const { comment, emoji, emojiId, time } = it;
          const { name, role } = this._emojiNameRole(emojiId);
          listItems.push(`
          <tr>
            <td>${this._fmtDate(startISOtime)}</td><td>${this._fmtDuration(time, startTS)}</td>
            <td>${this._decDuration(time, startTS)}</td>
            <td>${comment ? comment.text : ''}</td>
            <td><x-emj role="${role}" title="${name}">${emoji || ''}</x-emj></td>
          </tr>`);
          break;
        }
      }
    });

    this._logElem.innerHTML = listItems.join('\n');

    console.debug('Log:', log);
  }

  _emojiNameRole (emojiId) {
    if (!emojiId) return { name: '', role: '' };
    const icons = new Icons();
    const { name } = icons.find(emojiId);
    if (!name) return { name: '', role: '' };
    return { name, role: 'img' };
  }

  _formatTime (time) {
    let minutes = parseInt(time / 60, 10);
    let seconds = parseInt(time % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${minutes}:${seconds}`;
  }

  /* Duration in the format, "mm:ss"
  */
  _fmtDuration (endTS, startTS) {
    return this._formatTime((endTS - startTS) / 1000);
  }

  /* Floating-point duration, in minutes (2 decimal places).
  */
  _decDuration (endTS, startTS) {
    return parseInt((endTS - startTS) / (60 * 10)) / 100;
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
