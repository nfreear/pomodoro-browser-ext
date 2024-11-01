
[![Node.js CI][ci-img]][ci]

# My Pomodoro Browser Extension

A [Pomodoro][] countdown timer that helps you focus by blocking access to distracting websites.

## Features

* 🔧 ⏱️ The block-list, timer duration and other settings are configurable
* 🌟 🖋️ Add an icon and optionally a note to each timer session
* 🔔 🫑 An audible bell helps you track your progress
* 🏹 🎯 Achieve greater focus!
* 🧠 Designed for and by [neurodivergent brains][neuro]
* 😎 ♿ Designed with [accessibility][a11y-wp] in mind
* 👷‍♀️‍ 🚧 Under active development

Work-in-progress downloads:

* [extension.chromium.zip][] — _for Chrome, Edge & Chromium-based browsers_
* [extension.gecko.zip][] — _for Firefox & Gecko-based browsers_

## Browser support

Currently, the extension supports Chrome, Edge, and to some extent Firefox. There is an [open issue][xbrowser] where I'm documenting progress.

## Privacy

* 🔎 🔒 View the [Privacy policy][].

## Accessibility

The extension uses semantic HTML markup, for example, `<button>` and all input fields have associated labels. This and other features help to ensure that the extension is [accessible][] to all, including those who declare disabilities.

[pomodoro]: https://en.wikipedia.org/wiki/Pomodoro_Technique
[extension.chromium.zip]: https://nightly.link/nfreear/pomodoro-browser-ext/workflows/node.js/main/extension.chromium.zip
[extension.gecko.zip]: https://nightly.link/nfreear/pomodoro-browser-ext/workflows/node.js/main/extension.gecko.zip
[xbrowser]: https://github.com/nfreear/pomodoro-chrome-ext/issues/1
  "Cross-browser support (Firefox), #1"
[privacy policy]: /docs/PRIVACY.md
[accessible]: https://www.w3.org/WAI/fundamentals/accessibility-intro/
[a11y-wp]: https://en.wikipedia.org/wiki/Accessibility
[neuro]: https://en.wikipedia.org/wiki/Neurodiversity

[repo]: https://github.com/nfreear/pomodoro-browser-ext
[ci]: https://github.com/nfreear/pomodoro-browser-ext/actions/workflows/node.js.yml
[ci-img]: https://github.com/nfreear/pomodoro-browser-ext/actions/workflows/node.js.yml/badge.svg
