# Language foundation (stage 5A)

English is the default. Navigation labels are pre-rendered from `_data/i18n.yaml`.
The EN / 中文 buttons switch their visibility without changing URLs, search
parameters or anchors. Research content remains English in this stage.

`bilingual-text.html` accepts `en` and `zh` plain strings. It escapes text and
creates no IDs. Blank, missing or null Chinese falls back to English; that
fallback retains `lang="en"`. It does not render Markdown or rich HTML.
Rich content support belongs to the following content stages.

Inactive text uses the native `hidden` attribute, removing it from layout and
the accessibility tree. Without JavaScript, English stays visible and the
language controls stay hidden. The buttons use native keyboard activation and
`aria-pressed` for the current language, with a visible focus outline.

The preference key is `duan-lab:<baseurl>:language`, including the project path
to avoid collisions between GitHub Pages projects. Only explicit button clicks
save a preference. Storage failures are caught; switching still works within
the current page. The script dispatches `languagechange` for later search and
content integration. It does not implement language query parameters, browser
language detection, translated metadata or separate language routes.

Existing automatic script/style loading includes the new files. No change to
deployment configuration is required. Keep using `relative_url` for all links.

## Verification

Local checks cover JavaScript syntax, mock-DOM behavior (default/saved language,
blocked storage, switching, hidden state, accessibility state and unchanged URL
and dark-mode state), Liquid block pairing, protected-file scope and diff
whitespace. Mock-DOM checks are not browser or screen-reader tests.

Before publication, run Jekyll with `/lab-website-template/` as baseurl. Check
desktop and 320px/375px mobile widths, home and interior headers, the collapsed
menu, Tab/Enter/Space, actual screen-reader output, dark mode, refresh, disabled
JavaScript/storage, and URLs containing search parameters and anchors. Confirm
the language files load from the project path and existing tooltips still work.
