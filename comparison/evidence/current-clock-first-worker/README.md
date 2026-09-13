# Current packed SDK in local workerd

Archive `b8ffb7e04e46eeaaf1e1dcf6c07875b2f805e2497dee50f03280ec0afd14e051` passes the expanded diagnostic in local workerd 1.20260911.1 through Wrangler 4.131.1. All 56 installed files match the archive; the copied diagnostic type-checks against installed declarations and scoped lint passes.

Diagnostic version 3 retains the previous sixteen-file cases and adds two recipient/clock-first reminders. Both preserve original input, event text and source spans; require every offered title/date/DST choice; reject premature export; resolve to the expected instant; and reject stale choices/export after changing Sam to Jo. Strict calculator grammar continues to reject those scheduling-only source forms.

Separate icalendar 7.3.0 and recurring-ical-events 3.8.2 readers accept eighteen files. The two new point files have the expected title and UTC instant, without an invented end, duration or recurrence. The updated reader also accepts the retained version-2 sixteen-file report. Existing expectations were preserved.

Reproduce with the packed Worker commands in `examples/sdk/README.md`. The diagnostic and reader snapshots, raw Worker response, readbacks and package provenance are retained here. No SDK source, dependencies, public API or performance implementation changed.

This verifies an authored local runtime integration. It is not deployed-Worker evidence, independent language evaluation or calendar-client import. The full fourteen-task offline browser suite still uses 4b96da77; physical-device and actual-import counts remain zero. The ongoing-duration conformance and rapid-download gaps remain open. Nothing was deployed or written to a calendar.
