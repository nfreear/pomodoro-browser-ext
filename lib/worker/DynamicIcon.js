/**
 * DynamicIcon class - used by Service Worker.
 *
 * @listens `timer:start` message.
 * @listens `timer:stop` message.
 *
 * @copyright © Nick Freear, 31-August-2024.
 */

const RED = { color: '#F00' };

export class DynamicIcon {
  constructor () {
    console.assert(this._action);
    console.assert(this._action.setBadgeText);
  }

  get _browser () { return globalThis.browser || globalThis.chrome; }
  get _runtime () { return this._browser.runtime; }
  get _action () { return this._browser.action; }

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

/* const dynamicIcon = new DynamicIcon();

dynamicIcon.listen(); */
