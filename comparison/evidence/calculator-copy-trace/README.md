# Original calculator: copy, trace and strict API replay

September 13, 2026. Six Chrome desktop journeys pass: three arithmetic tasks at 320 and 1280 px, reference 2026-09-12T16:00:00Z, America/Chicago.

- January 31 plus one month minus one day produces February 27; the intermediate date is February 28.
- January 31 minus one day plus one month produces February 28; the intermediate date is January 30.
- September 12 at noon plus half a second produces 17:00:00.500Z; visible and copied text retains .500.

The runner checks readable dates/clocks, activates Copy date, waits for success and reads back only the value just written through the real browser clipboard API. It never reads pre-existing clipboard content. It clicks Check API result, verifies engine v2, exact independently specified timestamps and intermediate steps, then opens the visible calculation trace and checks each displayed before/after value and operation against those results. No horizontal overflow occurs. Invalid February 30 edits remove copy controls; subsequent valid input restores the normal flow.

Reproduce with `node examples/app/verify-calculator.mjs PLAYWRIGHT-ENTRY NEW-output-directory` against an already-running local main app on port 5174. Requires installed Chrome and clipboard permissions in the task-local browser context. It writes the authored result to the clipboard; it does not test cross-application paste. Keyboard checks use focus/Enter, not full Tab traversal. No physical-device, screen-reader, clipboard-denial or independent human-completion claim follows. Reports record failures rather than treating incomplete runs as success.

This is source/main-app evidence, not another packed SDK or comparative performance run. No application code, calendar, cloud setting or deployment changed. The earlier copy/API-only pass remains in local scratch `2026-09-13-tempus-calculator-copy`; the retained report includes the added visible-trace assertions.
