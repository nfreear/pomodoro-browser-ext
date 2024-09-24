/**
 * Developer Tools page.
 *
 * @copyright © Nick Freear, 22-September-2024.
 */

import AddonBase from '../AddonBase.js';
import MOCK_LOG from './mock-data.js';

class DeveloperTools extends AddonBase {
  get _mockLogData () { return { log: MOCK_LOG }; }

  attachDOM () {
    this._devLogForm = document.querySelector('#devLogForm');
    this._userAgentElem = document.querySelector('#userAgent');

    console.assert(this._devLogForm);
    console.assert(this._userAgentElem);

    this._userAgentElem.textContent = navigator.userAgent;
  }

  handleUserEvents () {
    this._devLogForm.addEventListener('submit', (ev) => this._devLogSubmitHandler(ev));
    this._devLogForm.addEventListener('reset', (ev) => this._devLogResetHandler(ev));

    // this._resetStorageForm.addEventListener('reset', (ev) => this._resetStorageHandler(ev));
  }

  async _devLogSubmitHandler (ev) {
    ev.preventDefault();

    const SUBMIT = confirm('Are you sure you want to add mock log data to storage?');
    if (SUBMIT) {
      await super._store(this._mockLogData);
    }

    console.debug('submit:', ev);
  }

  async _devLogResetHandler (ev) {
    ev.preventDefault();

    const RESET = confirm('Are you sure you want to reset log storage? (Destructive!)');
    if (RESET) {
      await super._store({ log: null });
      // await this.fromStorage();
    }

    console.debug('reset:', ev);
  }

  async consoleLog () {
    const { log } = super._fromStorage();
    console.debug(JSON.stringify(log.slice(log.length - 16), null, 2));
  }
}

const devTools = new DeveloperTools();

devTools.attachDOM();
devTools.handleUserEvents();
devTools.consoleLog();
