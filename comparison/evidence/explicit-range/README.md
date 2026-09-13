# Explicit timed date ranges

September 13, 2026. The new source handles a complete `from DATE at TIME to/until DATE at TIME` reminder. Both endpoints use the original reference and timezone. Numeric-date ambiguity and DST ambiguity produce endpoint-specific choices. Original input, event title and source span are retained; the explicit end is exclusive and is never moved to manufacture a positive interval.

The relative-date task resolves September 13, 2026 noon Chicago to September 18 noon Chicago (17:00 UTC at both ends). The corrected task chooses November 1 for `11/01/2026`, then the second 1:30 AM occurrence (07:30 UTC), ending November 2 at noon Chicago (18:00 UTC). Chrome 153.0.8010.36 completes both tasks at 320/1280 px using direct focus/Enter, downloads each interval and verifies that invalid/changed input removes export. The locked Python reader independently confirms all four exact endpoints and event titles.

All 763 shared-source tests across 36 files and production build pass. Source tests cover unchanged calculator rejection of schedule grammar, retained spans, numeric-date/DST history, invalid dates, endpoint arithmetic, qualifiers and reversed/equal dates. The existing client bundle warning remains: 902.90 kB / 265.89 kB gzip. Date-only and mixed-precision endpoints remain explicitly unsupported; no clock or inclusive end is assumed.

[Reproduction](../../../examples/app/README.md) uses the repository browser runner and locked reader with a new output directory. Source and runner hashes are retained in provenance.json. Desktop viewport checks and file reading do not establish physical-device behavior, full keyboard traversal, actual calendar-client import or independent language evaluation.

The SDK archive 8d0c2791 and 21-task comparison snapshot predate this source change. New packed runtime and replay verification remain required. No publication, deployment, external calendar write or competitive claim occurred.
