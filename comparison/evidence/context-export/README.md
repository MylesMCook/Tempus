# Corrected timezone through usable file

September 13, 2026. This extends the [timezone-edit fix evidence](../context-reset/README.md) from preview/reset checks to actual corrected downloads. Chrome 153.0.8010.36 passes at 320/1280 px using direct focus/Enter. The journey resolves the reminder in Chicago, changes to UTC, answers the clarification again, verifies the reset export title and downloads the complete file. Invalid-zone and refresh recovery still remove export access afterward.

Both independently read files contain September 30, October 2 and October 4, 2026 at 12:00 UTC. The old Chicago interpretation would have used 17:00 UTC. All events retain `Call Sam`; the previous custom title does not survive. No end or duration is invented. File hashes match the browser report. The updated reader also passes both prior named-date reminder scenarios; those are historical files, not fresh browser runs.

The runner passes formatting/lint/types without warnings. Application and SDK code did not change in this follow-up. Use `examples/app/verify-context-reset.mjs` against the local app, followed by the locked `examples/app/read-reminder.py` on the new output directory. The runner refuses existing output directories; reader checks are limited to its named authored scenarios.

This is desktop download and file-reading evidence, not physical-device testing, screen-reader verification, actual calendar-client import or independent evaluation. The known ongoing recurrence compatibility and release gates remain open. No publication, deployment or calendar write occurred.
