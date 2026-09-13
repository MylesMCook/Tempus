# Focused export-boundary review

September 13, 2026. No stale-file bypass was confirmed in the reviewed app/SDK path. This is a focused source and lifecycle review, not a completed Codex Security scan, exhaustive diff audit or deployed-security certification. The earlier formal scan still predates these changes.

## Source conclusions

The export component remounts when input, reference, timezone or interpretation changes. Recurring preparation memoizes the complete request; completed responses are exposed only when their initiating request is still the current object. Cleanup cancels delivery and terminates the worker. Title edits invalidate the ready file immediately while debouncing the next preparation. Worker failure does not enable download or reuse an earlier file.

Recurring file preparation reconstructs the complete export plan from the interpretation's source and the supplied context/decisions; the internal combined review entry does not accept a caller-supplied prepared plan. Unresolved interpretations, incomplete clock choices and blocked ongoing policies do not produce a file. Single/collection preparation checks metadata, escapes calendar text and folds UTF-8 lines. These observations do not independently validate every timezone rule or possible calendar-client interpretation.

SDK options and selection history are copied into parser context; the SDK has no user session, authentication or external-action authority. Results remain ordinary JavaScript values. A host must retain current input/context, clear stale answers and authorize any external write itself. The strict API v2 builder remains separate from scheduling/export. Its deployed infrastructure was not checked.

A possible year-boundary concern was not established: the two retained ordinary arithmetic requests at years 1 and 9999 were unresolved before export. This is limited negative evidence, not an exhaustive calendar-boundary proof.

## Current built-app evidence

Three desktop runs pass in Chrome 153.0.8010.36, Playwright Firefox 148.0.2 and WebKit 26.4 at 320 px. The existing harness delays actual worker messages and simulates unavailable Worker construction. It verifies cancellation, retry, title/input edits while an old response is queued, failure recovery, restarting a cancelled clock choice and worker termination on close.

Nine downloaded files pass separate icalendar 7.3.0 and recurring-ical-events 3.8.2 readers. Checks cover current titles, complete event counts, recurrence identities and daily starts. The reader lacks an independently captured reference-time oracle and does not import into a calendar. Input activation uses direct focus and Enter; this is not a sequential-Tab or physical-device result.

The app was served from dist/client with public/_headers using the task-local static server on loopback 5175. Source and built-asset hashes identify the inspected state. No production API was emulated or deployed. The server was stopped afterward; the existing app on 5174 remains running.

## Documentation correction and remaining work

The calendar guide incorrectly said no SDK export API existed. The private candidate does expose file-preparation functions; it does not publish a package or write calendars. The guide now states this and documents the host's current-input and authorization responsibilities. No parser, exporter or application code changed during this review.

Full post-scan source coverage, dependency/provenance review, deployed Cloudflare/account settings, third-party integration authorization, physical devices and real calendar imports remain open. review.json states the narrow coverage; filenames in source-hashes.json identify supporting material and must not be read as a full-file audit claim. Historical browser failures and ongoing recurrence policy gaps remain unchanged.

Reproduce the runtime checks with `examples/app/serve-built.mjs`, then set `TEMPUS_APP_URL=http://127.0.0.1:5175` for `examples/app/verify-worker-preparation.mjs`, followed by its separate Python reader. Use new output directories and stop the task-local server afterward. The [release checklist](../../../docs/release-checklist.md) retains the broader gates.
