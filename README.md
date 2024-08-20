
[![Node.js CI][ci-img]][ci]

# My Pomodoro Browser Extension

Grow trees! A [Pomodoro][] countdown timer that blocks access to distracting websites. The block-list and timer duration are user configurable.

Work-in-progress downloads:

* [extension.chromium.zip][] — _for Chrome & Chromium-based browsers_
* [extension.gecko.zip][] — _for Firefox_

## Browser support

Currently, the extension supports Chrome. There is an [open issue][xbrowser] where I'm documenting progress.

## Privacy

* [Privacy policy][]

## Accessibility

The extension uses semantic HTML markup, for example, `<button>` and all input fields have associated labels. This helps to ensure that the extension is [accessible][] to all, including those who declare disabilities.

[pomodoro]: https://en.wikipedia.org/wiki/Pomodoro_Technique
[extension.chromium.zip]: https://nightly.link/nfreear/pomodoro-chrome-ext/workflows/node.js/main/extension.chromium.zip
[extension.gecko.zip]: https://nightly.link/nfreear/pomodoro-chrome-ext/workflows/node.js/main/extension.gecko.zip
[xbrowser]: https://github.com/nfreear/pomodoro-chrome-ext/issues/1
  "Cross-browser support (Firefox), #1"
[privacy policy]: https://github.com/nfreear/pomodoro-chrome-ext/issues/6
[accessible]: https://www.w3.org/WAI/fundamentals/accessibility-intro/
[a11y-wp]: https://en.wikipedia.org/wiki/Accessibility

[ci]: https://github.com/nfreear/pomodoro-chrome-ext/actions/workflows/node.js.yml
[ci-img]: https://github.com/nfreear/pomodoro-chrome-ext/actions/workflows/node.js.yml/badge.svg
