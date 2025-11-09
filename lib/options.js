import { AddonBase, DEFAULTS } from './AddonBase.js';
import Icons from './Icons.js';

const { confirm } = globalThis;

/**
 * Options page, and OptionsStorage class.
 *
 * @copyright © Nick Freear and contributors, 08-August-2024.
 */

const DURATION = {
  default: DEFAULTS.duration, // new AddonBase()._defaults.duration,
  min: 5,
  max: 60,
  step: 5
};

class OptionsStorage extends AddonBase {
  #blockListForm;
  #durationForm;
  #emojiForm;
  #resetStorageForm;
  #userAgentElem;

  attachDOM () {
    this.#blockListForm = document.querySelector('#blockListForm');
    this.#durationForm = document.querySelector('#durationForm');
    this.#emojiForm = document.querySelector('#emojiForm');
    this.#resetStorageForm = document.querySelector('#resetStorageForm');
    this.#userAgentElem = document.querySelector('#userAgent');

    console.assert(this.#blockListForm);
    console.assert(this.#durationForm);
    console.assert(this.#emojiForm);
    console.assert(this.#resetStorageForm);
    console.assert(this.#userAgentElem);
    this.#userAgentElem.textContent = navigator.userAgent;

    this.#initializeEmojiForm();
  }

  #initializeEmojiForm () {
    const icons = new Icons();
    const optionsTemplate = `<template>${icons.getSelectOptions()}</template>`;
    this._attachTemplate(this.#emojiSelectElem, optionsTemplate, false);
  }

  get #blockListElem () { return this.#blockListForm.elements.list; }
  get #durationElem () { return this.#durationForm.elements.duration; }
  get #emojiSelectElem () { return this.#emojiForm.elements.emoji; }

  handleUserEvents () {
    this.#blockListForm.addEventListener('submit', (ev) => this.#blockListSubmitHandler(ev));
    this.#blockListForm.addEventListener('reset', (ev) => this.#blockListResetHandler(ev));

    this.#durationElem.addEventListener('change', (ev) => this.#durationChangeHandler(ev));
    this.#emojiSelectElem.addEventListener('change', (ev) => this.#emojiChangeHandler(ev));

    this.#resetStorageForm.addEventListener('reset', (ev) => this.#resetStorageHandler(ev));
  }

  async fromStorage () {
    const { blockList, duration, emojiId } = await super._fromStorage();

    this.#blockListElem.value = (blockList || []).join('\n');
    this.#durationElem.value = parseInt(duration);
    this.#emojiSelectElem.value = emojiId;

    console.debug('OptionsStorage ~ duration, blockList:', duration, blockList);
  }

  async #blockListSubmitHandler (ev) {
    ev.preventDefault();

    const url = ev.target.elements.url.value;
    const listElem = ev.target.elements.list;

    listElem.value += url + '\n';

    const { blockList } = await super._fromStorage();

    console.debug('OS ~ submit:', url, blockList, listElem, ev);

    if (blockList && this.#isArray(blockList)) {
      blockList.push(url);

      await super._store({ blockList }); // , () => console.debug('storage ~ set:', blockList));
    } else {
      await super._store({ blockList: [url] });
    }

    await this.fromStorage();
  }

  async #blockListResetHandler (ev) {
    ev.preventDefault();

    const { blockList } = await super._fromStorage();

    // Re-create pre-install state?
    await super._store({ blockList: null });

    await this.fromStorage();

    console.debug('OS ~ reset:', blockList, ev.target.elements, ev);
  }

  async #durationChangeHandler (ev) {
    const duration = parseInt(ev.target.value);
    console.assert(duration >= DURATION.min);
    console.assert(duration <= DURATION.max);

    await super._store({ duration });

    console.debug('OS ~ duration change:', duration, ev);
  }

  async #emojiChangeHandler (ev) {
    const icons = new Icons();
    const emojiId = ev.target.value;
    const { emoji } = icons.find(emojiId);

    await super._store({ emoji, emojiId });

    console.debug('OS ~ emoji change:', emoji, ev);
  }

  async #resetStorageHandler (ev) {
    ev.preventDefault();

    const RESET = confirm('Are you sure you want to reset storage?');
    if (RESET) {
      await super._store(super._defaults);
      await this.fromStorage();
    }

    console.debug('OS ~ reset storage:', RESET, ev);
  }

  #isArray (somevar) {
    return somevar.constructor.name === 'Array';
  }
}

const optionsStorage = new OptionsStorage();

optionsStorage.attachDOM();
optionsStorage.handleUserEvents();
optionsStorage.fromStorage();

console.debug('>> options.js', optionsStorage);
