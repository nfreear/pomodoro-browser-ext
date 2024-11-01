/**
 * Options page, and OptionsStorage class.
 *
 * @copyright © Nick Freear and contributors, 08-August-2024.
 */

import { AddonBase, DEFAULTS } from './AddonBase.js';
import Icons from './Icons.js';

const DURATION = {
  default: DEFAULTS.duration, // new AddonBase()._defaults.duration,
  min: 5,
  max: 60,
  step: 5
};

class OptionsStorage extends AddonBase {
  attachDOM () {
    this._blockListForm = document.querySelector('#blockListForm');
    this._durationForm = document.querySelector('#durationForm');
    this._emojiForm = document.querySelector('#emojiForm');
    this._resetStorageForm = document.querySelector('#resetStorageForm');
    this._userAgentElem = document.querySelector('#userAgent');

    console.assert(this._blockListForm);
    console.assert(this._durationForm);
    console.assert(this._emojiForm);
    console.assert(this._resetStorageForm);
    console.assert(this._userAgentElem);
    this._userAgentElem.textContent = navigator.userAgent;

    this._initializeEmojiForm();
  }

  _initializeEmojiForm () {
    const icons = new Icons();
    const optionsTemplate = `<template>${icons.getSelectOptions()}</template>`;
    this._attachTemplate(this._emojiSelectElem, optionsTemplate, false);
  }

  get _blockListElem () { return this._blockListForm.elements.list; }
  get _durationElem () { return this._durationForm.elements.duration; }
  get _emojiSelectElem () { return this._emojiForm.elements.emoji; }

  handleUserEvents () {
    this._blockListForm.addEventListener('submit', (ev) => this._blockListSubmitHandler(ev));
    this._blockListForm.addEventListener('reset', (ev) => this._blockListResetHandler(ev));

    this._durationElem.addEventListener('change', (ev) => this._durationChangeHandler(ev));
    this._emojiSelectElem.addEventListener('change', (ev) => this._emojiChangeHandler(ev));

    this._resetStorageForm.addEventListener('reset', (ev) => this._resetStorageHandler(ev));
  }

  async fromStorage () {
    const { blockList, duration, emojiId } = await super._fromStorage();

    this._blockListElem.value = (blockList || []).join('\n');
    this._durationElem.value = parseInt(duration);
    this._emojiSelectElem.value = emojiId;

    console.debug('OptionsStorage ~ duration, blockList:', duration, blockList);
  }

  async _blockListSubmitHandler (ev) {
    ev.preventDefault();

    const url = ev.target.elements.url.value;
    const listElem = ev.target.elements.list;

    listElem.value += url + '\n';

    const { blockList } = await super._fromStorage();

    console.debug('OS ~ submit:', url, blockList, listElem, ev);

    if (blockList && this._isArray(blockList)) {
      blockList.push(url);

      await super._store({ blockList }); // , () => console.debug('storage ~ set:', blockList));
    } else {
      await super._store({ blockList: [url] });
    }

    await this.fromStorage();
  }

  async _blockListResetHandler (ev) {
    ev.preventDefault();

    const { blockList } = await super._fromStorage();

    // Re-create pre-install state?
    await super._store({ blockList: null });

    await this.fromStorage();

    console.debug('OS ~ reset:', blockList, ev.target.elements, ev);
  }

  async _durationChangeHandler (ev) {
    const duration = parseInt(ev.target.value);
    console.assert(duration >= DURATION.min);
    console.assert(duration <= DURATION.max);

    await super._store({ duration });

    console.debug('OS ~ duration change:', duration, ev);
  }

  async _emojiChangeHandler (ev) {
    const icons = new Icons();
    const emojiId = ev.target.value;
    const { emoji } = icons.find(emojiId);

    await super._store({ emoji, emojiId });

    console.debug('OS ~ emoji change:', emoji, ev);
  }

  async _resetStorageHandler (ev) {
    ev.preventDefault();

    const RESET = confirm('Are you sure you want to reset storage?');
    if (RESET) {
      await super._store(super._defaults);
      await this.fromStorage();
    }

    console.debug('OS ~ reset storage:', RESET, ev);
  }

  _isArray (somevar) {
    return somevar.constructor.name === 'Array';
  }
}

const optionsStorage = new OptionsStorage();

optionsStorage.attachDOM();
optionsStorage.handleUserEvents();
optionsStorage.fromStorage();

console.debug('>> options.js', optionsStorage);
