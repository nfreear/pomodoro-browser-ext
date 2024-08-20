/**
 * Build a manifest file targetting Chromium/Webkit or Gecko-based browsers.
 *
 * © NDF, 19-Aug-2024.
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json
 */

const fs = require('fs').promises;
const { resolve } = require('path');

console.log('Building manifest - targetting:', process.env.UA);

const IS_GECKO = process.env.UA === 'gecko';

const FILE_PATH = resolve(__dirname, '..', 'manifest.json');
const SERVICE_WORKER = 'lib/service-worker.js';

const TEMPLATE = {
  manifest_version: 3,

  name: 'My Pomodoro',
  version: '1.0',

  description: 'Grow trees! A Pomodoro countdown timer that blocks access to distracting websites.',
  homepage_url: 'https://github.com/nfreear/pomodoro-chrome-ext#readme',

  icons: {
    128: 'assets/icon-128.png'
  },

  permissions: [
    'activeTab',
    'notifications',
    'scripting',
    'storage',
    'webNavigation'
  ],

  host_permissions: [
    'https://*/*',
    'http://*/*'
  ],

  background: {
    // scripts: ['lib/service-worker.js'],
    // service_worker: 'lib/service-worker.js'
  },

  action: {
    default_popup: 'pages/index.html',
    default_title: 'My Pomodoro'
  },

  options_ui: {
    open_in_tab: true,
    page: 'options/options.html'
  },

  // content_scripts: [],

  web_accessible_resources: [
    {
      matches: ['https://*/*'],
      resources: [
        'assets/content-style.css',
        'assets/evergreen_tree.svg'
      ]
    }
  ]
};

const GECKO = {
  browser_specific_settings: {
    gecko: {
      id: 'my-pomodoro-ext@nick.freear.org.uk',
      strict_min_version: '42.0'
    }
  }
};

const MANIFEST = IS_GECKO ? { ...TEMPLATE, ...GECKO } : TEMPLATE;

if (IS_GECKO) {
  MANIFEST.background.scripts = [SERVICE_WORKER];
} else {
  MANIFEST.background.service_worker = SERVICE_WORKER;
}

const jsonData = JSON.stringify(MANIFEST, null, 2);

fs.writeFile(FILE_PATH, jsonData)
  .then(() => console.log('File written OK:', FILE_PATH))
  .catch((err) => {
    console.error('ERROR: failed to write:', FILE_PATH, err);
    process.exit(1);
  });
