/**
 * Content script, and CSDialogTimer class.
 *
 * @listens `timer:ping` message.
 * @listens `timer:stopped` message.
 *
 * @fires `timer:stop` message.
 *
 * @copyright © Nick Freear and contributors, 01-August-2024.
 */

const CSP = "script-src 'self'; img-src chrome-extension: 'self'; font-src 'self' https://fonts.gstatic.com/; upgrade-insecure-requests;";

class CSDialogTimer {
  get _template () {
    return `
  <template>
  <link href="${this._stylesheet}" rel="stylesheet">
  <dialog part="dialog">
    <h1> My Pomodoro </h1>
    <p class="emoji-svg">
      <x-svg> Loading emoji &hellip; </x-svg>
    </p>
    <p>
      <output id="my-timer">&nbsp;</output>
    </p>
    <!-- <form method="dialog"> -->
      <p>
        <button id="stop-button">Stop</button>
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

  async createShowElement () {
    await this.importEmojiSVG();

    const ELEM = this._element = document.createElement('my-pomodoro-timer');

    const TEMPLATE = this.replaceWithEmojiSVG();

    this._attachLocalTemplate(ELEM, TEMPLATE);

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

  addCSP () {
    const META = document.createElement('meta');
    META.setAttribute('http-equiv', 'Content-Security-Policy');
    META.setAttribute('content', CSP);
    document.head.appendChild(META);
  }

  /* addSVGCallback (callbackFunc) {
    this._svgFunc = callbackFunc;
  } */

  findEmojiSVG (byId) {
    return this._icons.findEmojiSVG(byId);
  }

  replaceWithEmojiSVG () {
    return this._template.replace('<x-svg></x-svg>', this.findEmojiSVG('beans'));
  }

  /*
  https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension
  */
  async importEmojiSVG () {
    const src = this.getURL('lib/Icons.js');
    const { Icons } = await import(src);
    this._icons = new Icons();
    await this._icons.importEmojiSVG();
  }
}

/* (async () => {
  const src = chrome.runtime.getURL('lib/emoji-svg.js');
  const contentMain = await import(src);
  // contentMain.main();
})(); */

const dialogTimer = new CSDialogTimer();

dialogTimer.createShowElement().then(() => {
  dialogTimer.handleUserEvents();
  // dialogTimer.addStylesheet();
  // dialogTimer.getStatus();
  dialogTimer.listen();
});

// dialogTimer.addCSP();

console.debug('>> content-script.js');
