# Current packed SDK offline browser verification

Archive `a7f9e298c3c3152e0cddc7e439819ed0aba83a2471e81adc78a646e9737ca21b` passes fifteen authored download journeys in each of six desktop contexts: installed Chrome, Playwright Firefox and Playwright WebKit at widths 320 and 1280. All ninety files pass the pinned icalendar and recurring-ical-events readers. Archive files and integration-source hashes are checked before serving and running.

The runner loads the static installed-package integration, disables the network, and confirms a control fetch fails. Every subsequent parse, clarification and file preparation completes with no request beyond that failed control. This proves offline-after-load operation of these tasks; it does not prove cold offline installation/startup.

Journey version 2 adds `Buy apples for mom at 1:30am on 11/01/2026`: title/date/DST answers, original text and spans, one event at November 1 07:30 UTC, followed by an edit to dad that invalidates the answer and blocks download. Pending/assuming/provided conditions retain input and stay unresolved without a selectable title or file. Those rejections are safeguards, not completed conditional tasks. The original fourteen date/range/count/list/recurrence tasks remain unchanged. The updated reader also passes the previous version's 84 files.

Keyboard traversal is Tab/Shift-Tab in Chrome and Firefox and Option-Tab/Shift-Option-Tab in WebKit. Download actions use Enter and are paced by 1.1 seconds. This is not download-throughput evidence. Historical rapid-download failures and ordinary-Tab WebKit limitations remain open. No new failure occurred in this run.

The browser integration and SDK implementation did not change; this milestone updates the verification harness and reader. Scoped lint and JavaScript/Python syntax checks pass. The exact runner snapshots, browser reports/screenshots, downloaded files, source identities and separate reader results are retained here. The loopback server was stopped afterward.

Reproduce with `serve-packed.mjs INSTALL NEW_STATIC_OUTPUT`, followed by `verify-browser.mjs INSTALL NEW_BROWSER_OUTPUT PLAYWRIGHT_ENTRY --webkit-option-tab --offline-after-load`, then `uv run --locked examples/sdk/read-browser-files.py BROWSER_OUTPUT`. The HTML and Vite configuration must match the repository example in the verified installation. See the SDK examples README for setup.

This is desktop engine and authored integration evidence, not physical iOS/Android, retail Safari, assistive-technology testing, calendar-client import, independent user evaluation or a public API stability commitment. New runtime proof does not establish competitive superiority. No deployment, publication or calendar write occurred.
