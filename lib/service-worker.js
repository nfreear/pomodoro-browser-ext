/*!
  WorkerTimer class.

  © NDF, 26-July-2024.
*/

// import { offscreenAudio } from './offscreenAudio.js';
import { ServiceWorkerTimer } from './worker/ServiceWorkerTimer.js';

const workerTimer = new ServiceWorkerTimer();

workerTimer.initialize();

// ========================

const BROWSER = globalThis.browser || globalThis.chrome;

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

  if (isBlocked !== -1 && workerTimer.isRunning) {
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
  const { updated } = await _storage.get('updated');
  const data = await _storage.get('onDOMCLoaded');
  // const { blockList } = await _storage.get('blockList');

  console.debug('SW ~ Storage ~ get:', updated, blockList, data);

  _storage.set({ updated: new Date() });
  _storage.set({ onDOMCLoaded: { tabId, url } });
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
});

console.debug('>>service-worker.js', globalThis);

// End.
