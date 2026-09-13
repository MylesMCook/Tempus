# Tempus release checklist

[Current packed Worker verification](../comparison/evidence/current-clock-first-worker/README.md) passes on b8ffb7e0: eighteen separately read files, including recipient/clock-first clarification and meaningful edit invalidation. Local workerd only; full current offline-browser coverage, deployed Workers, physical devices and actual imports remain open.

Latest resource evidence: [packed b8ffb7e0](../comparison/evidence/clock-first-resources/README.md) refreshes Node/Chrome shared CPU timings, initialization/allocation profiles and separate trace/correction/export costs. The scoped desktop figures meet provisional containment targets; gpu-time still leads measured startup, batches, bundle size and slower-end latency. Current full runtime, physical-device, peak-memory, energy and independent-task evidence remains incomplete. Older measurements below retain their original artifact scope.

**Release incomplete.** The [product matrix](product-matrix.md) remains the acceptance contract. Complete input → correction → usable output journeys take priority. Work stays local; no push, publication, deployment, cloud mutation or calendar write is authorized.

Previous resource candidate: [bd06963f numeric-date formatter reuse](../comparison/evidence/numeric-formatter/README.md). It passes Node 22/26, targeted browser correction, local Worker and retained replay checks; 909 source/comparison tests pass with one expected failure. Its memory and paired correction measurements improve in scope. The [current offline-after-load keyboard/download suite](../comparison/evidence/offline-sdk/README.md) also passes six runs and 84 file readbacks on bd06963f. The latest shared gpu-time comparison is recorded separately for 756fbb4e; do not merge runtime scopes.

Newest candidate: [756fbb4e quantity-title confirmation](../comparison/evidence/quantity-title/README.md). It adds eighteen passing regression cases and verified quantity correction/export/edit journeys. Node 22/26 and targeted browser checks pass. The bd06963f record above remains the predecessor for the full offline/Worker suite and memory optimization; current broad runtime refresh is open. The [756fbb4e resource refresh](../comparison/evidence/quantity-resource-refresh/README.md) now covers CPU/allocation, shared Node/Chrome parsing, bundle cost and retention.

## Evidence identity

| Scope                   | Latest retained evidence                                                                                                                                                                                                                                                                        | What it does not establish                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Current source          | [Quantity-title journeys](../comparison/evidence/quantity-title/README.md): 927 source/comparison passes and one expected failure; eight built-app downloads read separately; build/lint/types pass                                                                                             | Broader conflicts, independent evaluation, physical-device behavior and current security review remain open                |
| Latest packed SDK       | [Current 756fbb4e](../comparison/evidence/quantity-title/README.md): Node 22/26, 56-file equality, installed types, 31/22 replay and nine targeted browser probes; local Worker now passes on byte-identical 4b96da77; current fourteen-task offline suite passes on 4b96da77 with 84 readbacks | Public stability, rapid-download reliability, actual imports, physical devices and deployed Workers remain open            |
| Comparison replay       | [Current packed replay](../comparison/evidence/identifier-runtime/README.md): a8a1cbb4 matches the retained 31 cases/22 authored journeys, outputs, stages and file hashes on Node 26                                                                                                           | Independent expected answers, full semantic scoring and human comparative completion                                       |
| Performance             | [Current 756fbb4e costs](../comparison/evidence/quantity-resource-refresh/README.md): CPU/allocation profile, shared Node/Chrome CPU comparison and separate authored correction/export timings                                                                                                 | Independent complete-task performance, physical devices, peak memory, energy and frozen budgets remain open                |
| Whole-repository review | [Last retained scoped checks](../comparison/evidence/release-check/README.md), plus later milestone-specific checks above                                                                                                                                                                       | A fresh whole-repository pass or refreshed security scan; new check failures and their resolution are recorded in tasks.md |

These are different snapshots, not one release certification. Do not add their task/file counts together as independent samples. [Pre-consolidation records](../comparison/evidence/release-reconciliation/README.md) preserve the former status prose; [release verification](release-verification.md) and the individual reports preserve milestones and failures.

## Performance and resource acceptance

The latest a8a1cbb4 archive has seven passing Node 22/26 examples and matching 31-case/22-journey replay. Its packed desktop-browser checks pass on retry and local Worker checks pass. The first Chrome 320 run read an empty result before the first file; the cause remains unconfirmed. Navigation/failure diagnostics were added without changing assertions; retain startup reliability as open. Numeric identifier source coverage adds seventeen passing cases (908 source/comparison passes and one expected failure).

Apply the [provisional performance budgets](performance-budgets.md) to the current packed candidate. Release requires per-family latency and throughput, cold start, transfer cost, bounded retention and complete-task correctness together. Desktop microbenchmarks cannot close physical-phone, peak-memory, energy or independent-evaluation gates. Initial thresholds are engineering targets; freeze claim-specific budgets with the evaluator before holdouts. [Large-export/resource evidence](../comparison/evidence/large-export-resources/README.md) now verifies 1,000-event files and paginated review, but retains 208–214 ms UI tasks and roughly 157 MiB process RSS growth under varied-zone stress. [Worker preparation](../comparison/evidence/worker-preparation/README.md) removes the observed main-thread task in the two built-app runs, while ready time remains about 299–306 ms and a 144 kB gzip worker is added. Memory/device/energy and broader latency gaps remain open.

## Journey coverage and remaining work

| User task                 | Recorded usable path                                                                                                                                                                                                                                     | Still required                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Original calculator       | [Written-order arithmetic, visible trace, clipboard readback and strict API replay](../comparison/evidence/calculator-copy-trace/README.md)                                                                                                              | Broader tasks, cross-application paste, screen reader and devices                                              |
| Reminder and finite dates | [22-task authored replay](../comparison/evidence/explicit-range-journeys/README.md), plus month/year/time choices and [context-edit recovery](../comparison/evidence/context-export/README.md)                                                           | Broader conflict recovery and independent user completion                                                      |
| Explicit range            | Timed/all-day/mixed correction through source/app download and [current packed integrations](../comparison/evidence/range-policies-sdk/README.md)                                                                                                        | Broader conflict journeys, unfamiliar users, devices and imports                                               |
| Counted schedule          | [Written-start journeys](../comparison/evidence/count-past-journeys/README.md), exclusion/clock choices and [current packed integrations](../comparison/evidence/count-policies-sdk/README.md), through correction, complete files and edit invalidation | Broader schedule/conflict journeys, rapid download behavior, devices and actual imports                        |
| Ongoing schedule          | Recorded ordinary point/interval rules and compatibility diagnostics                                                                                                                                                                                     | Future ambiguous clocks, elapsed intervals across offset changes and day-29/30 clamping; retain current blocks |

The [built static SDK example](../comparison/evidence/static-sdk-startup/README.md) passes nine delayed-startup/correction probes and six full browser journeys with 84 separately read files. This is the preferred reproducible browser verification path. It does not establish the cause of the earlier development-server empty-result failure or close physical-device/import gates.

## Calendar export: separate gates

| Gate                                      | Status                        | Required proof                                                                                                      |
| ----------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| File construction and independent reading | Partial                       | Recorded finite files and scoped ongoing rules pass; disagreements below remain open                                |
| Browser download of reviewed output       | Scoped desktop paths verified | Current output, explicit action, complete extent, correction and edit invalidation                                  |
| Actual calendar-client import             | Unverified                    | Explicit authorization, disposable calendars and inspection of imported dates, durations, recurrence and exclusions |

A file parser or successful download is not a calendar import. No reminder delivery or calendar write is performed by the SDK. The host owns current input/context, confirmation and external actions.

[Focused export-boundary review](../comparison/evidence/export-boundary-review/README.md) adds current built-app lifecycle and nine-file readback evidence. No bypass was confirmed in that narrow path; this does not close full post-scan review or deployed-security gates.

[Candidate compatibility documentation](../comparison/evidence/candidate-compatibility/README.md) now records both public entries, opaque-state invalidation across upgrades and strict-v2 boundaries. Archive 4b96da77 differs from 756fbb4e only in README.md; seven Node26 examples and installed types pass. Runtime/performance evidence retains its original identity. Public release commitments remain open.

[Current journey coverage](../comparison/evidence/count-quantity-validation/README.md) has 25 authored tasks with 31/25 installed replay and separate file readbacks. The three additions include meaningful edits; earlier whitespace checks remain limited. Comparative count tasks, independent participants and real calendar imports remain open.

[Current packed Worker verification](../comparison/evidence/current-quantity-worker/README.md) passes sixteen file readbacks and quantity edit recovery on 4b96da77. This is local workerd; deployed Workers and the full current offline browser suite remain open.

[Current loaded-SDK offline verification](../comparison/evidence/current-offline-sdk/README.md) passes the existing fourteen-task suite in six desktop contexts with 84 separately read downloads. The quantity journey is outside that suite. Cold offline startup, physical phones and actual imports remain open.

[Newest recipient candidate e7ac31c4](../comparison/evidence/recipient-reminder/README.md) passes source/build/lint, targeted Node22/26, ten built-app file readbacks and 31/25 replay. The capitalized-name grammar is bounded; full current Worker/offline/performance refresh remains open.

[Current source review](../comparison/evidence/recipient-review/README.md) retains one failing clock-first reminder task after correcting recipient capitalization/qualifier flaws. That milestone was not green; the clock-first follow-up clears the test without weakening it.

[Clock-first candidate b8ffb7e0](../comparison/evidence/clock-first/README.md) passes 979 source tests with one existing expected failure, build/types/lint, Node26 package checks, targeted Node22/26 and unchanged 31/25 replay. Twelve built-app file journeys pass on retry; the first-run download timeout remains open. Full current runtime/performance refresh is separate.

## Open release gates

- [ ] Finish ongoing recurrence recovery. Offering an end date completes a different finite task; it does not satisfy the original ongoing request.
- [ ] Complete broader language/conflict journeys, then verify their full outputs rather than only recognition. [Observed wording gaps](../comparison/evidence/reminder-wording-probe/README.md) include broader recipient text with `for` (lowercase and date-like names remain unsupported), multiple quantities, two actions and clarification responses without selectable recovery.
- [ ] Finish explicit future-clock policy and faithful ongoing intervals spanning offset changes. Do not substitute the preview or invent an end date.
- [ ] Resolve the pending decision about experimental elapsed-duration export versus retaining the block until client verification. No answer or permission is assumed; the block remains.
- [ ] After authorization, import the reviewed [diagnostic pack](calendar-client-check.md) into disposable real calendars and inspect dates, durations, exclusions and recurrence.
- [ ] Verify physical iOS/Android download and import separately.
- [ ] Verify Safari.app, retail Firefox, physical devices, offline startup and deployed Workers where claimed.
- [ ] Decide public package name/version, API guarantees and migration policy before publication.
- [ ] Make remaining main-app browser journeys and diagnostic evidence portable for a fresh checkout; local scratch reports alone cannot close public-review gates. The [browser performance runner now requires an explicit Playwright entry](../comparison/evidence/browser-runtime-portability/README.md), eliminating one parent-directory dependency; fresh-machine setup remains unverified.
- [ ] Meet the [performance/resource budgets](performance-budgets.md) on the final candidate with equivalent parsing, explanation, correction and export work. Initial desktop targets are provisional; maximum-size export, sustained retention, rendered interaction, physical-device latency, peak memory, energy and comparative task completion remain open.
- [ ] Obtain an independent evaluator and holdout custodian; run an independent pilot, then freeze claims, policies, sample allocation, analysis and regression margins before opening holdouts.
- [ ] Report per-family wrong accepts, abstentions, policy disagreements and corrected task completion. Authored development cases and scripted journeys cannot substitute for this evidence.
- [ ] Complete review of accumulated post-scan changes, remaining diagnostic tooling and hosting readiness. Detached-signature verification, independent review and cross-host/hermetic compiler provenance remain open.
- [ ] Complete whole-repository validation. `pnpm check` still fails solely on unrelated `aux/misc/rust-wasm-spike/profile.mjs` formatting, which remains untouched. Scoped passing checks do not close this gate.
- [ ] Obtain authorization for a concrete push, publication or deployment after local review. None is authorized now.

## Known failures and limits

- The current SDK’s unpaced browser run timed out on Chrome’s eleventh download at both widths. A retry with 1.1-second download spacing passes all six runs. The cause remains unconfirmed; this does not prove rapid-download reliability. [Failure and retry](../comparison/evidence/count-policies-sdk/README.md).

- A two-series day-29/30 clamp diagnostic passes both readers for four files, 4,798 occurrences each (UTC/Chicago, 400 years, two exclusions, 30-minute intervals). This requires separately editing/deleting February and other-month series. Explicit opt-in versus retaining the block is a pending product decision; actual imports and arbitrary starts/clocks remain unverified. [Candidate and limitations](../comparison/calendar/README.md#two-series-monthly-clamping-candidate).

- The locked Python conformance command exits 1 on the duration-rule fixture. The [PRODID-corrected control](../comparison/evidence/duration-control/README.md) retains the same mismatch in both readers; it is an authored reader diagnostic, not an exporter defect. The optional timezone suite passes 7/8; libical diagnostics pass 8/10. A parseable file is not proof of correct recurrence expansion.
- Monthly day-29/30 clamp candidates fail interoperability: ical.js passes 1/5 candidates, Python 3/5. BYSETPOS produces extra dates in ical.js; RSCALE/SKIP fails both tested readers. No failing candidate was enabled. [Reproduction](../comparison/calendar/README.md).
- One Chicago elapsed-duration candidate passes 20,870 occurrences with libical/ICU, while no-ICU and later-year probes retain failures. This does not establish general compatibility. [Exact scope](../comparison/calendar/README.md#ongoing-elapsed-duration-candidate).

- Ordinary Tab skips native clarification buttons in the tested WebKit mode; a native-control probe reproduces it and Option-Tab succeeds. Actual Safari preferences, screen-reader behavior and physical devices remain unverified.
- The sealed security scan covered 107/108 inventory items fully and reported no findings. It predates subsequent changes and does not establish current Cloudflare settings or deployed security. [Scope](security-review.md).
- Fresh timezone archive rebuild matched bundled bytes, but detached-signature, independent review and cross-host/hermetic compiler provenance remain open. [Evidence](../comparison/evidence/timezone-upstream/README.md).

## Work order and smallest unblock actions

| Priority | Next work                                                                                                               | Access or decision needed                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1        | Prepare and run the [independent pilot handoff](../comparison/evaluation/pilot-handoff.md) on the verified candidate    | Independent evaluator, participants and designated devices; imports need authorization                            |
| 2        | Review current package contract and accumulated changes; use measured costs and complete-task failures to guide changes | Local review can proceed; desktop preview performance is current                                                  |
| 3        | Review accumulated parser/export/tooling changes, reproducibility, privacy and package contract                         | Local review can proceed; do not claim a fresh security scan or deployed check                                    |
| 4        | Resolve ongoing elapsed-duration and two-series monthly export decisions                                                | User decision on the concrete recorded tradeoffs; keep blocks until answered                                      |
| 5        | Import diagnostic files and test real phone/accessibility journeys                                                      | Explicit calendar-write authorization, disposable calendars, physical iOS/Android and screen-reader/Safari access |
| 6        | Run independent pilot and then freeze comparison artifacts/policies                                                     | Independent evaluator, holdout custodian, participants and agreed claims/budgets/margins; keep holdouts unopened  |

[Tasks](../tasks.md) owns immediate work. [Evaluation readiness](../comparison/evaluation/status.json) records missing independent inputs. Elapsed time and passing development tests supply neither permission nor independent evidence.

[Clarification focus repair](../comparison/evidence/download-focus/README.md) has controlled before/after proof and twelve instrumented built-app downloads with separate readbacks. It closes the reproduced delayed-focus defect only. Earlier uninstrumented download timeouts, rapid repeated downloads and actual imports remain open. The subsequent b8ffb7e0 resource refresh supersedes the older shared performance measurements.
