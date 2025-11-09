import AddonBase from '../AddonBase.js';
import Icons from '../Icons.js';

/**
 * Log class.
 *
 * @listens `timer:start` message.
 *
 * @copyright © Nick Freear and contributors, 29-August-2024.
 */
export class Log extends AddonBase {
  #logElem;

  /*
   * Page-display mode.
   */
  attachDOM () {
    this.#logElem = document.querySelector('#logTable tbody');
    // Was: this._logElem = document.querySelector('#log');
    console.assert(this.#logElem, '#logElem');
  }

  /* Service Worker mode.
   */
  addStartListener () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === this.ev.timerStart) {
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
        case this.ev.timerStart:
        case this.ev.timerStarted: // Drop-through.
          startTS = it.time;
          startISOtime = it.timeISO || it.time_fmt;
          break;
        case this.ev.timerStop:
        case this.ev.timerStopped: { // Drop-through.
          const { comment, emoji, emojiId, time } = it;
          const { name, role } = this._emojiNameRole(emojiId);
          listItems.push(`
          <tr>
            <td>${this.#fmtDate(startISOtime)}</td><td>${this.#fmtDuration(time, startTS)}</td>
            <td>${this.#decDuration(time, startTS)}</td>
            <td>${comment ? comment.text : ''}</td>
            <td><x-emj role="${role}" title="${name}">${emoji || ''}</x-emj></td>
          </tr>`);
          break;
        }
      }
    });

    if (listItems.length) {
      this.#logElem.innerHTML = listItems.join('\n');
    }

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
  #fmtDuration (endTS, startTS) {
    return this._formatTime((endTS - startTS) / 1000);
  }

  /* Floating-point duration, in minutes (2 decimal places).
  */
  #decDuration (endTS, startTS) {
    return parseInt((endTS - startTS) / (60 * 10)) / 100;
  }

  #fmtDate (isoTime) {
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

export default Log;
