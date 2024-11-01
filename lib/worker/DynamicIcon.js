/**
 * DynamicIcon class - animated icon - used by Service Worker.
 *
 * @listens `timer:start` message.
 * @listens `timer:stop` message.
 *
 * @copyright © Nick Freear and contributors, 31-August-2024.
 */

import AddonBase from '../AddonBase.js';

const RED = { color: '#F00' };

export class DynamicIcon extends AddonBase {
  constructor () {
    super();
    console.assert(this._action.setBadgeText);
  }

  addStartListener () {
    this._count = 0;

    this._runtime.onMessage.addListener((msg, sender, sendResponse) => {
      switch (msg.type) {
        case 'timer:start': // Drop-through.
        case 'timer:stopped':
          this._action.setBadgeTextColor(RED);
          this._action.setBadgeBackgroundColor(RED);
          this._action.setTitle({ title: 'My Pomodoro (timer running)' });

          this._internalID = setInterval(() => this._animate(), 2000);
          break;
        /* case 'timer:stopped':
          this._clearInterval();

          this._action.setBadgeText({ text: '' });
          this._action.setTitle({ title: 'My Pomodoro' });
          break; */
      }
    });
  }

  stop () {
    this._clearInterval();

    this._action.setBadgeText({ text: '' });
    this._action.setTitle({ title: 'My Pomodoro' });
  }

  _animate () {
    const text = (this._count % 2 === 0) ? ',' : ''; // &ThinSpace;
    this._action.setBadgeText({ text });
    this._count++;
  }

  _clearInterval () {
    clearInterval(this._internalID);
    this._internalID = null;
    this._count = 0;
  }
}
