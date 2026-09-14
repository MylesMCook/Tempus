# Compare parsers locally

| Path                                                        | What it is                           |
| ----------------------------------------------------------- | ------------------------------------ |
| This folder                                                 | Parser comparison tests and scoring  |
| [results/](results/report.md)                               | Generated local reports (gitignored) |
| [evidence/](evidence/README.md)                             | Retained hashes and review snapshots |
| [calendar/](calendar/README.md)                             | Calendar-file comparison helpers     |
| [performance/](performance/README.md)                       | Bundle and CPU measurements          |
| [independent-evaluation/](independent-evaluation/README.md) | Holdout study handoff                |

```sh
pnpm install --frozen-lockfile
pnpm compare
```

Open [the generated report](results/report.md). [report.json](results/report.json) includes every input, expected result, rationale, context, diagnostic and raw response. Working reports are generated locally and ignored by Git. A [retained review snapshot](evidence/README.md) preserves current development results and journey files outside that ignored directory, with source/file hashes and verification commands.

Both parsers run in the same Node process, without HTTP requests or a GPU. gpu-time 0.2.1 is pinned in the development dependencies and lockfile; it is not imported by the app. The tests also run under `pnpm test` in CI.

The report keeps three entries: `tempus` is the strict v2 evaluator, `interpretation` is the app's sentence recognizer, and `gpu` is gpu-time. Current corpus `development-v4-precision` has 31 inspected cases. The original eleven date/arithmetic cases remain protected. Historical counts below describe their named corpus versions, not the current denominator.

The [current package replay](evidence/count-quantity-validation/README.md) verifies that the installed SDK matches the 31-case/25-journey source snapshot on Node 26. Earlier Node 22/26 reports retain their own corpus identities. This is consistency evidence, not independent accuracy evaluation.

The [scripted journey report](results/journeys.md) covers 25 correction-to-file tasks through the source SDK. It checks retained input and event text, exact endpoints, date-only precision, independent file expansion and invalidation after an edit. [Raw results](results/journeys.json) and `results/journey-files/` preserve the outputs for the separate [second-reader check](../docs/archive/calendar-export.md#second-reader-verification). Every stage must pass; rejection or an unanswered question does not complete a task. These inspected integration checks do not measure human completion, browser interaction, calendar-client import or comparative performance.

The value grade in development-v4 adds authored date-only/timed expectations to the same 31 inputs. It preserves every legacy timestamp grade and reports per-family value counts separately. A missing precision field is `not-exposed`, not a match inferred from midnight; an absent gold label is `not-specified`. Strict v2 intentionally returns calculator timestamps rather than all-day semantics, so its 11 matching calculations are not newly incorrect. On these cases, all 21 timestamp-matching interpreter results and 14 timestamp-matching gpu-time results also match precision. This adds a guard against misleading scores, not a new competitive win. The prior report is retained under `results/history/development-v3-before-precision/`.

## Current release check

On September 13, 2026 (Chicago), the [npm registry](https://registry.npmjs.org/gpu-time) still lists 0.2.1 as `latest`, published September 12 at 17:20:39 UTC, package gitHead `aba27e54aabe7310cba5c160fa2079045096ffb1`. The installed dependency stays pinned at 0.2.1; no upgrade was needed. [upstream-release.json](upstream-release.json) records the timestamp, registry URL and package integrity. Refresh this record again before final claims; it is a dated observation, not a live assertion. The earlier README/model-card source link below points to an earlier inspected source commit, not the package gitHead.

## What the score means

| Grade             | Meaning                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Correct           | The preview timestamps and recurring/non-recurring classification match the expectation. |
| Correct rejection | An invalid or non-scheduling input produced no occurrence or rule.                       |
| Abstained         | A valid or ambiguous input produced no result. This is not a completed task.             |
| Incorrect         | A returned result disagrees with the expectation, even if it includes a warning.         |
| Error             | The package threw instead of returning its normal result or diagnostic.                  |

All cases stay in their family's denominator. There is no combined accuracy ranking. The scorer compares exact instants, range endpoints and result counts; a point matching one endpoint of a range is not a match. It preserves sub-millisecond differences and rejects malformed instants. Result ordering does not affect the score; duplicate or extra occurrences do.

Recurrence checks cover only the next three occurrences and whether the API returns a rule. They do **not** validate the exported rule, truncation, exceptions or behavior beyond that preview. A separate value grade additionally compares explicit all-day flags; it still does not establish complete semantic fidelity. Both preview grades compare sorted occurrence values, retaining duplicates but ignoring order. They cannot verify source-order preservation or chronological ordering. Generated JSON records these checked and unchecked dimensions in `metadata.scoringCoverage`. The comparative scorer does not run an interactive clarification flow. The separate Tempus-only scripted report does not change its grades. An ambiguity rejection remains an abstention, not a recovery success.

## Corpus and policies

[fixtures.ts](fixtures.ts) contains 31 development cases with manually specified expectations and calendar rationale. They include the earlier comparison examples, gpu-time's published schedule example and documented duration regression, and newly authored variations. They have been inspected during development and are **not an untouched holdout**. No user data is included.

The starting instant is September 12, 2026 at 11:00 in Chicago, except the two spring DST cases. Timezone and reference are explicit in every recorded result. Month arithmetic follows Tempus's documented stepwise clamping. All-day intervals use an exclusive end. Ambiguous numeric dates and repeated local times require clarification. A cancelled scheduling instruction must not create an event. These are declared product policies; a competing parser's different policy is not automatically a bug.

The record includes runtime, pinned package version, Git revision, dirty state, fixture hash, runner/scorer hashes, all shared implementation source hashes (including pinned timezone data and its license), and package/lockfile hashes. This source snapshot does not hash every installed runtime dependency. The scorer uses Temporal only to validate and normalize instants; expected calendar answers are written independently of both parsers.

## Historical 0.2.0 development baseline

| Family     | Cases | Tempus correct results | gpu-time correct results |
| ---------- | ----: | ---------------------: | -----------------------: |
| Dates      |     6 |                      6 |                        6 |
| Arithmetic |     5 |                      5 |                        0 |
| Sentences  |     4 |                      0 |                        3 |
| Schedules  |     5 |                      0 |                        4 |

On six recovery cases, Tempus rejects four invalid/non-scheduling inputs and abstains on two ambiguities. gpu-time rejects three and returns three results that conflict with the stated policies. The JSON distinguishes diagnostics and returned values. These selected counts describe this corpus, not general language accuracy.

## Add a case

1. Write its intended meaning, fixed context and independently checked expected result.
2. Add it to `fixtures.ts` with a unique ID and rationale. Set `preserve` only for a verified Tempus capability that must remain correct.
3. Run `pnpm compare` and inspect both raw results. Keep mismatches visible; do not change an expectation just to match a parser.

The harness fails on scoring regressions, lost protected Tempus cases or gpu-time runtime exceptions. Known capability gaps remain report entries so the baseline can run before those features exist.

The 0.2.1 refresh preserves the correct-result counts above: dates 6/6, arithmetic 0/5, sentences 3/4 and schedules 4/5. One arithmetic case changed from an incorrect answer to abstention. The duration case still returned the same incorrect point under our fixed context; the upstream fix claim was not reproduced here. Raw historical runs are retained locally in `results/history/gpu-time-0.2.0/` and `results/history/gpu-time-0.2.1-development-v1/`.

Corpus `development-v2` changes the correction fixture from an automatically selected Saturday to clarification, matching the [schedule contract](../docs/schedule-contract.md). Both engines still abstain, so grades are unchanged; this is a declared policy correction, not a measured parser improvement. The original corpus and outputs remain in the archived reports.

The [desktop CPU performance pilot](performance/README.md) measures a shared supported subset separately from correctness scoring. Browser/phone performance, calendar-export validation, real-user completion and an independently evaluated holdout remain open; see the [product matrix](../docs/product-matrix.md).

Sources: [gpu-time release](https://github.com/arikchakma/gpu-time/blob/bbd7611c1f58c451d3caeed27e5d51ffc473d0e2/README.md), [model card](https://github.com/arikchakma/gpu-time/blob/bbd7611c1f58c451d3caeed27e5d51ffc473d0e2/MODEL_CARD.md). Source and model weights retain gpu-time's MIT license; they are installed through the package manager rather than copied into our source.

## Development-v3 refresh

Five inspected development cases were added after implementation work: a suffix-duration reminder, bounded repeating duration with exclusion, ambiguous calendar-duration end, matching-clock group and unfinished duration. Existing expectations were not changed. The 26-case development-v2 report and fixture source are preserved locally in `results/history/development-v2-before-duration-cases/`. Do not compare aggregate counts across the two corpus sizes as if they measured improvement.

On these additions, both parsers return the complete simple duration reminder. Tempus returns the bounded recurrence/exclusion; installed gpu-time 0.2.1 abstains. Both abstain on matching-clock groups. gpu-time selects the earlier ambiguous calendar-duration endpoint (a disagreement with our explicit-choice policy) and drops the unfinished `for` qualifier to return a point (an incomplete result under the corpus contract). Tempus asks for the endpoint choice and rejects the unfinished duration. The scorer counts unresolved ambiguity as abstention; it does not score a completed correction task.

All 31 current inputs and raw results remain in the generated report. The cases were chosen from recent Tempus work and are biased development coverage, not an untouched evaluation or general accuracy estimate. The installed gpu-time version was measured; no latest-release claim was revalidated in this run.

## Independent evaluation handoff

The [draft protocol](evaluation/protocol.md) separates library output, completed user tasks, file/client validation and runtime cost. The [status record](evaluation/status.json) is not frozen: an independent development pilot, evaluator/custodian, sample design, error tolerances, reviewed analysis and designated devices are missing. Current fixtures and scripted journeys remain inspected development evidence. The preview scorer now offers a separate all-day-flag check, but does not implement the protocol's full semantic contract; do not reuse its grades as independent task-completion or superiority evidence.

## Count and quantity journey refresh

Three authored tasks extend the journey corpus from 22 to 25; the direct 31-input comparison and protected expectations are unchanged. Quantity/title/date/DST confirmation and both count-exclusion choices now reach complete file output, then reject stale answers after meaningful edits. [Evidence and remaining gaps](evidence/count-quantity-validation/README.md) retain the earlier reports and the known ongoing-duration reader failure. These are Tempus-only tasks, not comparative count-policy or user-study results.

### Source snapshots without Git

Comparison reports retain source and lockfile hashes when `.git` is absent. Commit and dirty-state fields are then `null`, with `gitMetadataStatus: "absent"`; they do not describe a clean checkout or borrow a parent repository identity. Broken existing Git metadata remains an error. [Isolated-build evidence](evidence/isolated-source-build/README.md) records a same-host offline install, matching artifacts and the original Git-dependent failure.
