# Earlier release plans and evidence

For the deployed build and open work, see the [current release checklist](../release-checklist.md). The record below preserves earlier status statements and measurements.

<details>
<summary>Read the earlier release record</summary>

# Tempus release checklist

## Calculator-focused publication — September 13, 2026

The user authorized this bounded website/source release. It does not satisfy the independent-user gate for broader product claims or publish the private SDK to npm.

- [x] Calculator-first page, visible operation steps, secondary scheduling examples and updated metadata.
- [x] Bounded calculator question prefixes preserve input/spans and reject contradictory tense after evaluation. The reviewer’s two counterexamples are protected regressions.
- [x] 1,181 tests pass; one existing expected failure in the independent ongoing-timezone reader remains. Types, lint, formatting, build and deployment dry run pass.
- [x] Final three-browser packed-SDK/playground contract replay passes, including questions and tense rejection. Offline/keyboard journeys and nine separately read lifecycle downloads pass. A 390px layout was visually inspected.
- [x] Fresh blind agent probes: two of six unambiguous questions resolved correctly; four remained unresolved. Both constraint cases remained unresolved. No false resolved result observed in those eight cases; this is not human or broad language evidence.
- [x] PR [#5](https://github.com/MylesMCook/Tempus/pull/5) merged as `de265f0` after CI and bounded full-diff review. Deployed version `7e6b8cbf-63cb-4beb-b4d0-c1a3884d9b13`. Both hostnames pass home/privacy/developer/API checks; live Chromium/Firefox/WebKit pass calculator steps, numeric-date correction, tense rejection and complete five-date copy without page errors or horizontal overflow.

Candidate archive SHA-256: `4d955887db8cda1d7406f3b3086a7c4c627227c3c1cf1d74605eb5fafa843470`. [Retained local release evidence](../../comparison/evidence/calculator-focus) and the reproducible app runners identify this scope. Raw build artifacts and browser downloads are under `/tmp/tempus-calculator-release`. Previous deployed version: `2254407e-a2ca-48c1-a4f3-55b5e9213bd4`.

Current engine bundle: 533,494 minified / 152,164 gzip bytes, up 226 gzip bytes from the preceding core candidate. No dependency additions. Live evidence is retained in [live-report.json](../../comparison/evidence/calculator-focus/live-report.json); these desktop browser checks do not prove physical-phone or calendar-client import behavior.

## Active product decision gate

The [product focus](../product-focus.md) supersedes competitor-wide parity as the development goal.

- [x] Narrow scope to the explainable engine and reference playground; freeze feature expansion.
- [x] Inspect pinned timezone guarantees and run a host-offset comparison; retain disagreements and unavailable historical samples.
- [x] Prepare the [evaluation handoff](../../comparison/independent-evaluation/README.md) and blank records; capture candidate SDK identity without claiming a frozen study.
- [ ] Arrange an independent task author, oracle reviewer and six unfamiliar participants. No outreach has been authorized or performed.
- [ ] Freeze holdout, artifact identities and task protocol; evaluate complete output and correction, then apply the continuation/maintenance gate.
- [ ] Obtain physical-device and assistive-technology evidence. Calendar-client imports remain separate from file validation.

## Current local pruning

The follow-up [size-pruning pass](size-pruning.md) is verified locally and unreleased. It removes unused UI, the inactive app shell and 35 direct dependencies without introducing package versions. Final production checks, three-browser engine journeys and offline/file readers pass. CSS is 69% smaller raw; JavaScript is essentially unchanged. The separate Worker experiment was rejected because it broke first offline use and increased combined gzip. The engine contract, matrix and deployment configuration remain unchanged.

## Preceding local consolidation

The bounded engine-first consolidation is **verified locally and not released**. The pruning section above supersedes this pass for application dependencies and delivery evidence; deployment records below describe earlier artifacts, not the current worktree. No push, publication, deployment or calendar writes are authorized for this work.

- [x] Playground parsing uses the public SDK entry. Batch and reusable parsing preserve captured context without repeated snapshots; mutation isolation and malformed-input checks pass.
- [x] Capture a fresh installed archive before calendar changes, including CPU and sampled-allocation profiles. This baseline already contains context-reuse changes; it cannot measure their benefit retrospectively.
- [x] Remove the preliminary preview pass for resolved finite schedules and the app's synthetic calculation prop. Full validation remains in the complete recurrence pass. The current suite has 1,164 passing tests and one existing expected failure.
- [x] Consolidate public calendar preparation and migrate the reference consumer. Final production-built browser lifecycle/offline/keyboard journeys pass in three desktop engines; nine downloads pass separate Python readers.
- [x] Type clarification dependency families and preserve the selection wire format. Focused invalidation tests and 1,296 before/after valid-ID selection combinations pass; stale input/context preparation is covered at the public boundary.
- [x] Replay equivalent complete journeys through candidate archive `0d1d2ddb` and the production playground in three browsers. Full results, retained text, precision, boundaries, complete copy data and semantic files agree; ical.js separately expands the expected dates and durations.
- [x] Finish before/after resource evidence. Export improves; the mixed single-parse median worsens, startup/batches remain similar and combined gzip grows 581 bytes. Measured desktop lanes fit provisional budgets; unmeasured device/rendering/maximum-size/energy gates remain open.
- [x] Review the final diff and verify checks, 1,164 passing tests plus one existing expected failure, production build and three-browser closeout replay. The large-client-chunk warning remains. Candidate emitted package files match the worktree byte-for-byte; the packed manifest is semantically identical with pnpm's trailing-newline normalization. Product matrix, dependency manifests/lockfile and deployment configuration are unchanged.

The [current evidence report](engine-consolidation-evidence.md) records artifact identities, commands, measurements, failures and limitations. Final results use `candidate/profile`, `candidate/journeys-closeout`, `candidate/worker-final` and `candidate/identity-audit.json`; intermediate reports retain their original scope. Physical devices, energy measurements, independent users and actual calendar-client imports remain unavailable evidence, not implied passes. The [product matrix](../product-matrix.md) remains unchanged.

## Historical deployed web refresh — September 13, 2026

**The RedwoodSDK web refresh and complete schedule-output preview are deployed.** The typography follow-up self-hosts Geist and Geist Mono. Bounded schedules can display and copy their complete data as text, Markdown or pretty-printed JSON. Build and actual font rendering/layout checks passed locally and live at 320px, 390px and 1440px. This delivery supersedes the local-only pause below; no calendar account writes or SDK publication were performed.

Tempus is a natural-language-to-date system. The website is its playground and integration guide. Reminder-shaped phrases are inputs to interpret; reminder delivery and calendar account management belong to consuming applications and are not missing Tempus features.

- RedwoodSDK 1.7.3 provides explicit web routes and server rendering. The existing engine stays in the browser; the strict API and its rate limiter remain separate. React/RSC are matched at 19.2.8.
- The same calculation, ambiguous date-list and counted schedule passed on the built app and again on the live custom domain at two desktop widths. Separate Python readers verified all four live downloaded files.
- Chrome, Firefox and WebKit passed nine desktop layout/navigation/correction/preferences checks. Cold loading withheld JavaScript, verified the disabled/loading state, then correct local interpretation. No phrase-triggered API requests or final browser console errors were observed.
- Full formatting, lint, type checks, 1,015 source tests plus one expected failure, build, dependency audit, evidence-integrity checks and a Cloudflare dry run pass for this candidate. Earlier live checks covered home, integration guide, privacy, 404 and strict API behavior on both hostnames, including nonce CSP and response headers.
- SDK publication, physical devices, energy, independent user evaluation and actual calendar imports retain their separate limits. No faster/lighter or overall superiority claim is made. The latest black-box findings are recorded in the [dogfood report](dogfood-2026-09-13.md).

[Delivery artifacts](/Users/mylescook/Documents/Codex/2026-09-13-tempus-redwood) include the source backup, before/after screenshots, exact built hashes, tests, corrected failed probes, live files and deployment output. These are local review artifacts. The known SSR window access, timezone hydration mismatch and developer-code overflow were fixed before deployment. Initial probe selector/wait errors were corrected separately.

## Previous review decision — superseded by the deployment above

**Recommend a calculator-first preview, with guided reminder and finite-schedule file creation clearly experimental. Do not present Tempus as a general scheduling replacement. Implementation is paused for user review.** The existing [product matrix](../product-matrix.md) remains the long-term acceptance contract; this is a smaller release proposal, not a reduction of those requirements.

Current packed SDK: private 0.1.0, SHA-256 `b1cbd22abe5d87385eb47dcfd3d8528ca6c38206250e6112f12774bc0f5d3395`. Its installed dist files match the local package dist. Today's app checks used the existing loopback development server on port 5174, Chrome 153, America/Chicago and a fixed reference of September 12, 2026 at 16:00Z. They do not establish a current production build or deployed behavior.

### What completed today

| Journey                                            | Observed usable result                                                                                                                                                                                                                   | Recovery and limits                                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `2026-01-31 plus 1 month minus 1 day`              | February 27, 2026, date only. App showed February 28 then February 27 in the trace; clipboard readback and local API replay agreed. Packed Node SDK returned the same steps/result.                                                      | Editing to February 30 removed the valid result/copy action. Cross-application paste and unfamiliar-user comprehension were not checked.                                                                                                                                              |
| `Call Sam December 31 and January 1, 2027 at noon` | App and SDK asked which year applies to December 31, then whether noon applies to that date. Choosing 2026 and “At noon” produced December 31, 2026 and January 1, 2027, both noon Chicago, retaining “Call Sam” and the original input. | App downloaded the two-date file. Editing January 1 to January 2 reopened clarification and removed export. Two questions work mechanically; their clarity and necessity have not been evaluated by unfamiliar users. This produces an event file, not a delivered reminder or alarm. |
| `Call Sam every Monday at noon for 5 occurrences`  | App displayed the total and downloaded all five dates: September 14, 21, 28; October 5, 12, 2026. Packed SDK's initial three-date preview was explicitly incomplete; calendar preparation returned all five.                             | Changing the count to zero blocked output. No duration was invented. The finite file does not prove ongoing recurrence compatibility or calendar-client import.                                                                                                                       |

All three app journeys passed at 320px and 1280px using direct focus/Enter. These are two desktop layouts, not two devices or a full keyboard/accessibility evaluation. The same three tasks passed in the installed packed SDK on Node 26.8.1. Separate Python readers checked all six app/package files against exact dates, titles, absent durations and expanded occurrence sets. No calendar was imported or written.

**Failures:** no product failure was observed in these three selected paths. The first new file-reader attempt incorrectly rejected the finite schedule's `RDATE` representation. The corrected reader checks those dates against the expected set and verifies complete expansion; it passes. Both attempts remain in the [single local run directory](/Users/mylescook/Documents/Codex/2026-09-13-tempus-three-journeys). This is authored verification, not independent product evaluation. Existing DST-reader disagreements, rapid-download failures and unsupported ongoing cases remain open.

Run scripts, reports, downloaded files, source hashes and package identity are in that directory. No new permanent audit framework or product code was added. These local paths are review aids, not portable public evidence.

### Five prioritized problems

1. **The release candidate and its claims are not coherent yet.** Freeze one app/package candidate and a bounded supported-use statement; verify its release build and packaged consumers. Reconcile older headings with actual artifact identities, fix the known export-privacy disclosure omission, and decide the SDK's public compatibility contract. Existing runtime records mostly cover a7f9e298, while today's narrow Node check covers b1cbd22a. The unrelated Rust-spike formatting failure still prevents a whole-repository green check.
2. **We do not know whether unfamiliar people can finish and correct real tasks.** Run a small independently authored calculator/reminder/schedule pilot before widening claims. Include confusing wording, abandonment and wrong accepts. More scripted success counts do not answer this question. No evaluator, holdout custodian or participants are currently established.
3. **Calendar usefulness stops at file evidence.** Obtain authorized disposable-client imports and inspect displayed dates, timezone, duration, exclusions and editing behavior. Retain blocks for unresolved ongoing elapsed-duration and day-29/30 policies. Reader completeness gaps and privacy wording belong here; neither a parseable file nor a finite substitute completes an ongoing request.
4. **Phone and accessibility completion are unverified.** Check real iOS/Android, Safari and screen readers through input, correction, copy/download and recovery. Desktop widths and WebKit Option-Tab workarounds cannot stand in for that access. Calendar imports need separate authorization.
5. **Resource claims need final-candidate and device scope.** Keep existing provisional budgets, with separate parsing, explanation, correction and export costs. Current b1 Node profiling supports no rewrite: typical single parsing is competitive in the four-input workload, while gpu-time's CPU path leads startup, batches, bundle size and slower-end latency. Process memory growth is neither peak memory nor energy. Physical-device latency, sustained resource use and battery/energy remain unmeasured.

The detailed historical work below rolls into these five problems. It is not a second active queue. [tasks.md](tasks.md) records the review pause.

### Smallest useful release and blockers

**Proposed first release:** a clearly labeled preview for explainable date calculations and copyable results. Let reviewers try guided reminder/date-list and finite-schedule previews; if calendar downloads are included, label them experimental and state that client imports are unverified. Keep ongoing export restrictions. The package remains a preview API until its compatibility policy is decided. No automatic reminder delivery, calendar account integration, general English accuracy, physical-phone readiness or superiority claim.

**Before publishing even that preview:** resolve problem 1 for the exact candidate, state the export/file privacy boundary accurately, verify the chosen artifact's startup and the three release journeys, and obtain explicit publication/deployment authorization. If downloads are advertised as dependable calendar integration, actual client import is an additional blocker; until then, omit that promise or defer downloads from the supported release scope. Independent pilots and device evidence block broader usability, mobile and replacement claims, rather than preventing a candid desktop preview for review.

**Stop here for user review.** No parser changes, verifier integration, rewrite, dependency change, push, publication, deployment or calendar write is authorized by this recommendation. The performance matrix and historical evidence remain intact.

## Retained evidence and previous release planning

The following records retain their original scopes and may contain superseded candidate headings or work order. The decision and five priorities above govern current work; counts below are not additional release claims.

**Release incomplete.** Current SDK: **a7f9e298**, still private 0.1.0. The [product matrix](../product-matrix.md) remains the acceptance contract. Complete input → correction → usable output journeys take priority; resource efficiency and independent evaluation are separate gates.

Local only: no push, publication, deployment, cloud mutation or calendar write is authorized. A scoped passing check does not close an unmeasured release gate.

## Evidence identity

The current Node/source candidate is a7f9e298; broad Worker/offline and performance evidence retains e70f6d12. Main-app evidence has separate source identities. Every row below identifies its own verification scope; a passing SDK check does not establish deployed behavior or user success.

| Scope                   | Latest retained evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | What it does not establish                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Source and main app     | [Recipient condition review](../../comparison/evidence/recipient-condition-review/README.md): current 1010 source passes plus one expected failure, build/types and sixteen separately read app files. Earlier scope: [Input preservation](../../comparison/evidence/input-preservation/README.md): current 995 source passes plus one expected failure and build/types. Six desktop insertion/edit checks pass. [Built timezone correction](../../comparison/evidence/built-context-reset/README.md) adds two corrected-file readbacks. Earlier fourteen app file journeys, copy recovery and privacy checks retain their identities. | Broader conflicts, historical download failures, physical devices, independent users or a current full security review |
| Packed Node SDK         | [b1cbd22a](../../comparison/evidence/selection-history-boundary/README.md): consistent malformed-history rejection; seven examples on Node22/26, installed consumer types and 56-file equality                                                                                                                                                                                                                                                                                                                                                                                                                                         | Public compatibility commitment or independent consumer review                                                         |
| Local Worker            | [a7f9e298](../../comparison/evidence/current-a7f-worker/README.md): nineteen separate file readbacks; lowercase reminder correction, spans and edit invalidation; conditional wording remains unresolved                                                                                                                                                                                                                                                                                                                                                                                                                               | Deployed Workers or actual calendar imports                                                                            |
| Offline browser SDK     | [a7f9e298](../../comparison/evidence/current-a7f-offline/README.md): fifteen tasks in six desktop contexts, 90 separate readbacks, including lowercase reminder correction/edit and conditional rejection                                                                                                                                                                                                                                                                                                                                                                                                                              | Cold offline startup, physical phones, assistive technologies or retail Safari                                         |
| Comparison replay       | [a7f9e298](../../comparison/evidence/recipient-condition-review/README.md): retained 31 cases/25 authored journeys match outputs, stages and file hashes                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Independent expected answers, general accuracy ranking or comparative human completion                                 |
| Performance             | [a7f9e298](../../comparison/evidence/current-a7f-resources/README.md): current CPU/allocation profiles, per-input Node/Chrome parsing, trace/correction/export costs, bundles and process memory. [e70 optimization](../../comparison/evidence/snapshot-resources/README.md) retains its alternating before/after scope                                                                                                                                                                                                                                                                                                                | Independent complete-task performance, physical devices, peak memory, energy or frozen budgets                         |
| Whole-repository review | [Last scoped release checks](../../comparison/evidence/release-check/README.md), followed by milestone-specific checks above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Whole-repository green status or a complete review of changes since the earlier security scan                          |

The performance figures meet scoped provisional desktop containment targets. gpu-time still leads measured startup, batches, bundle size and pooled slower-end latency. The current package has not demonstrated overall superiority. Earlier records retain their artifact identities; do not merge them into current proof.

[Preview scoring scope](../../comparison/evidence/preview-scoring-scope/README.md) is explicit: the comparison grades do not check occurrence order, source/event text, complete recurrence, correction or export. Matching previews cannot pass those gates. Repeated samples are not independent cases. [Historical records](../../comparison/evidence/release-reconciliation/README.md), [release verification](release-verification.md) and individual reports preserve prior milestones and failures.

## Performance and resource acceptance

Apply the [provisional budgets](../performance-budgets.md) without waiving correctness or recovery. [Current packed measurements](../../comparison/evidence/current-a7f-resources/README.md) fit scoped desktop targets and retain typical/slower-end latency, initialization, throughput, bundles, sampled allocations and post-GC memory. Device-specific budgets and independent evaluation are not frozen.

Earlier [large-export resource tests](../../comparison/evidence/large-export-resources/README.md) found main-thread stalls and memory growth. [Worker preparation](../../comparison/evidence/worker-preparation/README.md) removed the observed long tasks in two built-app runs, with about 299–306 ms readiness and additional worker transfer. [Numeric formatter evidence](../../comparison/evidence/numeric-formatter/README.md) reduced the recorded retention workload. These retain their original artifact identities; current maximum-export, sustained retention, painted latency, physical-device, peak-memory and energy gates stay open.

## Journey coverage and remaining work

| User task                 | Recorded usable path                                                                                                                                                                                                                                            | Still required                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Original calculator       | [Written-order arithmetic, visible trace, clipboard readback and strict API replay](../../comparison/evidence/calculator-copy-trace/README.md)                                                                                                                  | Broader tasks, cross-application paste, screen reader and devices                                              |
| Reminder and finite dates | [22-task authored replay](../../comparison/evidence/explicit-range-journeys/README.md), plus month/year/time choices and [context-edit recovery](../../comparison/evidence/context-export/README.md)                                                            | Broader conflict recovery and independent user completion                                                      |
| Explicit range            | Timed/all-day/mixed correction through source/app download and [recorded packed integrations](../../comparison/evidence/range-policies-sdk/README.md)                                                                                                           | Broader conflict journeys, unfamiliar users, devices and imports                                               |
| Counted schedule          | [Written-start journeys](../../comparison/evidence/count-past-journeys/README.md), exclusion/clock choices and [recorded packed integrations](../../comparison/evidence/count-policies-sdk/README.md), through correction, complete files and edit invalidation | Broader schedule/conflict journeys, rapid download behavior, devices and actual imports                        |
| Ongoing schedule          | Recorded ordinary point/interval rules and compatibility diagnostics                                                                                                                                                                                            | Future ambiguous clocks, elapsed intervals across offset changes and day-29/30 clamping; retain current blocks |

The [built static SDK example](../../comparison/evidence/static-sdk-startup/README.md) passes nine delayed-startup/correction probes and six full browser journeys with 84 separately read files. This is the preferred reproducible browser verification path. It does not establish the cause of the earlier development-server empty-result failure or close physical-device/import gates.

[Current built timezone correction](../../comparison/evidence/built-context-reset/README.md) passes at two Chrome widths with separate file readbacks. It checks old-choice/title invalidation, renewed UTC interpretation, invalid settings and reference refresh. Main-app and SDK evidence remain distinct.

## Calendar export: separate gates

| Gate                                      | Status                        | Required proof                                                                                                      |
| ----------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| File construction and independent reading | Partial                       | Recorded finite files and scoped ongoing rules pass; disagreements below remain open                                |
| Browser download of reviewed output       | Scoped desktop paths verified | Current output, explicit action, complete extent, correction and edit invalidation                                  |
| Actual calendar-client import             | Unverified                    | Explicit authorization, disposable calendars and inspection of imported dates, durations, recurrence and exclusions |

A file parser or successful download is not a calendar import. No reminder delivery or calendar write is performed by the SDK. The host owns current input/context, confirmation and external actions.

[Focused export-boundary review](../../comparison/evidence/export-boundary-review/README.md) records earlier built-app lifecycle and nine-file readback evidence. No bypass was confirmed in that narrow path; this does not close full post-scan review or deployed-security gates.

## Open release gates

- [ ] Finish ongoing recurrence recovery. Offering an end date completes a different finite task; it does not satisfy the original ongoing request.
- [ ] Complete broader language/conflict journeys, then verify their full outputs rather than only recognition. [Observed wording gaps](../../comparison/evidence/reminder-wording-probe/README.md) include broader recipient text with `for` (lowercase and date-like names remain unsupported), multiple quantities, two actions and clarification responses without selectable recovery.
- [ ] Finish explicit future-clock policy and faithful ongoing intervals spanning offset changes. Do not substitute the preview or invent an end date.
- [ ] Resolve the pending decision about experimental elapsed-duration export versus retaining the block until client verification. No answer or permission is assumed; the block remains.
- [ ] After authorization, import the reviewed [diagnostic pack](../calendar-client-check.md) into disposable real calendars and inspect dates, durations, exclusions and recurrence.
- [ ] Verify physical iOS/Android download and import separately.
- [ ] Verify Safari.app, retail Firefox, physical devices, offline startup and deployed Workers where claimed.
- [ ] Decide public package name/version, API guarantees and migration policy before publication.
- [ ] Make remaining main-app browser journeys and diagnostic evidence portable for a fresh checkout; local scratch reports alone cannot close public-review gates. The [browser performance runner now requires an explicit Playwright entry](../../comparison/evidence/browser-runtime-portability/README.md), eliminating one parent-directory dependency; fresh-machine setup remains unverified.
- [ ] Meet the [performance/resource budgets](../performance-budgets.md) on the final candidate with equivalent parsing, explanation, correction and export work. Initial desktop targets are provisional; maximum-size export, sustained retention, rendered interaction, physical-device latency, peak memory, energy and comparative task completion remain open.
- [ ] Obtain an independent evaluator and holdout custodian; run an independent pilot, then freeze claims, policies, sample allocation, analysis and regression margins before opening holdouts.
- [ ] Report per-family wrong accepts, abstentions, policy disagreements and corrected task completion. Authored development cases and scripted journeys cannot substitute for this evidence.
- [ ] Complete review of accumulated post-scan changes, remaining diagnostic tooling and hosting readiness. Detached-signature verification, independent review and cross-host/hermetic compiler provenance remain open.
- [ ] Complete whole-repository validation. `pnpm check` still fails solely on unrelated `aux/misc/rust-wasm-spike/profile.mjs` formatting, which remains untouched. Scoped passing checks do not close this gate.
- [ ] Obtain authorization for a concrete push, publication or deployment after local review. None is authorized now.

## Known failures and limits

[UTC-to-local reader isolation](../../comparison/evidence/utc-reader-isolation/README.md) reproduces the spring and fall boundary disagreements without Tempus generation. Keep the conformance command failing and validate civil clocks, offsets and instants separately; a UTC round trip can hide a wrong clock. No actual-client or general-export gate is closed.

- The earlier SDK’s unpaced browser run timed out on Chrome’s eleventh download at both widths. A retry with 1.1-second download spacing passes all six runs. The cause remains unconfirmed; this does not prove rapid-download reliability. [Failure and retry](../../comparison/evidence/count-policies-sdk/README.md).

- A two-series day-29/30 clamp diagnostic passes both readers for four files, 4,798 occurrences each (UTC/Chicago, 400 years, two exclusions, 30-minute intervals). This requires separately editing/deleting February and other-month series. Explicit opt-in versus retaining the block is a pending product decision; actual imports and arbitrary starts/clocks remain unverified. [Candidate and limitations](../../comparison/calendar/README.md#two-series-monthly-clamping-candidate).

- The locked Python conformance command exits 1 on the duration-rule fixture. The [PRODID-corrected control](../../comparison/evidence/duration-control/README.md) retains the same mismatch in both readers; it is an authored reader diagnostic, not an exporter defect. The optional timezone suite passes 7/8; libical diagnostics pass 8/10. A parseable file is not proof of correct recurrence expansion.
- Monthly day-29/30 clamp candidates fail interoperability: ical.js passes 1/5 candidates, Python 3/5. BYSETPOS produces extra dates in ical.js; RSCALE/SKIP fails both tested readers. No failing candidate was enabled. [Reproduction](../../comparison/calendar/README.md).
- One Chicago elapsed-duration candidate passes 20,870 occurrences with libical/ICU, while no-ICU and later-year probes retain failures. This does not establish general compatibility. [Exact scope](../../comparison/calendar/README.md#ongoing-elapsed-duration-candidate).

- Ordinary Tab skips native clarification buttons in the tested WebKit mode; a native-control probe reproduces it and Option-Tab succeeds. Actual Safari preferences, screen-reader behavior and physical devices remain unverified.
- The sealed security scan covered 107/108 inventory items fully and reported no findings. It predates subsequent changes and does not establish current Cloudflare settings or deployed security. [Scope](../security-review.md).
- Fresh timezone archive rebuild matched bundled bytes, but detached-signature, independent review and cross-host/hermetic compiler provenance remain open. [Evidence](../../comparison/evidence/timezone-upstream/README.md).

## Work order and smallest unblock actions

| Priority | Next work                                                                                                               | Access or decision needed                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1        | Prepare and run the [independent pilot handoff](../../comparison/evaluation/pilot-handoff.md) on the verified candidate | Independent evaluator, participants and designated devices; imports need authorization                            |
| 2        | Review current package contract and accumulated changes; use measured costs and complete-task failures to guide changes | Local review can proceed; desktop preview performance is current                                                  |
| 3        | Review accumulated parser/export/tooling changes, reproducibility, privacy and package contract                         | Local review can proceed; do not claim a fresh security scan or deployed check                                    |
| 4        | Resolve ongoing elapsed-duration and two-series monthly export decisions                                                | User decision on the concrete recorded tradeoffs; keep blocks until answered                                      |
| 5        | Import diagnostic files and test real phone/accessibility journeys                                                      | Explicit calendar-write authorization, disposable calendars, physical iOS/Android and screen-reader/Safari access |
| 6        | Run independent pilot and then freeze comparison artifacts/policies                                                     | Independent evaluator, holdout custodian, participants and agreed claims/budgets/margins; keep holdouts unopened  |

[Tasks](tasks.md) owns immediate work. [Evaluation readiness](../../comparison/evaluation/status.json) records missing independent inputs. Elapsed time and passing development tests supply neither permission nor independent evidence.

## Supporting evidence and history

- [Copy recovery](../../comparison/evidence/copy-recovery/README.md): six authored Chrome Tab/denial/retry/edit checks; native dialogs, other-browser clipboard behavior and devices remain open.
- [Input preservation](../../comparison/evidence/input-preservation/README.md): complete overlong text remains editable; no truncated qualifier becomes a resolved result. Also records the evidence-snapshot compilation mistake and repair.
- [Public consumer types](../../comparison/evidence/public-consumer-contract/README.md): union narrowing and invalid API use; public naming, version commitments and independent consumer review remain open.
- [Privacy boundaries](../../comparison/evidence/privacy-boundary/README.md): local input/storage and explicit API replay; not a fresh full security or Cloudflare audit.
- [Isolated source build](../../comparison/evidence/isolated-source-build/README.md): same-host offline equality for 5866c6b3 only; not current-candidate, cross-host or hermetic proof.
- [Focus repair](../../comparison/evidence/download-focus/README.md): reproduced focus race fixed; other historical timeouts remain unresolved.

The [complete previous checklist](../../comparison/evidence/release-document-reconciliation/release-checklist.before.md) preserves milestone details and superseded claims. Its uses of “current” refer to past artifacts, not this release candidate. Keep new status updates in the evidence table above rather than appending another timeline.

### Complete schedule copy follow-up (2026-09-13)

Bounded schedules now prepare all upcoming occurrences before enabling copy. Text, Markdown and JSON include every occurrence; JSON preserves calculation snapshots, traces, source, rule and reference. The interface displays ten dates per page for larger sets, without truncating copied data. Unbounded rules explicitly remain rules with a preview. Full expansion respects existing limits and requires unresolved clock choices before copying. Choices are shared with calendar-file preparation. No Knap dependency is needed.

Validation: production build, scoped lint, 52 targeted tests, and Chrome/Firefox/WebKit authored browser journeys including five and 1,000 dates, future DST fold, input changes, file-choice reuse and clipboard denial. Responsive desktop widths are not physical-phone evidence. This does not establish calendar-client import compatibility or competitive superiority. Evidence: ~/Documents/Codex/2026-09-13-tempus-complete-copy.

</details>
