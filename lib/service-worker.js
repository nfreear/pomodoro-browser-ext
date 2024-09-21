/**
 * Service worker, and SiteBlocker class.
 *
 * @copyright © Nick Freear, 26-July-2024.
 */

import AddonBase from './AddonBase.js';

import { ServiceWorkerTimer } from './worker/ServiceWorkerTimer.js';
import { OffScreenAudio } from './offscreenAudio.js';
import { DynamicIcon } from './worker/DynamicIcon.js';
import { Log } from './worker/Log.js';

const workerTimer = new ServiceWorkerTimer();
const offScreenAudio = new OffScreenAudio();
const dynamicIcon = new DynamicIcon();
const log = new Log();

async function stopCallback (reason) {
  await offScreenAudio.play();
  dynamicIcon.stop();
  const { comment, emoji, emojiId } = await commentEtcFromStorage();
  // const { emoji, emojiId } = await log._fromStorage();
  await log.append({ type: 'timer:stop', reason, comment, emojiId, emoji });

  console.debug('stopCallback - timer:stopped');
}

async function commentEtcFromStorage () {
  const { comment, emoji, emojiId } = await log._fromStorage();
  await log._store({ comment: null });
  return { comment: (comment || { text: '' }), emoji, emojiId };
}

workerTimer.addStopCallback(stopCallback);
workerTimer.initialize();

offScreenAudio.addStartListener();
dynamicIcon.addStartListener();
log.addStartListener();

// ==========================

class WebSiteBlocker extends AddonBase {
  constructor () {
    super();
    this._tabBlockList = [];
  }

  handleBrowserEvents () {
    this._webNavigation.onDOMContentLoaded.addListener(({ tabId, url }) => this._onDOMContentLoaded(tabId, url));

    this._tabs.onActivated.addListener(({ tabId }) => this._onTabActivated(tabId));
  }

  async _isUrlBlocked (url) {
    const { blockList } = await super._fromStorage();

    const isBlocked = (blockList || []).findIndex((pattern) => {
      const RE = new RegExp(pattern);
      return RE.test(url);
    });
    return isBlocked !== -1;
  }

  async _onDOMContentLoaded (tabId, url) {
    const { blockList, isRunning } = await super._fromStorage();
    const isBlocked = await this._isUrlBlocked(url);

    let exec = false;

    console.debug('SW ~ browser.webNav.onDOMCLoaded:', tabId, url);
    console.debug('SW ~ Should block?', isBlocked, blockList);

    if (isBlocked && isRunning) {
      exec = true;

      this._executeScript(tabId);
    }

    if (isBlocked) {
      this._tabBlockList.push({ tabId, url, exec });
    }
  }

  async _onTabActivated (tabId) {
    const isRunning = await super._isRunning();

    const found = this._tabBlockList.find((it) => it.tabId === tabId);

    console.debug('SW ~ tabs.onActivated:', tabId, found, this._tabBlockList);

    if (found && !found.exec && isRunning) {
      this._executeScript(tabId);
    }
  }

  _executeScript (tabId) {
    this._scripting.executeScript({
      target: { tabId },
      files: ['lib/content-script.js']
    });
  }
}

const siteBlocker = new WebSiteBlocker();

siteBlocker.handleBrowserEvents();

// ==========================
// LEGACY CODE.

/* const BROWSER = globalThis.browser || globalThis.chrome;

const tabBlockList = [];

BROWSER.webNavigation.onDOMContentLoaded.addListener(async ({ tabId, url }) => {
  let exec = false;
  const _storage = BROWSER.storage.local;
  const { blockList } = await _storage.get('blockList');

  console.debug('SW ~ browser.webNav.onDOMCLoaded:', blockList, tabId, url);

  const isBlocked = (blockList || []).findIndex((pattern) => {
    const RE = new RegExp(pattern);
    return RE.test(url);
  });

  console.debug('SW ~ Should block?', tabId, url, isBlocked);

  const isRunning = await workerTimer._isRunning();

  if (isBlocked !== -1 && isRunning) {
    exec = true;

    BROWSER.scripting.executeScript({
      target: { tabId },
      files: ['lib/content-script.js']
    });
  }

  if (isBlocked !== -1) {
    tabBlockList.push({ tabId, url, exec });
  }

  // Storage test.
  /* const { updated } = await _storage.get('updated');
  const data = await _storage.get('onDOMCLoaded');
  // const { blockList } = await _storage.get('blockList');

  console.debug('SW ~ Storage ~ get:', updated, blockList, data);

  _storage.set({ updated: new Date() });
  _storage.set({ onDOMCLoaded: { tabId, url } });
  *--/
});

BROWSER.tabs.onActivated.addListener(({ tabId }) => {
  const found = tabBlockList.find((it) => it.tabId === tabId);

  console.debug('SW ~ tabs.onActivated:', tabId, found, tabBlockList);

  if (found && !found.exec && workerTimer.isRunning) {
    BROWSER.scripting.executeScript({
      target: { tabId },
      files: ['lib/content-script.js']
    });
  }
}); */

console.debug('>>service-worker.js', globalThis);

// End.
