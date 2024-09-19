[← Readme][]

# Privacy Policy

Last updated: _20 September 2024_.

The privacy policy for the '_My Pomodoro_' browser extension is really simple.

## What is the single purpose?

My Pomodoro is a countdown timer that helps you focus, by blocking access to distracting websites. (The block-list and timer duration are user configurable.)

## What data does the extension store?

The extension collects the following data:

* Configuration options, including the choice of emoji, the length of the Pomodoro timer, and the list of websites to block.
* A log of the start and end date and time for each Pomodoro timer.
* A comment that you can optionally add to each Pomodoro timer.
* The "_reason_" that the timer ended (for example, that the timer reached zero, or that you clicked the "Stop" button!)

The browser extension does not generate, use or store:

* Analytics data,
* Cookies,
* Personal data,
* Sensitive data,
* Browsing data and preferences,

## Where is data stored?

All of this data is stored on your local device. It does not leave your computer, tablet or phone.

## Who is the data shared with?

The data is not stored within any other party.

## What permissions are required?

The browser extension uses the following [permissions][]:

* "`activeTab`" — To check whether the current tab needs blocking, when it becomes active.
* "`notifications`" — To display system notifications at the start and end of Pomodoros.
* "`offscreen`" — To play a bell sound at the start and end of Pomodoros (_only on Chromium and Chrome_).
* "`scripting`" — To execute JavaScript to display a modal on blocked pages.
* "`storage`" — To store the configuration and log data.
* "`webNavigation`" — To check whether the current page needs blocking, when it becomes active.
* "`<all_urls>`" — To run the extension on all pages, and if configured, block access for you!

## Updates?

This privacy policy may be updated from time to time. Please check back regularly for any changes.

---
[← Readme][]

[priv bug]: https://github.com/nfreear/pomodoro-chrome-ext/issues/6
[pomodoro]: https://en.wikipedia.org/wiki/Pomodoro_Technique
[permissions]: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#manifest
[tm perm]: https://www.tampermonkey.net/faq.php#Q304
[tm priv]: https://www.tampermonkey.net/privacy.php#tampermonkey-extensions-and-apps

[short policy]: https://www.privacypolicies.com/blog/short-privacy-policy/
[termly]: https://termly.io/products/privacy-policy-generator/
[termly app]: https://app.termly.io/builder/documents/new?template_id=12

[← readme]: https://github.com/nfreear/pomodoro-chrome-ext#readme
