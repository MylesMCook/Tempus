# Excluded clocks and count slots

Current source resolves an excluded start that can fall on either side of the reference during a clock transition. After the user chooses to consume excluded count slots, it asks which start instant determines that slot. No duration or end is resolved for the excluded date, and no event is exported on it.

Eight desktop Chrome paths pass: earlier/later choices for the November 1 fold and March 8 gap, each at 320 and 1280 pixels. The earlier selected instant is before the fixed reference and leaves three future starts; the later instant consumes a slot and leaves two. The original input stays intact and count edits invalidate decisions/export state. Direct focus/Enter is tested; this is not full keyboard traversal, physical-device access or calendar import.

Python icalendar 7.3.0 and recurring-ical-events 3.8.2 independently read all eight actual downloads. The reader checks file hashes, fixed scenario identities, exact future starts over ten years, retained title and count-policy descriptions, and the absence of ongoing rules or invented durations. Neither excluded date appears as an event.

All 793 shared tests and the production build pass. Lint identified implicit Temporal date string coercion in the new question; it was changed to an explicit `toString()` after the browser run. This preserves the displayed question. The five focused tests were rerun after that cleanup. Browser hashes retain the bytes actually executed; the final source hash is recorded separately. Client bundle remains above the existing warning threshold at 907.17 kB minified / 267.00 kB gzip.

Reproduce with `node examples/app/verify-excluded-clock.mjs PLAYWRIGHT-ENTRY NEW-output-directory` against the main app on loopback port 5174, then `uv run examples/app/read-excluded-clock.py NEW-output-directory`. These are authored development cases, not an independent language evaluation.

Written past starts still require a separate count policy and remain unresolved, including a written start whose selected excluded clock is past. Current source is newer than packed archive `36928444`; a new archive and runtime verification remain necessary. Physical devices, actual calendar imports and independent evaluation remain open. No publication, deployment, cloud change or calendar write occurred.
