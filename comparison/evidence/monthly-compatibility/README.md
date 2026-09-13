# Monthly export compatibility evidence

These are diagnostic files, not enabled app exports. The single-series candidates retain known reader failures. The two-series candidate preserves the tested dates but creates two separately editable calendar series; the product decision about offering it remains pending. No calendar-client import or calendar write occurred.

| Candidate                                | ical.js 2.2.1                | icalendar 7.3.0 / recurring-ical-events 3.8.2 | Scope                                                                                      |
| ---------------------------------------- | ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Day 29/30, BYSETPOS                      | Both fail: extra March dates | Both pass                                     | UTC points, 2026–2425                                                                      |
| Day 29/30, RSCALE/SKIP                   | Both fail: February missing  | Both fail: reader exception                   | UTC points, 2026–2425                                                                      |
| Last day of each month control           | Pass                         | Pass                                          | 4,800 UTC points                                                                           |
| Separate February and other-month series | Four files pass              | Four files pass                               | Days 29/30 × UTC/Chicago; 4,798 noon occurrences each, two exclusions, 30-minute durations |

The two suites test different representations and scopes. Their pass counts are not an accuracy ranking or proof of general interoperability. Arbitrary start dates/clocks, actual client imports and editing/deletion remain unverified. The app's ongoing day-29/30 clamp block remains in place.

## Inspect the files

- [Single-series first reader](single-series/ical-js.json) and [second reader](single-series/python.json) preserve all five cases, including the first observed mismatches and reader exceptions.
- [Two-series first reader](two-series/ical-js.json) and [second reader](two-series/python.json) preserve all four cases.
- Each directory includes the `.ics` files and `.expected.json` date arrays used for the independent reader check. Expected values are authored diagnostic expectations, not independently collected holdouts.
- [Provenance](provenance.json) records source/dependency-lock hashes and process exit codes. A fresh local rerun produced the same nine `.ics` byte sequences as the earlier retained artifacts. JSON whitespace was normalized before freezing this snapshot; decoded report values and expected arrays are unchanged.

## Verify retained bytes

From this directory:

```sh
shasum -a 256 -c SHA256SUMS
```

The checksums detect changes relative to this manifest. They are not signatures, independent expected answers or proof of current-source equivalence.

## Reproduce from the repository root

Install the locked project dependencies and build the SDK first:

```sh
pnpm install --frozen-lockfile
pnpm build:sdk
```

Use new scratch directories; do not overwrite the frozen evidence. Both single-series commands are expected to exit **1** while the recorded incompatibilities remain:

```sh
node comparison/calendar/monthly-clamp.mjs /absolute/NEW-single-series
uv run --locked comparison/calendar/monthly-clamp.py /absolute/NEW-single-series
```

Run the two-series candidate separately; both commands are expected to exit **0** for this recorded scope:

```sh
node comparison/calendar/monthly-split.mjs /absolute/NEW-two-series
uv run --locked comparison/calendar/monthly-split.py /absolute/NEW-two-series
```

Compare raw outputs and file hashes. Do not change expectations to force the first suite to pass. These commands generate/read local files; they never contact or write a calendar account. A future dependency or timezone change may change results and must be recorded as a new snapshot.
