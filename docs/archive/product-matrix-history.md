# Archived matrix snapshot

Preserved before status consolidation. Statements below describe earlier milestones and may conflict with current implementation. Use [the current matrix](../product-matrix.md), [release checklist](../release-checklist.md) and [verification log](release-verification.md) for current status. Acceptance requirements remain in the current matrix.

# Tempus product matrix

Tempus should make short English scheduling input easy to understand, correct and use. It also needs a usable library if we want developers to choose it over gpu-time. A better calculator interface alone does not replace a scheduling parser.

**Status: product requirements defined; competitive superiority not established.** This is the working acceptance matrix, not a list of completed features. Tempus remains a working name.

## Baseline and scope

Reviewed September 12, 2026 against Tempus `d91a7ca` plus the local implementation recorded in `tasks.md` and gpu-time's [0.2.1 source](https://github.com/arikchakma/gpu-time/tree/aba27e54aabe7310cba5c160fa2079045096ffb1). Our [local comparison](../../comparison/README.md) now runs **gpu-time 0.2.1**. Historical 0.2.0 results are retained separately.

The newer release reports fixing the `set OOO for 3 days from today` duration regression. It also records remaining duration and clock-with-place gaps. Our refreshed runner still observes the same incorrect duration point under its fixed context; it does not reproduce that reported fix. Correct-result counts are unchanged from 0.2.0, while one incorrect arithmetic answer becomes an abstention. Historical reports are preserved; see the comparison notes for the versioned corpus policy change.

| User job                                      | Required outcome                                                          | Fair comparison                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Enter a reminder or schedule in short English | Inspect the full interpretation, correct it, then copy or export it       | Same inputs, context and output semantics; measure the whole task in equivalent interfaces                     |
| Add date recognition to an application        | Install a package and obtain typed points, intervals or schedules locally | Library against library, including runtime support, limits, bundle cost and integration effort                 |
| Calculate a date through several operations   | Get a reproducible answer with an inspectable explanation                 | Preserve Tempus arithmetic; describe this as an additional capability, not proof of better schedule extraction |

English reminder fields, schedule forms and command bars are the initial scope. Arbitrary documents, other languages and consequential scheduling are not promised. Do not add GPU processing or rewrite the language/framework without a measured constraint.

## Capability matrix

“Partial” means a bounded implementation exists. “Missing” means the product capability is absent. “Unmeasured” means we have no adequate comparative evidence. Competitor capabilities below are documented upstream unless a local result is explicitly given.

| Area                             | gpu-time baseline                                                                                | Tempus today                                                                                                                                                                                                                                                                                         | Requirement                                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **INPUT — Recognition**          | Short English dates, ranges and recurrence; coverage has documented gaps                         | **Partial:** selected sentences, points, intervals, finite weekday groups and bounded daily, weekday/weekend and multi-weekday recurrence; source/event spans retained; multiword reminder labels supported within a conservative temporal-boundary grammar                                          | Cover the same declared input families. Preserve the original text and remaining event text. Account for every date, duration, condition and correction instead of silently dropping them |
| **CORRECTNESS — Interpretation** | Neural token recognition followed by TypeScript calendar resolution                              | **Partial:** strict evaluator plus conservative sentence rules; rejection tests, no independent language evaluation                                                                                                                                                                                  | Separate recognition from resolution. Validate the complete candidate; distinguish unsupported input, no expression and ambiguity. Publish calendar policies and policy disagreements     |
| **MATH — Calendar arithmetic**   | Resolves timezone, DST and calendar values after recognition                                     | **Present within documented grammar:** ordered operations, fractions, clamping, DST policy and trace                                                                                                                                                                                                 | Preserve existing behavior while adding intervals and schedules. Make assumptions and approximations inspectable                                                                          |
| **RECOVERY — Correction**        | Structured diagnostics for the caller to handle                                                  | **Partial:** selectable numeric dates, point and single-range DST clocks, two-clause corrections and next-date confirmation for equal-clock ranges; occurrence-specific DST choices are supported; finite-group DST choices are supported; arithmetic-step and broader conflict recovery remain open | Ask one concrete question at a time, retain the input, and resolve the selected alternative without requiring the user to reconstruct the request                                         |
| **UX — Complete the task**       | Library and demonstration interface                                                              | **Partial:** complete point/range/occurrence previews and copy, retained event text and keyboard clarification; finite-file download implemented locally, calendar-client import unverified                                                                                                          | Add interval and recurrence previews, correction and export. Keep the next action obvious; put optional explanation behind disclosures                                                    |
| **DX — Integration**             | Parse, batch and reusable parser APIs; CPU/WebGPU; occurrences, recurrence rules and diagnostics | **Local candidate:** versioned ESM/types, single/batch/reusable APIs and packed Node/browser/Worker examples; supported release and device coverage remain open                                                                                                                                      | Publish a versioned package with discriminated outcomes, batch calls, browser/Node/Worker support, limits and a runnable integration example                                              |
| **EVIDENCE — Comparison**        | Published model card, development evaluations and limitations                                    | **Partial:** 26 inspected development cases; no untouched holdout or user study; finite-file independent-reader validation only                                                                                                                                                                      | Reproducible, versioned, per-family evaluation with independent expected answers; report failures, abstentions and task completion together                                               |
| **PERF — Ordinary devices**      | Local CPU/WebGPU; automatic routing favors CPU for smaller workloads                             | **Desktop pilot:** gpu-time CPU is faster and smaller on four shared development cases; phone/browser/GPU performance remains unmeasured                                                                                                                                                             | Measure cold and warm single-input work, batches, memory and transfer size on ordinary phones and browsers before choosing acceleration                                                   |
| **TRUST — Use and side effects** | Local inference; model card limits intended use and warns against consequential scheduling       | **Partial:** browser interpretation is local; explicit API replay sends a phrase; no reminder delivery; explicit local finite-file download, no calendar write                                                                                                                                       | Keep parsing side-effect free. Show current interpretation before export or external writes; invalidate approval after an edit. Document limits, privacy and operational boundaries       |

Deterministic calendar math is shared ground: gpu-time already has it. Neither deterministic rules nor a neural model guarantee correct intent recognition. Highlighting words explains what the parser used; it does not prove the interpretation is right.

Numeric date-order clarification now offers named alternatives, preserves input and binds choices to the original context. Complete two-clause corrections now offer keep/replace choices for points and intervals. Point clock ambiguity now offers explicit repeated-time offsets or replacement times for a gap, including a numeric-date decision followed by a clock decision. Ambiguous interval endpoints, arithmetic steps and other chained decisions remain incomplete.

## Acceptance gates

Weekly recurrence now reaches interpretation and the app with explicit boundaries, exceptions, complete previews and copy. The broad recurrence gate remains open: additional frequencies, broader conflict recovery and validated export are unfinished. See the [weekly preview contract](../schedule-contract.md#weekly-preview-contract).

Interval interpretation and browser previews now cover explicit clock ranges and integer day/week/hour/minute durations, with retained event/source text and complete range copy. All five development schedule cases resolve, including finite weekday groups. This does not close broad language or recurrence coverage. Recurrence, multiple groups, time/correction clarification and export remain open, so overall capability status stays partial. See [tasks.md](tasks.md).

These are **requirements for future work**, not achieved results. Each implementation should name its matrix IDs and attach evidence. A passing development corpus permits a bounded feature release; it does not permit a general accuracy claim.

| Area        | Evidence required to close the capability gap                                                                                                                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INPUT       | Positive, negative and minimally changed contrast cases for each supported family. Check exact source spans and retained event text, including punctuation, names, multiple mentions and trailing qualifiers. Score a lost duration or exception as an incorrect result                                                                        |
| CORRECTNESS | Independently specified expected semantics with fixed reference, timezone and date-order policy. Evaluate negation, correction, uncertainty, DST gaps/folds and conflicting dates. Separate policy disagreement from parser failure; publish both                                                                                              |
| MATH        | Existing protected cases remain correct. Add leap years, month ends, fractional units, written-order contrasts, DST crossings and explicit interval-end semantics. Trace and result must agree; reuse of the same resolver is not an independent oracle                                                                                        |
| RECOVERY    | Actual UI tests for “March 4 or April 3?”, “Which 1:30 AM?” with timezone offsets, and “Did Saturday replace Friday?”. Selecting, changing or cancelling an answer preserves text and produces the right current state. Measure completed corrections, not just returned diagnostics                                                           |
| UX          | Complete input → inspect → correct → copy/export tasks on phone and keyboard. Verify focus, screen-reader labels, 320px layout, empty/error states and stale-result handling. Show all-day versus timed values, timezone, interval endpoints and bounded recurrence previews                                                                   |
| DX          | Install the packed artifact into clean browser, Node and Worker examples. Test single/batch semantic parity, ordering and per-item errors. Document supported versions, input/expansion limits, cancellation or resource lifecycle where relevant, API stability and migration from strict v2                                                  |
| EVIDENCE    | Refresh competitor version; freeze policies and claims before evaluation. Keep training/development inputs separate from a sealed holdout. Publish corpus provenance, raw outputs, versions, hashes, denominators and uncertainty. No aggregate winner that hides weak families                                                                |
| PERF        | Same inputs, output contract, occurrence horizon and runtime on both libraries. Report cold initialization, warm p50/p95 latency, throughput, peak memory and compressed core bundle size separately from full-app assets. Test iOS Safari, Android Chrome and desktop with CPU fallback; record hardware and versions                         |
| TRUST       | No unresolved or stale interpretation can be exported or written externally. Test the edit/confirm/write sequence. Validate calendar exports with an independent reader and calendar import, including timezone, all-day dates, DST, exceptions and truncation. Document network behavior and the remaining hosting/security review separately |

An explicit Export action after viewing a current, resolved preview can be the confirmation. Routine text copying does not need a second approval dialog. Future calendar writes or reminder creation need an explicit action tied to that exact interpretation. The SDK itself performs no external actions; the integration example must demonstrate this boundary.

## What our measurements say

The existing 26-case development corpus contains six date cases, five arithmetic cases, four sentence cases, five schedule cases and six recovery cases. The current interpreter resolves **11/11 date and arithmetic cases, 3/4 sentences and 5/5 schedules**. gpu-time **0.2.0** resolves 6/6 dates, 0/5 arithmetic, 3/4 sentences and 4/5 schedules. These deliberately selected cases do not estimate population accuracy.

On recovery cases, our four correct rejections and two abstentions are not six completed tasks. A library extracting a mentioned date from cancelled text may satisfy a mention-extraction contract while failing our event-creation policy. Report that distinction instead of treating our policy as universal ground truth.

The current recurrence scorer checks three occurrences and the presence of a rule. It does not establish RFC 5545 validity, exception handling or long-horizon correctness. Source: [comparison contract and limitations](../../comparison/README.md), [fixtures](../../comparison/fixtures.ts), [scorer](../../comparison/scoring.ts), [interpreter](../../src/shared/interpret-date.ts).

The comparison refresh is complete locally. The [schedule contract](../schedule-contract.md) now defines the next implementation boundary. Holdout governance and numerical evaluation budgets remain open, so milestone 1 is not fully closed.

## Order of work

| Milestone                               | Work                                                                                                                                                                                    | Exit condition                                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Establish the current comparison** | EVIDENCE, CORRECTNESS: evaluate 0.2.1 without replacing historical results; freeze point/interval/recurrence, locale, DST and intent policies; define claim-specific evaluation budgets | Versioned report and explicit disagreements; independently written development cases for the next milestone; holdout protocol recorded before use |
| **2. Interpret complete schedules**     | INPUT, MATH: intervals and durations first, then bounded recurrence, boundaries and exceptions; retain source/event text                                                                | Complete values or explicit unresolved outcomes; protected arithmetic passes; duration versus offset contrasts and recurrence semantics verified  |
| **3. Resolve and use the result**       | RECOVERY, UX, TRUST: selectable clarification, phone/keyboard previews and independently validated export                                                                               | User can complete correction and export without losing input; unresolved/stale results cannot reach an external action                            |
| **4. Ship the integration contract**    | DX, PERF: extract the proven core into a package, run clean integrations and device benchmarks                                                                                          | Supported runtime matrix passes; documented limits and comparable performance evidence; no network requirement for local parsing                  |
| **5. Evaluate the claim**               | EVIDENCE across all areas: independent holdout and task-completion study                                                                                                                | Publish scoped strengths and failures. Claim improvement only for jobs whose parity, quality and usability gates pass                             |

Evidence collection starts in milestone 1 and continues throughout. Clarification semantics must be designed with the schedule contract, even though the complete interaction ships in milestone 3. Do not expose export before its trust gate passes.

## Rules for claiming “better”

For each user job, require supported-feature parity plus a measured advantage that matters to that job, with no unacceptable regression in agreed correctness, accessibility or resource budgets. More supported syntax alone is insufficient; rejecting every difficult input is also insufficient.

Report these measures by family:

- **Coverage:** completely correct resolved outputs / all valid inputs.
- **False acceptance:** wrong resolved outputs / all inputs, and wrong resolved outputs / all resolved outputs. Also report unsafe acceptance on the negative/ambiguous subset separately.
- **Abstention:** valid inputs left unresolved / all valid inputs; distinguish supported ambiguity from missing capability.
- **Task completion:** users reaching a correct usable result, including clarification, plus time and correction effort.
- **Cost:** latency, memory and bundle size for the same task, including initialization and fallback.

Freeze sample sizes, confidence intervals, acceptable regression margins and performance budgets after a baseline pilot and **before** opening the holdout. They are not set yet; competitive claims remain blocked until they are. A zero-failure sample is not proof of zero risk. Feature safety gates require zero known unsafe exports in the acceptance suite, while language reliability claims require uncertainty estimates.

Holdout answers must be independently checked and kept out of implementation work. If an input is inspected to guide a fix, move it into development data and replace it before the next independent evaluation. Publish failed cases and policy mismatches alongside successes. Benchmark provenance must allow someone else to rerun the claimed result.

## Sources and maintenance

Competitor sources are pinned to `aba27e54aabe7310cba5c160fa2079045096ffb1`: [README/API](https://github.com/arikchakma/gpu-time/blob/aba27e54aabe7310cba5c160fa2079045096ffb1/README.md), [model card](https://github.com/arikchakma/gpu-time/blob/aba27e54aabe7310cba5c160fa2079045096ffb1/MODEL_CARD.md), [architecture](https://github.com/arikchakma/gpu-time/blob/aba27e54aabe7310cba5c160fa2079045096ffb1/architecture.md), and [changes since our evaluated release](https://github.com/arikchakma/gpu-time/compare/bbd7611c1f58c451d3caeed27e5d51ffc473d0e2...aba27e54aabe7310cba5c160fa2079045096ffb1).

Update this matrix when a capability ships or a competitor release changes the comparison. Include the evaluated versions and evidence, not just checkmarks. Use [tasks.md](tasks.md) for current execution and [the roadmap](tempus-roadmap.md) for implementation context. Existing [security review limits](../security-review.md) remain separate release obligations; parser quality does not establish hosting security or publication readiness.

Performance evidence: the [reproducible desktop CPU pilot](../../comparison/performance/README.md) currently favors gpu-time for warm calls, batches and integration bundle cost. This changes the next action to profiling Tempus; it does not justify a GPU path or a speed claim.

Export evidence: an [internal finite-file serializer](calendar-export.md) now round-trips through ical.js. A local finite-file download interface is implemented. Calendar-client import and recurring-rule validation remain incomplete; the export feature is not released.

Point-precision evidence: interpreted points now distinguish date-only input from explicit, reference and arithmetic clocks. Preview/copy no longer imply a midnight appointment for an omitted clock. The local finite export action uses point precision; calendar-client and physical-device validation remain open.

Finite export now has a local web interface with explicit representation, editable title and current-result download. Calendar-client import remains unverified; recurrence export remains unavailable. See [export evidence](calendar-export.md).

Export preview audit: all finite events now have full date/time/offset rows at the download action, including arithmetic seconds. Independent-reader tests cover supported year boundaries and exact seconds; calendar-client compatibility remains unverified.

Release execution now follows the [journey and release checklist](../release-checklist.md). It preserves these capability gates and separates local implementation, file validation, client import, runtime support and independent evidence.

Current journey/package evidence is in [release verification](release-verification.md). The new tarball has scoped Node-minimum, desktop Chrome and local Worker checks. The repeating-schedule-to-calendar task remains incomplete. These checks do not establish comparative superiority.

Recurring export groundwork now includes a bounded timezone table and independently expanded rule/exclusion/override fixtures. This does not change the export capability status: the app still cannot export a complete repeating schedule. Unbounded coverage remains open.

Bounded repeating-schedule export now completes through a locally downloaded, independently expanded explicit-date recurrence set. It resolves every occurrence through the stated end date, including DST choices beyond the preview. Limits: ten years, 1,000 occurrences, unique start instants; no automatic truncation. This does not close unbounded RRULE export, calendar-client import or device gates. The SDK was repacked after the complete-resolver change; scoped Node, Chrome, declaration and local Worker checks pass. See the current artifact hash in release verification.

Journey finding: `Remind me to call Sam tomorrow at noon for 30 minutes` currently fails with calculator-oriented recovery. Prefix-duration support does not satisfy this ordinary reminder-field journey. Complete suffix-duration interpretation, correction and interval export are the next priority; preserve rejection of incomplete or unknown trailing qualifiers. See [failure/recovery evidence](release-verification.md).

Duration follow-up: the natural suffix-duration journey now resolves with complete DST start clarification and independently read file endpoints. Numeric-date-plus-duration correction is still incomplete. The latest source change requires a fresh package verification before a current-runtime claim.

Numeric-duration follow-up: date choice now preserves the whole interval and can chain to a repeated-clock choice. Original numeric text and source spans remain intact; independent file endpoints and keyboard browser preview pass. The refreshed artifact passes Node 22/26, Chrome 150, local Worker and installed strict declarations within the scope recorded in release verification.

Finite-group follow-up: matching clocks now require per-range next-date confirmation after resolving endpoint DST choices. Tests independently read full exported endpoints across the autumn transition; keyboard browser confirmation and edit invalidation pass. Other ranges retain their dates and order. The replacement group-audit package is verified in Node 22/26, Chrome 150, local Worker and installed declarations; exact scope and hash are in release verification.

Collection recovery audit: full-text recognition and the 14-range limit now run before individual clock questions. Malformed later ranges produce an explicit group error without a futile earlier choice. This preserves the complete-result contract; it does not add support for previously rejected qualifiers.

Repeating-duration journey: `every Monday at 9am for 30 minutes` now produces complete interval occurrences, with boundaries/exceptions and duration retained. The full bounded file is independently expanded, including a selected repeated start beyond the preview. Calendar-day endpoint ambiguity and broader recovery remain open; current package runtime evidence must be refreshed.

Timed calendar-duration endpoints now have concrete DST clarification for single and recurring intervals, preserving the start and calendar calculation. Independent export expansion verifies a chosen 25-hour occurrence and unchanged subsequent duration. All-day midnight transitions remain unresolved and are not covered by that claim.

The repeating-duration SDK artifact now passes scoped Node 22/26, Chrome 150, local Worker and installed declaration checks, including exact duration/exclusion results and endpoint clarification. The current hash and runtime-specific scope are recorded in release verification; these integration checks are not comparative accuracy evidence.

Evidence refresh: development-v3 adds five inspected cases without changing previous expected answers; the old report is preserved. See the comparison README for case-level outcomes and policy disagreements. The unchanged desktop CPU workload still favors gpu-time: batch 100 p50 10.678 ms vs Tempus 38.212 ms; gzip integration bundle 52,903 vs 61,310 bytes. These local measurements do not establish phone performance, untouched accuracy or completed user-task superiority.

Performance follow-up: removing an unnecessary synthetic-date conversion from interval clock comparison reduced the local batch-100 median to 31.284 ms; gpu-time remains faster at 10.714 ms. Full endpoints still use the existing evaluator. All 31 raw development outputs and 300 old/new interval candidates match; the optimized archive now passes scoped Node 22/26, Chrome 150, local Worker and installed declaration checks. See the performance report for unchanged workload and limits.

All-day boundary follow-up: date-only points and civil duration endpoints now preserve dates whose midnight is skipped/repeated, with independent DATE-file validation and browser evidence. Explicit times and strict calculator/API behavior retain their existing policy. Entirely skipped dates and date arithmetic across those transitions remain unresolved; package verification must be refreshed.

Recurrence audit: fixed false success for invalid clocks in expired schedules. Rule clocks now validate even when no upcoming occurrence exists; a valid expired schedule remains a valid empty preview. Matching recurring clocks require a different end or explicit duration.

The date-boundary package now passes scoped Node 22/26, Chrome 150, local Worker and installed declaration checks. Runtime evidence distinguishes date-only boundaries from explicit clock choices and invalid expired rules from valid empty previews. Exact hash and contexts are recorded in release verification.

Recurrence reference follow-up: valid noon schedules no longer fail because the reference day's midnight is skipped or repeated. The replacement archive passes the recorded Node, Chrome, Worker and declaration checks; a bounded reminder preserves duration and exclusion through independent file expansion. A remaining journey defect asks about ambiguous starts even when all choices are already past. This stays open alongside unbounded export, real calendar imports, physical-device access and independent evaluation; no matrix completion or superiority claim follows from these checks.

Past-occurrence follow-up: the recorded unnecessary-question defect is fixed for current-day points, ranges and durations. Both timezone candidates must precede the reference before an occurrence is skipped; a straddling or exactly-now candidate still requires clarification. Independent bounded-file checks preserve remaining dates and exclusions. The replacement packed SDK passes scoped Node 22/26, Chrome, local Worker and declaration checks. These are development journey checks; the broader export and independent-evaluation gates stay open.

Evidence follow-up: September 12 npm registry refresh confirms pinned gpu-time 0.2.1 remains latest; package provenance is recorded separately from the earlier inspected source commit. A separate three-task development replay now records prescribed clarification choices through complete output, retained event text, independent file expansion and edit invalidation. This is Tempus-only scripted integration evidence, not a human study or a comparative completion score. Existing 31-case comparative expectations remain unchanged.

Packed performance follow-up: the current verified archive now has a separate five-process CPU report on the unchanged four-case workload. All archived files are checked against the installed copy before timing. Tempus/gpu-time batch-100 p50 is 31.857/10.690 ms; gzip integration bundles are 61,704/52,903 bytes. Both match every repeated preview. Raw memory snapshots and source/artifact hashes are retained. This closes the local packed-desktop measurement gap, not physical-device, peak-memory, battery or comparative user-completion gates.

Unbounded export investigation: an authored recurring-DTEND probe reveals a standards disagreement in ical.js 2.2.1: its spring-DST instance ends after one elapsed hour when the master requires two. The explicit conformance command fails and retains the fixture/raw result. This prevents treating a superficially matching wall-clock expansion as proof of correct rule serialization. Existing UTC occurrence files are a separate path. The open gate now explicitly requires reader-conformance evidence, a future timezone source and a visible future-ambiguity policy; none is assumed complete.

Second-reader follow-up: pinned recurring-ical-events/icalendar verifies the three current scripted correction files plus the captured bounded browser file, preserving expected endpoints, exclusions and titles. It reproduces the DTEND standard disagreement, so reader agreement still cannot certify that recurring-rule strategy. Reproducible scripts retain file hashes, dependency lock and raw results. Actual client imports and unbounded export remain open.

Timezone-source follow-up: the inspected npm candidate contains stale 2018g data and is not adopted. Current tzurl files pass sampled Chicago/Almaty conversions, but the Yellowknife request returns an unverified Edmonton identity; the strict source gate remains failed. Runtime tzdata is 2026a versus captured source 2026d. Record the revision/alias gap before selecting a timezone dependency; no parser-defect claim is established by the rejected alias sample.

Alias-resolution correction: IANA 2026d confirms Yellowknife → Edmonton; the candidate identity is valid. Compiled official zone data independently confirms noon December 1 as 18:00Z, versus the current Node/SDK's 19:00Z from tzdata 2026a. The unresolved-alias blocker is replaced by a confirmed runtime-data consistency gap. Updated package documentation discloses this limitation; no host upgrade or parser-policy patch was made.

Pinned-data prototype: a scratch timezonecomplete/2026d candidate returns correct authored instants for six offset/gap/repeat cases and passes three matching Chrome checks. Its provider/data bundle is 57,182 gzip bytes. Shared database initialization and full-engine integration remain unresolved; the app and SDK still use host timezone data. This prototype is not a closed consistency gate or a replacement performance result.

Provider evaluation update: the private bundle passes application/provider isolation checks on Node 22/26 without changing Intl. A fresh-process year-9999 Chicago lookup takes roughly 4.89 seconds, so the unchanged prototype is not acceptable for the calculator's full supported range. Isolation now has a demonstrated route; bounded-cost lookup and full integration remain open. The current app's timezone-data consistency gap is not fixed.

Current backend decision: reject the JSON provider despite its improved lookup speed; its era-boundary representation is incorrect. A separate scratch TZif reader matches the original 5,760 cases. The repository now contains pinned-archive build and oracle scripts; explicit compiler options yield 33,513 cases across 597 zones, with 165 disagreements where IANA marks historical time unspecified and the prototype rejects an invented offset. No other sampled offset mismatches appeared. Unavailable-data behavior, reproducible data packaging, browser/Worker validation, loading cost and shared integration remain open. The application still uses host timezone data; the original matrix and its independent-evaluation gates are unchanged.

Compiler provenance correction: the matching IANA 2026d source build resolves the 126 host-generated fat/slim differences against identical oracle bytes. All 33,513 prior clock inputs remain included. Correct slim data is 76,430 gzip bytes before the reader. The 165 unspecified-history refusals and shared app/SDK integration remain open; this is backend verification, not user-journey completion.

Typed backend milestone: generated pinned data and a typed reader now live in source, with explicit unavailable-history errors and twelve focused tests. The standalone bundle reproduces the unchanged 33,513-clock comparison with only the same 165 historical refusals. It is not wired into the calculator, scheduling or formatting; no app reliability or packaged-runtime gate closes from this milestone.

Pinned-backend integration: calculator, scheduling choices, date boundaries, bounded timezone generation and display/API formatting now share IANA 2026d. The Yellowknife reminder/API/file regression passes, and the local browser shows the matching noon–1 PM range. All 625 tests and builds pass. Client gzip size rises to 256.23 kB. A fresh archive passes Node 26 consumer checks; other current-archive runtime checks and performance remain open. This closes the specific runtime-data mismatch, not broader release, client-import or competitive-evaluation gates.

Current archive verification: pinned-timezone archive `5105b5ac…` passes scoped Node 22/26, installed declarations, Chrome correction/edit and local Worker recurrence/endpoint checks. Updated four-case packed CPU report still favors gpu-time: batch-100 p50 28.546 vs 10.661 ms and gzip integration bundle 141,808 vs 52,903 bytes. Prior results are preserved. Actual calendar imports, browser/device performance and independent comparative task completion remain unverified.

Export journey milestone: fixed-future-offset recurring points and intervals now export as ongoing UTC rules without an invented end date. The actual Tokyo browser download preserves weekday conversion, duration and exclusion; edit recovery clears the old export. Independent readers validate the file, and tests expand beyond the preview. Future-DST rules, actual client imports and broader evaluation remain open. No overall recurrence-export or superiority gate is marked complete.

Future-DST prerequisite: civil transition-date conversion now matches independent calendar-rule expansion over a 400-year cycle for all 29 distinct date rules in the pinned source. Initial negative month-day representation failed and was replaced. This helper is not connected to export; historical cutover, offsets, future clock decisions and duration semantics remain open. Acceptance gates are unchanged.

Ongoing timezone candidate: an internal VTIMEZONE serializer now joins recorded history to the pinned future rules. Independent observance expansion matches exact transition offsets for eight zones in five sampled years through 2400. ICAL UTC-to-local conversion fails a separate boundary check, retained explicitly. No download capability gate closes. The reader metadata change requires a fresh SDK archive; preceding packed-runtime evidence applies only to that preceding artifact.

Second-reader follow-up: seven of eight ongoing timezone candidates pass after fixing missing daylight designations and initial seasonal history. Casablanca negative-DST mismatches remain; the verification command fails explicitly. The initial representation had defects, so prior reader-only attribution was too strong. No interoperability or export gate closes from the seven passing fixtures.

Failure isolation: independent Python ZoneInfo reads of the hash-verified pinned source agree on all 448 checkpoints. The calendar reader still has seven Casablanca conversion mismatches, including incorrect UTC round trips. This is narrower evidence about the remaining interoperability failure, not a completed export journey.

Event-level evidence: two readers preserve the tested noon reminders and exclusion in ongoing candidate files, but both shorten a two-hour elapsed reminder across spring DST even when encoded with DURATION:PT2H. The candidate probe fails explicitly. No general recurring-duration, export or client-import gate is closed.

SDK refresh: archive `20a1fd98…` now contains the current reader metadata. A clean installation matches all 38 archive files and passes Node 22/26 consumer journeys, installed declarations, Chrome keyboard date correction/edit and a local Worker three-interval response. Performance and broader runtime evidence from the preceding artifact are preserved separately; no comparative claim is updated from these checks.

Arithmetic recovery: interpreter choices now resume an ambiguous anchor or calendar step without discarding later operations. Five source journeys cover repeated/skipped clocks, chained ambiguity, stale selections and unchanged strict-calculator rejection. A desktop-browser second-occurrence selection produces the expected final time and editing restores clarification. Fractional-step variations and complete keyboard/mobile/export recovery need broader verification. This interpreter change is newer than archive `20a1fd98…`.

Arithmetic journey follow-up: fractional-day remainder and conflicting-choice checks pass; conflicting answers no longer silently prefer the first occurrence. A scripted reminder-to-file journey passes both readers. Desktop keyboard correction/export review leads to an actual downloaded point file with the correct final instant and retained event text. Final download activation used the download tool; physical-device and calendar-client evidence remain absent. The SDK archive still needs refreshing.

Recovery defect fixed: the prior conflict question could loop because answering retained both conflicting arithmetic selections. The selection helper now replaces that clock's answers and clears downstream arithmetic choices while retaining earlier decisions. Source and runnable SDK-example checks prove that choosing an answer resumes the calculation; changing an earlier answer requires the later clock again. Package refresh remains pending.

## September 13 measurement and implementation milestones

Archived during release-checklist reconciliation. References to “current” below describe each historical milestone, not the latest SDK candidate. Raw reports and failures retain their original scope.

## What our measurements say

Current development-v4-precision has **31 inspected cases**: six dates, five arithmetic, five sentences, six schedules and nine recovery cases. It compares strict Tempus v2, the interpreter and pinned gpu-time 0.2.1. See the [per-family report](../../comparison/results/report.md) and [raw results](../../comparison/results/report.json). The old 26-case/0.2.0 figures are preserved in the historical snapshot below.

Sixteen [scripted correction-to-file tasks](../../comparison/results/journeys.md) cover numeric reminder duration, range replacement, bounded recurring DST/exclusion, arithmetic-clock correction, grouped repeated-clock correction, a fortnightly DST reminder, all-day versus explicit-midnight precision, short-duration reminders and explicit alternatives. These are development integration checks. A correct rejection, unanswered question or passing unit test is not measured human task completion.

The preview scorer now reports an additional explicit all-day-flag grade, preserving the legacy timestamp grades. It does not validate event text/spans, full RFC 5545 rules, all-day calendar behavior or long-horizon recurrence. Separate file probes retain elapsed-duration and timezone-conversion failures. Agreement between readers does not establish standards conformance or calendar-client compatibility.

The [packed desktop performance report](../../comparison/results/performance/packed/report.md) measures current archive 1edbaacb…: Tempus/gpu-time batch-100 p50 is 29.249/10.864 ms; integration gzip is 143,518/52,903 bytes. gpu-time remains faster for cold initialization and batches and has the smaller bundle. gpu-time also has the lower warm-single median and p95 in this four-case run. Prior artifact reports are preserved. No physical-device, independent holdout or comparative user-completion evidence is available.

The latest [spring-gap fortnight journey](release-verification.md#spring-gap-fortnight-reminder) verifies correction through complete file output while preserving cadence, duration and exclusion. Current source/file replay covers 17 inspected tasks; the spring-gap task also passes scoped local Chrome keyboard/download/edit checks. These remain development results, with no physical-device or independent human-completion claim.

Blocked export now has a verified keyboard path back to editing the unchanged schedule. Choosing an end date can complete a different, finite task; ongoing export remains a release blocker.

A per-instance civil-date conversion cache now passes all 697 source tests and preliminary alternating Node measurements (batch-100 median 25.0 → 20.7 ms). New archive `c1f8d2a0…` passes the scoped Node, browser-engine and local Worker integration checks. Its refreshed batch-100 medians are 20.390 ms in Node and 27.0 ms in Chrome, versus gpu-time’s 10.767 and 8.0 ms. These four-case development results do not establish general accuracy or task-completion superiority.

The action-label uncertainty false accept is fixed for maybe/perhaps/probably/possibly, with 701 source tests and a verified edit-to-download browser journey. Archive `e2360d14…` now includes the fix and passes the scoped installed Node, browser-engine and local Worker checks. Comparative timings remain tied to prior archive `c1f8d2a0…`.

The follow-up negative-clause fix covers cannot and common negative contractions without rejecting ordinary name apostrophes. It passes 710 source tests and scoped keyboard recovery/download checks, but postdates archive `e2360d14…`; package validation must be refreshed after the modifier audit.

The bounded 17-case modifier audit is complete. Tentatively and optionally no longer become accepted title words; all 712 source tests and the scoped browser edit/download recovery pass. Archive `3ec6621c…` includes the accumulated fixes and passes scoped installed Node, browser-engine, local Worker and calendar-file checks. Current archive 3ec6621c timings are refreshed: batch-100 median 20.599 ms in Node and 26.95 ms in Chrome versus gpu-time 10.775/8.10 ms. Remaining release review stays open; the limited post-scan implementation follow-up found no new boundary issue and does not replace the formal scan.

The [monthly reminder journey](monthly-schedules.md) now defines the next complete implementation unit: short-month clarification, duration/bounds/exclusions, correct monthly preview and file generation. Monthly source now has a discriminated rule, selectable short-month policy, bounded point/interval export and preflighted ongoing point export. Ordinary ongoing monthly intervals now pass date-aware preflight and file checks. Clock-change intervals and ongoing day-29/30 clamping remain unfinished; the latter exposed a reader expansion failure. The monthly plan records exact verified scope.

## Snapshot before current-candidate reconciliation

Archived September 13, 2026. References to “current” below belong to the earlier writing; use the active matrix and release checklist for present status.

# Tempus product matrix

Tempus should make short English scheduling input easy to understand, correct and use. It also needs a usable library if we want developers to choose it over gpu-time. A better calculator interface alone does not replace a scheduling parser.

**Status: product requirements defined; competitive superiority not established.** This is the working acceptance matrix, not a list of completed features. Tempus remains a working name.

## Baseline and scope

Reviewed September 12, 2026 against Tempus `d91a7ca` plus the local implementation recorded in `tasks.md` and gpu-time's [0.2.1 source](https://github.com/arikchakma/gpu-time/tree/aba27e54aabe7310cba5c160fa2079045096ffb1). Our [local comparison](../../comparison/README.md) now runs **gpu-time 0.2.1**. Historical 0.2.0 results are retained separately.

The newer release reports fixing the `set OOO for 3 days from today` duration regression. It also records remaining duration and clock-with-place gaps. Our refreshed runner still observes the same incorrect duration point under its fixed context; it does not reproduce that reported fix. Correct-result counts are unchanged from 0.2.0, while one incorrect arithmetic answer becomes an abstention. Historical reports are preserved; see the comparison notes for the versioned corpus policy change.

| User job                                      | Required outcome                                                          | Fair comparison                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Enter a reminder or schedule in short English | Inspect the full interpretation, correct it, then copy or export it       | Same inputs, context and output semantics; measure the whole task in equivalent interfaces                     |
| Add date recognition to an application        | Install a package and obtain typed points, intervals or schedules locally | Library against library, including runtime support, limits, bundle cost and integration effort                 |
| Calculate a date through several operations   | Get a reproducible answer with an inspectable explanation                 | Preserve Tempus arithmetic; describe this as an additional capability, not proof of better schedule extraction |

English reminder fields, schedule forms and command bars are the initial scope. Arbitrary documents, other languages and consequential scheduling are not promised. Do not add GPU processing or rewrite the language/framework without a measured constraint.

## Capability matrix

“Partial” means a bounded implementation exists. “Missing” means the product capability is absent. “Unmeasured” means we have no adequate comparative evidence. Competitor capabilities below are documented upstream unless a local result is explicitly given.

| Area                             | gpu-time baseline                                                                                | Tempus today                                                                                                                                                                                                                                                                                   | Requirement                                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **INPUT — Recognition**          | Short English dates, ranges and recurrence; coverage has documented gaps                         | **Partial:** points, intervals, weekly/monthly recurrence and explicit finite date lists; event/item spans retained. Mixed time scope is selectable. Selected-year named-month lists have source/app evidence; broader shorthand and language remain open.                                     | Cover the same declared input families. Preserve the original text and remaining event text. Account for every date, duration, condition and correction instead of silently dropping them |
| **CORRECTNESS — Interpretation** | Neural token recognition followed by TypeScript calendar resolution                              | **Partial:** strict evaluator plus conservative sentence rules; rejection tests, no independent language evaluation                                                                                                                                                                            | Separate recognition from resolution. Validate the complete candidate; distinguish unsupported input, no expression and ambiguity. Publish calendar policies and policy disagreements     |
| **MATH — Calendar arithmetic**   | Resolves timezone, DST and calendar values after recognition                                     | **Present within documented grammar:** ordered operations, fractions, clamping, DST policy and trace                                                                                                                                                                                           | Preserve existing behavior while adding intervals and schedules. Make assumptions and approximations inspectable                                                                          |
| **RECOVERY — Correction**        | Structured diagnostics for the caller to handle                                                  | **Partial:** numeric dates, shared-time scope, point/interval/occurrence DST, equal-endpoint confirmation, two-clause corrections and arithmetic-step choices. Context edits invalidate answers; bounded history supports 38-answer list completion.                                           | Ask one concrete question at a time, retain the input, and resolve the selected alternative without requiring the user to reconstruct the request                                         |
| **UX — Complete the task**       | Library and demonstration interface                                                              | **Partial:** readable results, copy and keyboard correction-to-file paths; bounded complete files and selected ongoing rules. Actual calendar-client imports, physical devices and human completion remain unverified.                                                                         | Add interval and recurrence previews, correction and export. Keep the next action obvious; put optional explanation behind disclosures                                                    |
| **DX — Integration**             | Parse, batch and reusable parser APIs; CPU/WebGPU; occurrences, recurrence rules and diagnostics | **Local candidate:** archive 906f3a6f passes Node 22/26, installed TypeScript, browser and local-Worker year/time recovery checks. The app shorthand correction/download journey passes at 320/1280 px; publication and devices remain gated.                                                  | Publish a versioned package with discriminated outcomes, batch calls, browser/Node/Worker support, limits and a runnable integration example                                              |
| **EVIDENCE — Comparison**        | Published model card, development evaluations and limitations                                    | **Partial:** 31 inspected development cases, 18 scripted correction-to-file journeys and separately recorded browser/file checks. No untouched holdout or independent human study; reader incompatibilities remain visible.                                                                    | Reproducible, versioned, per-family evaluation with independent expected answers; report failures, abstentions and task completion together                                               |
| **PERF — Ordinary devices**      | Local CPU/WebGPU; automatic routing favors CPU for smaller workloads                             | **Desktop pilot:** gpu-time is faster for startup/batches and smaller on four shared cases. Headless Chrome is measured; physical phones, GPU, battery and peak memory are not. Current 906f3a6f is measured on that same four-case workload; clarification/export latency remains unmeasured. | Measure cold and warm single-input work, batches, memory and transfer size on ordinary phones and browsers before choosing acceleration                                                   |
| **TRUST — Use and side effects** | Local inference; model card limits intended use and warns against consequential scheduling       | **Partial:** local browser/library parsing; explicit API replay sends a phrase. Current-interpretation file download requires a click; no reminder delivery or calendar write. Hosting and client-import gates remain open.                                                                    | Keep parsing side-effect free. Show current interpretation before export or external writes; invalidate approval after an edit. Document limits, privacy and operational boundaries       |

Deterministic calendar math is shared ground: gpu-time already has it. Neither deterministic rules nor a neural model guarantee correct intent recognition. Highlighting words explains what the parser used; it does not prove the interpretation is right.

Numeric date-order clarification now offers named alternatives, preserves input and binds choices to the original context. Complete two-clause corrections offer keep/replace choices for points and intervals. Two complete alternatives joined by `or` offer context-bound choices; supported ambiguity within each branch offers staged choices before the final selection. Point clock ambiguity now offers explicit repeated-time offsets or replacement times for a gap, including a numeric-date decision followed by a clock decision. Interval endpoints and arithmetic steps now have chained choices; edits invalidate selections. Broader conflict recovery and complete device/export journeys remain incomplete.

## Acceptance gates

Weekly recurrence now reaches interpretation and the app with explicit boundaries, exceptions, complete previews and copy. The broad recurrence gate remains open: additional frequencies, broader conflict recovery and validated export are unfinished. See the [weekly preview contract](../schedule-contract.md#weekly-preview-contract).

Interval interpretation and browser previews now cover explicit clock ranges and integer day/week/hour/minute/second durations, with retained event/source text and complete range copy. All five development schedule cases resolve, including finite weekday groups. This does not close broad language or recurrence coverage. Bounded recurrence, multiple groups and time/correction clarification have scoped implementations. Ongoing future-DST export and broad language coverage remain open, so overall capability status stays partial. See [tasks.md](tasks.md).

These are **requirements for future work**, not achieved results. Each implementation should name its matrix IDs and attach evidence. A passing development corpus permits a bounded feature release; it does not permit a general accuracy claim.

| Area        | Evidence required to close the capability gap                                                                                                                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INPUT       | Positive, negative and minimally changed contrast cases for each supported family. Check exact source spans and retained event text, including punctuation, names, multiple mentions and trailing qualifiers. Score a lost duration or exception as an incorrect result                                                                        |
| CORRECTNESS | Independently specified expected semantics with fixed reference, timezone and date-order policy. Evaluate negation, correction, uncertainty, DST gaps/folds and conflicting dates. Separate policy disagreement from parser failure; publish both                                                                                              |
| MATH        | Existing protected cases remain correct. Add leap years, month ends, fractional units, written-order contrasts, DST crossings and explicit interval-end semantics. Trace and result must agree; reuse of the same resolver is not an independent oracle                                                                                        |
| RECOVERY    | Actual UI tests for “March 4 or April 3?”, “Which 1:30 AM?” with timezone offsets, and “Did Saturday replace Friday?”. Selecting, changing or cancelling an answer preserves text and produces the right current state. Measure completed corrections, not just returned diagnostics                                                           |
| UX          | Complete input → inspect → correct → copy/export tasks on phone and keyboard. Verify focus, screen-reader labels, 320px layout, empty/error states and stale-result handling. Show all-day versus timed values, timezone, interval endpoints and bounded recurrence previews                                                                   |
| DX          | Install the packed artifact into clean browser, Node and Worker examples. Test single/batch semantic parity, ordering and per-item errors. Document supported versions, input/expansion limits, cancellation or resource lifecycle where relevant, API stability and migration from strict v2                                                  |
| EVIDENCE    | Refresh competitor version; freeze policies and claims before evaluation. Keep training/development inputs separate from a sealed holdout. Publish corpus provenance, raw outputs, versions, hashes, denominators and uncertainty. No aggregate winner that hides weak families                                                                |
| PERF        | Same inputs, output contract, occurrence horizon and runtime on both libraries. Report cold initialization, warm p50/p95 latency, throughput, peak memory and compressed core bundle size separately from full-app assets. Test iOS Safari, Android Chrome and desktop with CPU fallback; record hardware and versions                         |
| TRUST       | No unresolved or stale interpretation can be exported or written externally. Test the edit/confirm/write sequence. Validate calendar exports with an independent reader and calendar import, including timezone, all-day dates, DST, exceptions and truncation. Document network behavior and the remaining hosting/security review separately |

An explicit Export action after viewing a current, resolved preview can be the confirmation. Routine text copying does not need a second approval dialog. Future calendar writes or reminder creation need an explicit action tied to that exact interpretation. The SDK itself performs no external actions; the integration example must demonstrate this boundary.

## What our measurements say

The [retained development comparison](../../comparison/evidence/shorthand-development/report.md) contains 31 inspected cases against pinned gpu-time 0.2.1. The separate [retained correction-to-file replay](../../comparison/evidence/shorthand-development/journeys.md) contains 17 authored tasks. Neither is an untouched holdout or a human task-completion study. The preview scorer does not validate full recurrence exports, event text/source spans or calendar-client behavior.

The latest [Node](../../comparison/results/performance/packed/report.md) and [Chrome](../../comparison/results/performance/browser-current-list/report.md) measurements cover SDK `52d5c981…`, which predates current `4ec18030…` shorthand code. On four shared inputs, Tempus/gpu-time batch-100 empirical p50 is 21.216/10.668 ms in Node; Chrome medians are 27.90/8.20 ms. Parsing bundles are 145,658/52,903 gzip bytes. gpu-time is faster for initialization, single calls and batches and has the smaller bundle in this workload. These checks validate previews, not correction journeys or calendar exports.

Current SDK runtime checks and separate browser correction/download paths have scoped evidence in the [release checklist](../release-checklist.md). Reader disagreements remain failures. No physical-device, actual calendar-client import, independent holdout or comparative human-completion evidence is available. Earlier measurement and implementation milestones remain in [matrix history](product-matrix-history.md#september-13-measurement-and-implementation-milestones).

## Current release blockers

- Complete declared input-family and conflict journeys, with usable corrected outputs and retained qualifiers/source text.
- Finish future-clock policy and intervals spanning offset changes. One-transition UTC occurrence overrides now pass both readers for repeated clocks and elapsed-duration correction; full-range generation now produces a 3.29 MB candidate, but sampled reading fails the year-9999 boundary and is slow. The strategy and client import remain unverified. Zoned points and intervals with unambiguous endpoints and no contained offset changes now export; Chicago noon and 9–5/exclusion journeys pass both readers and actual downloads. Broader duration semantics and calendar-client import remain separate gates.
- Confirm public SDK stability and wider runtime coverage. Current archive `4ec18030…` passes direct Node/TypeScript and three-browser/local-Worker shorthand and calendar failure-recovery checks. Prior broader UI journey evidence is historical. Safari.app, retail Firefox, deployed Workers and physical devices remain unverified.
- Obtain physical iOS/Android performance and task-completion evidence and measure the final candidate. Existing desktop Node/Chrome measurements predate current shorthand code and favor gpu-time for startup, single calls and batches.
- Freeze evaluation policies, budgets and claims before obtaining independently authored/checked holdouts and human task-completion results.
- Finish release security and hosting review. The sealed static diff scan predates later implementation changes and has partial coverage and no reportable findings; subsequent full timezone-payload comparison passes against the retained build. Independent provenance and operational checks remain open. Push, publication, deployment and calendar writes still require explicit authorization.

The [release checklist](../release-checklist.md) owns detailed gates; [tasks.md](tasks.md) owns next local actions. The milestone exit conditions below remain unchanged.

## Order of work

| Milestone                               | Work                                                                                                                                                                                    | Exit condition                                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Establish the current comparison** | EVIDENCE, CORRECTNESS: evaluate 0.2.1 without replacing historical results; freeze point/interval/recurrence, locale, DST and intent policies; define claim-specific evaluation budgets | Versioned report and explicit disagreements; independently written development cases for the next milestone; holdout protocol recorded before use |
| **2. Interpret complete schedules**     | INPUT, MATH: intervals and durations first, then bounded recurrence, boundaries and exceptions; retain source/event text                                                                | Complete values or explicit unresolved outcomes; protected arithmetic passes; duration versus offset contrasts and recurrence semantics verified  |
| **3. Resolve and use the result**       | RECOVERY, UX, TRUST: selectable clarification, phone/keyboard previews and independently validated export                                                                               | User can complete correction and export without losing input; unresolved/stale results cannot reach an external action                            |
| **4. Ship the integration contract**    | DX, PERF: extract the proven core into a package, run clean integrations and device benchmarks                                                                                          | Supported runtime matrix passes; documented limits and comparable performance evidence; no network requirement for local parsing                  |
| **5. Evaluate the claim**               | EVIDENCE across all areas: independent holdout and task-completion study                                                                                                                | Publish scoped strengths and failures. Claim improvement only for jobs whose parity, quality and usability gates pass                             |

Evidence collection starts in milestone 1 and continues throughout. Clarification semantics must be designed with the schedule contract, even though the complete interaction ships in milestone 3. Do not expose export before its trust gate passes.

## Rules for claiming “better”

For each user job, require supported-feature parity plus a measured advantage that matters to that job, with no unacceptable regression in agreed correctness, accessibility or resource budgets. More supported syntax alone is insufficient; rejecting every difficult input is also insufficient.

Report these measures by family:

- **Coverage:** completely correct resolved outputs / all valid inputs.
- **False acceptance:** wrong resolved outputs / all inputs, and wrong resolved outputs / all resolved outputs. Also report unsafe acceptance on the negative/ambiguous subset separately.
- **Abstention:** valid inputs left unresolved / all valid inputs; distinguish supported ambiguity from missing capability.
- **Task completion:** users reaching a correct usable result, including clarification, plus time and correction effort.
- **Cost:** latency, memory and bundle size for the same task, including initialization and fallback.

The [draft evaluation protocol](../../comparison/evaluation/protocol.md) defines job-specific output contracts, pilot decisions, outcome accounting and holdout custody. Its [status record](../../comparison/evaluation/status.json) is explicitly not frozen; it does not replace these acceptance rules.

Freeze sample sizes, confidence intervals, acceptable regression margins and performance budgets after a baseline pilot and **before** opening the holdout. They are not set yet; competitive claims remain blocked until they are. A zero-failure sample is not proof of zero risk. Feature safety gates require zero known unsafe exports in the acceptance suite, while language reliability claims require uncertainty estimates.

Holdout answers must be independently checked and kept out of implementation work. If an input is inspected to guide a fix, move it into development data and replace it before the next independent evaluation. Publish failed cases and policy mismatches alongside successes. Benchmark provenance must allow someone else to rerun the claimed result.

## Sources and maintenance

Competitor sources are pinned to `aba27e54aabe7310cba5c160fa2079045096ffb1`: [README/API](https://github.com/arikchakma/gpu-time/blob/aba27e54aabe7310cba5c160fa2079045096ffb1/README.md), [model card](https://github.com/arikchakma/gpu-time/blob/aba27e54aabe7310cba5c160fa2079045096ffb1/MODEL_CARD.md), [architecture](https://github.com/arikchakma/gpu-time/blob/aba27e54aabe7310cba5c160fa2079045096ffb1/architecture.md), and [changes since our evaluated release](https://github.com/arikchakma/gpu-time/compare/bbd7611c1f58c451d3caeed27e5d51ffc473d0e2...aba27e54aabe7310cba5c160fa2079045096ffb1).

Update this matrix when a capability ships or a competitor release changes the comparison. Include the evaluated versions and evidence, not just checkmarks. Use [tasks.md](tasks.md) for current execution and [the roadmap](tempus-roadmap.md) for implementation context. Existing [security review limits](../security-review.md) remain separate release obligations; parser quality does not establish hosting security or publication readiness.

Historical follow-ups are preserved in [the archived matrix snapshot](product-matrix-history.md). Current implementation and artifact evidence are in [release verification](release-verification.md). Update status in place; keep chronological notes in the verification log.

The separate [ordinary-input probe](../../comparison/exploratory/README.md) exposes gaps behind the partial INPUT status: gpu-time handles the tested generic title, half-hour duration and monthly day-one recurrence where Tempus abstains. Both fail the explicit date list. These eight inspected cases are qualitative development evidence, outside the 31-case corpus; temporal preview matches do not prove event extraction, complete recurrence export or human task completion.

The ordinary-input probe was refreshed after half-hour support: both engines now return the intended half-hour interval. Other probe outcomes are unchanged, with the prior report retained. This does not close generic-title, date-list or monthly-recurring journeys.

### Bounded recurrence follow-up: September 13

A separate two-year reminder journey now passes four keyboard start/end decisions, full 103-interval file reading in both readers, restart and invalid-edit recovery. Evidence is in [release verification](release-verification.md#two-year-bounded-recurrence-recovery). It does not change the sixteen-case scripted harness, comparison corpus, independent-evaluation status or unbounded-export gate. No implementation or current packed SDK change was required.

### SDK calendar integration: September 13

Recurrence export choices now expose named groups in the app and SDK example. Before/after accessibility snapshots and the keyboard correction/restart path pass in desktop Chrome at 320px; actual screen-reader and device evidence remain missing. See [choice-group verification](release-verification.md#named-recurrence-choice-groups).

The current packed Node consumer also verifies reminder correction through file preparation, answer invalidation after input/context changes, batch isolation and nested reusable-parser snapshots. This is scoped integration evidence; recurrence-export decision invalidation remains the host's responsibility. See [correction-state checks](release-verification.md#packed-sdk-correction-state-boundary).

The optional calendar entry point now provides the app's pure file preparation to package consumers. A clean packed consumer completes recurrence clarification, complete preview, download, restart and edit invalidation in three desktop browser engines; Node and local Worker checks pass too. All downloaded intervals pass independent file reading. See [packed calendar SDK evidence](release-verification.md#packed-calendar-sdk-entry-point). Public stability, unbounded future-clock policy, actual client import and device access remain open.

### Download failure recovery: September 13

A browser failure probe exposed missing feedback in the SDK example and incomplete cleanup in both download handlers. Both now pass visible-error, resource cleanup, keyboard retry and edit recovery checks. This improves the complete file journey without changing parsing or the current archive. Actual import and broader device gates remain open; see [download recovery evidence](release-verification.md#download-failure-and-retry-recovery).

### Profile-guided performance follow-up: September 13

A bounded future-transition cache reduces repeated offset work without changing policies. Current source tests, old/new timezone parity and complete packed/app calendar journeys pass. Desktop batches improved in the measured workload, but gpu-time remains faster and smaller. [Current archive and measurements](release-verification.md#bounded-future-offset-cache) retain the scope and missing device/independent evidence.

### Independent duration reader: September 13

A third reader, libical 4.0.5, passes the exact-versus-calendar-duration probes across both DST directions. It still fails the repeated/missing-clock controls. This changes the next export investigation, not the acceptance criteria or current app capability. Its adapter rejects detached exceptions; actual client compatibility remains unverified. See [reader evidence](release-verification.md#independent-duration-reader-follow-up).

### Ongoing elapsed-duration candidate: September 13

A generated-timezone candidate passes one full 400-year cycle (20,870 occurrences) with the ICU-backed third reader and a pinned-data Python oracle. Other reader configurations and later-year windows fail. This does not close the ongoing-export gate. Experimental exposure versus continued blocking is a pending product decision; no default or calendar-write approval has been inferred. See [cycle evidence and limits](release-verification.md#ongoing-duration-cycle-evidence-and-reader-limits).

Monthly interval follow-up: both readers agree on 4,799 authored half-hour occurrences across a 400-year calendar cycle. The refreshed local archive `953106eb…` passes the documented Node/browser/Worker checks. This is recurrence-file/runtime evidence, not a calendar-client import, untouched evaluation or comparative performance result.

The follow-up monthly clamp probe preserves a reader disagreement rather than scoring the preview as completion: ical.js passes 1/5 candidate encodings, Python 3/5. Both pass last-day-31; day-29/30 ongoing clamping still lacks interoperable file evidence. See the [reproducer](../../comparison/calendar/README.md#monthly-clamping-compatibility). These are authored conformance diagnostics, not competitive accuracy cases.

Historical monthly archive `953106eb…` had four-input CPU measurements: Node/Chrome batch-100 medians are 21.508/27.55 ms for Tempus and 11.224/8.10 ms for gpu-time 0.2.1. Tempus remains larger and slower for those batches and initialization. Retained process-memory snapshots also show higher growth, without isolating library or peak memory. The [performance report](../../comparison/performance/README.md#current-candidate-measurements) preserves scope and history; these results establish no competitive superiority.

Explicit-date-list milestone: the previously failing two-date `Call Sam September 14, 2026 at noon and September 16, 2026 at noon` probe now returns both correct starts and retained event text. A separate browser journey completes numeric-date correction, repeated-clock correction, two-event download, restart and invalid edit; a mixed date-only/timed file also passes both readers. Source spans and written order are preserved. At that milestone, full years and independently specified times were required; the later shared-time and shorthand milestones below supersede that restriction. The refreshed eight-case probe preserves its earlier report and still provides no independent accuracy or superiority claim. Current archive/performance evidence predates this list source change.

Explicit-list review corrected two failures: mixed untimed/timed lists now ask about the time's scope instead of silently treating earlier dates as untimed; a 187-character list needing 38 answers now completes under a bounded 64-prior-answer history, rather than dropping old choices and asking repeatedly. The matrix's ambiguity and complete-task requirements are unchanged. Archive `b4d401b7…` passes its recorded Node/browser/Worker and file checks. Shorthand dates without complete years remain open, as do independent evaluation and actual client imports.

Historical candidate `52d5c981…`: README-only correction relative to `b4d401b7…`, with identical code/declarations/manifest and refreshed Node checks. Browser/Worker evidence remains tied to the proven identical code bytes; no repeated run is implied.

The two-series monthly clamp diagnostic passes both readers for the four recorded noon/30-minute cases, but creates separately editable February and other-month series. The pending product decision and missing client-import evidence keep the export gate open. [Scope](../../comparison/calendar/README.md#two-series-monthly-clamping-candidate).

Same-month shorthand with one written month/year now completes explicit time-scope correction, file output and edit invalidation in the app and SDK. Same-month year choices have packed evidence. Mixed-month year choices now have source/main-app correction-to-file evidence; omitted months, partially written mixed-month years and broader conflicts remain open. Original input and spans are retained; [journey evidence](release-verification.md#same-month-shorthand-reminder-journey).

Current archive `4ec18030…` now has [portable browser journey evidence](../../comparison/evidence/packed-browser/README.md): six desktop browser/viewport runs, keyboard activation, correction, restart, edit invalidation and twelve independently read downloads. This covers the developer integration example; full keyboard traversal, main-app usability, physical devices and calendar-client import remain separate gates. The matrix requirements are unchanged.

A stronger Tab/Shift-Tab check now contradicts any inference of complete keyboard readiness from direct-focus activation: Chrome/Firefox pass, but WebKit skips clarification buttons at both tested widths. [Retained failure traces](../../comparison/evidence/packed-keyboard/README.md). Keyboard requirements are unchanged; browser/OS configuration and actual Safari need investigation.

Follow-up: the minimal native form reproduces WebKit’s Tab behavior; [explicit Option-Tab](../../comparison/evidence/packed-option-tab/README.md) completes all six SDK journeys and twelve-file readback without changing settings. This supports a navigation-mode explanation while preserving the ordinary-Tab failures. Actual Safari, screen readers and physical devices remain unverified.

Developer integration usability: the [calendar example](../../comparison/evidence/readable-sdk/README.md) now shows readable interpretation and nearby actions, with optional JSON. Six scoped keyboard/browser journeys and twelve-file readback pass. Main-app, physical-device and human task-completion gates remain unchanged.

Calendar evidence correction: the historical exact-duration fixture lacked PRODID. The [corrected control](../../comparison/evidence/duration-control/README.md) preserves dates and expected duration and still fails both readers. Reader agreement cannot certify this case; ongoing-export and real-client gates remain open.

SDK documentation correction: [archive e2293d2d](../../comparison/evidence/sdk-contract-docs/README.md) changes only README.md. It now distinguishes weekly/monthly fields and complete finite files from ongoing previews. All capability requirements and unresolved gates remain unchanged.

Same-month missing-year recovery now asks for a selected shared year before time scope. The [main-app journey](../../comparison/evidence/year-choice/README.md) preserves input/spans/title, downloads both events and resets after edits at 320/1280 px. Packed SDK/runtimes remain pending; e2293d2d predates this implementation. Mixed-month shorthand and broader language gaps remain open.

Shared-year integration is now verified in [archive 906f3a6f](../../comparison/evidence/year-sdk/README.md): Node 22/26, strict installed declarations, six browser/viewport runs, local workerd and fifteen independently read files. Earlier pending-package notes are historical; broader language, ongoing export, devices and independent evaluation remain open.

Current [906f3a6f performance evidence](../../comparison/evidence/performance-year/README.md) replaces the stale-candidate timing gap for four inspected preview inputs only. gpu-time remains faster for startup/batches and smaller; Tempus has lower Node single p50 but higher p95. No correction/export/device or general superiority claim follows. Historical results are preserved.

The [reusable development replay](../../comparison/evidence/year-journeys/README.md) now includes the shared-year reminder as task 18. It verifies intermediate export refusal, both selected answers, per-item spans, no invented duration, complete file content and edit invalidation. Both readers pass all eighteen files; comparison family totals are unchanged. This adds development coverage, not an independent participant or holdout.

Mixed-month year → time → complete file → edit recovery now passes in the main app at 320/1280 px. [Scope and readback](../../comparison/evidence/mixed-month/README.md). Current source differs from packed archive 906f3a6f; runtime/performance and the retained 18-task snapshot are historical for this source delta, not refreshed evidence.

The mixed-month delta now has [packed archive 1dbb7a0b verification](../../comparison/evidence/mixed-month-sdk/README.md) in Node 22/26, installed TypeScript, six browser/viewport runs and local workerd, with fifteen independently read files. The [current development replay](../../comparison/evidence/mixed-month-journeys/README.md) contains 19 complete tasks. Prior runtime/performance reports keep their original scope; no independent evaluation or superiority claim follows.

Correction/alternative choices now distinguish date-only points and all-day intervals from explicit midnight appointments. [Regression and correction-to-file evidence](../../comparison/evidence/correction-precision/README.md) includes both paths at 320/1280 px and four independently read files. This source label change is newer than packed archive 1dbb7a0b; historical runtime evidence is not relabeled.

Packed archive 7d1907c6 now verifies the correction precision fix in Node 22/26 and installed TypeScript. [Archive review](../../comparison/evidence/precision-sdk/README.md) confirms only the interpretation description implementation changed; 55 other files are identical. This is not a browser/Worker rerun or a new comparison result.

The current 7d1907c6 archive now has [direct precision-label browser/Worker evidence](../../comparison/evidence/precision-runtimes/README.md): six browser/viewport runs, local workerd and 29 independently read files. Node/TypeScript evidence is linked separately. WebKit uses explicit Option-Tab; physical devices, real calendar imports and independent evaluation remain open.

DX/TRUST evidence: archive 7d1907c6 passes [static import-closure review](../../comparison/evidence/import-closure/README.md), including declared runtime dependencies and intended exports. This scoped packaging result does not close upstream/compiler provenance, side-effect analysis, independent security review or hosting gates.

TRUST provenance: [fresh official timezone archives and local rebuild](../../comparison/evidence/timezone-upstream/README.md) reproduce all 597 bundled zone bytes and the retained compiler hash. This strengthens source-to-payload evidence without claiming detached-signature verification, independent review or cross-host/hermetic reproducibility.

TRUST tooling: [timezone generation guards](../../comparison/evidence/generator-guards/README.md) now enforce successful builds, matching compiler/license bytes and fresh outputs. Generated payload bytes remain unchanged. This is scoped local tooling evidence, not independent provenance or hosting verification.

MATH/UX evidence: [six original-calculator journeys](../../comparison/evidence/calculator-copy-trace/README.md) now directly verify real clipboard readback, visible arithmetic steps and strict API v2 replay for written-order contrasts and half-second precision, plus invalid-edit recovery at 320/1280 px. Cross-application paste, devices, screen readers and independent task-completion evaluation remain unverified.

EVIDENCE correction: the [Tempus preview adapter](../../comparison/evidence/collection-adapter/README.md) now retains collection all-day flags instead of forcing timed precision. Three controls pass; current 31-case summaries remain unchanged. The legacy score still omits event text, qualifiers, written order and complete recurrence/export semantics, so preview agreement must not be presented as complete task success.

INPUT/RECOVERY: [missing item-year clarification](../../comparison/evidence/item-year/README.md) now completes a cross-year two-date reminder through year/time selection, file download and edit invalidation. Written years and source spans stay intact. Scope: every month named, one distinct written year; missing months and broader conflicts remain open. Current packed/replay evidence predates this source delta.

Missing item-year recovery now has [current archive 11018566 runtime evidence](../../comparison/evidence/item-year-sdk/README.md), including Node 22/26, installed TypeScript, six browser/viewport runs, local workerd and 29 independently read files. The [current development replay](../../comparison/evidence/item-year-journeys/README.md) has 20 complete tasks; comparison summaries are unchanged, and the separate duration diagnostic still fails. The initial browser startup failure is preserved alongside its successful retry.

Release verification: [task-owned format/lint/type checks and evidence integrity](../../comparison/evidence/release-check/README.md) pass. Full `pnpm check` remains failing on the preserved unrelated auxiliary formatting issue; no global clean-check or competitive claim is made.

## Release checklist before current-candidate reconciliation

Historical snapshot; current gate status lives in release-checklist.md.

# Tempus release checklist

**Release incomplete.** Keep the [product matrix](../product-matrix.md) as the acceptance contract. Complete input → correction → usable output journeys take priority over additional grammar. Work stays local: no push, publication, deployment, cloud mutation or calendar write is authorized.

This is the current gate summary, reconciled September 13, 2026. [Release verification](release-verification.md) preserves the dated milestones, raw artifact locations and failures. Historical results do not certify a newer candidate. Passing development tests does not establish competitive superiority.

## Current candidate and evidence

Current archive `110185666dc9da97be3bfa9b9b073d7a8fd826c222d88f5fdf591dfa6f02009f` has [direct item-year packed runtime evidence](../../comparison/evidence/item-year-sdk/README.md): Node 22/26, TypeScript, six browser/viewport runs, local workerd and 29 independently read files. The [current source snapshot](../../comparison/evidence/item-year-journeys/README.md) contains 20 complete tasks. Earlier runtime and performance sections below retain their original artifact scope.

Latest source fixes misleading midnight labels in date-only correction choices and all-day alternatives. 65 targeted tests, build and four desktop correction/download/edit runs pass; all four saved files pass independent readback. [Evidence](../../comparison/evidence/correction-precision/README.md). Archive 7d1907c6 now passes [installed Node 22/26 and TypeScript checks](../../comparison/evidence/precision-sdk/README.md); [direct packed browser/Worker checks](../../comparison/evidence/precision-runtimes/README.md) now pass, including 24 browser downloads and five Worker files independently read.

**Prior runtime candidate:** archive `1dbb7a0be85c7a6bb7610c65c82c1316571abb4424fc6a1a417ee08e29321df4` passes [packed mixed-month checks](../../comparison/evidence/mixed-month-sdk/README.md), including Node 22/26, TypeScript, six browser/viewport journeys, local workerd and fifteen-file readback. The [current replay](../../comparison/evidence/mixed-month-journeys/README.md) has 19 complete tasks. The detailed 906f3a6f runtime/performance record below remains historical; performance was not rerun for this delta.

[Shared-year clarification](../../comparison/evidence/year-sdk/README.md) now has current packed Node/browser/Worker evidence in addition to the main-app journey. Runtime and file-reading scopes remain distinct from devices and actual imports.

- **SDK:** private `@tempus-date/core` 0.1.0; archive SHA-256 `906f3a6f9e0d4cf73cd18e281f0dc9ed2d2b6312b35d3475562a6d39dd8d8004`. All 56 installed files match. [Current year-choice evidence](../../comparison/evidence/year-sdk/README.md): five examples each on Node 22/26, installed declarations, six browser/viewport runs and local workerd. Fifteen generated files pass independent readback.
- **Source:** 755 source checks and the 18-journey replay pass, reported as 756 test cases combined (the replay is one test case). The production build passes with the existing bundle warning: 898.73 kB client JavaScript / 264.81 kB reported gzip. [Latest source and presentation review](release-verification.md#date-list-source-and-presentation-review).
- **Performance:** [current archive 906f3a6f Node/Chrome measurements](../../comparison/evidence/performance-year/README.md) favor gpu-time for startup, batches and bundle size. Tempus's lower Node single p50 has a higher p95. This is four inspected preview tasks; year clarification, export, device and human performance remain unmeasured.
- **External evidence:** no calendar-client imports, physical-device runs, independent holdout or independent human-completion study. Current Cloudflare settings and deployed behavior have not been verified by this local work.

## Complete user journeys

| Journey            | Verified scope                                                                                                                                          | Remaining gate                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Calculator         | Written-order arithmetic → inspectable trace → copy → strict API parity; fractional-second display/copy; invalid edit and recovery                      | Broader tasks, screen reader and physical devices; cross-application paste is unverified  |
| Reminder           | 18 inspected scripted correction-to-file journeys cover titles, direct commands, durations, numeric dates, DST, alternatives and replacements           | Independent human completion; broader conflicts and input families                        |
| Finite schedule    | Complete ranges, exclusions and clock choices; a two-year keyboard task resolves four choices and downloads all 103 intervals                           | Actual calendar-client import and broader collection recovery                             |
| Monthly schedule   | Short-month choice → bounded preview → complete four-interval download → edit; ordinary ongoing monthly intervals also have download/expansion evidence | Future ambiguous clocks, intervals spanning offset changes and ongoing day-29/30 clamping |
| Explicit date list | Numeric date → shared-time scope → repeated-clock choice → two-event download → restart/edit; mixed date-only/timed output retains precision            | Mixed-month shorthand and broader conflict recovery                                       |
| Recovery           | Keyboard selection, restart, unchanged-input editing, failed-download cleanup/retry and stale-export prevention in recorded paths                       | Screen reader, physical devices and human completion                                      |

The 18-task source replay, separate browser journeys and file-reader checks have different scopes. They are authored development evidence; they are not 18 independent human studies. The [monthly](monthly-schedules.md#implementation-progress), [list](release-verification.md#shared-time-clarification-and-packed-date-list-candidate) and [blocked-export](release-verification.md#blocked-export-edit-recovery) records retain exact inputs and outputs.

- [x] Complete the recorded correction-to-output paths without losing input, title, duration, source spans or selected clocks.
- [x] Verify [original calculator copy/visible trace/API replay](../../comparison/evidence/calculator-copy-trace/README.md) with real clipboard readback on written-order and fractional-second tasks at 320/1280 px. This is not cross-application paste or physical-device evidence.
- [x] Preserve date-only entries as all-day dates and timed points without an invented duration; explain that a calendar client may display its own default duration.
- [ ] Finish ongoing recurrence recovery. Offering an end date completes a different finite task; it does not satisfy the original ongoing request.
- [ ] Complete broader language/conflict journeys, then verify their full outputs rather than only recognition.

## Calendar export: three separate gates

| Gate                                      | Status                                    | Evidence or required action                                                                                      |
| ----------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| File construction and independent reading | Partial                                   | Finite journey files and selected ongoing rules pass recorded readers; known disagreements below remain failures |
| Browser download of reviewed output       | Verified in scoped local desktop journeys | Includes complete output beyond preview, keyboard use, retry and edit invalidation                               |
| Actual calendar-client import             | Unverified                                | Requires authorization and a disposable calendar, followed by inspection in the actual client                    |

- [x] Validate finite file endpoints, all-day/exclusive ends, complete collections, selected clocks, escaping and rejection paths. Both readers pass the 18 current recorded journey files; packed runtime files have separate readback evidence.
- [x] Keep parsing and file preparation free of calendar writes. Bind download to an explicit action on the current reviewed result.
- [ ] Finish explicit future-clock policy and faithful ongoing intervals spanning offset changes. Do not substitute the preview or invent an end date.
- [ ] Resolve the pending decision about experimental elapsed-duration export versus retaining the block until client verification. No answer or permission is assumed; the block remains.
- [ ] After authorization, import the reviewed [diagnostic pack](../calendar-client-check.md) into disposable real calendars and inspect dates, durations, exclusions and recurrence.
- [ ] Verify physical iOS/Android download and import separately.

**Known failures stay visible:**

- A two-series day-29/30 clamp diagnostic passes both readers for four files, 4,798 occurrences each (UTC/Chicago, 400 years, two exclusions, 30-minute intervals). This requires separately editing/deleting February and other-month series. Explicit opt-in versus retaining the block is a pending product decision; actual imports and arbitrary starts/clocks remain unverified. [Candidate and limitations](../../comparison/calendar/README.md#two-series-monthly-clamping-candidate).

- The locked Python conformance command exits 1 on the duration-rule fixture. The [PRODID-corrected control](../../comparison/evidence/duration-control/README.md) retains the same mismatch in both readers; it is an authored reader diagnostic, not an exporter defect. The optional timezone suite passes 7/8; libical diagnostics pass 8/10. A parseable file is not proof of correct recurrence expansion.
- Monthly day-29/30 clamp candidates fail interoperability: ical.js passes 1/5 candidates, Python 3/5. BYSETPOS produces extra dates in ical.js; RSCALE/SKIP fails both tested readers. No failing candidate was enabled. [Reproduction](../../comparison/calendar/README.md).
- One Chicago elapsed-duration candidate passes 20,870 occurrences with libical/ICU, while no-ICU and later-year probes retain failures. This does not establish general compatibility. [Exact scope](../../comparison/calendar/README.md#ongoing-elapsed-duration-candidate).

## Packed SDK runtimes

The table below refers to archive `906f3a6f…` and its [retained reports](../../comparison/evidence/year-sdk/README.md). Earlier archives and consumer presentations remain historical in the [evidence index](../../comparison/evidence/README.md).

| Runtime/check                                      | Result                                                            | Limit                                                                               |
| -------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Clean offline install, scripts disabled            | 56 installed files match                                          | Private local archive; not published                                                |
| Node 22.12.0 and 26.8.1                            | Five examples each pass                                           | Authored examples, not every possible consumer                                      |
| Strict installed TypeScript consumers              | Browser/calendar/Worker declarations pass                         | Public API stability still needs release review                                     |
| Chrome 153.0.8010.36, Firefox 148.0.2, WebKit 26.4 | Six 320/1280 px correction/download/edit journeys pass            | WebKit uses explicit Option-Tab; desktop engines, not physical phones or Safari.app |
| Local Wrangler 4.131.1/workerd                     | Weekly/monthly/list interpretation, recovery and file checks pass | Not a deployed Worker                                                               |
| Independent file readback                          | Twelve browser downloads and three Worker files pass              | Not a calendar-client import                                                        |

**Keyboard gap:** [ordinary-Tab WebKit runs](../../comparison/evidence/packed-keyboard/README.md) failed at both widths. A minimal native form reproduced the mode difference; explicit Option-Tab succeeds. No settings changed. Retain the failure and verify actual Safari/device behavior before closing the broader gate.

- [x] Verify context-bound answers, invalidation after edits, batch isolation, reusable-parser snapshots and bounded clarification history in the recorded source/packed checks.
- [ ] Verify Safari.app, retail Firefox, physical devices, offline startup and deployed Workers where claimed.
- [ ] Decide public package name/version, API guarantees and migration policy before publication.

Integrators own current input/context and external actions. The optional calendar entry point prepares a file; it does not create a reminder or write a calendar. [Integration boundary](../schedule-contract.md#calendar-export-boundary).

## Evaluation, performance and release review

- [x] Retain a [non-ignored development review snapshot](../../comparison/evidence/README.md) with 31 comparison cases, 18 scripted tasks, 18 calendar files and source/file hashes. The exporter refuses stale reports; verification detects changed files. This preserves existing development evidence, not independent evaluation.
- [x] Retain [monthly compatibility diagnostics](../../comparison/evidence/monthly-compatibility/README.md), including all five single-series cases, four two-series cases, failing reader results, expected dates and checksums. Fresh replay reproduces all nine prior file byte sequences.
- [x] Provide a [portable packed-Node runner and reports](../../comparison/evidence/packed-node/README.md): Node 22/26, 56 matching installed files, five examples and installed declaration checks. It refuses repository/existing output directories and runs no servers or external actions.
- [x] Provide a [packed Worker diagnostic and independent file readback](../../comparison/evidence/packed-worker/README.md): installed declarations, seven failure codes, stale-answer and metadata recovery, and complete 9/2/4-event files. Local workerd only; no client import.
- [x] Provide [packed browser correction/download runners and reports](../../comparison/evidence/packed-browser/README.md): Chrome/Firefox/WebKit, 320/1280 px, 12 independently read files, restart/edit/blocked-output recovery. Developer example only; physical devices remain unverified; current keyboard scope and the ordinary-Tab WebKit failure are recorded above.
- [ ] Make remaining main-app browser journeys and diagnostic evidence portable for a fresh checkout; local scratch reports alone cannot close public-review gates.

- [x] Retain gpu-time 0.2.1 and the September 13 registry check; refresh before freezing a comparison.
- [x] Retain [current-archive desktop performance](../../comparison/evidence/performance-year/README.md): Node/Chrome batch-100 p50/median 20.808/27.25 ms versus gpu-time 10.829/8.05 ms. Tempus parsing bundle is 514,339 minified / 146,124 gzip bytes; parsing plus calendar is 531,971 / 151,635 bytes. Four inspected preview inputs do not measure correction or export completion. Historical reports retain their original identities.
- [ ] Measure the final candidate's agreed workloads and resource budgets. Physical-device latency, peak memory, battery and comparative task completion remain unmeasured.
- [x] Correct [collection precision in the comparison adapter](../../comparison/evidence/collection-adapter/README.md) and refresh the 19-task source snapshot. Existing 31-case scores are unchanged; full event/rule semantics remain outside that preview grade.
- [x] Draft the [independent evaluation protocol](../../comparison/evaluation/protocol.md) and [readiness record](../../comparison/evaluation/status.json).
- [ ] Obtain an independent evaluator and holdout custodian; run an independent pilot, then freeze claims, policies, sample allocation, analysis and regression margins before opening holdouts.
- [ ] Report per-family wrong accepts, abstentions, policy disagreements and corrected task completion. The 31-case inspected corpus and 18 scripted journeys cannot substitute for this evidence.
- [x] Preserve the sealed security scan: partial coverage, 107/108 inventory items fully reviewed, no reportable findings. It predates later implementation changes. [Snapshot and limits](../security-review.md#current-diff-scan--september-13-2026).
- [x] Record limited post-scan implementation/list/download reviews and full timezone-byte comparison against the retained build. These do not refresh the sealed scan or establish independent compiler provenance.
- [x] Review the current archive’s [static runtime import closure](../../comparison/evidence/import-closure/README.md): declared Tempus → Temporal → JSBI edges, both browser bundles without external imports, intended exports, and negative checker controls. This is not runtime side-effect or upstream provenance proof.
- [x] [Rebuild bundled timezone bytes from fresh official HTTPS archives](../../comparison/evidence/timezone-upstream/README.md): matching pinned hashes, compiler binary, all 597 zones/344 unique payloads and license.
- [x] Tighten [timezone generator preconditions](../../comparison/evidence/generator-guards/README.md), verify unchanged fresh output and failure rejection without destination changes.
- [ ] Complete review of accumulated post-scan changes, remaining diagnostic tooling and hosting readiness. Detached-signature verification, independent review and cross-host/hermetic compiler provenance remain open.
- [x] Retain dated full/production/development advisory checks with no reported advisories. This is not security certification.
- [x] Run [task-owned format/lint/type checks and retained-evidence integrity checks](../../comparison/evidence/release-check/README.md). Immutable evidence JSON is excluded from formatting, not rewritten; 263 existing checksum entries match.
- [ ] Complete whole-repository validation. `pnpm check` still fails solely on unrelated `aux/misc/rust-wasm-spike/profile.mjs` formatting, which remains untouched. Scoped passing checks do not close this gate.
- [ ] Obtain authorization for a concrete push, publication or deployment after local review. None is authorized now.

## Work order and missing access

| Priority | Work                                                        | Can proceed locally?                                                                                                                                 | Completion evidence                                                                                                 |
| -------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1        | Ongoing recurrence correction and export contract           | Review and bounded fixes can proceed. Experimental elapsed-duration export and two-series clamping have unanswered product decisions; retain blocks. | Original ongoing request survives correction; faithful complete rule; documented compatibility limits               |
| 2        | Mixed-month lists and broader conflict recovery             | Yes                                                                                                                                                  | Input → clarification → complete usable output → edit invalidation, with original text preserved                    |
| 3        | Reproducible main-app checks and accumulated release review | Yes                                                                                                                                                  | Fresh-checkout runner evidence, reviewed package/import closure, post-scan diff and timezone provenance             |
| 4        | Real calendar-client import                                 | Requires separate write authorization and disposable calendars/client access                                                                         | Inspect imported dates, durations, all-day status, recurrence and exclusions; not merely an import dialog           |
| 5        | Device and accessibility journeys                           | Requires physical iOS/Android, screen-reader and Safari.app access                                                                                   | Actual input/correction/download paths; record device, browser, navigation mode and failures                        |
| 6        | Independent comparison                                      | Requires independent evaluator, holdout custodian and participants                                                                                   | Independent pilot; agreed claims, budgets, margins and analysis; frozen artifacts/protocol before unopened holdouts |

The [task queue](tasks.md) tracks immediate work. The [evaluation readiness record](../../comparison/evaluation/status.json) lists unresolved evaluation decisions. Nobody has supplied the missing decisions, independent data or calendar authorization; do not infer them from elapsed time or passing tests.

The current [31-case/18-journey snapshot](../../comparison/evidence/year-journeys/README.md) and [independent file readback](../../comparison/evidence/year-journey-readback.json) preserve the shared-year task. All eighteen files pass; strict duration conformance fails separately. Historical 17-task reports retain their original scope. The existing goal remains open.

<details>
<summary>Matrix before the Writer edit</summary>

# Tempus product matrix

**Scope decision:** [Product focus and decision gate](../product-focus.md) supersedes the broad competitor-parity goal below. This matrix is retained as an inventory and historical comparison, not a requirement to implement every competitor capability. New feature families are paused; existing supported behavior remains protected.

**Product boundary (September 13, 2026):** Tempus interprets natural language as date data. This matrix uses reminder and scheduling tasks to evaluate interpretation, correction and outputs. Delivering reminders or managing calendar accounts belongs to applications built on Tempus; neither is a missing native product feature.

The active acceptance contract is the explainable engine and its evaluation gate. The wider capability inventory below remains incomplete. Use the [release checklist](../release-checklist.md) for current artifact identities and evidence, and [tasks.md](tasks.md) for active work.

Performance and resource use are acceptance criteria alongside complete journeys, correctness and independent evaluation. No-model operation is not evidence of low cost; authored tests are not evidence of overall superiority.

## Updated arithmetic evidence

[Direct gpu-time 0.3.0 probes](../arithmetic-comparison.md) demonstrate written-order relative shifts, per-step month-end clamping and DST-aware day/hour arithmetic. Earlier failures on Tempus’s five anchored/fractional expressions are grammar-specific evidence, not proof those underlying arithmetic capabilities are absent. The historical baseline below remains versioned.

## Baseline and scope

Reviewed September 12, 2026 against Tempus `d91a7ca` plus the local implementation recorded in `tasks.md` and gpu-time's [0.2.1 source](https://github.com/arikchakma/gpu-time/tree/aba27e54aabe7310cba5c160fa2079045096ffb1). Our [local comparison](../../comparison/README.md) now runs **gpu-time 0.2.1**. Historical 0.2.0 results are retained separately.

The newer release reports fixing the `set OOO for 3 days from today` duration regression. It also records remaining duration and clock-with-place gaps. Our refreshed runner still observes the same incorrect duration point under its fixed context; it does not reproduce that reported fix. Correct-result counts are unchanged from 0.2.0, while one incorrect arithmetic answer becomes an abstention. Historical reports are preserved; see the comparison notes for the versioned corpus policy change.

| User job                                      | Required outcome                                                          | Fair comparison                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Enter a reminder or schedule in short English | Inspect the full interpretation, correct it, then copy or export it       | Same inputs, context and output semantics; measure the whole task in equivalent interfaces                     |
| Add date recognition to an application        | Install a package and obtain typed points, intervals or schedules locally | Library against library, including runtime support, limits, bundle cost and integration effort                 |
| Calculate a date through several operations   | Get a reproducible answer with an inspectable explanation                 | Preserve Tempus arithmetic; describe this as an additional capability, not proof of better schedule extraction |

English reminder fields, schedule forms and command bars are the initial scope. Arbitrary documents, other languages and consequential scheduling are not promised. Do not add GPU processing or rewrite the language/framework without a measured constraint.

Performance and resource efficiency are explicit acceptance criteria alongside complete journeys, deterministic correctness and independent evaluation. The [performance budgets](../performance-budgets.md) define separate parsing, explanation, correction and export lanes, provisional latency/size/memory gates, and missing physical-device and energy evidence. [Large-file review and resource stress](../../comparison/evidence/large-export-resources/README.md) now cover all 1,000 events through pagination and separately read downloads. [Built worker preparation](../../comparison/evidence/worker-preparation/README.md) avoids observed export long tasks in two desktop runs with cancellation and stale-response protection. Ready time, additional worker transfer and retained process-memory growth remain open. No-model operation does not imply lower resource use. The measured competitor path is CPU.

## Capability matrix

“Partial” means a bounded implementation exists. “Missing” means the product capability is absent. “Unmeasured” means we have no adequate comparative evidence. Competitor capabilities below are documented upstream unless a local result is explicitly given.

| Area                             | gpu-time baseline                                                                                | Tempus today                                                                                                                                                                                                                                                                           | Requirement                                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **INPUT — Recognition**          | Short English dates, ranges and recurrence; coverage has documented gaps                         | **Partial:** points, intervals, weekly/monthly recurrence and finite date lists retain event/item spans. Shared-time, shared-year and missing item-year choices complete recorded file journeys. Broader shorthand and language remain open.                                           | Cover the same declared input families. Preserve the original text and remaining event text. Account for every date, duration, condition and correction instead of silently dropping them |
| **CORRECTNESS — Interpretation** | Neural token recognition followed by TypeScript calendar resolution                              | **Partial:** strict evaluator plus conservative sentence rules; rejection tests, no independent language evaluation                                                                                                                                                                    | Separate recognition from resolution. Validate the complete candidate; distinguish unsupported input, no expression and ambiguity. Publish calendar policies and policy disagreements     |
| **MATH — Calendar arithmetic**   | Resolves timezone, DST and calendar values after recognition                                     | **Present within documented grammar:** ordered operations, fractions, clamping, DST policy and trace                                                                                                                                                                                   | Preserve existing behavior while adding intervals and schedules. Make assumptions and approximations inspectable                                                                          |
| **RECOVERY — Correction**        | Structured diagnostics for the caller to handle                                                  | **Partial:** staged date/year/time, DST, interval, correction and arithmetic choices preserve input. Date-only choices retain civil-date precision; edits invalidate dependent answers. Broader conflicts remain open.                                                                 | Ask one concrete question at a time, retain the input, and resolve the selected alternative without requiring the user to reconstruct the request                                         |
| **UX — Complete the task**       | Library and demonstration interface                                                              | **Partial:** readable results, copy and keyboard correction-to-file paths; bounded complete files and selected ongoing rules. Actual calendar-client imports, physical devices and human completion remain unverified.                                                                 | Add interval and recurrence previews, correction and export. Keep the next action obvious; put optional explanation behind disclosures                                                    |
| **DX — Integration**             | Parse, batch and reusable parser APIs; CPU/WebGPU; occurrences, recurrence rules and diagnostics | **Local candidate:** a7f9e298 passes seven Node22/26 examples, installed types and 31-case/25-journey replay. Broad offline browser/Worker evidence retains e70f6d12. Public stability, devices and deployed Workers remain open.                                                      | Publish a versioned package with discriminated outcomes, batch calls, browser/Node/Worker support, limits and a runnable integration example                                              |
| **EVIDENCE — Comparison**        | Published model card, development evaluations and limitations                                    | **Partial:** latest retained replay has 31 inspected comparison cases and 25 authored correction-to-file tasks. Current packed/source outputs match; the corpus still lacks comparative count tasks and independent evaluation.                                                        | Reproducible, versioned, per-family evaluation with independent expected answers; report failures, abstentions and task completion together                                               |
| **PERF — Ordinary devices**      | Local CPU/WebGPU; automatic routing favors CPU for smaller workloads                             | **Partial:** e70f6d12 has packed CPU/allocation profiles, per-input Node/Chrome timings and separate trace/correction/export measurements. gpu-time leads measured startup, batches, size and pooled tails. Peak memory, devices, energy and independent evaluation remain unmeasured. | Measure cold and warm single-input work, batches, memory and transfer size on ordinary phones and browsers before choosing acceleration                                                   |
| **TRUST — Use and side effects** | Local inference; model card limits intended use and warns against consequential scheduling       | **Partial:** local browser/library parsing; explicit API replay sends a phrase. Current-interpretation file download requires a click; no reminder delivery or calendar write. Hosting and client-import gates remain open.                                                            | Keep parsing side-effect free. Show current interpretation before export or external writes; invalidate approval after an edit. Document limits, privacy and operational boundaries       |

Deterministic calendar math is shared ground: gpu-time already has it. Neither deterministic rules nor a neural model guarantee correct intent recognition. Highlighting words explains what the parser used; it does not prove the interpretation is right.

## Acceptance gates

These are **requirements for future work**, not achieved results. Each implementation should name its matrix IDs and attach evidence. A passing development corpus permits a bounded feature release; it does not permit a general accuracy claim.

| Area        | Evidence required to close the capability gap                                                                                                                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INPUT       | Positive, negative and minimally changed contrast cases for each supported family. Check exact source spans and retained event text, including punctuation, names, multiple mentions and trailing qualifiers. Score a lost duration or exception as an incorrect result                                                                        |
| CORRECTNESS | Independently specified expected semantics with fixed reference, timezone and date-order policy. Evaluate negation, correction, uncertainty, DST gaps/folds and conflicting dates. Separate policy disagreement from parser failure; publish both                                                                                              |
| MATH        | Existing protected cases remain correct. Add leap years, month ends, fractional units, written-order contrasts, DST crossings and explicit interval-end semantics. Trace and result must agree; reuse of the same resolver is not an independent oracle                                                                                        |
| RECOVERY    | Actual UI tests for “March 4 or April 3?”, “Which 1:30 AM?” with timezone offsets, and “Did Saturday replace Friday?”. Selecting, changing or cancelling an answer preserves text and produces the right current state. Measure completed corrections, not just returned diagnostics                                                           |
| UX          | Complete input → inspect → correct → copy/export tasks on phone and keyboard. Verify focus, screen-reader labels, 320px layout, empty/error states and stale-result handling. Show all-day versus timed values, timezone, interval endpoints and bounded recurrence previews                                                                   |
| DX          | Install the packed artifact into clean browser, Node and Worker examples. Test single/batch semantic parity, ordering and per-item errors. Document supported versions, input/expansion limits, cancellation or resource lifecycle where relevant, API stability and migration from strict v2                                                  |
| EVIDENCE    | Refresh competitor version; freeze policies and claims before evaluation. Keep training/development inputs separate from a sealed holdout. Publish corpus provenance, raw outputs, versions, hashes, denominators and uncertainty. No aggregate winner that hides weak families                                                                |
| PERF        | Same inputs, output contract, occurrence horizon and runtime on both libraries. Report cold initialization, warm p50/p95 latency, throughput, peak memory and compressed core bundle size separately from full-app assets. Test iOS Safari, Android Chrome and desktop with CPU fallback; record hardware and versions                         |
| TRUST       | No unresolved or stale interpretation can be exported or written externally. Test the edit/confirm/write sequence. Validate calendar exports with an independent reader and calendar import, including timezone, all-day dates, DST, exceptions and truncation. Document network behavior and the remaining hosting/security review separately |

An explicit Export action after viewing a current, resolved preview can be the confirmation. Routine text copying does not need a second approval dialog. Future calendar writes or reminder creation need an explicit action tied to that exact interpretation. The SDK itself performs no external actions; the integration example must demonstrate this boundary.

## What our measurements say

The current SDK archive is **b1cbd22a**, a private 0.1.0 candidate. [Selection-history validation](../../comparison/evidence/selection-history-boundary/README.md) fixes inconsistent malformed-argument handling; valid 31/25 replay and Node22/26 consumers pass. The broad runtime and resource reports below retain **a7f9e298**. [Recipient condition review](../../comparison/evidence/recipient-condition-review/README.md) corrects conditional title proposals while retaining complete lowercase title/date/DST/file/edit paths, Node22/26 verification and unchanged 31/25 replay. [Current resource measurements](../../comparison/evidence/current-a7f-resources/README.md) now cover **a7f9e298**; [local Worker verification](../../comparison/evidence/current-a7f-worker/README.md) also covers **a7f9e298**. [Offline-after-load browser verification](../../comparison/evidence/current-a7f-offline/README.md) now covers the same **a7f9e298** archive in six desktop contexts with 90 separate file readbacks. Historical reports below retain their original identities. [Resource evidence](../../comparison/evidence/snapshot-resources/README.md) records 31 inspected cases and 25 authored correction-to-file tasks, Node22/26 examples, source tests and full-output equality. [Runtime evidence](../../comparison/evidence/snapshot-runtime/README.md) covers desktop offline-after-load and local Worker journeys. These are regression/integration checks, not independent language or usability evaluation. [Preview scoring](../../comparison/evidence/preview-scoring-scope/README.md) ignores occurrence order and does not grade event/source text, full recurrence, correction or export; generated JSON records these limits.

The shared performance workload has four repeated inputs using gpu-time's CPU path. Tempus's current Node single median is lower and Chrome medians tie at reported precision; gpu-time leads startup, batches, size and pooled single-call tails. Snapshot reuse improves scoped calculator/correction/export timing, but process RSS and Chrome cold start did not improve. These results do not establish overall superiority or phone/energy behavior.

The [release checklist](../release-checklist.md) is the single current evidence index. It separates SDK, main-app, file-reader and historical artifacts; a newer result does not retroactively refresh another scope. Actual calendar imports, physical devices and independent evaluation remain unverified. [Reader isolation](../../comparison/evidence/utc-reader-isolation/README.md) also shows why correct UTC round trips alone cannot validate displayed clocks.

## Current release blockers

- Complete broader input/conflict journeys with retained qualifiers, source text and usable corrected outputs. Recorded paths do not establish general language reliability.
- Resolve faithful ongoing export for future ambiguous clocks, intervals across offset changes and day-29/30 clamping. Reader diagnostics still disagree. Experimental elapsed-duration export and two separately editable monthly series remain blocked pending product decisions and client verification; a finite substitute does not complete an ongoing request.
- Verify actual calendar-client imports separately from file reading and download. Obtain disposable-calendar write authorization before importing.
- Review public SDK stability, accumulated post-scan changes and hosting readiness. Safari.app, retail Firefox, deployed Workers and physical devices remain unverified. The sealed security scan predates later changes; fresh timezone rebuild parity does not establish signatures or independent compiler provenance.
- Measure the final candidate on agreed workloads and physical devices. Obtain screen-reader and human task-completion evidence.
- Obtain an independent evaluator and holdout custodian; run the pilot and freeze policies, budgets, margins and claims before opening holdouts.
- Close whole-repository validation: task-owned formatting/lint/types pass, but `pnpm check` fails on preserved unrelated `aux/misc/rust-wasm-spike/profile.mjs` formatting. No push, publication, deployment or calendar write is authorized.

The [release checklist](../release-checklist.md) owns detailed gates; [tasks.md](tasks.md) owns next local actions. The milestone exit conditions below remain unchanged.

## Order of work

| Milestone                               | Work                                                                                                                                                                                    | Exit condition                                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Establish the current comparison** | EVIDENCE, CORRECTNESS: evaluate 0.2.1 without replacing historical results; freeze point/interval/recurrence, locale, DST and intent policies; define claim-specific evaluation budgets | Versioned report and explicit disagreements; independently written development cases for the next milestone; holdout protocol recorded before use |
| **2. Interpret complete schedules**     | INPUT, MATH: intervals and durations first, then bounded recurrence, boundaries and exceptions; retain source/event text                                                                | Complete values or explicit unresolved outcomes; protected arithmetic passes; duration versus offset contrasts and recurrence semantics verified  |
| **3. Resolve and use the result**       | RECOVERY, UX, TRUST: selectable clarification, phone/keyboard previews and independently validated export                                                                               | User can complete correction and export without losing input; unresolved/stale results cannot reach an external action                            |
| **4. Ship the integration contract**    | DX, PERF: extract the proven core into a package, run clean integrations and device benchmarks                                                                                          | Supported runtime matrix passes; documented limits and comparable performance evidence; no network requirement for local parsing                  |
| **5. Evaluate the claim**               | EVIDENCE across all areas: independent holdout and task-completion study                                                                                                                | Publish scoped strengths and failures. Claim improvement only for jobs whose parity, quality and usability gates pass                             |

Evidence collection starts in milestone 1 and continues throughout. Clarification semantics must be designed with the schedule contract, even though the complete interaction ships in milestone 3. Do not expose export before its trust gate passes.

## Rules for claiming “better”

For each user job, require supported-feature parity plus a measured advantage that matters to that job, with no unacceptable regression in agreed correctness, accessibility or resource budgets. More supported syntax alone is insufficient; rejecting every difficult input is also insufficient.

Report these measures by family:

- **Coverage:** completely correct resolved outputs / all valid inputs.
- **False acceptance:** wrong resolved outputs / all inputs, and wrong resolved outputs / all resolved outputs. Also report unsafe acceptance on the negative/ambiguous subset separately.
- **Abstention:** valid inputs left unresolved / all valid inputs; distinguish supported ambiguity from missing capability.
- **Task completion:** users reaching a correct usable result, including clarification, plus time and correction effort.
- **Cost:** latency, memory and bundle size for the same task, including initialization and fallback.

The [draft evaluation protocol](../../comparison/evaluation/protocol.md) defines job-specific output contracts, pilot decisions, outcome accounting and holdout custody. Its [status record](../../comparison/evaluation/status.json) is explicitly not frozen; it does not replace these acceptance rules.

Freeze sample sizes, confidence intervals, acceptable regression margins and performance budgets after a baseline pilot and **before** opening the holdout. They are not set yet; competitive claims remain blocked until they are. A zero-failure sample is not proof of zero risk. Feature safety gates require zero known unsafe exports in the acceptance suite, while language reliability claims require uncertainty estimates.

Holdout answers must be independently checked and kept out of implementation work. If an input is inspected to guide a fix, move it into development data and replace it before the next independent evaluation. Publish failed cases and policy mismatches alongside successes. Benchmark provenance must allow someone else to rerun the claimed result.

## Sources and maintenance

Competitor sources are pinned to `aba27e54aabe7310cba5c160fa2079045096ffb1`: [README/API](https://github.com/arikchakma/gpu-time/blob/aba27e54aabe7310cba5c160fa2079045096ffb1/README.md), [model card](https://github.com/arikchakma/gpu-time/blob/aba27e54aabe7310cba5c160fa2079045096ffb1/MODEL_CARD.md), [architecture](https://github.com/arikchakma/gpu-time/blob/aba27e54aabe7310cba5c160fa2079045096ffb1/architecture.md), and [changes since our evaluated release](https://github.com/arikchakma/gpu-time/compare/bbd7611c1f58c451d3caeed27e5d51ffc473d0e2...aba27e54aabe7310cba5c160fa2079045096ffb1).

Update this matrix when a capability ships or a competitor release changes the comparison. Include the evaluated versions and evidence, not just checkmarks. Use [tasks.md](tasks.md) for current execution and [the roadmap](tempus-roadmap.md) for implementation context. Existing [security review limits](../security-review.md) remain separate release obligations; parser quality does not establish hosting security or publication readiness.

Historical follow-ups are preserved in [the earlier matrix history](product-matrix-history.md) and [the complete pre-reconciliation snapshot](../../comparison/evidence/release-document-reconciliation/product-matrix.before.md). Update status in place and link scoped evidence from the release checklist; do not prepend milestone histories to this matrix.

</details>
