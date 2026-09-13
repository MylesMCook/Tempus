# Mixed-month packed SDK verification

Archive `1dbb7a0be85c7a6bb7610c65c82c1316571abb4424fc6a1a417ee08e29321df4`: private @tempus-date/core 0.1.0; all 56 installed files match. Offline install with scripts disabled. Five examples each pass Node 22.12.0 and 26.8.1, including both same-month and mixed-month year/time choices. Installed browser/calendar/Worker declarations and the diagnostic Worker type-check pass.

Six browser journeys (Chrome 153.0.8010.36, Firefox 148.0.2, WebKit 26.4; 320/1280 px) pass weekly and mixed-month correction → complete download → restart/edit, plus blocked/invalid/all-day recovery. WebKit explicitly uses Option-Tab; the historical ordinary-Tab failure remains open. Browser reports retain keyboard traces and file hashes. No errors or unexpected requests were recorded.

The mixed-month task is `Call Sam September 30 and October 2 at noon`, reference 2026-09-12T16:00:00Z, America/Chicago. Choose 2026 then At noon. The two events are September 30 and October 2 at 17:00 UTC, title Call Sam, with no invented duration. Editing October 2 to October 3 invalidates the answer. Local workerd also passes this path, weekly/monthly files, all seven file failure codes and recovery.

The locked Python readers pass all twelve saved browser downloads and three Worker files. These are file checks, not calendar-client imports. No physical-device, screen-reader, independent evaluation or comparative performance result is implied. Current performance evidence still belongs to archive 906f3a6f.

Reproduce with `examples/sdk/verify-package.mjs`, `verify-browser.mjs --webkit-option-tab`, `verification-worker.ts` and the two locked `read-*-files.py` scripts. Follow their argument contracts and use a fresh scratch installation with the copied example/config. Browser and Worker servers were bound to loopback and stopped after verification. Main-app service was left running.
