/*!
  DialogTimer class.

  © NDF, 01-August-2024.
*/

class DialogTimer {
  get _template () {
    return `
  <template>
  <dialog>
    <h1> My Timer </h1>
    <p>
      <output id="my-timer"></output>
    </p>
    <form method="dialog">
      <p>
        <button id="stop-button">Stop</button>
      </p>
    </form>
  </dialog>
  </template>
  `;
  }

  // constructor () {}

  createShowElement () {
    const ELEM = this._element = document.createElement('my-pomodoro-timer');

    this._attachLocalTemplate(ELEM, this._template);

    document.body.appendChild(ELEM);

    this._dialog = ELEM.shadowRoot.querySelector('dialog');
    this._stopButton = this._dialog.querySelector('#stop-button');
    this._timer = this._dialog.querySelector('#my-timer');

    this._dialog.showModal();

    this._stopButton.addEventListener('click', (ev) => {
      console.debug('Stop!');
    });

    console.debug('content-script.js:', ELEM);
  }

  getStatus () {
    chrome.runtime.sendMessage({ type: 'timer:getStatus' });
  }

  listen () {
    const PORT = chrome.runtime.connect({ name: 'MyTimer' });

    PORT.onMessage.addListener((msg) => {
    // WAS: chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      console.debug('onMessage:', msg);

      if (msg.type === 'timer:ping') {
        // const { value } = msg;

        this._timer.value = msg.value;

        console.debug('timer:ping:', msg.value);
      }

      if (msg.type === 'timer:stopped') {
        this._stopButton.disabled = 'disabled';
        // startButton.disabled = null;

        this._timer.value = '00:00';
      }
    });

    console.debug('listen:', PORT, chrome.runtime);
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

const dialogTimer = new DialogTimer();

dialogTimer.createShowElement();
dialogTimer.getStatus();
dialogTimer.listen();

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
