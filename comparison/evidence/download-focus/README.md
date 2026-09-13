# Clarification focus and download diagnostics

A delayed clarification-focus callback can take focus away from the next control. The parent already commits choices with `flushSync`; focusing the result immediately avoids that second focus move. Restart choices now uses the same synchronous behavior. Calendar calculations, safeguards and download generation are unchanged.

The controlled probe held animation-frame callbacks until after focus reached the export summary. Before the fix, both desktop widths moved focus back to the result; after the fix, both retained the export summary. `examples/app/verify-choice-focus.mjs` is the reusable regression check. It also asserts that clarification initially focuses its result.

The instrumented pre-fix journey run failed on quantity at 1280px while trying to focus the download button. No download-button click, Blob creation, anchor click or browser download occurred. The active element was the calculated result. This is consistent with the independently reproduced focus race; it does not establish the cause of every historical download timeout.

After the fix, twelve authored Chrome 153 journeys at widths 320 and 1280 passed. Each recorded a trusted download-button click, Blob creation, connected anchor click and one browser download. Separate readers accepted all twelve files. The ordinary journey runner uses direct focus and Enter, not a complete sequential-keyboard or unfamiliar-user study. Instrumentation delegates the native browser calls but remains test instrumentation.

Build, TypeScript and scoped lint passed. The existing large-chunk build warning remains. No SDK implementation changed: b8ffb7e0 remains the latest package, while measured performance still refers to 756fbb4e. No new performance claim follows from this UI repair.

## Reproduce locally

Build with `pnpm build`, then run the task-local `node examples/app/serve-built.mjs`. Pass an explicit installed Playwright entry and a new output path:

```sh
TEMPUS_APP_URL=http://127.0.0.1:5175 node examples/app/verify-choice-focus.mjs /absolute/playwright-core/index.mjs /new/focus.json
TEMPUS_APP_URL=http://127.0.0.1:5175 node examples/app/verify-event-identifiers.mjs /absolute/playwright-core/index.mjs /new/journeys
uv run --locked examples/app/read-event-identifiers.py /new/journeys
```

The reports retain exact executed runner snapshots; the current journey runner additionally hashes the two app sources. The controlled before/after scratch probe is retained as text. Hashes establish artifact integrity, not independent evaluation.

Rapid repeated-download behavior, earlier uninstrumented timeouts, actual calendar-client imports, physical phones, accessibility technology, current-package performance and independent task evaluation remain open. No calendars were written and nothing was pushed, published or deployed.
