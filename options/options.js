/*!
  OptionsStorage class.

  © NDF, 08-August-2024.
*/

const DURATION = {
  default: 10,
  min: 5,
  max: 60,
  step: 5
};

class OptionsStorage {
  attachDOM () {
    this._blockListForm = document.querySelector('#blockListForm');
    this._durationForm = document.querySelector('#durationForm');

    console.assert(this._blockListForm);
    console.assert(this._durationForm);
  }

  get _browser () { return globalThis.browser || globalThis.chrome; }
  get _storage () { return this._browser.storage.local; }

  get _blockListElem () { return this._blockListForm.elements.list; }
  get _durationElem () { return this._durationForm.elements.duration; }

  handleUserEvents () {
    this._blockListForm.addEventListener('submit', (ev) => this._blockListSubmitHandler(ev));
    this._blockListForm.addEventListener('reset', (ev) => this._blockListResetHandler(ev));

    this._durationElem.addEventListener('change', (ev) => this._durationChangeHandler(ev));
  }

  async fromStorage () {
    console.assert(this._storage);

    const { blockList, duration } = await this._storage.get();

    this._blockListElem.value = (blockList || []).join('\n');
    this._durationElem.value = parseInt(duration || DURATION.default);

    console.debug('OptionsStorage ~ duration, blockList:', duration, blockList);
  }

  async _blockListSubmitHandler (ev) {
    ev.preventDefault();

    const url = ev.target.elements.url.value;
    const listElem = ev.target.elements.list;

    listElem.value += url + '\n';

    const { blockList } = await this._storage.get('blockList');

    console.debug('OS ~ submit:', url, blockList, listElem, ev);

    if (this._isArray(blockList)) {
      blockList.push(url);

      await this._storage.set({ blockList }); // , () => console.debug('storage ~ set:', blockList));
      // _storage.set(blockList).then(() => console.debug('storage ~ set OK:', blockList));
    } else {
      await this._storage.set({ blockList: [url] });
    }

    await this.fromStorage();
  }

  async _blockListResetHandler (ev) {
    ev.preventDefault();

    const { blockList } = await this._storage.get('blockList');

    // Re-create pre-install state?
    await this._storage.set({ blockList: null });
    await this.fromStorage();

    console.debug('OS ~ reset:', blockList, ev.target.elements, ev);
  }

  async _durationChangeHandler (ev) {
    const duration = parseInt(ev.target.value);
    console.assert(duration >= DURATION.min);
    console.assert(duration <= DURATION.max);

    await this._storage.set({ duration });

    console.debug('OS ~ duration change:', duration, ev);
  }

  _isArray (somevar) {
    return somevar.constructor.name === 'Array';
  }
}

const optionsStorage = new OptionsStorage();

optionsStorage.attachDOM();
optionsStorage.handleUserEvents();
optionsStorage.fromStorage();

console.debug('>> options.js');
