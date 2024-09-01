/*!
  WorkerTimer class.

  © NDF, 26-July-2024.
*/

import { ServiceWorkerTimer } from './worker/ServiceWorkerTimer.js';
import { OffScreenAudio } from './offscreenAudio.js';
import { DynamicIcon } from './worker/DynamicIcon.js';
import { Log } from './worker/Log.js';

const workerTimer = new ServiceWorkerTimer();
const offScreenAudio = new OffScreenAudio();
const dynamicIcon = new DynamicIcon();
const log = new Log();

function stopCallback (reason) {
  offScreenAudio.play();
  dynamicIcon.stop();
  log.append({ type: 'timer:stop', reason });

  console.debug('stopCallback - timer:stopped');
}

workerTimer.addStopCallback(stopCallback);
workerTimer.initialize();

offScreenAudio.addStartListener();
dynamicIcon.addStartListener();
log.addStartListener();

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
