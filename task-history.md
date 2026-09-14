# Phoenix rebuild

## Objective

Rebuild TempusTotal around explicit timezone/reference inputs, sequential calendar arithmetic, a truthful live trace, and matching browser/API results. Current contract and evidence: [Phoenix](docs/phoenix.md).

## Status

- [x] Preserve clean baseline `bf92c81` and define v2 semantics; evaluate RedwoodSDK/language alternatives. Retain one TypeScript engine in React and Cloudflare.
- [x] Replace heuristic parser/evaluator with typed grammar, Temporal arithmetic, exact fractions, bounded validation, and execution trace.
- [x] Rebuild calculator, display preferences, examples, and API replay; migrate stored preferences without the retired arithmetic switch.
- [x] 183 tests, source/type/build checks, frozen install, three-host-timezone suite, and browser replay at desktop/tablet/mobile. Fixed observed mobile overflow and grouping issues.
- [x] Update API migration documentation, privacy copy, and Writer/Laws of UX critique. Historical v1 audits marked superseded.
- [x] Landed `e1eb6ce` on main and pushed. Wrangler OAuth deployment succeeded; public calculator, trace, API parity, HTTP errors/no-store, asset, and privacy navigation verified.

## Operational boundary

No database, host service, DNS, or credential changes. Existing GitHub Cloudflare deployment token is invalid; automated deployment remains a separate credential handoff. CI validation and manual deployment are reported separately.

Rollback: revert the Phoenix implementation commit, install the resulting lockfile, rebuild, and deploy through the same path. Existing timezone/date-format storage remains compatible with v1.

Release: `868ac2ab-b176-4063-8fee-0e602449436f`; client `index-DBLeC7iA.js`. GitHub run `34673173157` passed check/test/build and failed deployment; manual deployment succeeded independently. See the release evidence in `docs/phoenix.md`.

Current state: Phoenix rebuild complete and live. Remaining operational follow-up: replace the GitHub deployment token through the required credential handoff. Parser rebuild is complete; current UI work is tracked below.

## Compatibility follow-up — live

- [x] Live “3 weeks ago” returns August 21 from September 11 in Chicago, with a 21-day subtraction and matching API replay. User-reported failure not yet reproduced; requested observed error/date.
- [x] Compare pre-audit and pre-Phoenix implementations; research Chrono and GNU date's documented language and edge cases.
- [x] Measured 47 phrases across original, audited v1, and initial Phoenix; added 58 independent compatibility oracles. Restored useful grammar and labelled calendar approximations. See `docs/parser-compatibility.md`.
- [x] 255 tests, source/type/build checks, three-host-timezone suite, browser/API match, visible approximations, error recovery, and diagnostic copy feedback. Narrow-screen DOM measured no horizontal overflow.
- [x] Pushed `ad5355e`; deployed version `60fd1a59-ae81-4628-96a9-7e2f1080ea48`, client `index-8bf3uT5u.js`. Public browser and fixed-reference API checks passed for ago, mixed fractions, aliases, exact half years, labelled month approximations, and trailing-text rejection.
- [x] GitHub run `34674040184` passed check/test/build; its deploy failed. The manual release succeeded independently.
- Remaining uncertainty: the original “3 weeks ago” failure has not been reproduced. The diagnostic copy action now captures the exact inputs and error/result for follow-up.

## ADHD-oriented calculator — live

- [x] Put the phrase and result first; offer three quick examples and disclose optional controls.
- [x] Make copy completion visible; preserve live trace, warnings, errors, settings, and API replay.
- [x] Verify desktop/mobile and keyboard paths, parser regression suite, types, and production build.
- [x] Pushed `844f00d` to main; OAuth deployment `5176f388-7812-4330-8562-5ddc9d67dee9` is live with client `index-DqeNL3PR.js`. Public copy feedback, approximation trace, and API parity verified.

Decision: apply the I Have ADHD plugin's low-distraction and visible-state guidance without storing phrases or changing calculation semantics.

Verification: 255 tests; source/type/build checks; desktop, 390px and 320px browser paths, keyboard copy/example navigation, format/timezone/phrase recovery, approximation trace, and matching API replay. Details: [UX review](docs/phoenix-ux-review.md#adhd-oriented-follow-up--september-12-2026).

GitHub run `34699827081` passed check/test/build and failed deployment. Manual deployment succeeded independently. Worktree closeout is documentation-only; the existing automated-deployment credential handoff remains open. Rollback: revert `844f00d`, rebuild, and deploy through the same path.

## Secondary controls — live

- [x] Replace five competing cards with controls grouped by task: examples at input, settings and explanation at result, developer tools below.
- [x] Verified 390px/320px containment, keyboard disclosures, example-to-result focus, copy feedback, settings, error diagnostics, live approximation trace, API parity, 255 tests, checks, types, and build.
- [x] Pushed `1fea2d2`; deployed `3948799c-afe0-49b9-970c-2ec8997fe2ad` with client `index-CytiqxH9.js`. Public grouped controls, trace, copy feedback, and HTTP 200 API parity verified.

Secondary-controls rollback: revert `1fea2d2`, rebuild, and deploy through the existing OAuth path. No parser, preference-storage, dependency, or hosting configuration changes.

GitHub run `34700146532` passed check/test/build and failed automated deployment. The verified manual release succeeded independently.

## Open-source and security readiness — release verified

- [x] Codex Security standard source scan at `81dce96`: 97 files reviewed, no confirmed source-backed vulnerabilities. History secret/metadata scans found no detections. See [security review](docs/security-review.md) for scope and limits.
- [x] Patched dependencies; final audit reports zero advisories. Vite+ 0.3.1 resolves the intermittent type-checker failure found during clean-install verification.
- [x] Prepared MIT license, third-party attribution, contributor/security docs, critique issue forms, review guide, and credential-free CI with opt-in deployment.
- [x] Fresh `ebef472` checkout passed frozen install, checks, 260 tests, and build. Tests also passed under UTC, America/New_York, and Asia/Tokyo during hardening. Main checkout checks, tests, build, and deploy dry run passed before release.
- [x] Deployed `e385941f-1556-4e6e-81a3-3048c91ac257`; client `index-BAk8XBE-.js`. Read back Cloudflare's 120/minute per-IP limiter, 100 ms CPU budget, query redaction, preview URLs disabled, and unchanged production domain mapping.
- [x] Both custom domain and workers.dev: home/privacy/API 200, unknown API route 404, unsupported method 405, and preflight 200; security headers and no-store API responses verified. Fixed-reference API returned February 28 from January 31 plus one month. Live browser copy, API parity, error recovery, and approximation trace passed.
- [x] Release commits pushed to main; GitHub CI run `34702196985` passed on `832c39a`. Automated deployment was intentionally skipped and stays disabled until its credential handoff is complete and deployment is explicitly enabled.
- [ ] Cloudflare zone-wide TLS/WAF and account access-policy review: existing OAuth lacks read permissions; dashboard is signed out. HTTPS redirect and valid certificate are observed, but these do not prove zone configuration.
- [ ] Confirm MIT/publication and enable private vulnerability reporting when publishing. Repository remains private.

Evidence: `/Users/mylescook/Documents/Codex/2026-09-12-tempustotal-open-source/`. Formal scan ID `d759b8fa-a7c2-46aa-9d43-3616a58d3e67`. The scan predates hardening; focused regression/runtime checks cover this release separately. Query redaction does not erase old logs. Rate limits are approximate per edge location, not a global spending cap.

Rollback: previous live version `3948799c-afe0-49b9-970c-2ec8997fe2ad`. Revert the hardening/toolchain commits together, restore that lockfile, rebuild, deploy, and verify both production addresses. No stateful data migration or shared host changes occurred.

## Developer copy and formatting — live

- [x] Replace API prose wall with a clear empty state, decoded request fields, structured reference, and concise comparison status. Preserve explicit request action and privacy disclosure.
- [x] Writer pass complete. Verified 390px/320px/1280px containment, keyboard disclosures, empty state, decoded fields, URL/response copy feedback, stale status, HTTP 400 and successful recovery. No browser console errors; 260 tests, checks, types and build pass.
- [x] Pushed `220051f`; GitHub CI `34702768861` passed. Deployed `adf61c72-542b-4578-bb90-c297fdb2ab91`, client `index-D8Lsn2vx.js`. Both production hosts serve the current client/security headers; live 390px layout, empty state, request details, copy feedback and API parity verified.

Scope: presentation and feedback only; parser and Cloudflare protections stay unchanged.

Copy/formatting rollback: revert `220051f`, rebuild and deploy through the documented path. Existing Cloudflare account-review and automated-deployment credential handoffs remain unchanged.

## Repository writing — complete

- [x] Read Writer and I Have ADHD guidance; rewrite README, contribution/review guidance and feedback templates around the reader's next action. Move detailed date/API rules into linked reference pages.
- [x] Validate formatting, relative links, preserved examples, GitHub Markdown rendering and issue-template YAML. GitHub About now has a plain description and the current calculator URL; visibility remains private.
- [x] Pushed `f3dd3a5`; CI `34703549046` passed checks, tests, build and dependency audit. GitHub serves the matching README. No application deployment or repository-visibility change needed.

## Tempus comparison — verified locally

- [x] Added `pnpm compare`: 26 authored semantic fixtures; gpu-time 0.2.0 pinned as a development dependency; both engines run locally on CPU. Reports include raw outputs, expectations, rationale, source hashes and runtime metadata.
- [x] Verified scoring and protected existing date/arithmetic cases. All 270 tests, formatting, lint, types, build and dependency audit pass. Client bundle remains `index-D8Lsn2vx.js`. Per-family baseline and evaluation limits are in `comparison/README.md`.
- [x] Documented the next milestone in `docs/tempus-roadmap.md`: a versioned interpretation contract and one complete sentence-to-date path.

The bounded interpretation milestone shipped below. Independent holdout evaluation, calendar-export validation and device/user benchmarks remain open; this harness does not establish general language accuracy.

Scope: development baseline only. Tempus is a working name; existing API, deployed behavior, repository name and domains stay unchanged. These inspected fixtures are development evidence, not an untouched accuracy benchmark.

## Sentence interpretation — live

- [x] Added interpretation v1 with a point result, source/event spans and explicit unresolved outcomes. Strict evaluator/API v2 remain unchanged. Reminder labels require a supported action and a single-word target.
- [x] Added 28 sentence/regression checks. A test caught recurrence being discarded from the event label; the corrected recognizer evaluates the complete suffix. All 298 tests, formatting, lint, types and build pass. The unchanged comparison corpus now reports strict v2, interpretation and gpu-time separately: interpretation resolves 3/4 sentence cases, preserves 11/11 date/arithmetic cases and resolves 0/5 schedule cases.
- [x] Verified 320px/390px containment, desktop API replay, highlighted phrase, event label, copy contents/feedback, keyboard trace, recurrence/cancellation rejection and successful recovery. No browser console errors. API replay sends only the highlighted phrase and labels this distinction. Agent-browser screenshot capture stalled; verification completed in the Codex browser.

Pushed `2391f60`; CI `34720662896` passed. Deployed Worker `d28852a9-a777-4bec-b023-3789001583f3`, client `index-PCguxmMf.js`. Both production hosts serve the new client and security headers; fixed-reference API behavior, live 390px sentence result and browser/API parity verified. Previous live Worker for rollback: `adf61c72-542b-4578-bb90-c297fdb2ab91`. No server contract, binding, credential or domain changes.

Constraint: no claim of arbitrary prose understanding or reminder delivery. Intervals and recurrence remain unsupported until their own contracts and tests exist.

## Product matrix — local documentation

- [x] Added [the product matrix](docs/product-matrix.md): nine capability areas, current gaps, acceptance gates, work order and rules for comparative claims. Linked roadmap and comparison guidance to it.
- [x] Checked upstream source at `aba27e5` (0.2.1); it reports a duration fix since our evaluated 0.2.0. Historical scores remain explicitly versioned. No dependency or runtime change in this task.
- [x] Preserved local 0.2.0 and unchanged-corpus 0.2.1 reports under `comparison/results/history/`; pinned the comparison dependency to 0.2.1. Correct-result counts are unchanged; one incorrect arithmetic result becomes abstention. The duration fixture still returns the same incorrect point in this context.
- [x] Defined [schedule semantics](docs/schedule-contract.md) and interval acceptance examples. Corrected the automatic-correction expectation to require clarification, matching product policy; corpus is now `development-v2`. No parser improvement is claimed from this policy edit.
- [x] Verified 298 tests, comparison, formatting, lint, types, build and documentation links. Browser client remains `index-PCguxmMf.js`; no application behavior or deployment changed. Build still warns about the existing client chunk size.
- [ ] Next implementation: interval results and complete duration/range interpretation, preserving strict calculator behavior. Holdout governance and numerical evaluation budgets remain open; the whole first matrix milestone is not yet complete.

## Interval resolver — implementation in progress

- [x] Added internal `interpret-interval.ts`: complete explicit clock ranges and integer day/week/hour/minute durations reuse the existing evaluator. Calendar durations retain DST behavior and endpoint traces; all-day classification uses parsed anchor semantics.
- [x] Added contrast tests for calendar days versus elapsed hours, overnight ranges, equal endpoints, invalid clocks/context, unsupported qualifiers and limits. Corrected overnight validation to check the destination date, including the autumn repeated clock.
- [x] Connected interval values to interpretation, retained event/source text, comparison normalization and complete UI previews/copy. API replay is unavailable for ranges; strict API v2 stays unchanged. Development schedule cases improve from 0/5 to 3/5, with protected dates/arithmetic 11/11.
- [x] Verified 328 tests, formatting, lint/types and build. Browser checks: 320px and 1280px containment, event/range preview, equal-endpoint error, recovery to an all-day range, stale-copy feedback reset and keyboard activation. Native copy reported success; exact copied content was checked with an instrumented write because clipboard read permission was denied. Range API replay is unavailable as intended.
- [ ] Finish visual capture and remaining browser regression checks. Agent-browser screenshot stalled; capture processes were terminated. No physical-phone evidence. Recurrence, multiple groups, selectable clarification and export remain open; no deployment or general accuracy claim.

## Numeric date clarification — local implementation

- [x] Added named choices for ambiguous numeric dates, including supported reminder sentences. Selection preserves source/event spans and original input; generated date expressions retain strict v2 evaluation. Invalid dates and unknown/stale selections remain unresolved.
- [x] Context includes input, timezone and reference; browser edits, refresh and timezone changes clear selection. Only truly ambiguous dates offer a change-interpretation action. A DST-invalid clock cannot silently eliminate a date-order alternative.
- [x] Added 10 tests; 338 tests, static checks and build pass. Browser at 390px verified both outcomes, original input and keyboard result focus. Selection-change focus was repaired after browser review. Initial ambiguity remains an abstention in comparison scoring.
- [ ] Remaining recovery: repeated/nonexistent clock choices, explicit corrections, conflicts and equal-range endpoints. Broader UI task studies and physical-device checks remain open. No publish, push or deployment.

## Explicit correction choices — local implementation

- [x] Added keep/replace choices for complete two-clause corrections of points and intervals. Original sentence and event spans remain intact. Chained corrections, conditions, invalid clauses and changed event labels remain unresolved. Reopening an interval choice is supported.
- [x] Correction tests exposed a weekday-policy contradiction: the strict calculator excludes today for a bare weekday, while scheduling examples include a future time today. Added a scheduling-only rule; explicit next/last/this, arithmetic and strict API v2 retain their behavior. Documented the boundary in `docs/schedule-contract.md`; tests cover both DST directions and past versus future clocks.
- [x] Verified 355 tests, static checks, build and diff whitespace. Browser at 320px: named alternatives, keyboard confirmation/result focus, complete interval preview, retained input/event and no overflow. Initial comparison correction remains an abstention until a user chooses; it is not scored as automatic recognition success.
- [ ] Next recovery work: repeated/nonexistent clocks and multi-step decisions. Remaining matrix gates, independent evaluation and physical-device evidence remain open. No external publication or deployment.

## Point clock clarification — local implementation

- [x] Added repeated-clock choices with explicit UTC offsets and gap replacement choices requiring selection. Supports non-hour DST transitions. Original input and event/source spans remain intact; strict API v2 rejection behavior is unchanged.
- [x] Numeric-date choices can lead to a second clock choice using bounded context-bound decision history. Invalid/stale choices remain unresolved. Ambiguity inside arithmetic or interval endpoints is still unresolved; no operation is discarded to manufacture a result.
- [x] Point copy now retains event text, displayed date, clock, timezone and UTC offset. Strict API replay is unavailable for selected clock interpretations. Trace explicitly identifies the user-selected instant rather than claiming the original phrase passed strict v2.
- [x] Verified 360 tests, static checks, build and diff whitespace. Browser at 320px: second repeated-clock occurrence, two-step date-to-gap choice, keyboard focus, preserved original text/event and no overflow. Instrumented clipboard write verified the selected CST offset. No browser errors observed; physical-device and visual-capture evidence remain open.
- [ ] Next: complete interval/multi-step recovery and schedule families, then package/export and independent evidence gates. Matrix is not complete. No push, publish, deployment or cloud changes.

## Weekly recurrence — internal resolver in progress

- [x] Added bounded weekly point/range previews, ISO start/until boundaries, excluded local start dates, complete overnight endpoints and explicit truncation. Reuses the calendar evaluator and rejects partial previews on DST ambiguity. Rule validation is explicitly preview-only.
- [x] Documented inclusive date boundaries, upcoming-start policy and limits before integration. No RRULE/export validity claim.
- [x] Verified 15 recurrence tests and 375 total tests, formatting, lint/types and diff whitespace. No app behavior changed in this resolver-only step.
- [x] Connected complete recurrence values to interpretation, event/source spans, comparison scoring, empty state, previews and copy. Strict v2 replay and calendar export remain unavailable for recurrence. Development schedule cases now resolve 4/5; multiple groups remain an abstention.
- [x] Verified 382 tests, static checks and build. Browser at 320px: bounded weekly reminder, excluded date, complete range endpoints, no overflow, keyboard copy with instrumented content readback, disabled empty-preview copy and DST-error removal of stale results. Copy preserves the source rule, timezone and preview boundaries. No physical-device or export-validation claim.
- [ ] Broader recurrence families, occurrence-level clarification and independent calendar-export checks remain open.

## Finite weekday groups — local implementation

- [x] Added complete multi-day/multi-range collections with event and per-group absolute source spans. All text must be consumed; invalid, duplicate or ambiguous intervals prevent partial success. Each range occurs once in source order; no implicit recurrence.
- [x] Shared the occurrence preview component across collections and weekly schedules. Preview/copy preserves every endpoint and labels finite ranges as not repeating. Strict API v2 remains unchanged; no calendar export added.
- [x] Fixed a regression caught by protected tests: the group recognizer must leave single ranges to the interval resolver, retaining equal-endpoint clarification. Verified 399 tests, static checks, build and diff whitespace. All five inspected development schedule fixtures pass; no general accuracy claim.
- [x] Browser at 320px: all three ranges and event label, overnight endpoint, no overflow, keyboard copy with instrumented readback, and removal of stale results after an unsupported exception. Physical-device evidence remains open.
- [ ] Next: broaden declared language/recurrence coverage and finish recovery, export, supported SDK and independent evaluation gates. Changes remain local; no push or deployment.

## TypeScript SDK — local package candidate

- [x] Added private `@tempus-date/core` 0.1.0 candidate with ESM and declarations, single/batch/reusable parsing, immutable limits, preserved input/context and context-bound clarification. Invalid argument types and sparse batches are rejected; unresolved language remains structured. Package naming is provisional; nothing is published.
- [x] Explicit `.js` imports make the pure core usable outside a bundler. Added workspace links and SDK build before repository checks, so clean installs can resolve example types. The package has only the pinned Temporal runtime dependency; no app framework, model or network requirement.
- [x] Verified the final tarball in a separate consumer: Node 26.8.1 assertions, strict NodeNext declaration checks, Chrome 150 keyboard clarification/input preservation/edit invalidation, and local Wrangler 4.131.1 Worker recurrence output with exact endpoints. Browser group/error checks also passed before the final argument-validation tightening. At 320px, no horizontal overflow. These are desktop/emulated checks, not physical-phone evidence.
- [x] Final tarball SHA-256: `0449b896767a104cdc78144b7b9962608e84dde5e1ee4a4ea7d051a66d2707cb`. Reproduction instructions live in `examples/sdk/README.md`; local artifacts are ignored. All 403 tests, formatting, lint/types and app build pass. The app bundle remains 553.10 kB / 168.32 kB gzip with its existing size warning.
- [ ] Next: finish interval/occurrence recovery and declared schedule coverage; validate calendar export independently. SDK release gates still include Node minimum-version/Safari/physical-device coverage, package performance, independent evaluation and publication approval. No push, deployment, cloud change or superiority claim.

## Equal-clock ranges — explicit next-date confirmation

- [x] Single ranges with matching clocks now offer a named next-date endpoint, requiring selection. Both endpoints must resolve before offering it. Positive interval duration remains required; a user who means a single instant can edit to a point.
- [x] Original input/event spans, timed classification and strict API v2 rejection are preserved. Choices expire when input/reference/timezone changes. Calendar-day semantics cover 23-, 24- and 25-hour intervals; no silent 24-hour assumption.
- [x] Verified 412 tests, formatting, lint/types and build. Browser at 320px verified keyboard confirmation, result focus, complete DST-changing endpoints, preserved reminder text and no overflow. Existing app chunk warning remains: 554.00 kB / 168.59 kB gzip.
- [ ] DST choices inside interval endpoints and recurring occurrences, broader schedules, export and independent evaluation remain open. No push, publication, deployment or cloud changes. SDK source includes this improvement; the preceding packed-artifact hash describes the earlier SDK milestone, not this newer source.

## Multi-weekday recurrence — local implementation

- [x] Weekly rules accept one to seven distinct full weekday names joined by commas or `and`, with a shared clock/range. All selected days appear chronologically; preview limits count total occurrences. Duplicate weekdays and unsupported qualifiers prevent partial success.
- [x] Bounds, excluded start dates, overnight endpoints and local clocks across DST retain their semantics. An ambiguous occurrence still prevents a partial preview. The unpublished SDK rule now uses sorted ISO `weekdays` instead of singular `weekday`; documented as a candidate type change.
- [x] Verified 426 tests, formatting, lint/types and build. Browser at 320px: complete bounded reminder preview, excluded date, overnight endpoints, preserved text, no overflow, keyboard copy with instrumented content readback, and removal of stale results for unsupported exclusions. Fixed the misleading calculator error for unsupported recurrence exclusions. Client is 554.60 kB / 168.83 kB gzip; existing size warning remains.
- [ ] Broader recurrence frequencies, differing clocks per weekday, endpoint/occurrence clarification, validated export, runtime/device coverage and independent comparison gates remain open. No publication, push, deployment or cloud changes; the earlier packed SDK artifact does not contain this later source change.

## Desktop CPU performance — reproducible pilot

- [x] Added `pnpm benchmark:cpu`: five fresh processes per engine, alternating order; import/initialization/first result, warm single and 10/100 batches, raw timing samples, GC memory snapshots and matched esbuild integration bundles. Records environment, versions, hashes, exact preview checks and workload; generated artifacts stay ignored locally.
- [x] Comparator verification caught ISO offset formatting being mistaken for different instants; fixed it and added checks for equivalent offsets, actual time differences, missing/extra endpoints, recurrence flags and sub-millisecond differences before recording the baseline.
- [x] Corrected pilot on Apple M4 Pro / Node 26.8.1: both match all four repeatedly sampled development cases. Tempus/gpu-time CPU median warm calls: 0.353/0.194 ms; batch 100: 49.044/10.664 ms; gzip bundles: 58,706/52,903 bytes. Results favor gpu-time CPU here. Memory snapshots also favor gpu-time but do not isolate allocation causes or peak memory.
- [x] Updated matrix and comparison docs with methods, results and limits. Formatting, lint/types and benchmark verifier pass. This does not change parser behavior, independently validate accuracy, or measure phones/browser runtime/GPU.
- [ ] Next performance work: profile calendar evaluation/repeated parsing while preserving behavior. Device measurements and claim-specific budgets remain open alongside recovery, broader scheduling, export and independent evaluation. No external publication or deployment.

## Profile-guided timezone validation cache

- [x] Profiled the built SDK, then instrumented formatter construction: 1,800 `Intl.DateTimeFormat` constructions for 400 mixed inputs. Most repeat the same formatting-support check. Profile/probe artifacts are in the task scratch directory, not source control.
- [x] Added a bounded 64-string cache of successful timezone validation. No input/result cache; every reference, calendar calculation, DST decision and trace still resolves normally. Constructor probe drops to two calls.
- [x] Verified 427 tests, static checks and build. All 26 comparison cases retain identical Tempus raw results, traces and diagnostics. Tests exercise zone churn beyond the bound, invalid zones, changed references and DST ambiguity.
- [x] Repeated CPU pilot: median Tempus batch-100 improves from 49.044 to 38.316 ms; gpu-time remains faster at 10.797 ms. Archived the post-change raw run; bundle grows by 43 gzip bytes. This is a scoped local improvement, not competitive parity.
- [ ] The full matrix remains open: broader scheduling/recovery, independently validated export, supported runtime/device coverage and independent evidence. No push, publication, deployment or cloud change.

## Calendar export — internal finite-file preparation

- [x] Added deterministic internal file preparation for explicitly classified points, intervals and finite collections. Requires UUID/title/creation metadata; no clock read, network, download or calendar write. Recurrence and unresolved values return no file.
- [x] Preserves timed UTC instants and exclusive civil all-day ends, retains source/timezone/assumptions, rejects sub-second event precision and validates text/metadata. CRLF and UTF-8 line folding preserve Unicode; escaped user text cannot add calendar properties.
- [x] Added ical.js 2.2.1 as a pinned development-only independent reader. Tests cover points, all-day/DST/overnight ranges, complete collections, repeated-clock selection, Unicode/punctuation, unresolved/recurrence rejection and invalid metadata.
- [x] Verified 445 tests, formatting, lint/types and build. App bundle is unchanged because file preparation is not wired into the UI or public SDK yet.
- [ ] Next: preserve point precision explicitly, implement current-result export UX, validate complete recurring rules/timezones and obtain actual calendar-client import evidence. Internal preparation is not a completed export feature. No public SDK export API, UI button, calendar write, publication or deployment was added.

## Point precision — interpretation and preview

- [x] Added date/time precision and clock provenance to interpreted points. Distinguishes an omitted clock from explicit midnight, inherited reference time, and sub-day arithmetic. Date-only calendar operations remain dates when no clock is introduced. Numeric, DST and correction choices retain the selected precision; strict calculator/API v2 output is unchanged.
- [x] Point preview and copied text now identify date-only input instead of suggesting a requested midnight appointment. Explicit midnight still displays and copies its clock/offset. Internal calendar preparation still requires an explicit point representation; no write is implied.
- [x] Verified 462 tests, formatting, lint/types and build. Browser at 320px: date-only versus midnight, keyboard copy with instrumented readback, retained input and no overflow. Client: 555.22 kB / 169.05 kB gzip; existing size warning remains.
- [ ] Next: complete current-interpretation export UX and recurrence/timezone validation, then actual calendar-client import. Broader schedules/recovery, supported device/runtime coverage and independent evaluation remain open. No push, publication, deployment or calendar write.

## Multiword reminder labels — local implementation

- [x] Replaced the one-word target limit with multiword labels containing letters, spaces, apostrophes and hyphens. Full original spans survive points, intervals, weekly recurrence, finite groups and numeric clarification. The first recognized temporal marker starts the mandatory complete date suffix.
- [x] Regression review found `weekly on Monday` could become label text plus a single Monday. Added cadence, boundary and written-number markers and negative cases for recurrence/conditions; no failed temporal prefix is skipped in favor of a later date. The prior Sam Jones rejection was explicitly replaced by positive complete-label coverage; semantic rejection tests remain.
- [x] Browser at 320px verified a full Jo O’Brien recurring reminder, all preview rows, keyboard copy via instrumented readback and removal of the old result on an unsupported weekly phrase. No overflow or browser errors observed. This is emulation, not a physical-phone test.
- [x] Verified 491 tests, formatting, lint/types and build. Client: 556.13 kB / 169.44 kB gzip; existing size warning remains.
- [ ] Unsupported cadence phrases still receive calculator-style guidance; improve that recovery alongside cadence support. Numeric targets, date-like names and broader prose remain unresolved/unsupported; this is not a general event-text extractor. Export, remaining recovery/recurrence families, runtime/device evidence and independent comparison gates remain open. No push, publication, deployment or calendar write.

## Daily, weekday and weekend recurrence

- [x] Added `daily`, `every day`, `every weekday`, `every weekend` and `weekly on <weekday list>` with shared explicit clocks/ranges. Uses the existing weekday-set resolver, preserving bounds, exclusions, overnight endpoints and local-clock DST behavior. Original source spans and reminder labels remain intact.
- [x] Bare supported cadence forms ask what time should repeat rather than creating a point or assuming midnight. Weekdays are explicitly Monday–Friday and weekends Saturday/Sunday; resolved repeat days appear in preview and copy. Every-N and all-day recurrence remain open.
- [x] Replaced the old `daily at noon` rejection with complete recurrence assertions, including reminder exclusions. Verified 507 tests, formatting, lint/types and build. At 320px, browser checks cover missing-clock recovery through editing, complete weekday range preview, keyboard copy via instrumented readback, and removal of stale results on an ambiguous daily occurrence. No overflow or browser errors observed.
- [ ] Calendar export/actual-client validation, occurrence/endpoint choices, broader frequencies, runtime/device evidence and independent evaluation remain open. Client is 557.06 kB / 169.78 kB gzip with the existing warning. No push, publication, deployment or calendar write.

## Single-range DST recovery — verified locally

- [x] Added separate start/end clock decisions, preserved decision history and original event text, and provided Restart choices. Equal-clock next-date confirmation remains a separate decision.
- [x] The written range fixes its date structure before replacement clocks are chosen. Reversed selected instants remain unresolved; no silent overnight conversion. Tests include both repeated endpoints, skipped clocks, overnight destination ambiguity and Apia's skipped civil date. Arithmetic and occurrence ambiguity remain unresolved.
- [x] Verified 515 tests, formatting, lint/types, SDK build and app build. Independent ical.js readback preserves both selected interval instants. Browser at 320px verified keyboard selection, reversed-result recovery, restart, result/error focus, preserved reminder text and stale-choice reset after editing; no overflow or browser errors observed.
- [ ] Next: recurring-occurrence recovery and current-result finite export UX, followed by calendar-client validation. Broader recurrence, current packed SDK/runtime coverage, physical devices and independent holdout/user evaluation remain open. App client is 558.91 kB / 170.31 kB gzip with the existing size warning. No push, publication, deployment, cloud change or calendar write.

## Finite calendar download — local UI candidate

- [x] Added an optional export disclosure for resolved points/ranges/finite collections, representation explanation, editable title and explicit .ics download. Date-only versus timed intent is retained; no duration, recurrence or reminder is invented. No network request or calendar write.
- [x] Export state resets on input/context/interpretation changes. Unresolved values and recurring previews have no export action. Whitespace titles disable download; file preparation/download errors leave the input available for retry.
- [x] Verified 515 tests, formatting, lint/types, SDK and app builds. At 320px, keyboard disclosure/download, all-day and timed Blob contents, whitespace-title validation, stale-result removal and injected download failure passed. No overflow or browser errors. Browser download contents were instrumented; actual calendar import and physical-device behavior are not proven.
- [ ] Before release: independently inspect imports in a real calendar client with explicit write authorization. Recurring export/occurrence recovery, broader input families, current packed SDK compatibility and independent device/accuracy evidence remain open. Client: 563.90 kB / 172.12 kB gzip; existing chunk warning remains. All work stays local.

## Export preview audit — verified locally

- [x] Found and closed a preview mismatch: arithmetic seconds were preserved in the file but absent from the minute-only summary. The export disclosure now lists every complete event with full dates, seconds/milliseconds, timezone and offset, independent of display preferences.
- [x] Added independent-reader checks for whole-second arithmetic and supported all-day year boundaries, plus rejection when a local date's UTC instant exceeds the export year range. Corrected the test oracle to compare parsed year fields because ical.js displays year 0001 without padding; the file's four-digit date is also asserted.
- [x] Verified 519 tests, formatting, lint/types and builds. Browser at 320px verified keyboard export disclosure, all three finite events with overnight end, visible seconds/milliseconds and fractional-second refusal; no overflow. Final client 564.83 kB / 172.33 kB gzip, with existing chunk warning.
- [ ] Next remains recurring-occurrence recovery and independently validated recurring export. Actual calendar import, physical-device evidence, broader input coverage, supported packed SDK runtimes and independent evaluation remain open. No push, deployment, publication or calendar write.

## Recurring-occurrence DST recovery — local implementation

- [x] Added choices bound to the requested occurrence date and start/end endpoint. Repeated clocks and skipped-clock replacements preserve all other occurrences' local clocks. Range choices must yield a positive interval; excluded dates do not prompt.
- [x] The unpublished rule records optional `clockOverrides` for validated decisions in the preview/lookahead. These are not defaults for unseen transitions. Original source/event text, context-bound decision history and preview-only export rejection remain intact. Selected point traces identify the explicit occurrence.
- [x] App shows/copies selected exceptions and offers Change clock choices with error focus. Corrected finite-collection copy that incorrectly said calendar export was unavailable. Verified 524 tests, formatting, lint/types and builds. At 320px, keyboard selection, complete reminder preview, copied decisions through instrumentation, restart/input retention and focus passed; no overflow or browser errors.
- [ ] Next: independently validated recurring export, finite-group and broader conflict recovery, remaining schedule frequencies and input coverage. Actual calendar imports, physical devices, supported packed SDK verification and independent evaluation remain open. Client 566.88 kB / 172.85 kB gzip with existing size warning. All changes remain local; no publication, deployment or calendar write.

## Finite-group DST recovery and journey verification

- Added range-specific endpoint choices, retained all ranges/source spans, and bounded decision history at 32 across interpreter and SDK. Ten sequential choices now complete through the SDK; the previous eight-history limit could not. Equal-clock next-date group confirmation remains open.
- Verified 528 tests, formatting, lint/types and builds. Independent ical.js readback preserves both selected and unchanged ranges. Browser at 320px completed reminder input → repeated-clock choice → two-event preview → keyboard file download. A controlled October 31 reference was injected for this journey and the native clock restored. Blob instrumentation confirmed exact endpoints/title/decision text; no calendar import occurred. Client 567.73 kB / 173.00 kB gzip with existing warning.
- User direction: finish current clarification and prioritize complete journeys, export validation, current packed SDK runtime verification and a consolidated release checklist. No comparative superiority claim; all work remains local.

## Status before current SDK checklist consolidation

# Tempus release work

## Objective

Keep the existing [product matrix](docs/product-matrix.md) as the acceptance contract: reliable original calculator plus short-English reminder/schedule interpretation, usable web flows and a supported TypeScript package. Work stays local.

## Current priorities

1. [ ] Continue the [journey verification](docs/release-verification.md): calculator/correction/finite-file tasks pass in scoped checks; bounded repeating schedule → file passes; fixed-future-offset unbounded rule → real download passes; future-DST rules and calendar import remain incomplete. Failure/retry/Clear/boundary recovery checked; natural suffix-duration reminder now resolves; numeric-date-plus-duration and chained DST recovery now pass.
2. [ ] Finish calendar export. Finite files and fixed-future-offset rules are implemented and independently read; future-DST rules and real calendar-client import remain incomplete. Calendar writes require authorization.
3. [ ] Refresh the SDK after arithmetic clarification. Preceding archive `20a1fd98…` passes its recorded runtime checks, but does not include this interpreter change. Preserve those reports; add the new arithmetic journeys to the next installed-package verification.
4. [x] Consolidated the matrix and release checklist in place. Historical matrix updates are archived; acceptance rows, requirement cells, milestone exits and comparative-claim rules were checked unchanged. Stale packed-runtime checkmarks are reopened. Missing access/evaluation now has explicit unblock actions.

## Current evidence

- Current suite: 693 pass and one explicitly expected reader-conversion failure; formatting/lint/type checks and build pass. Client 882.69 kB / 260.14 kB gzip with the existing chunk warning.
- DST choices now cover points, single ranges, recurring occurrences, finite-group endpoints and arithmetic calendar steps. Arithmetic choices resume remaining operations, preserve trace and reject stale selections. Repeated/skipped clocks and chained ambiguity pass source checks; broader fractional-step cases and keyboard/mobile/export journeys remain open.
- 320px desktop-browser journey verified a reminder with two ranges through correction and file download; Blob inspection and independent ical.js tests verify file contents. This is neither physical-phone evidence nor calendar-client import evidence.
- Development-v3 has 31 inspected cases; five additions cover recent duration/recovery journeys. Current packed four-case desktop CPU measurements still favor gpu-time (batch 100 p50 10.661 ms vs Tempus 28.546 ms; gzip bundle 52,903 vs 141,808 bytes). These are development evidence. Three scripted correction-to-file tasks now record every stage separately. The September 12 registry refresh confirms gpu-time 0.2.1 is still latest. None of this establishes population accuracy or superiority.

## Boundaries and next action

No push, publication, deployment, cloud mutation or calendar write without authorization. Bounded recurrence sets and fixed-future-offset unbounded rules are implemented locally; future-DST rules and real calendar imports remain incomplete.

Next actions:

- Pinned timezone calculation, schedule choices, date boundaries, bounded timezone generation and display/API formatting are integrated. Yellowknife reminder → API → file passes; the browser displays noon–1 PM at GMT−06:00. New unresolved-history errors are explicit. Current packed runtime checks pass in their documented scope. Next: complete keyboard correction/export journeys, unbounded rules and browser/device loading measurements. Screenshot capture was cancelled after stalling; no new screenshot evidence is claimed.
- Continue unbounded export for zones with future clock changes. Fixed-future-offset rules now preserve weekday shifts, exceptions, points and interval durations with no invented end date. Tokyo browser download and edit recovery pass. The known recurring-DTEND reader failure still affects the unresolved zoned-rule strategy.
- Future start-clock preflight now checks recorded transitions and a complete Gregorian cycle after the last exception/cutover. Export errors identify the first conflicting local clock beyond the preview. Seven cases cover repeats, gaps, exceptions, skipped dates and a still-upcoming repeated clock after transition. No-conflict results do not validate interval duration or enable the remaining export path.
- Ongoing zoned point export is now enabled when start-clock preflight passes and the pinned timezone definition can be serialized. Chicago noon → DST/exclusion → actual browser download passes both readers; edit invalidation passes. No UNTIL/COUNT or duration is invented. Future-clock conflicts and zoned intervals remain blocked; actual calendar import remains unverified.
- Locked second-reader replay now checks both the generated ongoing Tokyo fixture and the captured download, including an exact 2048 occurrence beyond 1,000 weeks. Both pass; strict rule conformance still exits 1 for the separate DST-duration fixture. Future timezone-rule conversion must handle negative and greater-than-24-hour transition times without changing their dates.
- Future transition-date conversion now covers all 29 distinct date rules in the pinned DST footers across a 400-year Gregorian cycle using independent ICAL expansion. Initial negative month-day lists failed reader checks; ordinal weekdays/positive windows pass. Not connected to exports yet: historical cutover, offsets, future gap/repeat decisions and duration semantics remain to implement and verify.
- Internal ongoing VTIMEZONE now joins recorded changes to explicit future rules. Eight-zone checks cover seasonal values and exact transition offsets in five sampled years through 2400. A separate ICAL UTC-to-local conversion failure is retained as an expected failure. Export integration, broader timezone coverage, a second reader and future-clock/duration policy remain open.
- Second-reader replay now checks generated timezone bytes with TZID substitution disabled. Daylight designation and preceding-cycle fixes bring seven of eight files through; Casablanca negative-DST mismatches remain and the command exits 1. Exact checkpoints/failures are retained. The separate ICAL conversion failure persists. Do not enable this candidate until those interoperability and history-coverage gaps are resolved.
- Casablanca isolation: Python ZoneInfo reading hash-verified pinned TZif files agrees on all 448 expected checkpoints. The calendar reader's seven mismatches retain local-fold candidates and incorrect UTC round trips. This narrows the failure to interoperability after source validation; it does not authorize enabling export. Next investigate event-level recurrence behavior and a faithful client-compatible representation, preserving these failures.
- Event probes now confirm both readers preserve noon reminders/exclusions but fail a two-hour elapsed reminder across Chicago spring DST even with DURATION:PT2H. Source fixtures and exact endpoints retained; commands exit 1. Do not replace the previous DTEND strategy with DURATION and call the duration gap fixed. Next: resolve event semantics/client compatibility and explicit future-clock policy before export integration.
- Continue complete-journey and declared input-family gaps. Keep the original calculator and strict API behavior protected; do not substitute rejection for completion.
- Arithmetic reminder → clock correction → final point → file now passes scripted two-reader checks and an actual desktop-browser download. Keyboard selection/export review passes; the download tool activated the final button. Fractional-day remainder checks pass. Conflicting answers for one arithmetic clock now remain unresolved. Physical-device, calendar import and refreshed SDK evidence remain open.
- Conflict recovery initially trapped callers because selecting an answer retained both conflicting IDs. `appendSelection` now replaces that arithmetic answer and clears later arithmetic choices. Regression proves recovery and re-questioning after an earlier answer changes. SDK example includes the recovery assertion; README/contract no longer incorrectly say arithmetic choices are unsupported.
- Current archive: `ongoing-metadata/tempus-date-core-0.1.0.tgz`, SHA-256 `20a1fd980d43a90183e84fa437b4e16273b8268ae5e48a7b455a28fe7ff407f0`. See release verification for its absolute path and scoped evidence. Performance figures above belong to the preserved preceding archive.
- Keep calendar imports, physical-device evidence and independent evaluation open. The disposable local import request remains unanswered; no calendar write is authorized.

Historical milestone evidence is preserved in [task-history.md](task-history.md). Current export details and remaining gates are in [calendar export](docs/calendar-export.md) and [release verification](docs/release-verification.md).

Ongoing workday milestone: zoned intervals now export only when neither endpoint is ambiguous and no occurrence contains an offset change across recorded transitions/the checked future cycle. Chicago Monday 9–5 with exclusion passes actual download and both readers. Sunday midnight–4 remains blocked. Next: explicit future-clock policy and faithful exports for intervals spanning changes; SDK refresh remains pending.

## Archived delivery record before engine-first consolidation

Historical authority and artifact statements below do not authorize current external actions.

Deliver Tempus as a natural-language-to-date system and coherent web playground, with RedwoodSDK routes. Preserve the [product matrix](docs/product-matrix.md), correctness, complete journeys, resource efficiency and independent evaluation requirements. User authorized deployment after testing. No calendar writes, SDK publication or unrelated cloud changes. Preserve unrelated Rust-spike work.

## Current result

- [x] Run one calculation, one ambiguous reminder and one finite recurring schedule in the current local app and packed SDK b1cbd22a.
- [x] Check calculation trace/copy/API parity, reminder correction, finite file outputs and edit invalidation. Six downloaded/generated files pass separate date/title/duration/expansion checks after correcting a reader assumption; the failed attempt is retained.
- [x] Consolidate the backlog into five problems and recommend a calculator-first preview with explicit limitations in the [release checklist](docs/release-checklist.md).
- [x] Preserve historical reports and matrix requirements. No implementation changes made for this assessment.

## Five priorities — paused for review

1. Coherent release candidate, accurate claims/privacy and package compatibility contract.
2. Independent complete-task and correction evaluation.
3. Calendar-client usefulness, faithful export and unresolved ongoing policies.
4. Physical-device and accessibility completion.
5. Final-candidate resource containment and device/energy evidence.

The checklist contains the exact three inputs, observed results, failures, proposed scope and blockers. Older records remain in its retained evidence section, [task history](task-history.md) and existing evidence directories. Narrow authored desktop checks do not establish overall superiority, independent usability, physical-phone behavior or actual imports.

## Active delivery

- [x] Read RedwoodSDK, Product Wrangler, Laws of UX, Writer and I Have ADHD guidance; preserve the date-system product boundary.
- [x] Inspect Cloudflare target and record rollback version d28852a9-a777-4bec-b023-3789001583f3. Source backup and before image are in ~/Documents/Codex/2026-09-13-tempus-redwood.
- [x] Finish RedwoodSDK web shell and coherent phrase → clarification → interpretation → output experience.
- [x] Replay three journeys, cold start, navigation, keyboard and responsive states against the production build. Check privacy, headers, local parsing and API boundary.
- [x] Deploy tested artifact to existing tempus-total Worker, verify the live site, and report remaining limitations.

Primary surface: / playground, /developers integration guide, /privacy and existing /api/parse. No accounts, reminder delivery, storage or parser expansion. Browser verification uses disposable local input; API replay is explicit. No remote data bindings beyond the existing API rate limiter. Three selected lenses: Mental Model, Hick's Law and Law of Proximity. Existing engine/SDK tests and previous three-journey reports are the baseline; framework migration must preserve their outcomes.

Alternative considered: an SDK-only product. The user's request for a usable deployed website supports an interactive playground plus integration guide; the SDK remains the underlying integration surface. Confidence is high because the user explicitly corrected the calendar-app direction.

## Delivered

Version `70cab9dd-44af-424b-b92a-08a5b239fda0` is live on both existing hostnames. Three production journeys and four file readbacks pass; local cross-browser and cold-start checks pass. The [release checklist](docs/release-checklist.md) records the exact scope and rollback version. Whole-repository formatting, physical devices, independent evaluation and package publication remain outside this completed web pass. No additional implementation is queued automatically.

## Complete schedule copying

- [x] Replace three-date clipboard previews with complete bounded output, retaining count/exclusion and DST policies. Text, Markdown and full JSON require no added dependency.
- [x] Share recurrence clock decisions between copy and calendar-file preparation. Reset results when input or context changes; paginate display only; expose full output if clipboard access fails.
- [x] Production build, scoped lint and 52 targeted tests pass. Chrome, Firefox and WebKit replay five-date copying in all formats, 1,000-date copying, future clock correction, shared file decisions, edit reset, open-ended labeling, clipboard denial and desktop widths 320/390/1440. Chrome uses real clipboard permission; Firefox/WebKit clipboard writes are stubbed. One browser assertion initially matched an unrelated group and was narrowed to its accessible name.
- [x] Deployed `05e260e4-5f06-4242-b4d0-d01a0c869838`; all three browser journeys pass on the live custom domain. Rollback: `70cab9dd-44af-424b-b92a-08a5b239fda0`.

Evidence: ~/Documents/Codex/2026-09-13-tempus-complete-copy. No physical-device test or actual calendar-client import is claimed. No SDK publication or Git push.

## Black-box dogfood follow-up

- [x] Run a deployed-site dogfood pass across more than 100 distinct phrases, complete output, recurrence, ambiguity, ranges, timezone/DST, copy, calendar download, API boundaries, offline behavior, navigation, 320px layout, keyboard semantics, accessibility and one desktop performance observation.
- [x] Record ten reproducible findings in the [dogfood report](docs/dogfood-2026-09-13.md): nine medium, one low, no confirmed high or critical issues. Screenshots, videos and raw browser output remain in the local review archive.
- [x] Validate a downloaded five-occurrence file with an independent iCalendar reader. This is file validation, not calendar-client import evidence.
- [ ] Triage and fix findings in a later implementation pass. Highest product priority: cross-week weekday ranges; broadest problem: narrow natural-language variants paired with unrelated recovery messages.

No product code was changed during this audit. Physical phones, real calendar clients, assistive technology and independent users remain untested. The agent-browser daemon was repaired separately by configuring its verified installed Chrome runtime.

## Format preview follow-up

- [x] Add an initially visible, collapsible output preview next to format selection. Show exact clipboard text, Markdown source or formatted JSON using a native read-only viewer; no dependency or HTML execution. Keep the full data scrollable and manually selectable.
- [x] Verified preview/copy equality, format changes, 1,000-date output, pending choices, keyboard access (WebKit uses Option-Tab), responsive widths and clipboard-denial reopening in Chrome/Firefox/WebKit locally and live. Build and scoped lint pass. Deployed `53bb72bd-bb30-47fa-a363-e27f07739708`; rollback `05e260e4-5f06-4242-b4d0-d01a0c869838`. Native read-only viewer visually checked at 390px. Physical-phone testing remains unverified.

## Pretty-print follow-up

- [x] Replace the textarea with a keyboard-focusable code viewer. JSON retains indentation and uses syntax colors; source strings render as React text, never HTML. Long code lines scroll inside the viewer. Datasets over 100,000 characters retain complete formatted output without syntax spans.
- [x] Build, scoped lint, preview/copy equality and existing complete-output browser journeys pass locally in Chrome, Firefox and WebKit. Visually inspected the 390px JSON preview. Desktop keyboard access uses Option-Tab in WebKit.
- [x] Deployed `cb3fc196-18f6-455e-85b8-acb087157130`; all three browser replays pass on the live site, including exact preview/copy equality and syntax highlighting. Rollback: `53bb72bd-bb30-47fa-a363-e27f07739708`.

## Public release closeout

- [x] Publish the source, SDK preview, product matrix, dogfood findings and retained evidence to the public GitHub repository. Keep the SDK package private and unpublished until its compatibility contract is final.
- [x] Pass full formatting, lint, type checks, 1,015 tests plus one expected failure, production build, dependency audit, packed-file inspection, 99 evidence manifests and Cloudflare dry run.
- [x] Correct the calendar-reader test that depended on the host timezone. Its all-day file assertions now compare calendar dates; the focused test passes under `TZ=UTC`, and GitHub CI passes on Linux.
- [x] Deploy Cloudflare version `69c24d73-8e0f-4296-914e-5aa27f50380b`. Both hostnames return the expected routes, headers and fixed-reference API result. The live browser resolves all five dates, shows complete pretty JSON, reports copy success and logs no warnings or errors.

Remaining evidence gaps stay open: physical phones, actual calendar-client imports, assistive-technology sessions, energy measurements and independently authored user evaluation.
