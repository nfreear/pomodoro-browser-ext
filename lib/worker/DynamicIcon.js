import AddonBase from '../AddonBase.js';

/**
 * DynamicIcon class - animated icon - used by Service Worker.
 *
 * @listens `timer:start` message.
 * @listens `timer:stop` message.
 *
 * @copyright © Nick Freear and contributors, 31-August-2024.
 */
export class DynamicIcon extends AddonBase {
  #count = 0;
  #internalID;

  get #red () { return { color: '#F00' }; }

  constructor () {
    super();
    console.assert(this._action.setBadgeText);
  }

  addStartListener () {
    this._runtime.onMessage.addListener((msg, sender, sendResponse) => {
      switch (msg.type) {
        case this.ev.timerStart: // Drop-through.
        case this.ev.timerStopped:
          this._action.setBadgeTextColor(this.#red);
          this._action.setBadgeBackgroundColor(this.#red);
          this._action.setTitle({ title: 'My Pomodoro (timer running)' });

          this.#internalID = setInterval(() => this.#animate(), 2000);
          break;
        /* case 'timer:stopped':
          this.#clearInterval();

          this._action.setBadgeText({ text: '' });
          this._action.setTitle({ title: 'My Pomodoro' });
          break; */
      }
    });
  }

  stop () {
    this.#clearInterval();

    this._action.setBadgeText({ text: '' });
    this._action.setTitle({ title: 'My Pomodoro' });
  }

  #animate () {
    const text = (this.#count % 2 === 0) ? ',' : ''; // &ThinSpace;
    this._action.setBadgeText({ text });
    this._count++;
  }

  #clearInterval () {
    clearInterval(this.#internalID);
    this.#internalID = null;
    this.#count = 0;
  }
}

export default DynamicIcon;
