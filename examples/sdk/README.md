# Run the package examples

Run `pnpm install --frozen-lockfile` and `pnpm build:sdk` at the repository root. The workspace links the example to the package. For release verification, copy this example outside the workspace and install the packed tarball instead of the workspace dependency.

From this directory, `node node.mjs` runs the Node assertions.

`node state.mjs` checks a reminder through numeric-date and repeated-clock correction, then file preparation. It verifies that changed event text, duration, timezone or reference invalidates the answers; batch items cannot borrow another input's answers; and a reusable parser captures nested options independently of caller mutations. It writes no files or calendars. Run it against the copied packed installation for release evidence.

From the repository root:

```sh
pnpm exec vp dev --config examples/sdk/vite.config.mjs
pnpm exec wrangler dev --config examples/sdk/wrangler.jsonc --local --ip 127.0.0.1 --port 8788
```

The browser example offers clarification buttons and displays the full structured result. The Worker example returns a fixed weekly schedule. Neither creates reminders or writes calendars. These are local development commands; do not deploy the demonstration Worker.

## Verify a packed artifact

After building, run `pnpm pack` in `packages/core`. Copy the example files to a clean directory outside the workspace. Replace its package manifest with a private ESM manifest whose `@tempus-date/core` dependency points to the absolute tarball path, then install with scripts disabled. Run `node node.mjs` there.

From the repository root, use the copied config paths with the two development commands above. Type-check the copied `browser.ts` and `worker.ts` with `pnpm exec tsc --noEmit --strict --module NodeNext --moduleResolution NodeNext --target ES2023 --lib ES2023,DOM` followed by both absolute file paths. This checks installed declarations without a source alias.

In the browser, enter `03/04/2027 at noon`, select April 3 using the keyboard, and check that the original input remains. Editing it must restore the clarification. `Sat Sun 1pm-8pm Mon 10pm-12am` must return all three intervals; `invalid text` must remove the old result. The Worker endpoint must return three weekly ranges with complete endpoints.

For the repeated-clock group journey, configure the copied browser consumer's reference as `2026-10-31T12:00:00Z` and update its explanatory label. Keep the installed package unchanged. Enter `Remind me to call Sam Sun 1:15am-1:45am Mon 9am-10am` and choose the second start and second end by keyboard. Expect November 1 at 07:15–07:45Z and November 2 at 15:00–16:00Z, with `call Sam` retained. Editing 1:15 to 1:20 must restore the start question. With the same context, `Remind me to call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08` must resolve to November 1 and 8 at 07:30–08:00Z after choosing the second clock.

These checks establish integration behavior, not language accuracy or device performance.

## Calendar integration

The optional `@tempus-date/core/calendar` entry point reuses the app's file preparation. Run `node calendar.mjs` against the installed archive to check a complete recurrence correction and file result. It does not write a file or calendar.

Serve `calendar.html` with the same local development setup for a keyboard-usable correction/download example. It displays the event title, timezone, dates and complete file count, with raw interpretation/export-plan JSON in an optional disclosure. It disables unresolved download, clears decisions after edits and offers restart. Only the Download button creates a local file; calendar import is a separate action. Its fixed reference is intentional. Real integrations must clear choices whenever their reference or timezone changes too.

## Reproduce the Node package verification

After installing the locked project dependencies, run from the repository root:

```sh
node examples/sdk/verify-package.mjs /absolute/NEW-scratch-directory
```

Use a new directory outside the repository; its parent must already exist. The runner builds and packs the SDK locally, installs the archive offline with lifecycle scripts disabled, compares every installed package file with the archive, runs all seven Node integration examples, and type-checks the copied browser/calendar/Worker consumers against installed declarations. It retains the archive, installation, copied examples and `verification.json` for inspection. Existing evidence directories are refused.

The integration examples run with the Node executable used to invoke the runner. To check the same installed archive on another supported Node version, invoke `examples/sdk/verify-installed-node.mjs VERIFIED-INSTALL NEW-report.json` with that already-installed executable. It verifies installed file and copied example hashes before running the recorded examples without repacking (seven for the current archive; six for older archives). Node 22.12.0 and 26.8.1 have been verified on macOS; the build/install steps use the `pnpm` available on PATH, whose version is recorded separately. `pnpm` and `tar` are required. An empty package cache must first be populated by the normal locked project install; the verification install itself remains offline.

A failed check exits nonzero and retains a failed report. No server, browser, calendar account, publication or deployment is started. Type-checking a Worker consumer is not Worker runtime verification. The [retained Node reports](../../comparison/evidence/packed-node/README.md) preserve the exact archive and example hashes; browser/Worker execution and calendar-client imports remain separate checks.

## Reproduce the packed Worker check

First run the package verifier above into a new scratch directory. Copy the diagnostic into that installation so module resolution uses the packed SDK. Running the configuration directly in this repository would instead test the workspace.

```sh
cp examples/sdk/verification-worker.ts examples/sdk/wrangler.verify.jsonc /absolute/NEW-scratch-directory/
pnpm exec tsc --noEmit --strict --module NodeNext --moduleResolution NodeNext --target ES2023 --lib ES2023,DOM /absolute/NEW-scratch-directory/verification-worker.ts
pnpm exec wrangler dev --config /absolute/NEW-scratch-directory/wrangler.verify.jsonc --local --ip 127.0.0.1 --port 8788
```

With that task-local server running, use another terminal at the repository root:

```sh
curl --fail --silent http://127.0.0.1:8788/verify -o /absolute/NEW-scratch-directory/worker-result.json
uv run --locked examples/sdk/read-worker-files.py /absolute/NEW-scratch-directory/worker-result.json
```

The reader exits nonzero on a failed diagnostic or mismatched file. The Worker returns HTTP 500 when an assertion fails; other routes and methods return 404. Stop the local server with `x` after checking. Do not deploy this diagnostic.

Diagnostic version 3 verifies failure recovery, quantity and recipient/clock-first clarification, meaningful edit invalidation, and eighteen complete calendar files covering weekly, monthly, count, range and date-list cases. The reader also accepts historical version-1 fifteen-file and version-2 sixteen-file outputs without attributing new checks to them. They accept no user input, make no external requests and write no calendars. The Python reader needs the pinned dependencies available to uv. [Retained Worker reports](../../comparison/evidence/packed-worker/README.md) distinguish local runtime execution and file expansion from actual calendar-client import.

## Verify the built browser example

Use the static example when checking startup and release behavior. It bundles the installed SDK into one browser module and serves only the example HTML and JavaScript on loopback. It has no hot reload. The development-server workflow below remains useful while editing.

```sh
cp examples/sdk/calendar.html examples/sdk/vite.config.mjs /absolute/PACKED-INSTALL/
node examples/sdk/serve-packed.mjs /absolute/PACKED-INSTALL /absolute/NEW-BUILD
```

With that process running, use another terminal:

```sh
node examples/sdk/verify-startup.mjs /absolute/NEW-BUILD /absolute/NEW-STARTUP-REPORT /absolute/playwright-core/index.mjs
node examples/sdk/verify-browser.mjs /absolute/PACKED-INSTALL /absolute/NEW-JOURNEY-REPORT /absolute/playwright-core/index.mjs --webkit-option-tab
uv run --locked examples/sdk/read-browser-files.py /absolute/NEW-JOURNEY-REPORT
```

Stop the static server with Ctrl-C afterward. Port 5184 must be free; do not run the development and static servers together. The build and report directories must be new. The startup probe holds module delivery, enters an invoice reminder before initialization, then verifies date/DST correction and edit invalidation in three fresh contexts per browser. It checks the served bundle against the recorded build hash. It does not measure startup latency or download/import files. The separate journey runner checks keyboard paths and actual downloads, and the Python reader checks file contents.

Add `--quantity-title` to `verify-startup.mjs` to exercise the confirmed quantity-title → numeric-date → repeated-clock path on a supporting current archive. The default remains the numeric-identifier path used by older archives.

A prior development-server run read an empty result near a logged reload. The cause remains unconfirmed. Static serving removes hot reload from the verification path; it does not retrospectively explain that failure or establish phone behavior.

## Verify tasks after disconnecting

With the static packed example running, use a new output directory:

```sh
node examples/sdk/verify-browser.mjs /absolute/PACKED-INSTALL /absolute/NEW-OFFLINE-REPORT /absolute/playwright-core/index.mjs --webkit-option-tab --offline-after-load
uv run --locked examples/sdk/read-browser-files.py /absolute/NEW-OFFLINE-REPORT
```

The runner loads the example, disables networking in that browser context, and requires a control fetch to fail. It then runs the complete existing keyboard, correction, edit-invalidation and file-download checks. Any further network request fails the offline check. The separate reader also checks the offline control record before validating file contents.

This tests the already-loaded SDK. It does not establish offline website cold start, browser caching or service-worker behavior, phone download handling, or actual calendar import. The server and computer remain online; only the disposable test browser context is disconnected.

## Reproduce the packed browser journeys

Use the packed installation created by the Node runner. Copy the HTML and local server config into it; `calendar-browser.ts` is already copied and type-checked by that runner.

```sh
cp examples/sdk/calendar.html examples/sdk/vite.config.mjs /absolute/PACKED-INSTALL/
pnpm exec vp dev --config /absolute/PACKED-INSTALL/vite.config.mjs --strictPort
```

From another terminal at the repository root, with Playwright and its browser binaries already installed:

```sh
node examples/sdk/verify-browser.mjs /absolute/PACKED-INSTALL /absolute/NEW-OUTPUT /absolute/playwright-core/index.mjs
uv run --locked examples/sdk/read-browser-files.py /absolute/NEW-OUTPUT
```

The browser runner uses installed Google Chrome plus Playwright Firefox and WebKit, with no automatic installation. It requires the loopback example at port 5184 and a new output directory whose parent exists. It checks installed package hashes and copied example source, saves a report even when a browser assertion fails, and retains downloads and screenshots. Missing browser access fails the run; it is not silently skipped. The Python reader verifies all six runs and 84 files, exiting nonzero on missing or incorrect evidence.

Stop the task-local server with Ctrl-C afterward. Nothing deploys or imports into a calendar. The current runner uses Tab/Shift-Tab to reach controls and Enter to activate them; it performs no direct focus jumps. The retained ordinary-Tab report fails both WebKit widths because Tab skips the clarification buttons in the tested configuration. Chrome/Firefox pass; the strict reader refuses the incomplete report. Screen readers and physical devices remain unverified. [Current keyboard failure and focus traces](../../comparison/evidence/packed-keyboard/README.md); [historical direct-focus reports and independent readback](../../comparison/evidence/packed-browser/README.md).

### WebKit navigation mode

The default ordinary-Tab run retains the WebKit failure described above. To exercise the documented Option-Tab path without changing machine preferences, use a separate new output directory:

```sh
node examples/sdk/verify-browser.mjs /absolute/PACKED-INSTALL /absolute/NEW-OPTION-OUTPUT /absolute/playwright-core/index.mjs --webkit-option-tab
uv run --locked examples/sdk/read-browser-files.py /absolute/NEW-OPTION-OUTPUT
node examples/sdk/verify-webkit-controls.mjs /absolute/playwright-core/index.mjs /absolute/NEW-CONTROL-REPORT.json
```

The final command records Tab versus Option-Tab on an isolated native input/button/link form without a server or Tempus code. It refuses an existing report. It records observations, not an assumed pass/fail policy. The historical two-file journey passed all six runs with this explicit WebKit mode; its twelve downloads passed independent readback. [Evidence, Apple reference and limits](../../comparison/evidence/packed-option-tab/README.md). Actual Safari settings and behavior remain unverified.

`counts.mjs` exercises a finite count beyond the preview, monthly policy choice and count edit invalidation, a DST answer needed beyond the preview, five completed past-start/exclusion policy cases, and unresolved batch controls. Answers are authored integration fixtures; a real host must present them to its user. The example writes no files or calendars.

The expanded runner covers fourteen downloads per browser/width, including both past-start count policies, both exclusion policies, all-day range end choices and mixed-range date/time/DST correction. It spaces downloads by 1.1 seconds; this is a correctness check, not a throughput measurement. The unpaced eleven-download run timed out on Chrome’s eleventh file at both widths. Retained failures and current candidate results are in the [current range-policy SDK record](../../comparison/evidence/range-policies-sdk/README.md).

## Consumer type contract

The package verifier also compiles `contract.ts` against the installed public entries. This compile-only fixture checks resolved-value narrowing, optional clarification prompts, export-plan/file failure handling and required context. Expected compiler errors protect these boundaries from accidental declaration widening; the fixture is never executed or included in the package. It does not replace runtime checks or establish cross-version compatibility.
