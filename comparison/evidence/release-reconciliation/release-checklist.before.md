# Tempus release checklist

**Latest candidate:** [Count-bounded schedules and acceptance cases](occurrence-counts.md) now include finite count resolution/export, visible totals, monthly/DST choices and edit invalidation. Exclusion/past-start count choices remain unfinished. Archive `36928444` passes Node 22/26, installed types and import-closure checks. Its browser/local-Worker execution now passes: six desktop runs and 50 independently read files. Archive `47a218ba` runtime/performance evidence is historical.
**Release incomplete.** Keep the [product matrix](product-matrix.md) as the acceptance contract. Complete input → correction → usable output journeys take priority over additional grammar. Work stays local: no push, publication, deployment, cloud mutation or calendar write is authorized.

This is the current gate summary, reconciled September 13, 2026. [Release verification](release-verification.md) preserves the dated milestones, raw artifact locations and failures. Historical results do not certify a newer candidate. Passing development tests does not establish competitive superiority.

## Current candidate and evidence

**Latest source delta:** [explicit timed start/end ranges](explicit-date-ranges.md) now have source and main-app file evidence. [Archive 47a218ba](../comparison/evidence/explicit-range-sdk/README.md) now passes Node 22/26, installed TypeScript and import checks; the retained replay has 22 tasks. [Browser/local-Worker execution](../comparison/evidence/explicit-range-runtimes/README.md) now passes for this archive, including six desktop runs and 36 independently read files. The former 8d0c2791 runtime record below is historical.

**New source delta:** [omitted-month clarification](../comparison/evidence/omitted-month/README.md) now completes a three-date reminder through month/year/time selection, download and edit invalidation in the main app. [Archive 8d0c2791](../comparison/evidence/omitted-month-sdk/README.md) passes Node 22/26, installed TypeScript and static import closure. The [current replay](../comparison/evidence/omitted-month-journeys/README.md) has 21 tasks. [Browser/local-Worker execution](../comparison/evidence/omitted-month-runtimes/README.md) now passes for 8d0c2791, including six desktop runs and 29 independently read files. Older 11018566 sections below retain historical scope.

Current archive `110185666dc9da97be3bfa9b9b073d7a8fd826c222d88f5fdf591dfa6f02009f` has [direct item-year packed runtime evidence](../comparison/evidence/item-year-sdk/README.md): Node 22/26, TypeScript, six browser/viewport runs, local workerd and 29 independently read files. The [current source snapshot](../comparison/evidence/item-year-journeys/README.md) contains 20 complete tasks. Earlier runtime and performance sections below retain their original artifact scope.

- **SDK:** private `@tempus-date/core` 0.1.0; 56 installed files match the archive. Current checks include shared-year, mixed-month, missing item-year and date-only precision recovery. The initial Chrome 320 run failed with a navigation error; its report is retained, and all six runs passed on retry.
- **Source:** 750 shared-source tests and the production build passed at the item-year milestone. Client JavaScript is 900.12 kB / 265.21 kB reported gzip, with the existing size warning. The comparison harness separately passes 16 test cases, including the twenty-task replay counted as one test.
- **Performance:** [current archive 47a218ba measurements](../comparison/evidence/performance-range/README.md) favor pinned gpu-time for startup, single calls, batches and parsing bundle size. Four inspected preview inputs do not measure clarification/export, devices or human completion.
- **External evidence:** no calendar-client imports, physical-device runs, independent holdout or independent human-completion study. Current Cloudflare settings and deployed behavior have not been verified by this local work.

Earlier candidate identities, counts and failures remain in [the archived status snapshot](product-matrix-history.md#release-checklist-before-current-candidate-reconciliation) and the evidence directories; they are not current-candidate verification.

## Complete user journeys

| Journey            | Verified scope                                                                                                                                          | Remaining gate                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Calculator         | Written-order arithmetic → inspectable trace → copy → strict API parity; fractional-second display/copy; invalid edit and recovery                      | Broader tasks, screen reader and physical devices; cross-application paste is unverified  |
| Reminder           | 20 authored scripted correction-to-file journeys cover titles, direct commands, durations, numeric dates, DST, alternatives and replacements            | Independent human completion; broader conflicts and input families                        |
| Finite schedule    | Complete ranges, exclusions and clock choices; a two-year keyboard task resolves four choices and downloads all 103 intervals                           | Actual calendar-client import and broader collection recovery                             |
| Monthly schedule   | Short-month choice → bounded preview → complete four-interval download → edit; ordinary ongoing monthly intervals also have download/expansion evidence | Future ambiguous clocks, intervals spanning offset changes and ongoing day-29/30 clamping |
| Explicit date list | Numeric date → shared-time scope → repeated-clock choice → two-event download → restart/edit; mixed date-only/timed output retains precision            | Omitted-month shorthand and broader conflict recovery                                     |
| Recovery           | Keyboard selection, restart, unchanged-input editing, failed-download cleanup/retry and stale-export prevention in recorded paths                       | Screen reader, physical devices and human completion                                      |

The [20-task source replay](../comparison/evidence/item-year-journeys/README.md), separate browser journeys and file-reader checks have different scopes. They are authored development evidence; they are not 20 independent human studies. The [monthly](monthly-schedules.md#implementation-progress), [list](release-verification.md#shared-time-clarification-and-packed-date-list-candidate) and [blocked-export](release-verification.md#blocked-export-edit-recovery) records retain exact inputs and outputs.

- [x] Complete the recorded correction-to-output paths without losing input, title, duration, source spans or selected clocks.
- [x] Verify [original calculator copy/visible trace/API replay](../comparison/evidence/calculator-copy-trace/README.md) with real clipboard readback on written-order and fractional-second tasks at 320/1280 px. This is not cross-application paste or physical-device evidence.
- [x] Verify [timezone/refresh context reset](../comparison/evidence/context-reset/README.md): fix the lost timezone edit, clear stale export/title state, and retain invalid-zone recovery. [Corrected downloads](../comparison/evidence/context-export/README.md) independently retain all three noon UTC dates and the restored title. SDK missing/conflicting/stale answer checks pass; this is scoped evidence, not a fresh security scan.
- [x] Preserve date-only entries as all-day dates and timed points without an invented duration; explain that a calendar client may display its own default duration.
- [ ] Finish ongoing recurrence recovery. Offering an end date completes a different finite task; it does not satisfy the original ongoing request.
- [ ] Complete broader language/conflict journeys, then verify their full outputs rather than only recognition.

## Calendar export: three separate gates

| Gate                                      | Status                                    | Evidence or required action                                                                                      |
| ----------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| File construction and independent reading | Partial                                   | Finite journey files and selected ongoing rules pass recorded readers; known disagreements below remain failures |
| Browser download of reviewed output       | Verified in scoped local desktop journeys | Includes complete output beyond preview, keyboard use, retry and edit invalidation                               |
| Actual calendar-client import             | Unverified                                | Requires authorization and a disposable calendar, followed by inspection in the actual client                    |

- [x] Validate finite file endpoints, all-day/exclusive ends, complete collections, selected clocks, escaping and rejection paths. Both readers pass the 20 current recorded journey files; packed runtime files have separate readback evidence.
- [x] Keep parsing and file preparation free of calendar writes. Bind download to an explicit action on the current reviewed result.
- [ ] Finish explicit future-clock policy and faithful ongoing intervals spanning offset changes. Do not substitute the preview or invent an end date.
- [ ] Resolve the pending decision about experimental elapsed-duration export versus retaining the block until client verification. No answer or permission is assumed; the block remains.
- [ ] After authorization, import the reviewed [diagnostic pack](calendar-client-check.md) into disposable real calendars and inspect dates, durations, exclusions and recurrence.
- [ ] Verify physical iOS/Android download and import separately.

**Known failures stay visible:**

- A two-series day-29/30 clamp diagnostic passes both readers for four files, 4,798 occurrences each (UTC/Chicago, 400 years, two exclusions, 30-minute intervals). This requires separately editing/deleting February and other-month series. Explicit opt-in versus retaining the block is a pending product decision; actual imports and arbitrary starts/clocks remain unverified. [Candidate and limitations](../comparison/calendar/README.md#two-series-monthly-clamping-candidate).

- The locked Python conformance command exits 1 on the duration-rule fixture. The [PRODID-corrected control](../comparison/evidence/duration-control/README.md) retains the same mismatch in both readers; it is an authored reader diagnostic, not an exporter defect. The optional timezone suite passes 7/8; libical diagnostics pass 8/10. A parseable file is not proof of correct recurrence expansion.
- Monthly day-29/30 clamp candidates fail interoperability: ical.js passes 1/5 candidates, Python 3/5. BYSETPOS produces extra dates in ical.js; RSCALE/SKIP fails both tested readers. No failing candidate was enabled. [Reproduction](../comparison/calendar/README.md).
- One Chicago elapsed-duration candidate passes 20,870 occurrences with libical/ICU, while no-ICU and later-year probes retain failures. This does not establish general compatibility. [Exact scope](../comparison/calendar/README.md#ongoing-elapsed-duration-candidate).

## Packed SDK runtimes

The table below refers to archive `11018566…` and its [retained reports](../comparison/evidence/item-year-sdk/README.md). Earlier archives and consumer presentations remain historical in the [evidence index](../comparison/evidence/README.md).

| Runtime/check                                      | Result                                                            | Limit                                                                               |
| -------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Clean offline install, scripts disabled            | 56 installed files match                                          | Private local archive; not published                                                |
| Node 22.12.0 and 26.8.1                            | Five examples each pass                                           | Authored examples, not every possible consumer                                      |
| Strict installed TypeScript consumers              | Browser/calendar/Worker declarations pass                         | Public API stability still needs release review                                     |
| Chrome 153.0.8010.36, Firefox 148.0.2, WebKit 26.4 | Six 320/1280 px correction/download/edit journeys pass            | WebKit uses explicit Option-Tab; desktop engines, not physical phones or Safari.app |
| Local Wrangler 4.131.1/workerd                     | Weekly/monthly/list interpretation, recovery and file checks pass | Not a deployed Worker                                                               |
| Independent file readback                          | Twenty-four browser downloads and five Worker files pass          | Not a calendar-client import                                                        |

**Keyboard gap:** [ordinary-Tab WebKit runs](../comparison/evidence/packed-keyboard/README.md) failed at both widths. A minimal native form reproduced the mode difference; explicit Option-Tab succeeds. No settings changed. Retain the failure and verify actual Safari/device behavior before closing the broader gate.

- [x] Verify context-bound answers, invalidation after edits, batch isolation, reusable-parser snapshots and bounded clarification history in the recorded source/packed checks.
- [ ] Verify Safari.app, retail Firefox, physical devices, offline startup and deployed Workers where claimed.
- [ ] Decide public package name/version, API guarantees and migration policy before publication.

Integrators own current input/context and external actions. The optional calendar entry point prepares a file; it does not create a reminder or write a calendar. [Integration boundary](schedule-contract.md#calendar-export-boundary).

## Evaluation, performance and release review

- [x] Retain a [current development review snapshot](../comparison/evidence/item-year-journeys/README.md) with 31 comparison cases, 20 scripted tasks, 20 calendar files and source/file hashes. The exporter refuses stale reports; verification detects changed files. This preserves existing development evidence, not independent evaluation.
- [x] Retain [monthly compatibility diagnostics](../comparison/evidence/monthly-compatibility/README.md), including all five single-series cases, four two-series cases, failing reader results, expected dates and checksums. Fresh replay reproduces all nine prior file byte sequences.
- [x] Provide a [portable packed-Node runner and reports](../comparison/evidence/packed-node/README.md): Node 22/26, 56 matching installed files, five examples and installed declaration checks. It refuses repository/existing output directories and runs no servers or external actions.
- [x] Provide a [packed Worker diagnostic and independent file readback](../comparison/evidence/packed-worker/README.md): installed declarations, seven failure codes, stale-answer and metadata recovery, and complete 9/2/4-event files. Local workerd only; no client import.
- [x] Provide [packed browser correction/download runners and reports](../comparison/evidence/packed-browser/README.md): Chrome/Firefox/WebKit, 320/1280 px, 12 independently read files, restart/edit/blocked-output recovery. Developer example only; physical devices remain unverified; current keyboard scope and the ordinary-Tab WebKit failure are recorded above.
- [x] Make the [missing item-year main-app reminder](../comparison/evidence/portable-reminder/README.md) reproducible with repository browser and locked independent-reader commands; verify both viewport paths and retain failure controls.
- [ ] Make remaining main-app browser journeys and diagnostic evidence portable for a fresh checkout; local scratch reports alone cannot close public-review gates.

- [x] Retain gpu-time 0.2.1 and the September 13 registry check; refresh before freezing a comparison.
- [x] Retain [historical archive 906f3a6f desktop performance](../comparison/evidence/performance-year/README.md): Node/Chrome batch-100 p50/median 20.808/27.25 ms versus gpu-time 10.829/8.05 ms. Tempus parsing bundle is 514,339 minified / 146,124 gzip bytes; parsing plus calendar is 531,971 / 151,635 bytes. Four inspected preview inputs do not measure correction or export completion. Historical reports retain their original identities.
- [ ] Measure the final candidate's agreed workloads and resource budgets. Physical-device latency, peak memory, battery and comparative task completion remain unmeasured.
- [x] Correct [collection precision in the comparison adapter](../comparison/evidence/collection-adapter/README.md) and retain its 19-task snapshot; the current item-year snapshot has twenty tasks. Existing 31-case scores are unchanged; full event/rule semantics remain outside that preview grade.
- [x] Draft the [independent evaluation protocol](../comparison/evaluation/protocol.md) and [readiness record](../comparison/evaluation/status.json).
- [ ] Obtain an independent evaluator and holdout custodian; run an independent pilot, then freeze claims, policies, sample allocation, analysis and regression margins before opening holdouts.
- [ ] Report per-family wrong accepts, abstentions, policy disagreements and corrected task completion. The 31-case inspected corpus and 20 scripted journeys cannot substitute for this evidence.
- [x] Preserve the sealed security scan: partial coverage, 107/108 inventory items fully reviewed, no reportable findings. It predates later implementation changes. [Snapshot and limits](security-review.md#current-diff-scan--september-13-2026).
- [x] Record limited post-scan implementation/list/download reviews and full timezone-byte comparison against the retained build. These do not refresh the sealed scan or establish independent compiler provenance.
- [x] Review the current archive’s [static runtime import closure](../comparison/evidence/item-year-sdk/README.md): declared Tempus → Temporal → JSBI edges, both browser bundles without external imports, intended exports, and negative checker controls. This is not runtime side-effect or upstream provenance proof.
- [x] [Rebuild bundled timezone bytes from fresh official HTTPS archives](../comparison/evidence/timezone-upstream/README.md): matching pinned hashes, compiler binary, all 597 zones/344 unique payloads and license.
- [x] Tighten [timezone generator preconditions](../comparison/evidence/generator-guards/README.md), verify unchanged fresh output and failure rejection without destination changes.
- [ ] Complete review of accumulated post-scan changes, remaining diagnostic tooling and hosting readiness. Detached-signature verification, independent review and cross-host/hermetic compiler provenance remain open.
- [x] Retain dated full/production/development advisory checks with no reported advisories. This is not security certification.
- [x] Run [task-owned format/lint/type checks and retained-evidence integrity checks](../comparison/evidence/release-check/README.md). Immutable evidence JSON is excluded from formatting, not rewritten; 263 existing checksum entries match.
- [ ] Complete whole-repository validation. `pnpm check` still fails solely on unrelated `aux/misc/rust-wasm-spike/profile.mjs` formatting, which remains untouched. Scoped passing checks do not close this gate.
- [ ] Obtain authorization for a concrete push, publication or deployment after local review. None is authorized now.

## Work order and missing access

| Priority | Work                                                        | Can proceed locally?                                                                                                                                 | Completion evidence                                                                                                 |
| -------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1        | Ongoing recurrence correction and export contract           | Review and bounded fixes can proceed. Experimental elapsed-duration export and two-series clamping have unanswered product decisions; retain blocks. | Original ongoing request survives correction; faithful complete rule; documented compatibility limits               |
| 2        | Remaining list shorthand and broader conflict recovery      | Yes                                                                                                                                                  | Input → clarification → complete usable output → edit invalidation, with original text preserved                    |
| 3        | Reproducible main-app checks and accumulated release review | Yes                                                                                                                                                  | Fresh-checkout runner evidence, reviewed package/import closure, post-scan diff and timezone provenance             |
| 4        | Real calendar-client import                                 | Requires separate write authorization and disposable calendars/client access                                                                         | Inspect imported dates, durations, all-day status, recurrence and exclusions; not merely an import dialog           |
| 5        | Device and accessibility journeys                           | Requires physical iOS/Android, screen-reader and Safari.app access                                                                                   | Actual input/correction/download paths; record device, browser, navigation mode and failures                        |
| 6        | Independent comparison                                      | Requires independent evaluator, holdout custodian and participants                                                                                   | Independent pilot; agreed claims, budgets, margins and analysis; frozen artifacts/protocol before unopened holdouts |

The [task queue](../tasks.md) tracks immediate work. The [evaluation readiness record](../comparison/evaluation/status.json) lists unresolved evaluation decisions. Nobody has supplied the missing decisions, independent data or calendar authorization; do not infer them from elapsed time or passing tests.
