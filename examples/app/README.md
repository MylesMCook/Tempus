# Main-app journey checks

These runners exercise the locally served app. They do not start services, deploy, write calendars or test physical devices. Install repository dependencies from the lockfile and run `pnpm dev --host 127.0.0.1 --port 5174` in a task-local terminal. Keep it running during verification. The runners expect Chrome and an installed Playwright module; pass that module's entry path explicitly.

Use a new output directory for each run. The parent directory must exist. From the repository root:

```sh
node examples/app/verify-reminder.mjs /absolute/path/to/playwright-core/index.mjs /absolute/path/to/new-reminder-run
uv run --locked examples/app/read-reminder.py /absolute/path/to/new-reminder-run
node examples/app/verify-calculator.mjs /absolute/path/to/playwright-core/index.mjs /absolute/path/to/new-calculator-run
```

The reminder journey enters `Call Sam December 31 and January 1, 2027 at noon`, selects 2026 and noon, downloads both events, then edits the input and verifies that clarification returns and export disappears. It records screenshots, downloaded files, file hashes, browser version and local TypeScript source hashes. Source hashes identify the checkout; they do not prove which code an unrelated server serves. Confirm the server belongs to this checkout.

Pass `--omitted-month` as the last browser-runner argument to exercise `Call Sam September 30 and October 2 and 4 at noon`: choose October, 2026 and both missing times, download three dates, then edit 4 to 5. Use another new output directory. The same reader validates that scenario’s three exact starts. The runner waits for focus to return to the question/result after each answer.

The Python reader requires a passing browser report, checks downloaded bytes against its hashes, then independently checks exact dates, event title and absence of invented endpoints/durations. Reader output goes to stdout; preserve it alongside the run. Initial dependency setup may access the package registry. No calendar client is opened.

The calculator runner checks written-order arithmetic, fractional-second output, actual clipboard readback of the value it just copied, visible calculation steps and strict API replay. It uses isolated browser contexts.

Both runners use direct focus and Enter at desktop viewport widths of 320 and 1280 pixels. They do not prove full Tab traversal, screen-reader behavior, physical phone use, cross-application paste or calendar-client import. The reminder runner retains per-width failures and exits nonzero if either fails. Existing output directories are refused; do not reuse or rewrite earlier evidence.

`verify-context-reset.mjs` accepts `TEMPUS_APP_URL` for an explicit loopback app (default `http://127.0.0.1:5174`); use `http://127.0.0.1:5175` with `serve-built.mjs` to check shipped assets. It uses the same Playwright/new-directory arguments to check timezone changes, invalid-zone recovery, reference refresh and export-title reset at both widths. It downloads the corrected UTC file before testing invalid-zone and refresh recovery. Run the same locked `read-reminder.py` on its output directory to verify exact dates and restored title. The initial UTC edit regression and verified fix are retained in `comparison/evidence/context-reset`.

`verify-date-range.mjs` uses the same Playwright/new-directory arguments to check relative start/end dates and numeric-date/DST correction through actual interval download and edit invalidation. Use `uv run --locked examples/app/read-date-range.py RUN-DIRECTORY` to independently verify all four files. Both endpoints are checked; no calendar client is opened.

`verify-worker-preparation.mjs` checks cold and previously used Workers without network access after the app has loaded, single-date copying/download, reconnection and edit invalidation at 320px and 1280px in Chromium, Firefox and WebKit. Chromium and Firefox use browser offline emulation; WebKit blocks HTTP(S) requests instead because its offline emulation also rejects standalone blob Workers. The runner also exercises developer-example Tab/arrow-key access, cancellation, retries, stale responses and unavailable Workers. Use `pnpm build` followed by `pnpm preview --host 127.0.0.1 --port 5175`, then set `TEMPUS_APP_URL=http://127.0.0.1:5175` when running it with the same Playwright/new-directory arguments. This verifies the production document CSP as well as the inline Worker bundle. Offline files are checked with ical.js in the runner; `read-worker-preparation.py` separately validates the lifecycle downloads. This does not establish offline startup or physical-device support.
