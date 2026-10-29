# Main-app journey checks

These runners exercise the locally served app. They do not start services, deploy, write calendars or test physical devices. Install repository dependencies from the lockfile and run `pnpm dev --host 127.0.0.1 --port 5174` in a task-local terminal. Keep it running during verification. The runners expect Chrome and an installed Playwright module; pass that module's entry path explicitly.

Use a new output directory for each run. The parent directory must exist. From the repository root:

```sh
node examples/app/verify-reminder.mjs /absolute/path/to/playwright-core/index.mjs /absolute/path/to/new-reminder-run
node examples/app/verify-event-length.mjs /absolute/path/to/playwright-core/index.mjs /absolute/path/to/new-event-length-run
uv run --locked examples/app/read-reminder.py /absolute/path/to/new-reminder-run
node examples/app/verify-calculator.mjs /absolute/path/to/playwright-core/index.mjs /absolute/path/to/new-calculator-run
node examples/app/verify-layout.mjs /absolute/path/to/playwright-core/index.mjs /absolute/path/to/new-layout-run
node examples/app/verify-transparency.mjs /absolute/path/to/playwright-core/index.mjs /absolute/path/to/new-transparency-run
node examples/app/verify-typing-feel.mjs /absolute/path/to/playwright-core/index.mjs /absolute/path/to/new-typing-feel-run
```

The layout journey checks the two-column desktop calculator and stacked mobile layout at 320, 390, 768, 1054 and 1280 pixels. It checks example selection, clarification focus, and overflow for dates, intervals, recurrence and errors, and saves empty/result screenshots.

`verify-typing-feel.mjs` types phrases key by key at 320 and 1280 pixels. It checks that the answer pane does not re-animate while the kind of answer stays the same, that rows below it move less than 90px per keystroke, and that a phrase not yet understood stays neutral until typing pauses for 600ms or the field loses focus. It checks that clicking an example keeps the page still with the caret at the end of the field, that a touch tap at 390 pixels neither scrolls nor focuses the field, and that reduced motion runs no animation. It accepts `TEMPUS_APP_URL`.

The transparency journey checks the reference → selected date → arithmetic walkthrough and nested Debug calculation panel at 320/1280px. It covers “friday next week” versus “next friday”, date-only versus explicit midnight/now clock display, and verifies Debug is hidden when steps close. It compares every structured snapshot and the entire debug JSON with the engine, including exact local/UTC values, offsets, epoch milliseconds, warnings and reference. It verifies offsets do not split across display lines and keyboard users can focus and scroll long raw JSON lines. It also covers clamping, approximations, signed/subsecond elapsed time, the repeated autumn clock hour and range/recurrence callers. Debug copying covers an injected clipboard denial, real successful write/readback, cleared feedback after changing inputs and the correct payload for each panel. It also checks repeated Enter/Space disclosure toggles with normal and reduced motion, including the scoped trace/debug reveal and chevron timing. It saves walkthrough and debug screenshots. `TEMPUS_APP_URL` can target the local production preview.

The reminder journey enters `Call Sam December 31 and January 1, 2027 at noon`, selects 2026 and noon, downloads both events, then edits the input and verifies that clarification returns and export disappears. It records screenshots, downloaded files, file hashes, browser version and local TypeScript source hashes. Source hashes identify the checkout; they do not prove which code an unrelated server serves. Confirm the server belongs to this checkout.

Pass `--omitted-month` as the last browser-runner argument to exercise `Call Sam September 30 and October 2 and 4 at noon`: choose October, 2026 and both missing times, download three dates, then edit 4 to 5. Use another new output directory. The same reader validates that scenario’s three exact starts. The runner waits for focus to return to the question/result after each answer.

The Python reader requires a passing browser report, checks downloaded bytes against its hashes, then independently checks exact dates, event title and absence of invented endpoints/durations. Reader output goes to stdout; preserve it alongside the run. Initial dependency setup may access the package registry. No calendar client is opened.

The calculator runner checks written-order arithmetic, fractional-second output, actual clipboard readback of the value it just copied, visible calculation steps and strict API replay. It uses isolated browser contexts.

Both runners use direct focus and Enter at desktop viewport widths of 320 and 1280 pixels. They do not prove full Tab traversal, screen-reader behavior, physical phone use, cross-application paste or calendar-client import. The reminder runner retains per-width failures and exits nonzero if either fails. Existing output directories are refused; do not reuse or rewrite earlier evidence.

`verify-context-reset.mjs` accepts `TEMPUS_APP_URL` for an explicit loopback app (default `http://127.0.0.1:5174`); use `http://127.0.0.1:5175` with `pnpm build` followed by `pnpm preview --host 127.0.0.1 --port 5175` to check shipped assets. It uses the same Playwright/new-directory arguments to check timezone changes, invalid-zone recovery, reference refresh and export-title reset at both widths. It downloads the corrected UTC file before testing invalid-zone and refresh recovery. Run the same locked `read-reminder.py` on its output directory to verify exact dates and restored title. The initial UTC edit regression and verified fix are retained in `comparison/evidence/context-reset`.

`verify-date-range.mjs` uses the same Playwright/new-directory arguments to check relative start/end dates and numeric-date/DST correction through actual interval download and edit invalidation. Use `uv run --locked examples/app/read-date-range.py RUN-DIRECTORY` to independently verify all four files. Both endpoints are checked; no calendar client is opened.

`verify-worker-preparation.mjs` checks cold and previously used Workers without network access after the app has loaded, single-date copying/download, reconnection and edit invalidation at 320px and 1280px in Chromium, Firefox and WebKit. Chromium and Firefox use browser offline emulation; WebKit blocks HTTP(S) requests instead because its offline emulation also rejects standalone blob Workers. The runner also exercises developer-example Tab/arrow-key access, cancellation, retries, stale responses and unavailable Workers. Use `pnpm build` followed by `pnpm preview --host 127.0.0.1 --port 5175`, then set `TEMPUS_APP_URL=http://127.0.0.1:5175` when running it with the same Playwright/new-directory arguments. This verifies the production document CSP as well as the inline Worker bundle. Offline files are checked with ical.js in the runner; `read-worker-preparation.py` separately validates the lifecycle downloads. This does not establish offline startup or physical-device support.

`verify-panels.mjs` uses the same Playwright/new-directory arguments and `TEMPUS_APP_URL` override. It checks the approved, explicit `no plus` → `now plus` confirmation and context reset; exact debug and local clipboard payloads; zero API calls for local actions; real API comparison, stale response, mocked HTTP 429 and offline/retry recovery; and real all-day, range and five-occurrence ICS downloads. It checks 320/1280px reflow and saves panel screenshots. It uses Chrome with isolated contexts and synthetic inputs. This does not establish screen-reader behavior or calendar-client import.
