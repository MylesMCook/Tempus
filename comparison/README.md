# Compare parsers locally

```sh
pnpm install --frozen-lockfile
pnpm compare
```

Open [the generated report](results/report.md). [report.json](results/report.json) includes every input, expected result, rationale, context, diagnostic and raw response. Reports are generated locally and ignored by Git.

Both parsers run in the same Node process, without HTTP requests or a GPU. gpu-time 0.2.0 is pinned in the development dependencies and lockfile; it is not imported by the app. The tests also run under `pnpm test` in CI.

The report now keeps three entries: `tempus` is the unchanged strict v2 evaluator, `interpretation` is the browser's bounded sentence recognizer, and `gpu` is gpu-time. On the unchanged four sentence fixtures, interpretation resolves three and abstains on the correction. It preserves the eleven protected date/arithmetic cases and still abstains on all five schedule fixtures. This improvement on inspected templates does not establish general sentence accuracy.

## What the score means

| Grade             | Meaning                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Correct           | The complete occurrence preview and recurring/non-recurring classification match the expectation. |
| Correct rejection | An invalid or non-scheduling input produced no occurrence or rule.                                |
| Abstained         | A valid or ambiguous input produced no result. This is not a completed task.                      |
| Incorrect         | A returned result disagrees with the expectation, even if it includes a warning.                  |
| Error             | The package threw instead of returning its normal result or diagnostic.                           |

All cases stay in their family's denominator. There is no combined accuracy ranking. The scorer compares exact instants, range endpoints and result counts; a point matching one endpoint of a range is not a match. It preserves sub-millisecond differences and rejects malformed instants. Result ordering does not affect the score; duplicate or extra occurrences do.

Recurrence checks cover only the next three occurrences and whether the API returns a rule. They do **not** validate the exported rule, all-day flags, truncation, exceptions or behavior beyond that preview. Neither backend currently implements an interactive clarification flow in this harness. An ambiguity rejection remains an abstention, not a recovery success.

## Corpus and policies

[fixtures.ts](fixtures.ts) contains 26 development cases with manually specified expectations and calendar rationale. They include the earlier comparison examples, gpu-time's published schedule example and documented duration regression, and newly authored variations. They have been inspected during development and are **not an untouched holdout**. No user data is included.

The starting instant is September 12, 2026 at 11:00 in Chicago, except the two spring DST cases. Timezone and reference are explicit in every recorded result. Month arithmetic follows Tempus's documented stepwise clamping. All-day intervals use an exclusive end. Ambiguous numeric dates and repeated local times require clarification. A cancelled scheduling instruction must not create an event. These are declared product policies; a competing parser's different policy is not automatically a bug.

The record includes runtime, pinned package version, Git revision, dirty state, fixture hash, parser/scorer source hashes and lockfile hash. The scorer uses Temporal only to validate and normalize instants; expected calendar answers are written independently of both parsers.

## Initial development baseline

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

Next: [the interpretation milestone](../docs/tempus-roadmap.md). Browser performance, calendar-export validation, real-user completion and an independently evaluated holdout remain open.

Sources: [gpu-time release](https://github.com/arikchakma/gpu-time/blob/bbd7611c1f58c451d3caeed27e5d51ffc473d0e2/README.md), [model card](https://github.com/arikchakma/gpu-time/blob/bbd7611c1f58c451d3caeed27e5d51ffc473d0e2/MODEL_CARD.md). Source and model weights retain gpu-time's MIT license; they are installed through the package manager rather than copied into our source.
