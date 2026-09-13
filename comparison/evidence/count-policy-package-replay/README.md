# Current package replay

Archive `7fa6dd5769dc486a4de6e216984d99b57d1f7c97c64b193f94c6766e582c9d5e` matches the [current source snapshot](../count-policy-replay/README.md) on Node 22.12.0 and 26.8.1. All 31 inspected comparison inputs match both strict calculator and interpreter results; all 22 authored journeys match every recorded input, offered choice, resolved result, file hash and stale-edit outcome. The replay verifies every installed package file and the source snapshot manifest before executing. It imports the packed package, not workspace source.

This establishes consistency between two builds of Tempus. The inspected source results are not independent expected answers. The comparison remains a preview scorer; it does not score complete count/exclusion semantics, event text, exported rules or interactive gpu-time correction. The 22 journeys predate the newest count tasks; those have separate current [SDK and browser evidence](../count-policies-sdk/README.md). Do not merge these denominators into an accuracy figure.

The comparison/scorer/journey checks pass (13 tests). Locked Python icalendar 7.3.0 and recurring-ical-events 3.8.2 validate all 22 journey files and one fixed-offset diagnostic. The separate duration-rule diagnostic still reports `ruleConforms: false`; default reader success does not close that gate. There was no calendar-client import.

The registry observation at 2026-09-13T14:44:16Z still lists gpu-time 0.2.1, with the same pinned gitHead and package integrity. This network lookup is separate from local parsing. Refresh before freezing evaluation.

Reproduce the source snapshot using its README, then run:

```sh
node comparison/replay-packed.mjs VERIFIED-INSTALL SOURCE-SNAPSHOT NEW-report.json
```

Invoke the same runner with another installed supported Node executable to verify the same archive. Existing output files are refused. Run `uv run --locked --script comparison/calendar/second-reader.py` against the freshly generated source files for the second reader. `--require-rule-conformance` enforces the still-failing diagnostic gate. Task-owned runner lint passes. Historical reports remain intact.

Remaining work includes date-only/mixed-precision range journeys, broader conflict recovery, current-candidate performance, post-scan review, physical devices, authorized client imports and independent evaluation. No push, publication, deployment, cloud mutation or calendar write occurred.
