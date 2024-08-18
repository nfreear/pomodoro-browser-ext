/*!
  CSDialogTimer class.

  © NDF, 01-August-2024.
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
      <output id="my-timer" part="output"></output>
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
    // return `chrome-extension://${this._runtime.id}/assets/content-style.css`;
  }

  createShowElement () {
    const ELEM = this._element = document.createElement('my-pomodoro-timer');

    this._attachLocalTemplate(ELEM, this._template);

    document.body.appendChild(ELEM);

    this._dialog = ELEM.shadowRoot.querySelector('dialog');
    this._stopButton = this._dialog.querySelector('#stop-button');
    this._timer = this._dialog.querySelector('#my-timer');

    this._dialog.showModal();

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

    console.debug('CS ~ DialogTimer:', this._runtime.id, ELEM, globalThis);
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

  getStatus () {
    this._runtime.sendMessage({ type: 'timer:getStatus' });
  }

  listen () {
    const PORT = this._runtime.connect({ name: 'MyTimer' });

    PORT.onMessage.addListener((msg) => {
    // WAS: chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      console.debug('CS ~ DT ~ onMessage:', msg);

      if (msg.type === 'timer:ping') {
        // const { value } = msg;

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
    // return rootElem;
  }
}

const dialogTimer = new CSDialogTimer();

dialogTimer.createShowElement();
// dialogTimer.addStylesheet();
dialogTimer.getStatus();
dialogTimer.listen();

(async () => {
  const BROWSER = globalThis.browser || globalThis.chrome;
  const _storage = BROWSER.storage.local;

  console.debug('HI:', document.location, BROWSER.runtime);

  // const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  // Storage test.
  const { updated } = await _storage.get('updated');
  const data = await _storage.get('onDOMCLoaded');
  const { blockList } = await _storage.get('blockList');

  console.debug('CS ~ Storage ~ get:', updated, blockList, data);

  await _storage.set({ updated: new Date().toISOString() });
  // await _storage.set({ onDOMCLoaded: { location } });
})();

console.debug('>> content-script.js');

/*
(async () => {
  // see the note below on how to choose currentWindow or lastFocusedWindow
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  console.log('URL:', tab.url);
  // ..........

  const isBlocked = BLOCK_LIST.findIndex((pattern) => {
    const RE = new RegExp(pattern);
    return RE.test(tab.url);
  });

  if (isBlocked) {
    // console.log('Is blocked!');
  }

  console.log('Is blocked?', isBlocked);

  // End.
})();
*/
