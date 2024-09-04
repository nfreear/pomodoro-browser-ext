/**
 * CSDialogTimer class.
 *
 * @listens `timer:ping` message.
 * @listens `timer:stopped` message.
 *
 * @fires `timer:stop` message.
 *
 * @copright © Nick Freear and contributors, 01-August-2024.
 */

class CSDialogTimer {
  get _template () {
    return `
  <template>
  <link href="${this._stylesheet}" rel="stylesheet">
  <!-- <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0..1" rel="stylesheet"> -->
  <dialog part="dialog">
    <h1 part="hdg"> My Pomodoro </h1>
    <p>
      <img alt="evergreen tree" src="${this.getURL('/assets/evergreen_tree.svg')}">
      <!-- <i class="material-symbols-outlined tree-icon">park</i> -->
    </p>
    <p>
      <output id="my-timer" part="output">&nbsp;</output>
    </p>
    <!-- <form method="dialog"> -->
      <p>
        <button id="stop-button" part="button">Stop</button>
      </p>
    <!-- </form> -->
  </dialog>
  </template>
  `;
  }

  get _browser () { return globalThis.browser || globalThis.chrome; }
  get _runtime () { return this._browser.runtime; }

  getURL (path) {
    return this._runtime.getURL(path);
  }

  get _stylesheet () {
    return this.getURL('/assets/content-style.css');
  }

  createShowElement () {
    const ELEM = this._element = document.createElement('my-pomodoro-timer');

    this._attachLocalTemplate(ELEM, this._template);

    document.body.appendChild(ELEM);

    this._dialog = ELEM.shadowRoot.querySelector('dialog');
    this._stopButton = this._dialog.querySelector('#stop-button');
    this._timer = this._dialog.querySelector('#my-timer');

    console.assert(this._stopButton);
    console.assert(this._timer);

    this._dialog.showModal();

    console.debug('CS ~ DialogTimer:', this._runtime.id, ELEM, globalThis);
  }

  handleUserEvents () {
    this._stopButton.addEventListener('click', (ev) => this._handleClickEvent(ev));

    window.addEventListener('keyup', (ev) => {
      console.debug('keyup:', ev.key, ev);

      if (ev.key === 'Escape') {
        console.debug('@TODO: Block escape?');
        /* ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation(); */
        this._stop('escape');
      }
    });
  }

  _handleClickEvent (ev) {
    ev.preventDefault();

    const STOP = confirm('Are you sure you want to stop the timer?');
    if (STOP) {
      this._stop('click');
    }
    console.debug('CS ~ DT ~ Stop?', STOP, ev);
  }

  _stop (reason) {
    this._runtime.sendMessage({ type: 'timer:stop', reason, source: 'CSDialogTimer' });

    this._dialog.close();
  }

  /* getStatus () {
    this._runtime.sendMessage({ type: 'timer:getStatus' });
  } */

  listen () {
    const PORT = this._runtime.connect({ name: 'MyTimer' });

    PORT.onMessage.addListener((msg) => {
    // WAS: chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      console.debug('CS ~ DT ~ onMessage:', msg);

      if (msg.type === 'timer:ping') {
        this._timer.value = msg.value;

        console.debug('CS ~ DT ~ timer:ping:', msg.value);
      }

      if (msg.type === 'timer:stopped') {
        this._stopButton.disabled = 'disabled';
        // startButton.disabled = null;

        this._timer.value = '00:00';
      }
    });

    console.debug('CS ~ DT ~ listen:', PORT, this._runtime);
  }

  _attachLocalTemplate (elem, templateHtml, attachShadow = true) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateHtml, 'text/html');

    const template = doc.querySelector('template');
    const docFragment = template.content.cloneNode(true);

    if (attachShadow) {
      elem.attachShadow({ mode: 'open' }).appendChild(docFragment);
    } else {
      elem.appendChild(docFragment);
    }
  }
}

const dialogTimer = new CSDialogTimer();

dialogTimer.createShowElement();
dialogTimer.handleUserEvents();
// dialogTimer.addStylesheet();
// dialogTimer.getStatus();
dialogTimer.listen();

console.debug('>> content-script.js');
