[← Readme][]

# Privacy

## Single purpose description

A [Pomodoro][] countdown timer that helps you focus, by blocking access to distracting websites. (The block-list and timer duration are user configurable.)

## List and justify permissions

The "My Pomodoro" browser extension uses the following [permissions][]:

* "`activeTab`" — To check whether the current tab needs blocking, when it becomes active.
* "`notifications`" — To display system notifications at the start and end of Pomodoros.
* "`offscreen`" — To play a bell sound at the start and end of Pomodoros.
* "`scripting`" — To execute JavaScript to display a modal on blocked pages.
* "`storage`" — To store the configuration and log data.
* "`webNavigation`" — To check whether the current page needs blocking, when it becomes active.
* "`<all_urls>`" — To run the extenion on all pages, and if configured, block access.

---
[← Readme][]

[priv bug]: https://github.com/nfreear/pomodoro-chrome-ext/issues/6
[pomodoro]: https://en.wikipedia.org/wiki/Pomodoro_Technique
[permissions]: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#manifest
[tm perm]: https://www.tampermonkey.net/faq.php#Q304
[tm priv]: https://www.tampermonkey.net/privacy.php#tampermonkey-extensions-and-apps

[← readme]: https://github.com/nfreear/pomodoro-chrome-ext#readme
