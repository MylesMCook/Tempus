# Written-order list journey

The existing implementation preserves written order for an out-of-order list through DST clarification, preview, copy and serialized calendar events. No app or SDK implementation changed.

Authored input: `Call Sam 2026-11-01 at 1:30am and 2026-09-30 at noon`, America/Chicago, reference September 12, 2026. Choosing the second 1:30 AM gives November 1 at 07:30 UTC, followed by September 30 at 17:00 UTC. Editing Sam to Jo clears the answer and removes copy/export until the ambiguity is resolved again.

Desktop Chrome at 320 and 1280 pixels passed the input, rendered-order, real clipboard write/read, download, edit invalidation and overflow checks. The pinned Python icalendar reader checks both file values and VEVENT order without sorting. These are two authored desktop runs, not phone, accessibility, independent-user or calendar-client import evidence. Calendar clients may choose a different display order.

Reproduce with `examples/app/serve-built.mjs`, `examples/app/verify-list-order.mjs PLAYWRIGHT_ENTRY NEW_OUTPUT`, then `uv run --locked examples/app/read-list-order.py OUTPUT`. The server serves the existing build and shipped headers on loopback. No calendar was written.

The first browser check failed because its selector also counted ordered lists inside calculation traces. `selector-failure.json` retains that harness failure; the corrected selector scopes rows to the result status. The historical preview comparator still sorts occurrence values and cannot establish this order property.

The installed SDK remains archive `a7f9e298c3c3152e0cddc7e439819ed0aba83a2471e81adc78a646e9737ca21b`. Its source spans were separately checked against slices of the original input; see `sdk.json` and the retained probe.
