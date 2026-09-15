# Local journey and package verification

For the current candidate and open gates, start with the [release checklist](../release-checklist.md). This evidence log retains historical milestones: “current” and “latest” inside an older section refer to that section’s artifact, not the present release candidate.

## Local API boundary follow-up

The dated [security record](../security-review.md#current-local-api-review--september-13-2026) now explicitly excludes the current parser/calendar worktree from the older formal scan's verdict. This follow-up inspected the Worker boundary, changed shared API formatting and replay UI. No new defect was identified in that limited scope; the full current security review and live Cloudflare checks remain open.

`pnpm exec vp test run src/shared/parse-api.test.ts src/shared/timezone-integration.test.ts src/shared/compatibility.test.ts` passes **159 tests across three files**. These are local regression checks, including mocked request controls and pinned timezone/API parity. They do not represent new independent security coverage or production verification. No code behavior changed in this follow-up.

## Optional calendar bundle cost

The new `comparison/performance/calendar-bundle.mjs` verifies installed files against the archive, then bundles parsing exports, calendar exports and both together under identical browser/ES2022/minified ESM settings. Current archive `0341e306…` produces 506,402 / 143,542 bytes for parsing, 501,187 / 142,762 for calendar alone and 521,434 / 148,584 combined (minified / gzip). Calendar therefore adds **15,032 minified / 5,042 gzip bytes** to this parsing integration. Bundles, generated entries, esbuild metadata and identity-bearing reports are retained in `comparison/results/performance/calendar-bundle/`.

Shared pinned timezone data and Temporal/JSBI dominate the combined output; adding the two standalone bundle sizes would double-count shared code. Generated entry modules differ from the direct-entry comparison harness, explaining a slightly different parsing gzip size without a package change. This closes a bundle-cost evidence gap only: no calendar runtime timing, browser latency, network transfer, peak memory, battery or physical-device claim follows. The old September 12 table in the performance README is now explicitly labeled historical. Scoped script formatting/lint/types pass; app and SDK behavior are unchanged.

## Named recurrence choice groups

The recurrence export prompt and SDK calendar example labeled generic `div` elements without a group role. Chrome's accessibility snapshot exposed their questions and buttons but no named group. Both containers now use `role="group"`; the app group's accessible name is the exact occurrence question, and the SDK example retains its “Clarification choices” name. This follows the [WAI-ARIA group role](https://www.w3.org/TR/wai-aria-1.2/#group), rather than relying on naming a generic container.

Before/after snapshots and keyboard probes are saved in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-choice-groups/`. Chrome 153.0.8010.36 at 320px exposes the named group, reaches the second clock choice by Tab, resolves all nine intervals, enables download, and restores the prompt/disabled download on restart. Focus returns to the result/status; no horizontal overflow or page errors were observed. The app input stays intact. Scoped formatting, lint and type checks pass.

The SDK probe serves `group-calendar.html` beside the unchanged installed `0341e306…` archive. Original `calendar.html` and prior reports remain intact. Only app/example group semantics changed; calendar bytes and SDK implementation did not. This verifies an accessibility-tree and keyboard improvement, not actual screen-reader speech or physical-device accessibility. The local example server was stopped after the check.

## Local calendar integration release review

Source review confirms the web export component's React key includes input, reference, timezone and interpretation. Changes remount the component and reset its title, plan, decisions and download handler. Calendar preparation functions return text; the explicit browser action owns download. The package remains private, with separate parsing/calendar exports and both package and upstream timezone licenses. Its documentation assigns raw export-decision invalidation to the integrating host. No new defect was found within these reviewed boundaries.

`pnpm exec vp check src examples packages comparison` passes: **181 files formatted**, **165 files checked without lint or type errors**. Source identities and review scope are recorded in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-release-review/integration-review.json`. No implementation changed. This is a source/package-boundary review, not a full security assessment or a new browser verification. Whole-repository auxiliary formatting, dependency/security review, Cloudflare readiness, client import, physical devices and open recurrence behavior remain separate gates.

## Packed SDK correction-state boundary

`examples/sdk/state.mjs` now exercises a reminder from numeric-date clarification through repeated-clock selection to file preparation. Authored answers resolve November 1, 2026 at 07:30–08:00Z, with `call Sam` retained. Changing the event text, duration, timezone or reference makes the old selection behave exactly like a fresh parse and blocks file preparation until the new questions are answered. A batch preserves a resolved original, an unresolved edited reminder and an unsupported item in order.

The same check mutates the caller's nested selection history and scalar options after creating a reusable parser, then mutates a returned result. Subsequent results retain the captured context and correct interval. These checks pass against the installed `0341e306…` archive on Node 22.12.0 and 26.8.1; all 52 installed file hashes were rechecked. Script/output identities and raw results are in `state-verification.json`, `state-node22.json` and `state-node26.json` beside the archive. Scoped formatting, lint and type checks pass for the new script.

The initial harness used a clock ID without its required `interval:start:` prefix and failed before selection. Correcting the authored ID made the existing API journey pass; no implementation or expected instant changed. This checks Node SDK integration only. It does not extend Worker/browser evidence, bind raw recurrence-export decision arrays to context, validate a calendar-client import or establish language accuracy. Hosts still own export-decision invalidation.

## Release checklist evidence audit

The checklist now separates source integration, browser download, packed runtime and actual client-import evidence. It removes the obsolete claim that the SDK has no calendar API, corrects six scripted journeys to sixteen, and limits the current Worker claim to its actual assertions: pending clarification, the selected complete nine-occurrence plan/file and unresolved numeric-date export rejection. The Worker probe does not test UI or stale-choice invalidation.

The prior sixteen-journey report had a stale `timezone-reader.ts` hash and predated the optional SDK calendar entry point. Its report and files are preserved in `comparison/results/history/journeys-before-release-audit/`. Rerunning `pnpm exec vp test run comparison/journeys.test.ts` passes the harness and all sixteen recorded tasks. The refreshed provenance matches current shared source and includes `sdk-calendar.ts`; all sixteen generated files are byte-identical to the prior files. `refresh-audit.json` records those checks.

The locked Python conformance command was rerun with the client diagnostic pack, ongoing events, timezone candidates and pinned TZif build. It still exits **1**: bounded files **16/16**, fixed-offset files **1/1**, timezone candidates **7/8**; duration and missing-clock failures remain. The previous full second-reader report is preserved alongside the prior journey report. No expectation was changed, no feature was enabled, and no calendar client was used.

All four edited Markdown files pass formatting. The scoped `vp check` then exits 1 because its lint phase has no matching source files; this is not a successful lint run. `git diff --check` reports no whitespace errors in tracked changes. No implementation files changed in this audit.

This audit refreshes development evidence and documentation only. Archive `0341e306…`, the product matrix and the pending ongoing-export decision remain unchanged. It does not close independent evaluation, physical-device, screen-reader, actual import, API stability, security or release-authorization gates.

## Ongoing duration: cycle evidence and reader limits

The four-hour candidate with Tempus's generated timezone and one exclusion passes all **20,870 expected occurrences** from March 1, 2026 through March 1, 2426 using libical 4.0.5 with ICU 78.3. The independent oracle uses Python `ZoneInfo.from_file` against the pinned compiled Chicago data; every start and end is compared. No end date was added to the file. This is stronger evidence for this particular rule, not a full-range or general calendar-client claim.

The wider investigation also found failures. Without ICU, libical produces wrong weekly dates in 2100; a plain UTC control reproduces it, so it is not caused by Tempus's timezone output. The ICU-backed build fixes that case. Later-year windows still fail: 2582 has incorrect offsets and later windows are empty. Libical's timezone expansion code has an explicit 2582 cap. Original failures remain recorded, and the third reader still fails both ambiguous-clock controls.

Candidate, window checks and UTC controls: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-elapsed-ongoing/`. Durable cycle results: `comparison/results/calendar/elapsed-duration-cycle/`. Build identity includes the existing ICU libraries' hashes; no ICU install or upgrade occurred. [Reproduction and scope](../../comparison/calendar/README.md#ongoing-elapsed-duration-candidate) explain both build configurations.

App and SDK behavior and archive `0341e306…` are unchanged. A product decision has been requested before exposing this path as experimental because readers disagree and actual calendar-client import remains unverified. Keeping it blocked preserves the current behavior; experimental exposure would need a visible compatibility warning and would not authorize calendar writes or close the release gate. Until that decision arrives, the path remains blocked.

## Independent duration reader follow-up

A task-local libical 4.0.5 build now provides a third reader. The unchanged four-file diagnostic pack plus six duration probes produce **8 matches out of 10**. UTC control, exact DTEND duration, elapsed four/24-hour duration and nominal one-day duration pass, including both DST directions. Repeated clocks still choose the second occurrence instead of the first; missing clocks still resolve one hour early. Expectations were not changed to fit the reader.

The distinction matters: one calendar day crosses spring/autumn DST in 23/25 elapsed hours; 24 hours remains 24. This reader preserves that distinction. It supports investigating faithful ongoing elapsed-duration output, but does not establish general client compatibility or resolve ambiguous-start policy. App and SDK behavior and current archive `0341e306…` are unchanged.

Source archive, compiler/configuration logs, static library, executable and build manifest are retained in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-libical/`. Checked source/probe/build hashes accompany `comparison/results/calendar/libical-v4.0.5-verified/report.json`. The first configure attempt failed on optional introspection and was corrected by disabling it. A separate actual-file attempt was refused because this adapter does not expand detached exceptions; no third-reader pass is claimed for the 103-interval file. See [reproduction and limitations](../../comparison/calendar/README.md#third-reader-libical-405).

No dependency was added to the app or SDK, no system-wide install was performed, and no calendar client was used. Existing reader failures and missing real import/device/independent-evaluation gates remain visible.

## Bounded future-offset cache

September 13, 2026. CPU profiles identified repeated construction/sorting of the same neighboring-year timezone transitions. Each parsed future rule now retains only the six transitions needed for its most recently queried UTC year. Switching years replaces that small array. Calculation, DST policy and timezone data are unchanged; no dependency or network requirement was added.

Five alternating fresh-process probes compare the previous packed implementation with the candidate. Median time for 10,000 `tomorrow at noon` parses fell from 731.052 to 609.131 ms; 100 complete 103-occurrence export resolutions fell from 891.516 to 801.482 ms. These narrow desktop probes identify useful work to remove; they do not establish general latency or mobile performance. Profiles, scripts and samples are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-profile/`.

New regression coverage switches years out of order, checks northern/southern/negative-DST zones and reads exact transitions in both directions. All 697 tests under `src` pass. An additional comparison against the previous archive matches offset and daylight status for 14,328 samples across all 597 bundled names. That is regression parity, not independent timezone accuracy. The first new test distinguished negative zero from zero; its numeric-equality assertion now reflects equal UTC offsets without changing implementation behavior.

Current archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/year-cache/tempus-date-core-0.1.0.tgz`.
SHA-256: `0341e306322c80bd7f3a2a1a4840fbfb62f78a674d38e505ffc300cf9201ca0c`.
All 52 installed files match after clean offline installation with scripts disabled. Node 22.12.0 and 26.8.1 pass the original and calendar examples. Strict installed NodeNext declarations pass. Chrome 153.0.8010.36 and cached Firefox 148.0.2/WebKit 26.4 pass the complete calendar correction/download/restart/edit journey at 320px. Local workerd returns the same complete file and unresolved rejection. All four browser/Worker files pass the locked Python reader; the browser files also pass ical.js. Task servers on 5184/8788 were stopped. No deployed Worker, physical device or actual calendar-client import was tested.

The main app's two-year four-choice/103-interval journey was rerun and passes both file readers. Its new download hash is `7e20df31169a1ea41e68bdaabedb23898bdc8da2a32f20c4a0d104207eb614f5`; prior evidence is preserved in that journey's `history/before-year-cache/` directory. Build passes with the existing chunk warning: client JavaScript 887.45 kB / 261.69 kB gzip.

Refreshed exact-archive desktop parsing benchmark: Tempus/gpu-time import-through-first-result p50 23.872/16.092 ms, warm single 0.294/0.202 ms and batch 100 24.701/10.862 ms. Parsing bundles gzip to 143,476/52,447 bytes; all 11,100 timed previews match per engine. The previous report remains in `comparison/results/performance/history/calendar-a41cf8a8/`. gpu-time remains faster and smaller in this workload. Optional calendar bundle cost, mobile performance and peak memory remain unmeasured. Unbounded recurrence policy and client interoperability gates are unchanged.

## Download failure and retry recovery

September 13, 2026. A controlled browser failure in the SDK calendar example exposed an unhandled exception: no feedback, one leftover download link and one unreleased object URL. The app already displayed an error but shared the cleanup gap. Both handlers now remove the temporary link and schedule URL revocation in `finally`; the SDK example also catches browser download errors and displays a retry message.

Chrome 153.0.8010.36 at 320px verifies the injected click failure, visible error, zero remaining links, one revoked URL and successful keyboard retry in both app and SDK example. Input edits clear feedback and remove or disable export. The original failing observation remains at `/Users/mylescook/Documents/Codex/2026-09-13-tempus-download-recovery/before.json`; corrected checks and downloaded files are beside it. The retry probes use a fixed September 12 reference and verify September 13 at noon in Chicago as 17:00Z through an independent file reader.

The normal packed-SDK recurrence correction/download/restart/edit journey was rerun in Chrome and cached Firefox/WebKit; all pass. Three downloaded files plus the retained Worker file still pass the locked Python reader. Prior SDK browser reports are preserved under `calendar/history/before-download-recovery/`. No calendar-client import occurred.

Scoped formatting/lint/types, installed example declarations and production build pass. The client build remains large: 887.42 kB JavaScript / 261.67 kB gzip, with the existing chunk warning. SDK implementation and archive `a41cf8a8…` are unchanged; only host UI/example handlers changed. The updated consumer evidence is recorded beside that archive. Unbounded future-clock export and independent/device/client gates remain open.

## Packed calendar SDK entry point

The local `@tempus-date/core/calendar` entry point now exports the same pure file-preparation, complete recurrence-resolution and decision-retention functions used by the app. No new recurrence semantics or external actions were added. The example owns user confirmation, current-input state and downloads; it clears choices after edits and offers restart. Unresolved future-clock and interval cases remain explicit failures.

Archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/calendar/tempus-date-core-0.1.0.tgz`.
SHA-256: `a41cf8a85a59195972b2b2c436685fb338c3074f743ccecbe1594747d2956c93`.
All 52 installed files match the archive after a clean offline, scripts-disabled installation. All 37 previous dist files are byte-identical to the title archive. This remains a private local 0.1.0 candidate, not a published or stability-certified release.

Node 22.12.0 and 26.8.1 pass the existing Node example and the new `calendar.mjs` integration. Strict installed NodeNext types pass the calendar browser and Worker examples. Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 pass keyboard choice → full nine-occurrence plan → download → restart → invalid edit at 320px. WebKit uses Option-Tab. Focus, input retention, disabled unresolved download and overflow were checked. The local workerd probe returns the same selected November 1 07:30–08:00Z interval and complete file, and rejects unresolved input.

All three actual browser downloads pass ical.js expansion against authored expectations. Those three files plus the Worker file pass the locked Python reader for all nine endpoints. This is file validation, not calendar-client import. There is no physical-device, actual Safari/retail Firefox or deployed Worker claim. Task-local ports 5184/8788 were stopped and listener absence verified. Runtime scripts, file hashes, copied consumers, declarations configuration and reports are beside the archive in `verification.json`.

All 46 scoped calendar/SDK tests pass; SDK build and scoped formatting/lint/types pass. The initial browser-example type check caught access to event text without narrowing a resolved result; the example now narrows that branch. No parser changes were required.

Refreshed desktop parsing performance uses five fresh processes per engine. Tempus/gpu-time import-through-first-result p50: 23.519/16.467 ms; warm single: 0.309/0.201 ms; batch 100: 28.277/10.892 ms. Gzip parsing bundles: 143,451/52,447 bytes. Both match 11,100 timed previews on four inspected cases. Optional calendar entry-point cost, device performance, peak memory, exports and human completion are outside that benchmark. Prior report is retained at `comparison/results/performance/history/title-1edbaacb/`. No superiority claim follows.

## Two-year bounded recurrence recovery

September 13, 2026. Input: `Remind me to call Sam every Sunday from 1:30am to 1:45am until 2027-12-31 except 2026-11-08`, with reference `2026-01-01T12:00:00Z` and America/Chicago. Four explicit export decisions choose the first start and second end on November 1, 2026, then the second start and second end on November 7, 2027. The first selected interval lasts 75 elapsed minutes; the second lasts 15.

The new regression checks all 103 expected intervals against an independently authored date/offset table, complete file expansion, blocked intermediate exports and restart. All 19 tests in `recurring-calendar-file.test.ts` pass. Its first run failed because the new test used milliseconds in choice IDs; IDs use canonical whole-second instants. Correcting that test expectation required no production-code change.

Chrome keyboard interaction at 320px, with a fixed reference clock, completed all four choices, displayed all 103 file entries, downloaded the file and preserved the original input. Restart removed the prepared entries and disabled download. An edit making both range clocks equal removed export controls. No page errors or horizontal overflow were observed. This is desktop viewport testing, not a physical phone or screen-reader test.

Both ical.js and the locked Python readers verify every interval in the actual download. The file hash is `e307d8d993c8959ccef09e06b228bd314066901f42ed6e113e9910416458b8e7`. Scripts, observations, exact file and Python lock/report are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-multiyear-recurrence/`. No client import occurred. This separate inspected journey does not change the sixteen-case scripted harness or the 31-case comparison corpus.

App/SDK implementation and archive `1edbaacb…` are unchanged. Unbounded future-clock policy and intervals spanning offset changes remain unfinished; this bounded success does not close those gates.

## September 13: correction to missing-clock diagnostics

Our earlier generated-gap conformance expectation was wrong. [RFC 5545 verified erratum 4271](https://www.rfc-editor.org/errata/eid4271) distinguishes invalid dates (skip) from nonexistent local times (apply section 3.3.5, using the pre-gap offset). For Chicago March 8, 2026 at 02:30, the expected instant is 08:30Z. Both current diagnostic readers return 07:30Z, so the corrected case still fails.

The version 2 [client diagnostic pack](../calendar-client-check.md) and ongoing-event generator now use the corrected expectation. Explicit EXDATE skipping remains a separate chosen policy. Original files and reports are preserved in `comparison/results/calendar/history/before-erratum-4271/`; earlier omission-based conclusions below are historical and superseded. This is a diagnostic correction, not an enabled automatic clock policy or proof of calendar-client compatibility.

Re-run: sixteen bounded journey files, the fixed-offset file, and captured Chicago point/workday files pass the locked Python reader. The aggregate command exits 1: duration, missing-clock and other recurrence probes still fail; timezone candidates remain 7/8. No client import occurred. App/SDK source and archive `1edbaacb…` are unchanged by this correction.

## Current pinned-timezone implementation

The source now uses IANA 2026d consistently for calculator operations, scheduling clarification, date boundaries, bounded timezone export and display/API formatting. All 625 tests, formatting, lint, types and builds pass. Client size is 871.22 kB / 256.23 kB gzip, up from the historical 175.01 kB gzip baseline; the chunk warning remains.

The Yellowknife December 1, 2026 noon reminder resolves to 18:00Z, ends at 19:00Z, displays noon–1 PM at GMT−06:00 and preserves those endpoints in an independently read file. The browser display was observed on the local dev site. A screenshot command stalled and was cancelled; its subsequent unknown-history UI steps did not run. No new screenshot or unknown-history browser claim follows from that attempt. Source integration tests verify the explicit unavailable-history error.

New archive: `/Users/mylescook/Documents/Codex/2026-09-12-tempus-sdk-release/pinned-timezones/tempus-date-core-0.1.0.tgz`.
SHA-256: `5105b5accb17caad38fd0f11d6d76fbd71a95b83eb1545e233ea970faae2ea30`.
It includes the updated README and `dist/date-engine/timezone-LICENSE.txt`. A fresh consumer installation with scripts disabled passes existing Node 26.8.1 example journeys and separate updated-zone/unavailable-history assertions. This archive now passes Node 22.12.0 consumer assertions, strict installed NodeNext declarations for the browser/Worker examples, and a Chrome 150 numeric-date reminder correction with exact Yellowknife endpoints followed by edit invalidation. Local Wrangler 4.131.1/workerd returns the exact updated-zone endpoints and preserves recurrence choices at references 07:00Z/07:30Z; at 08:00Z the past repeated start is omitted. All three range probes contain only the November 8 06:00Z–07:30Z interval. Raw browser/Worker results and `runtime-verification.json` are beside the archive. The task-local servers on 5184/8788 were stopped and their listeners checked. These checks do not cover deployed Workers, Safari/Firefox or physical devices. Earlier artifacts below remain historical evidence.

The refreshed packed desktop comparison verifies installed files against archive hashes before measurement. Five fresh processes per engine, alternating order: Tempus/gpu-time import-through-first-result p50 25.316/16.410 ms, warm single 0.283/0.197 ms, batch 100 28.546/10.661 ms. SDK integration bundle gzip is 141,808/52,903 bytes. Both match all 11,100 timed previews across the same four development cases. No accuracy ranking, phone loading, battery, peak-memory or task-completion inference follows. Results are in `comparison/results/performance/packed/`; the previous report is preserved in `comparison/results/performance/history/before-pinned-timezone/`.

Custom-format correction: the previous date-fns-tz path could collapse the second Chicago 1:30 AM into the first when formatting `t`/`T` or offsets introduced by localized `P`/`p` formats. Tests now assert the actual selected timestamp and -06:00 offset for the second occurrence. Other tested formats retain their output where timezone data agrees. This corrects a formatting defect; it is not an API shape change or a reason to preserve a wrong timestamp.

September 12, 2026. This is an inspected development check, not independent evaluation or a release certification. Source remains uncommitted and local. The [release checklist](../release-checklist.md) retains all missing gates.

## Web journeys

Chrome 150 desktop automation, 320px viewport, local app at port 5174. Clipboard/Blob contents were instrumented for observation. No real calendar import or physical phone was tested.

| Journey                                               | Input and context                                                                                                             | Observed outcome                                                                                                                                                                                                                                         | Task status                                            |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Calculator → trace → copy → API                       | `January 31, 2027 plus 1 month minus 1 day`, America/Chicago; explicit API reference `2026-09-12T16:00:00Z`                   | Visible clamp to February 28, then subtract one day. Copy says February 27 and date-only. Strict API v2 returns `2027-02-27T06:00:00Z` with the same two steps. Absolute input makes the browser's reference difference immaterial here.                 | Passed this calculator task                            |
| Reminder → correction → file → edit                   | `Remind me to call Sam 03/04/2027 at noon`, America/Chicago; choose April 3                                                   | Retains `call Sam`; export preview and Blob both use April 3 noon CDT / `20270403T170000Z`. Appending whitespace restores the date question and removes export.                                                                                          | Passed through file generation; import unverified      |
| Group → clock correction → complete file              | `Remind me to call Sam Sun 1:30am-3am Mon 9am-10am`, controlled reference `2026-10-31T12:00:00Z`, America/Chicago             | Select second Sunday start: file retains `20261101T073000Z`–`090000Z` and unchanged Monday `20261102T150000Z`–`160000Z`. Two visible event rows, original title and selected-clock description. Native browser clock restored after supplying reference. | Passed through file generation; import unverified      |
| Bounded repeating schedule → usable calendar schedule | `Remind me to call Sam every weekday from 9am to 5pm starting 2026-09-14 until 2026-09-18 except 2026-09-16`, America/Chicago | Full export resolves September 14, 15, 17 and 18, each 9 AM–5 PM; independent reader expands the downloaded explicit-date recurrence set with the exclusion preserved.                                                                                   | Passed through complete finite file; import unverified |

No horizontal overflow was observed in these 320px paths. Keyboard correction/disclosure/download and result focus worked in the tested paths. This does not certify all accessibility behavior. Existing earlier tests cover other error paths; a broader combined failure/recovery run remains open.

## Latest tested packed SDK

Private candidate `@tempus-date/core` 0.1.0 includes past-occurrence filtering, recurrence reference validation and prior boundary/empty-rule handling. SHA-256 `bd7a2f467fe3f03f59aa0932952429800b8e711a31cd8e069b5b3ce49ce20a66`.

Artifact and clean consumer: `/Users/mylescook/Documents/Codex/2026-09-12-tempus-sdk-release/after-past-occurrences/`. Installed with scripts disabled using pnpm 11.24.0; repository commands use pinned pnpm 10.33.0. Contents: emitted ESM/declarations, README, license and manifest. Temporal remains its only runtime dependency; no source aliases or calendar-file SDK API.

| Runtime                       | Current-artifact evidence                                                                                                                                                                                                                                               | Limits                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Node 22.12.0 and 26.8.1       | Full copied Node example assertions pass: arithmetic, batch, reusable parser, reminder/group/recurrence correction, duration, boundaries and empty rules. Updated past-midnight expectations; straddling and exact-reference starts still ask.                          | Development integration tests, not independent accuracy.                   |
| Strict TypeScript NodeNext    | Copied browser and Worker probe compile against installed declarations.                                                                                                                                                                                                 | Types only.                                                                |
| Chrome 150                    | Chicago November 1 at 07:00Z: second 1:30 AM choice yields November 1/8 at 07:30Z, retains `call Sam`, focuses result; editing restores the question. At 08:00Z, midnight–1:30 AM recurrence yields November 8 only, 06:00Z–07:30Z, without choices. No browser errors. | Desktop browser, not physical device or application-wide UI certification. |
| Wrangler 4.131.1 local Worker | Reference 07:00Z and 07:30Z keep repeated-start clarification; 08:00Z skips the past start. Past-midnight ranges retain exactly the November 8 interval in all three contexts.                                                                                          | Local workerd, not deployed Worker.                                        |

Scratch browser finishes with labeled Chicago reference `2026-11-01T08:00:00Z`; Worker contains the three-reference probe. Both scratch servers were stopped and ports 5184/8788 checked for listeners. Reproduce setup with the [example instructions](../../examples/sdk/README.md). Earlier archives, including `after-reference-validation` SHA-256 `f8da7f0f8ca3fbc92e31efb48225c6f2400a5083efd25a2f1c98589fa33868f5`, remain historical. Later core edits require a fresh artifact before claiming current-package verification.

## Remaining failures and gates

- Bounded recurrence sets export complete fixed dates. Unbounded RRULE export and real calendar imports remain incomplete.
- File generation and independent parser round trips do not prove calendar-client import behavior. Import needs a named disposable calendar and explicit write authorization.
- Broader conflicts, remaining input families and task-level recovery remain matrix work. Matching-clock group confirmation is implemented in the recorded scope.
- Physical iOS/Android, Safari/Firefox and deployed-runtime evidence are absent.
- No untouched independently checked holdout, user task-completion study or current-device performance comparison exists. The earlier four-case CPU pilot favored gpu-time and predates recent changes.
- Public package naming/API stability, source/hosting review and release authorization remain separate requirements. Nothing was pushed, published, deployed or written to a calendar.

### Bounded recurring file journey — updated result

The same September weekday task now exports all four ranges (14, 15, 17, 18), not only the preview's first three. The browser-generated `.ics` file was saved to task scratch and independently expanded with ical.js: one recurrence UID, exact 14:00Z–22:00Z starts/ends, and `call Sam` title. This is a UTC explicit-date recurrence set, not a weekly RRULE. A ten-occurrence Sunday task also found and clarified November 1 outside the preview; reset restores the question and disables download. Keyboard focus and 320px containment passed.

546 tests, formatting/lint/types and builds pass. Client: 571.48 kB / 174.13 kB gzip with the existing chunk warning. Unbounded rule export and actual calendar imports remain incomplete. The historical post-resolver artifact was rebuilt and tested at that milestone. The earlier `13cf967…` artifact is historical evidence only.

### Export review and refreshed package

Fixed a structural extraction bug: literal `BEGIN:VEVENT` or `END:VEVENT` in an event title could be mistaken for a component boundary. A new independent-reader regression preserves that title and all three expected occurrences.

The fresh archive was installed outside the workspace with scripts disabled. Node 22.12.0 and 26.8.1 examples, installed strict declarations, Chrome 150 numeric/DST correction and stale-choice recovery, and local Worker exact three-range output passed. No browser errors were reported in the SDK path. This is scoped integration evidence, not broad compatibility certification.

Calendar is available on this Mac. Import into a disposable local calendar was requested for the reviewed four-event file; no authorization response or calendar write has occurred. Physical iOS/Android access, independent evaluation and actual calendar imports remain missing.

## Failure and recovery journeys

Current local app, Chrome 150 automation, 320px desktop viewport, September 12, 2026, America/Chicago. These are inspected development observations. No physical device or calendar client import was tested.

| Task                                                    | Observed result                                                                                                                                    | Assessment                                                                                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Add `unless it rains` to a valid noon reminder          | Preserves input, removes export, requests a more specific date or condition                                                                        | Safe abstention; condition resolution is not a completed task                                                                              |
| `Cancel my call tomorrow at noon`                       | Explicit cancellation message, no export                                                                                                           | Correctly avoids creating an event; does not cancel an existing calendar entry                                                             |
| End a reminder with `for`                               | Rejects remaining token, no export                                                                                                                 | Safe rejection, but calculator-oriented recovery copy is poor                                                                              |
| `Remind me to call Sam tomorrow at noon for 30 minutes` | Rejects `for 30 minutes`, advises plus/minus arithmetic                                                                                            | **Failed user journey.** Natural suffix duration needs complete interval resolution and appropriate recovery                               |
| Download failure → retry                                | Instrumented `URL.createObjectURL` throws; visible error retains phrase/title. Restoring the native method permits a new download request          | Passed scoped error/retry behavior; does not prove filesystem delivery or import                                                           |
| Keyboard Clear from a resolved reminder                 | Empty input, no export, empty-state copy; focus returns to `date-expression`                                                                       | Passed native app control. Automation `fill` with an empty string previously left stale React state; this was not reproduced through Clear |
| Unbounded Monday reminder → add `until 2026-09-28`      | Unbounded export asks for an explicit end date and disables download. After editing, complete plan contains all three Mondays and enables download | Passed bounded recovery; unbounded export is still unavailable                                                                             |

No horizontal overflow was observed in the measured paths. Export planning briefly shows a disabled checking state; assertions above use settled results. No browser errors were reported. Download failure instrumentation was restored.

### Duration reminder follow-up

The previously failing noon reminder now resolves noon–12:30 PM on September 13. The resolver accepts a complete trailing duration through the existing interval path. New tests cover calendar days across DST, elapsed hours across DST, source spans, event text, unsupported qualifiers, repeated-clock choice, stale selection and independent file endpoints. 555 tests, checks and build pass; client 571.59 kB / 174.17 kB gzip, with the existing chunk warning.

Chrome 150 at 320px: keyboard selection of November 1 second 1:30 AM produces a complete 1:30–2 AM CST range and matching export preview. Editing restores clarification and removes export; no horizontal overflow was observed. Independent ical.js reads 07:30Z–08:00Z and the event title. No calendar import occurred.

Numeric-date-plus-duration clarification and incomplete-duration recovery copy remain open. The pre-duration package hashes are historical. The current package table above records the replacement artifact and verification.

### Numeric-date duration correction

Numeric choices now pass the entire selected expression through interval resolution and retain the original source span. Tests cover April 3 noon plus 30 minutes, an all-day duration, and November 1 date choice followed by second-clock choice. Independent calendar reads preserve full endpoints, event title and original numeric date phrase; edits invalidate decisions. Incomplete duration now asks how long the event should last and gives a complete duration example.

Chrome 150, 320px: keyboard date selection → repeated-clock selection → complete 1:30–2 AM CST interval and export preview passed without horizontal overflow. 559 tests, checks and build pass; client 572.03 kB / 174.30 kB gzip with the existing warning.

Fresh package SHA-256: `463999407cdb2142c1ac273ad44a01c5bc197cf27b32207eb3e99d58a45e3448`, at `after-duration/tempus-date-core-0.1.0.tgz` under the existing release scratch directory. Clean external installation with scripts disabled passed expanded examples on Node 22.12.0 and 26.8.1, including numeric-plus-DST duration correction. Browser, Worker and declaration checks were subsequently completed; see the current package table above. Earlier artifact results remain historical. No calendar import or publication occurred.

### Matching-clock finite schedules

Each group range with matching written clocks now asks separately whether the end belongs to the next date. The proposed endpoint names its actual date, clock, timezone and offset. Endpoint DST choices must resolve before next-date confirmation; each decision remains bound to its range and original context.

A Saturday 9 AM–9 AM plus Monday 9 AM–10 AM task confirms only Saturday, preserving both complete ranges, title and source order. Independent ical.js parsing verifies all endpoints across the autumn DST change, including Saturday's 25 elapsed hours. A second test chains repeated-clock and next-date choices across two ranges. The first test attempt for that chain used a reference after Saturday's start and correctly resolved the next Saturday; the test reference was moved to Friday to exercise the intended DST weekend, without changing date policy.

Chrome 150 at 320px: keyboard confirmation → complete two-range result → full export preview passes with no overflow. Editing restores the question and removes export. The browser reference was September 12; the DST fixture uses an explicit October reference. These are separate evidence scopes. 561 tests, checks and build pass; client 572.51 kB / 174.40 kB gzip with the existing chunk warning. No real calendar import occurred.

### Whole-collection validation before correction

Group recognition now consumes all text and checks the 14-range limit before resolving individual clocks. Previously, an ambiguous first range could prompt for a choice before rejecting malformed later text. This did not produce a successful partial schedule, but it wasted a correction step. Regression checks now require no selectable clarification for malformed suffixes or oversized collections, and reject reuse of a choice after adding an unsupported qualifier. Recognized collections with invalid suffixes return a specific group error instead of falling through to calculator errors.

The previous test expected the premature clock question; it now verifies invalidation from a valid original input. Two low-level tests that expected null now assert an explicit failure and no clock prompt; their no-partial-success requirement is unchanged.

Chrome 150 at 320px: an incomplete Monday range shows a complete-range recovery message and no export. Completing it restores the Saturday next-date question. 562 tests, checks and build pass; client 572.74 kB / 174.46 kB gzip with the existing chunk warning. The package remains due for refresh after group changes. No calendar or external write occurred.

### Repeating reminder duration

`Remind me to call Sam every Monday at 9am for 30 minutes until 2026-10-05` previously failed even though its one-off counterpart worked. Recurrence now sends each duration occurrence through the complete interval resolver, retaining a duration field in the rule. Invalid amounts are rejected before enumeration, even if the schedule has no upcoming occurrences.

Chrome 150 at 320px: the input shows 9–9:30 AM ranges, explicit preview truncation and all four occurrences when opening export by keyboard. No horizontal overflow was observed. Independent ical.js tests expand complete files with an excluded Monday and with a repeated-clock choice on November 1 beyond the initial preview, verifying every 30-minute endpoint. No calendar import occurred.

568 tests, checks and build pass; client 573.04 kB / 174.55 kB gzip with the existing chunk warning. Calendar-day duration endpoint ambiguity and wider recurring-duration recovery remain to audit. The preceding SDK archive is historical until refreshed.

### Calendar-duration endpoint recovery

Timed day/week durations now resolve the civil endpoint independently of timezone disambiguation and offer a choice only for that endpoint. The original start is retained; elapsed-hour duration behavior is unchanged. Tests cover an autumn repeated end, spring skipped end, edit invalidation and independent file endpoints. A complete recurring-file test asks about October 31's end beyond the initial preview, preserves that 25-hour interval and leaves the following week's 24-hour interval unchanged.

Chrome 150 at 320px: keyboard selection of the second November 1 1:30 AM endpoint preserves October 31 1:30 AM CDT and shows the exact CST end in the complete export preview. No horizontal overflow observed. 571 tests and checks pass; the source build passes at 573.40 kB / 174.65 kB gzip with the existing warning. All-day midnight transition resolution remains open. The current source still requires a refreshed SDK artifact and runtime checks. No calendar import or external write occurred.

### All-day midnight transitions

Date-only scheduling now retains São Paulo November 4, 2018 despite missing midnight, and Havana November 1, 2026 despite repeated midnight. Internal boundaries use the first valid local time on the named date; export remains VALUE=DATE with an exclusive date end. Tests independently read exact civil endpoints before and after the gap, preserve numeric source after selection, and verify that explicit midnight still asks for a clock choice. Strict calculator behavior is unchanged. Apia's entirely skipped December 30, 2011 remains unresolved.

Chrome 150 at 320px: São Paulo date-only result → keyboard-opened all-day export preview passed without horizontal overflow. Editing to explicit midnight replaces export with clock choices. The timezone preference was restored to Chicago afterward. The first automated timezone/input sequence observed the old preference; verification was performed only after the displayed timezone settled to São Paulo.

577 tests, checks and build pass; client 574.54 kB / 174.89 kB gzip with the existing warning. No calendar import occurred. SDK refresh, all-day arithmetic, wholly skipped-date boundaries and broader all-day schedules remain open.

### Empty recurrence rule validation

A direct probe found that `every Monday at 25:00 starting 2026-01-01 until 2026-02-01` returned resolved with zero rows under the September reference. The enumeration never reached clock validation. Written clocks now validate before enumeration; matching recurring clocks also require an explicit duration or different end time, even for expired schedules.

Five regression cases cover invalid start/end clocks, equivalent matching-clock spellings and a valid expired schedule. The latter still resolves to an empty preview; it is not an invalid rule. Chrome shows the invalid-clock error with no export, and shows “No upcoming occurrences” for the valid expired rule. 582 tests pass. The SDK archive still needs refreshing after this and the date-only change. No calendar or external writes occurred.

### Recurrence reference validation

Reproduced failure: `daily at noon` on São Paulo November 4, 2018 and Havana November 1, 2026 rejected because recurrence validated an invented midnight through `today`. It now validates the supplied instant through `now`; requested occurrence clocks still receive their own ambiguity checks. Missing-clock questions no longer fail on these reference dates. Two regression cases failed before the change and pass after it.

A bounded `Remind me to call Sam daily at noon for 1 hour until 2018-11-06 except 2018-11-05` task with São Paulo reference `2018-11-04T12:00:00Z` independently expands to November 4 and 6, 14:00Z–15:00Z. This is source-to-file verification, not browser download or calendar import. 585 tests, formatting/lint/types and build pass. Client 574.88 kB / 174.97 kB gzip; the chunk warning remains.

Open journey defect observed in the packed browser: with the same reference, `daily at midnight` asks about November 4 even though both offered instants precede the reference. Selecting 1 AM resolves to upcoming November 5–7 midnight occurrences. No wrong future event was observed, but this is an unnecessary correction. Skip a past ambiguity only after proving that every candidate start precedes the reference; retain questions when any candidate is still upcoming. Cover ranges and complete bounded export before closing this item.

### Past-occurrence clarification — fixed

The preceding reference-validation section records the original browser defect. Five new cases failed before this change. Recurrence now checks both timezone interpretations of a current-day start before resolving its endpoints; both must be strictly past to skip it. This avoids selecting an ambiguous instant. Tests retain clarification when a candidate is upcoming or exactly at the reference, cover skipped-clock replacements, ranges and durations, independently expand a bounded reminder with an exclusion, and reject file preparation when no upcoming dates remain. An ongoing interval with a past start remains omitted under the existing upcoming-start contract.

594 tests, formatting/lint/types and build pass. Client 575.04 kB / 175.01 kB gzip; chunk warning remains. Browser and package evidence appears above. No actual calendar-client import, physical-device result or independent evaluation was added. Unbounded export remains unfinished.

### Current archive performance

The `after-past-occurrences` artifact above was benchmarked from its clean installation, with every archived file verified before timing. The [packed performance report](../../comparison/results/performance/packed/report.md) retains the unchanged four-case protocol and raw observations separately from historical emitted-source runs. Tempus is still slower and larger than gpu-time in this workload. No core SDK or app code changed in this measurement milestone; existing artifact/runtime evidence remains applicable. Physical-device and independent-evaluation gaps remain open.

### Unbounded-rule validation failure

`node comparison/calendar/rule-probe.mjs --require-conformance` exits 1 with pinned ical.js 2.2.1: a weekly DTEND master lasting two hours expands to only one elapsed hour across spring DST. Raw expected/observed rows and the authored fixture are retained in `comparison/results/calendar/`. This is a known validation failure, not a new successful export capability. See [calendar export](calendar-export.md) for the standards distinction and implementation gates. Existing finite UTC file tests were rerun separately; no new import or unbounded file was enabled.

### Second independent file reader

The pinned Python reader verifies three current correction-journey files plus the previously captured four-range browser export. It reproduces the authored DTEND recurrence disagreement; `--require-rule-conformance` exits 1 even while all four bounded checks pass. [Reproduction and exact scope](calendar-export.md#second-reader-verification) distinguish these outcomes. No fresh browser download, calendar-client write or unbounded-export capability was added.

## Fixed-future-offset repeating-rule journey

Tokyo: “Remind me to call Sam every Monday at 12:30am for 30 minutes starting 2026-09-14 except 2026-09-21” → choose Asia/Tokyo → open export → inspect three upcoming occurrences → download the ongoing rule. The actual saved file has one event, no UNTIL/COUNT, the Sunday UTC weekday shift and exact excluded start. Independent reading preserves the first three endpoints. Editing the exception closes export and clears feedback. No calendar import occurred. Future-DST rules remain open. The complete suite is now 631 tests; client bundle 873.60 kB / 257.06 kB gzip. Current SDK executable/archive checks remain applicable because this export change is app-only.

The locked Python reader now reproduces the ongoing-rule check for both the generated fixture and the captured browser file:

```sh
uv run --locked --python 3.13 comparison/calendar/second-reader.py --unbounded-browser-file comparison/results/calendar/unbounded-browser.ics
```

Three bounded files and both ongoing files pass. Each ongoing file is checked for one weekly master, Sunday UTC weekdays, no COUNT/UNTIL, the September exclusion and exact endpoints. A separate January 2048 query verifies continued recurrence beyond 1,000 weeks. These finite queries do not prove infinite correctness or calendar-client compatibility. Adding `--require-rule-conformance` still exits 1 for the retained DST duration failure; passing the other checks does not erase it.

Inspection of the pinned source found 30 distinct future DST footer rules. Some use negative transition times or times beyond 24 hours, including Gaza's fourth Thursday plus 50 hours. Export must preserve those civil-date rules and the historical-to-future cutover; converting every transition to an ordinal weekday would be incorrect. No future-DST export was enabled by this investigation.

### Future transition-date conversion

`calendarTransitionRule` converts explicit POSIX month/week/weekday rules into calendar recurrence rules, including shifted weekdays, month spill and sub-hour transition clocks. The 30 DST footers contain 29 distinct transition-date rules. Each now matches a direct Gregorian calendar oracle over 2000–2399 using independent ical.js expansion (`pnpm exec vp test run comparison/calendar/transition-rule.test.ts`). Malformed rules and unsupported leap-dependent spill fail explicitly.

The first representation used negative month-day lists and failed 14 reader checks with empty expansions. The revised representation uses last-weekday ordinals for unchanged final-week rules and positive month-day windows for shifted rules. All 30 checks pass, including the rejection check. This is development evidence for civil transition dates, not complete VTIMEZONE or event recurrence validation. Historical cutover, transition offsets, explicit future DST choices and interval semantics remain open. The helper is not connected to downloads.

### Ongoing timezone candidate

`calendarTimezoneOngoing` now serializes a baseline, recorded transitions through the source cutover and explicit ongoing observances. Split month-spill rules start on an actual matching occurrence. No host timezone lookup or calendar write occurs. It remains internal and is not connected to downloads.

Eight zones (Chicago, Cairo, Gaza, Nuuk, Lord Howe, Casablanca, Yellowknife and Tokyo) pass independent seasonal-value checks plus exact offsets one second before, at and after transitions in 2026, 2030, 2040, 2100 and 2400. The boundary check independently expands observance rules with ICAL and applies their declared offsets. This samples years and zones; it is not exhaustive timezone or calendar-client verification.

A separate `ical.js` UTC-to-local conversion check fails: `2026-03-08T07:59:59Z` converts to Chicago `02:59:59` instead of `01:59:59`. The assertion remains as an explicitly expected failure in `comparison/calendar/ongoing-timezone.test.ts`; it is not counted as a successful behavior. The suite reports 670 passes and one expected failure. Existing recurring-DTEND conformance failure remains open too. Broader coverage, a second reader, event-duration policy and future clock clarification are still required.

Timezone-reader metadata changed emitted SDK code. Archive `5105b5ac…` and its runtime/performance evidence remain preserved, but no longer represent the current source. Refresh packaging and scoped runtime verification before closing that release check again.

### Second-reader timezone failures and fixes

The candidate files and exact checkpoint expectations are now generated under `comparison/results/calendar/ongoing-timezones/`, with SHA-256 binding each file to its manifest. Reproduce with:

```sh
pnpm exec vp test run comparison/calendar/ongoing-timezone.test.ts
uv run --locked --python 3.13 comparison/calendar/second-reader.py --timezone-candidates comparison/results/calendar/ongoing-timezones
```

The Python reader disables TZID lookup explicitly, so it reads the generated definition instead of substituting installed timezone data. Initially seven of eight files failed. Our all-STANDARD representation omitted the source's daylight designation; preserving it brought six files through. Including the preceding seasonal cycle also fixed Lord Howe's initial half-hour DST state. Seven files now pass; Casablanca still has mismatches around negative DST. The command exits 1 and retains the expected and observed values in `comparison/results/calendar/second-reader.json`.

Correction to the earlier attribution: the initial failures were not solely a reader problem. We fixed two deficiencies in our candidate representation. The separate ICAL UTC-conversion assertion still fails after these corrections, and Casablanca's second-reader failure remains unresolved. A 370-day preceding window has been tested for these fixtures only; it does not establish sufficient history for every zone or start date. No new export path is enabled.

### Casablanca failure isolation

The reader command now accepts `--tzif-build /absolute/path/to/verified-build` for an independent source check. It verifies the pinned archive identity and each compiled file's recorded hash before reading it with Python `ZoneInfo.from_file`. The local build at `/Users/mylescook/Documents/Codex/2026-09-12-tempus-iana-pinned` agrees with all 448 checkpoint civil clocks and offsets across the eight fixtures.

The calendar reader still fails seven Casablanca checkpoints. For every mismatch, the expected instant appears among its direct local-to-UTC fold candidates, while several UTC-to-local results fail to round-trip to the original instant. For example, `2026-02-15T01:59:59Z` becomes local `01:59:59` with offset +01:00, then converts back to `00:59:59Z`. The expected local clock is `02:59:59` at +01:00. Exact candidates and round trips are now retained in the report.

This isolates a remaining calendar-reader conversion problem after the source and observance checks; it does not prove compatibility with calendar clients or justify enabling the candidate. The command still exits 1. Actual client import and event-level recurrence checks remain separate gates.

### Ongoing event probes

Three authored candidate files now exercise actual events using the ongoing timezone definition. They are not app exports. Reproduce after generating timezone fixtures:

```sh
node comparison/calendar/ongoing-event-probe.mjs --require-conformance
uv run --locked --python 3.13 comparison/calendar/second-reader.py --ongoing-events comparison/results/calendar/ongoing-events
```

Both commands exit 1. Both readers pass the first three occurrences of a Chicago Monday noon reminder with a one-hour duration and March 9 exclusion, and a Casablanca Sunday noon reminder across the February offset change. Both fail a Chicago Sunday 1 AM reminder with `DURATION:PT2H` across spring DST: March 8 must run 07:00Z–09:00Z, but the readers end it at 08:00Z. Replacing DTEND with DURATION does not solve the elapsed-duration issue.

The Python event probe uses a fresh timezone-provider cache per file and disables system-zone substitution while retaining the original file bytes. File hashes, expected/observed endpoints and reader versions are retained in `comparison/results/calendar/ongoing-events/report.json` and `comparison/results/calendar/second-reader.json`. These queries cover three occurrences, not all future recurrence behavior, future clarification, a browser journey or calendar-client import. No export capability is enabled from the passing noon cases.

### Current SDK archive after timezone metadata

Archive: `/Users/mylescook/Documents/Codex/2026-09-12-tempus-sdk-release/ongoing-metadata/tempus-date-core-0.1.0.tgz`.
SHA-256: `20a1fd980d43a90183e84fa437b4e16273b8268ae5e48a7b455a28fe7ff407f0`.

The adjacent clean consumer installed with scripts disabled; all 38 installed package files match the archive bytes. Node 22.12.0 and 26.8.1 pass the copied consumer journeys. Strict installed NodeNext browser/Worker declarations pass. Headless Chrome 150: type `03/04/2027 at noon`, Tab twice, Enter selects April 3; result is `2027-04-03T17:00:00.000Z`, original input remains and focus moves to the result. Editing to `03/05/2027 at noon` restores clarification. Raw corrected/edited results are saved beside the archive.

The copied Worker example runs under local workerd/Wrangler 4.131.1 and returns all three Monday intervals: September 15/22/29 at 01:00Z–03:00Z, corresponding to Monday evenings in Chicago. `worker-result.json` and `verification.json` retain scope. These are local runtime checks, not deployed Worker, Safari/Firefox, physical-device or calendar-client evidence. Previous archive `5105b5ac…` and its performance reports are preserved; this refreshed archive has not been benchmarked. No publication or deployment occurred.

### Arithmetic-step clock recovery

The interpreter now resumes the original calculation after explicit clock selection. Strict `calculateDate` and API v2 retain rejection; selected interpretations disable strict API replay. Choices are tied to the complete input/context and the position/local clock of each calendar resolution. Prior choices can be retained for a subsequent ambiguity. The calculation keeps every operation and records selections in its warnings and interpretation assumptions.

Five source cases cover both repeated-clock choices, both skipped-clock replacements and two sequential ambiguities. Later elapsed operations, trace length, original source, context/edit invalidation and strict rejection are asserted. An old test asserting absence of arithmetic choices was updated to require distinct arithmetic choice IDs. The chained fixture initially used an incorrect 364-day gap; November 1, 2026 to November 7, 2027 is 371 days, and the corrected expectation passes.

Desktop Chrome app journey: `October 31, 2026 at 1:30am plus 1 day plus 2 hours` → select 1:30 AM CST → November 1 at 3:30 AM CST, with original text retained. Editing the final amount to three hours restores clarification and removes the usable result. This was a pointer journey, not keyboard/mobile/export verification. Suite: 675 passes and one existing expected calendar-reader failure. Checks/build pass; client gzip 257.58 kB. SDK archive `20a1fd98…` predates this change and needs refreshing with these journeys.

### Arithmetic reminder to downloaded file

`Remind me to call Sam October 31, 2026 at 1:30am plus 1 day plus 2 hours` now has a scripted correction-to-file record in `comparison/results/journeys.json`. Select the second clock; the final point is `2026-11-01T09:30:00.000Z`. Both readers validate the generated file. Point comparison uses equal start/end instants as comparison notation; the file itself contains neither DTEND nor an invented duration.

Desktop app verification used Tab/Enter to select 1:30 AM CST and open export review. The title remained `call Sam`. The download tool activated the final button and saved `/Users/mylescook/Documents/Codex/2026-09-12-tempus-sdk-release/arithmetic-reminder-browser.ics`. Independent ICAL reading confirms that actual file's title, final instant and absent DTEND. This is not a keyboard-only final download, physical-phone test or calendar-client import.

Two additional cases prove that a half-day elapsed remainder and following two-hour operation still execute after the selected calendar clock. A conflict case exposed first-match selection when both clock answers were supplied; it now returns clarification. The suite has 678 passes and one existing expected reader failure; formatting/lint/types pass. SDK refresh remains pending.

### Recovery from conflicting arithmetic selections

An added recovery assertion failed before the fix: after receiving both answers for one clock, `appendSelection` retained the conflicting IDs even when the caller answered the question again. The interpreter stayed unresolved indefinitely. The helper now removes the replaced arithmetic clock and later arithmetic decisions from history. Earlier decisions and unrelated clarification families remain retained.

The regression now resolves to `2026-11-01T09:30:00.000Z` after choosing the second clock again. A chained test changes the first answer and verifies that the later ambiguity must be answered again. The runnable SDK Node example now includes conflict → question → corrected result with both operations preserved. These are source/workspace checks; the existing packed archive predates the fix. README and schedule-contract status were corrected to describe the implemented arithmetic path. The full suite remains 678 passes and one existing expected reader failure; checks pass.

### Release-record consolidation

The matrix's chronological follow-ups are preserved in `product-matrix-history.md`. Current status now references the 31-case/0.2.1 comparison and four scripted journeys, describes implemented arithmetic correction, and labels archived performance by artifact. The old 26-case counts and obsolete “arithmetic missing” statements are historical rather than current claims.

The package checklist is reopened because archive `20a1fd98…` predates arithmetic changes. Missing calendar-import authorization, physical devices and independent evaluation each have a concrete unblock action. A structural comparison verified that the capability requirement cells, full acceptance table, milestone exit conditions and comparative-claim rules stayed unchanged. No implementation gate was closed by editing documentation.

### Future recurring start-clock preflight

Export preparation now checks weekly start clocks beyond the three-row preview. It inspects recorded timezone transitions and a 400-year Gregorian cycle plus spill coverage after the future-rule cutover and last exception. A two-day lookback retains a repeated clock that is still upcoming after its transition instant. Finite exceptions remove only their named dates.

Seven source cases cover Chicago repeats/gaps, next-year conflicts after an exception, Lord Howe's half-hour repeat, Apia's skipped Friday at noon, a repeated clock still upcoming after transition, and an ordinary Chicago noon rule with no conflict. The latter proves only the checked start-clock property, not interval duration, export compatibility or future legislation. Unsupported export still stays disabled.

Desktop app: `every Sunday at 1:30am` → open export → see the specific November 1, 2026 1:30 clock conflict beyond the preview, with Download disabled. No future clock policy is selected and no end date is invented. The suite reports 685 passes and one existing expected reader failure; formatting/lint/types pass. Future clock-policy interaction and faithful interval export remain the next capability work.

### Ongoing zoned point export

Point schedules with no future start-clock conflict now export using local DTSTART/EXDATE and an embedded pinned VTIMEZONE. This path preserves local weekdays instead of converting them to a fixed UTC weekday. It adds no duration, UNTIL or COUNT. Future-clock conflicts and zoned intervals remain rejected; supported fixed-future-offset intervals retain their existing path.

`Remind me to call Sam every Monday at noon starting 2026-10-26 except 2026-11-02` exports October 26 at 17:00Z, then November 9 and 16 at 18:00Z. Independent expansion checks 1,100 occurrences. The actual browser file is saved at `/Users/mylescook/Documents/Codex/2026-09-12-tempus-sdk-release/zoned-point-browser.ics` and copied to `comparison/results/calendar/zoned-point-browser.ics`; both readers verify its first three values, title, exclusion and absent duration. Editing the exception closes export.

Reproduce the file-reader check with `node comparison/calendar/ongoing-event-probe.mjs --browser-point comparison/results/calendar/zoned-point-browser.ics`, then the second-reader command with `--ongoing-events comparison/results/calendar/ongoing-events`. Known elapsed-duration and Casablanca conversion failures remain separately recorded; the combined gate still exits 1. This does not establish arbitrary-zone/client compatibility, physical-device behavior or actual calendar import. Suite: 688 passes and one existing expected reader failure. Checks/build pass; client gzip 259.66 kB, with the chunk warning retained.

### Ongoing workday interval export

Zoned intervals now export when start/end clocks have no future ambiguity and no future occurrence contains an offset change. A shared transition scan covers recorded rules and the Gregorian future cycle after the last exception. For each transition, interval validation checks the nearest non-excluded occurrence of each weekday; earlier equal-duration starts cannot end later. Overnight dates and an end exactly at a change are included. Four added cases cover a Monday workday, spring DST inside an interval, a later conflict after an exception and a preceding-weekday overnight interval.

Browser input: `Remind me to call Sam every Monday from 9am to 5pm starting 2026-10-26 except 2026-11-02`. The actual download is `/Users/mylescook/Documents/Codex/2026-09-12-tempus-sdk-release/zoned-workday-browser.ics`, also retained under `comparison/results/calendar/`. Both readers confirm October 26 14:00Z–22:00Z, then November 9/16 15:00Z–23:00Z. The local 9–5 clocks, eight-hour duration, title and exclusion survive DST. Add `--browser-workday comparison/results/calendar/zoned-workday-browser.ics` to the ongoing-event probe to replay the captured file.

Editing to `every Sunday at midnight for 4 hours` disables download: future changes occur inside those intervals. Known candidate-duration and Casablanca conversion failures stay in the combined second-reader report, which still exits 1. No calendar import or physical-device claim is made. Suite: 693 passes and one existing expected reader failure; checks/build pass. Client gzip 260.14 kB; the chunk warning remains.

## Current arithmetic SDK artifact

Built and clean-installed `arithmetic-recovery/tempus-date-core-0.1.0.tgz` under `/Users/mylescook/Documents/Codex/2026-09-12-tempus-sdk-release/`. SHA-256: `93edf211533d30aa72ec524dd1127b01f1948e9926bb60721bab86fdb586a6bd`. All 40 installed files match the archive byte for byte; installation disabled scripts. `verification.json` binds raw runtime evidence by hash.

Copied consumer assertions pass on Node 22.12.0 and 26.8.1, including conflicting arithmetic selection recovery and remaining-operation preservation. Installed browser/Worker declarations pass strict NodeNext type checking. In packed Chrome, keyboard selection of the second repeated clock resolves “Remind me to call Sam October 31, 2026 at 1:30am plus 1 day plus 2 hours” to November 1 at 09:30Z. Both calculation steps, original input and event text remain; focus moves to the result. Editing two hours to three restores clarification. Raw browser records are beside the archive.

Local workerd returns three complete Monday 20:00–22:00 Chicago intervals: September 15, 22 and 29 at 01:00–03:00Z. This is local emulation, not a deployed Worker check. No calendar import or physical-device check occurred.

The refreshed packed performance report uses this exact archive. Five alternating fresh processes per engine measured four development cases. Tempus/gpu-time import-through-first p50 is 24.393/16.723 ms; batch-100 p50 is 28.029/10.674 ms; gzip integration bundles are 142,384/52,903 bytes. Tempus warm-single p50 is lower (0.173/0.197 ms), but its p95 is higher (1.701/0.446 ms). Neither isolated median establishes superiority. Prior artifact reports are preserved in `comparison/results/performance/history/pinned-timezones-5105b5ac/`. Memory snapshots are not peak memory; phones, browser execution performance and independent task completion remain unmeasured.

Closeout formatting, lint and type checks pass; `git diff --check` passes. The task-local SDK browser and Worker were stopped, and neither test port remains listening. The main app service was left running. No source parser changes were made in this verification pass.

## Recurrence conflict recovery

A new regression reproduced silent acceptance when two different answers targeted the same recurrence date/endpoint. The interpreter used the first matching answer. It now requires one distinct answer; duplicate identical answers remain valid. `appendSelection` replaces a recurrence answer and clears its dependent end when the start changes, preserving other occurrences. The export review uses the same replacement rule, and explicit export decisions supersede inherited preview answers without normalizing contradictory supplied decisions into success.

Five new checks cover conflicting point answers, bounded export refusal/recovery, SDK reminder recovery/edit invalidation, retained independent occurrence choices and a real repeated-start/repeated-end correction. The downloaded browser reminder uses “Remind me to call Sam every Sunday at 1:30am for 30 minutes starting 2026-11-01 until 2026-11-08”. Keyboard selection of the second clock resolves it; export review and download were activated through browser controls. Editing the duration restores clarification and removes export. `comparison/results/calendar/recurrence-recovery-browser.ics` and its hash-bound JSON report preserve the actual file. Independent ical.js 2.2.1 reads November 1 and 8 at 07:30–08:00Z, titled “call Sam”. No calendar-client import or physical-device test occurred.

Source suite: 698 pass and one explicitly expected reader-conversion failure; formatting/lint/types and build pass. Existing large-chunk warning remains. Initial test code incorrectly accessed the interpreter's SDK-only input field, then lacked union narrowing; these test defects were corrected before passing checks. The preceding SDK archive predates this fix; its raw evidence and performance remain preserved, and current-package release checks are reopened. Future unbounded clock policy and intervals spanning offset changes remain unfinished.

## Group correction through a complete file

Multi-range parsing had the same first-answer defect as recurrence: contradictory starts silently advanced to the end question. The regression reproduced that behavior. Each range endpoint now requires one distinct answer. The shared occurrence replacement helper clears a changed start's dependent end (including next-date confirmation), preserving unrelated occurrences. The SDK regression verifies contradictory-answer recovery, both exact ranges, retained reminder/input/source spans, end re-questioning and edit invalidation.

The fifth scripted journey, `group-clock-reminder`, selects the second repeated start and end for Sunday while retaining Monday 9–10 AM. The journey harness previously lacked collection handling and incorrectly assumed one UID. It now checks every event and requires distinct IDs for finite collections; recurring series retain their one-UID requirement. The five files pass both readers. The complete second-reader command still exits 1: Casablanca conversion and the separate ongoing elapsed-duration probe remain failures. Earlier four-journey reports are retained under `comparison/results/history/four-journeys-before-group-recovery/`.

Chrome at 320px used the controlled reference `2026-10-31T12:00:00Z` only while entering “Remind me to call Sam Sun 1:15am-1:45am Mon 9am-10am”; the native browser clock was immediately restored. Keyboard choices selected both second clocks. Export review/download used browser controls. The actual saved file and hash-bound readback are `comparison/results/calendar/group-recovery-browser.ics` and `.json`: Sunday 07:15–07:45Z, Monday 15:00–16:00Z, two distinct event IDs, both titled “call Sam”. Document width and scroll width were both 320px. Change clock choices restored the start question and removed export. This is desktop viewport emulation and file validation, not physical-device or calendar-client import evidence.

Source suite: 699 pass and one explicitly expected reader-conversion failure. Checks/build pass; existing bundle warning remains. The latest packed archive predates recurrence and group conflict recovery, so current-package verification remains open. Unbounded future-clock policy and intervals spanning offset changes remain the next capability gap.

## Future-clock representation probes

Added three authored clock-policy cases, three independently authored timezone controls, an explicit gap exclusion, a rejected EXDATE/RDATE replacement and four RECURRENCE-ID override candidates. Raw repeated-time behavior differs across the readers; generated missing times and explicit initial missing times fail their respective RFC expectations. The minimal opaque-TZID control reproduces those failures. Exact UTC override starts preserve either repeated clock; exact override endpoints preserve two elapsed hours across spring DST. All four override candidates match both readers, but the missing-time shift candidate still requires standards/membership review. The explicit gap exclusion passes both readers. The EXDATE/RDATE proposal is rejected: a reader matching its desired output does not overcome exclusion precedence.

These are authored three-occurrence candidates, not enabled app exports or calendar imports. Existing app/browser probes remain included and pass in their scopes. Full commands retain failures and exit 1; reports bind actual bytes and timezone definitions. Earlier report preserved at `comparison/results/calendar/ongoing-events/history/before-future-clock-policy.json`. See calendar export investigation for the result table, primary standards references and next implementation requirements. No app, SDK or runtime dependency changed in this investigation.

## Full supported-range override cost and failure

The development-only interval enumerator now generates all affected starts through the supported year 9999, including overlaps and exclusions. For the specified Chicago Sunday midnight/four-hour input, independent Gregorian transition-date expectations match 15,947 affected dates. The file is 3,285,872 bytes, SHA-256 `5aafcef91a7046d9ad4b68df4116fab9682504aa54efe58c19d583960cab0ae5`; initial generation took about 1.24 seconds. Two new source checks pass. The generator and file are not connected to app export.

The locked Python reader samples ten windows using embedded timezone data: nine pass; November 9999 fails `year 10000 is out of range`. Elapsed check time is 81.15 seconds. The JavaScript exhaustive scan was observed alive at over 180 CPU seconds and deliberately cancelled after the Python failure established the candidate could not meet the full-range gate. Exit 130 records cancellation, not reader conformance. Exact reports and hashes are in `comparison/results/calendar/override-coverage/`; regeneration preserves identical file bytes, so reader evidence still matches. Formatting/lint/type checks pass. No app/SDK behavior or runtime dependency changed; no calendar write occurred.

This experiment rejects the naive full-range override strategy as ready for ordinary export. It does not establish an acceptable file-size/latency budget or authorize silently adding an end date. Compact representation, explicit range policy, missing-time semantics and actual client/device evidence remain open.

## September 13 current SDK artifact

Current archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/tempus-date-core-0.1.0.tgz`, SHA-256 `b25f59e01fe34e3c7252897c40b35d7a04860908f864101354ea9525caeaae75`. Clean scripts-disabled installation outside the workspace matches all 40 archive files byte for byte. `verification.json` binds installed files, copied consumer sources and raw evidence by hash. The archive contains the recurrence and group conflict recovery fixes; no runtime dependency or package publication changed.

The updated Node consumer passes on 22.12.0 and 26.8.1, including arithmetic, recurrence/group contradictory-answer recovery, dependent-end invalidation, original calculator arithmetic, durations, boundary dates, batches and full interval endpoints. Installed browser/Worker declarations pass strict NodeNext type checks. The copied browser consumer uses an explicitly configured October 31, 2026 12:00Z reference with its label updated; installed package bytes remain unchanged.

Packed Chrome keyboard choices resolve the grouped reminder to Sunday November 1 07:15–07:45Z and Monday November 2 15:00–16:00Z, preserving input, `call Sam` and result focus. Editing 1:15 to 1:20 restores the start question. A repeating 1:30 AM/30-minute reminder resolves to November 1 and 8 at 07:30–08:00Z. Raw browser JSON is adjacent to the archive. Local workerd returns the fixed example's September 15/22/29 01:00–03:00Z endpoints. These are integration checks, not deployed Worker, physical-device, calendar-import or independent accuracy evidence.

Current desktop packed performance uses the same verified archive: Tempus/gpu-time import-through-first p50 25.125/17.618 ms, batch-100 p50 28.910/11.233 ms, integration gzip 142,477/52,903 bytes. Warm-single p50 favors Tempus (0.160/0.199 ms), but p95 favors gpu-time (1.576/0.464 ms). Both match 11,100 timed preview items on the four-case workload; this does not validate export or general language accuracy. Previous archive evidence is preserved under `comparison/results/performance/history/arithmetic-recovery-93edf211/`. No phone/browser-runtime performance, peak-memory or battery claim is supported.

## Independent evaluation handoff drafted

Added `comparison/evaluation/protocol.md` and `status.json`. The draft specifies separate reminder, schedule, command-bar and protected-calculator contracts; independent gold annotation; event-text/spans, all-day, interval and recurrence semantics; pilot/freeze decisions; first-pass versus correction outcome accounting; export/performance stages; and holdout custody/reopening rules. It identifies the current scorer's narrower timestamp/recurrence-flag scope rather than treating it as a full semantic evaluator.

No sample sizes, tolerances or device budgets were fabricated as agreed criteria. The matrix requires a pilot before freezing, and no independent pilot/evaluator/device access exists. Status is explicitly unfrozen, holdout unopened and confirmatory evaluation not ready. Current artifact hash, 31 inspected cases and five scripted journeys are labeled baseline candidates. The matrix's requirements and comparative-claim rules remain unchanged. No parser, SDK artifact, deployment or calendar state changed.

## Explicit precision in development scoring

The adapter now records the interpreter's date-only/timed precision and gpu-time's `allDay` field. Authored precision labels cover each resolved expectation in the same 31 inputs. `scoreWithPrecision` adds a separate preview-value grade; the original timestamp grade and protected calculator gates remain intact. Missing engine precision is `not-exposed`; absent oracle precision is `not-specified`; neither is credited as a precision match. Tests show that identical midnight timestamps with different date-only meaning fail this additional check.

Current report is `development-v4-precision`, with per-family and per-case value grades. All 31 legacy grades for all three engines match the preserved preceding report. The 21 timestamp-matching interpreter results and 14 timestamp-matching gpu-time results also match the authored flags. Strict v2's 11 matching calculations remain correct calculations; its API does not expose all-day meaning and is not credited for that additional field. This is a scoring guard, not new superiority evidence. Historical report: `comparison/results/history/development-v3-before-precision/`.

703 tests pass plus the existing expected reader failure; formatting/lint/types pass. No application, SDK artifact or runtime behavior changed. Event text/spans, all-day calendar behavior, full recurrence semantics and human task completion remain outside this comparison scorer.

## Fortnightly reminder through correction and export

Added every-other named weekday and explicit every-N-weeks-on weekday sets (whole N 1–52). Monday-based active weeks remain anchored to the written starting date after the reference advances; exceptions never reset cadence. Without a written start, the first upcoming clock establishes the cycle. The preview/copy label includes N. Boundaries and clock choices use the existing complete recurrence path. Strict calculator v2 is unchanged.

The sixth scripted journey selects the second November 1 clock for a fortnightly 1:30 AM/30-minute reminder anchored October 18, ending November 29 and excluding November 15. Both file readers verify exactly October 18 06:30–07:00Z, November 1 07:30–08:00Z and November 29 07:30–08:00Z. The preceding five-journey reports are retained in `comparison/results/history/five-journeys-before-cadence/`. A separate independent ICAL test verifies INTERVAL=2 and shifted WKST=SU for Tokyo Monday/Wednesday when converted to UTC, including a reference after the anchor and an excluded Monday.

Chrome at 320px completed keyboard clock selection, displayed “Repeats every 2 weeks on Sunday”, and downloaded the actual bounded file. `comparison/results/calendar/cadence-browser.ics` and `.json` retain the bytes, hash, exact ICAL readback and no-overflow observation. Editing cadence back to weekly restores the November 1 question and removes export. Export review/download used browser controls. No physical-device or calendar-client import evidence is claimed.

713 tests pass plus the existing expected reader failure; checks/build pass with the existing bundle warning. All six scripted files pass the second reader; its broader command still exits 1 for preserved conformance failures. The existing unbounded conflict preflight is conservative across all weekdays and can reject inactive-week transition cases; broader future policy remains open. Current SDK source adds optional rule.interval and limits.weeklyInterval; archive b25f59e0… predates this change, so packed verification is reopened.

## Cadence-aware export preflight

Future-clock and interval checks now follow the anchored active weeks. Overnight endpoint checks shift the week anchor with their date. Long active intervals still detect offset changes occurring in an inactive week. Future scanning covers the combined 400-year Gregorian and N-week cycle, within the supported year range, rather than assuming all cadences reset after 400 years.

The browser input `every other Sunday at 1:30am starting 2026-10-25` correctly skips the inactive November 1, 2026 repeat and reports the actual November 7, 2027 conflict. Download stays disabled. Raw DOM/state: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/phase-error-browser.json`. A permitted every-three-weeks Monday-noon rule independently expands October 26, November 16 and December 7 across DST. The initial reader assertion incorrectly expected its normalized rule string to retain default WKST=MO; the corrected check verifies the written file and exact independent expansion. This was a test assertion failure, not a silently corrected event.

719 tests pass plus the existing expected reader failure; build passes with the existing bundle warning. The latest whole-repository check fails formatting in unrelated `aux/misc/rust-wasm-spike/profile.mjs`; that file was left alone. This does not close future-clock policy, broad unbounded export or client import gates.

## Current cadence SDK artifact

Archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/cadence/tempus-date-core-0.1.0.tgz`.
SHA-256: `4244611d16b295efd31ec4c19eecef1a13360a646edebc68554752bb2e8dfc66`.
A fresh scripts-disabled consumer install matches all 40 archive files. Updated example assertions pass Node 22.12.0 and 26.8.1. Strict NodeNext checks pass for the installed browser and Worker consumers. Adjacent `verification.json` binds raw results and copied consumer sources to the archive.

The copied browser example keeps its September 12 reference. The keyboard journey enters `Remind me to call Sam every other Sunday at 1:30am for 30 minutes starting 2026-10-18 until 2026-11-29 except 2026-11-15` and selects the second clock. Exact intervals are October 18 06:30–07:00Z, November 1 07:30–08:00Z and November 29 07:30–08:00Z. Input, event text and result focus remain intact. Editing to weekly restores clarification. The copied local Worker exercises that same fixed input, explicit choice, interval limit and edit invalidation; installed package bytes remain unchanged. Both task-local servers stopped; ports 5184/8788 have no listeners.

Current exact-archive desktop performance: Tempus/gpu-time import-through-first p50 25.082/16.595 ms, batch-100 p50 29.298/10.872 ms, integration gzip 142,734/52,903 bytes. Warm-single p50 is 0.155/0.199 ms and p95 is 1.792/0.448 ms. Each matches 11,100 timed preview items in four development cases. Earlier b25f59e0 evidence is preserved under `comparison/results/performance/history/conflict-recovery-b25f59e0/`. There is no physical-device, deployed Worker, calendar-client import or independent competitive evaluation evidence. The matrix acceptance criteria remain unchanged.

Final scoped check passes: 169 files formatted and 155 files without lint/type errors across source, comparison, examples and package. Updated release documents pass formatting, and `git diff --check` passes. The separate auxiliary formatting failure still prevents a clean whole-repository check. The main local app remains listening on 5174.

## Date-only versus midnight reminder journey

The scripted harness previously forced every point to instant export. It now follows the interpretation's precision and checks the independent reader's DATE/datetime type as well as its value. Two contrast tasks select April 3 from `Remind me to call Sam 03/04/2027`, with and without `at midnight`. Both calculations happen to resolve to the same Chicago boundary instant, but their file contracts differ: the date-only file is April 3 with an implicit exclusive April 4 end; explicit midnight is 05:00Z with no invented duration. The Python reader retains civil dates instead of coercing them to UTC datetimes.

All eight generated correction files pass both readers. The full Python probe retains its known duration/timezone/future-clock failures. Previous six-task reports are preserved in `comparison/results/history/six-journeys-before-all-day/`. These are inspected development contrasts, not independent evaluation.

Chrome at 320px completed date selection and export review by keyboard. Actual all-day and midnight downloads independently retain the expected types and values; changing the input clears export and asks for the date again. Both views have document width 320px without horizontal overflow. Files and hashed DOM/readback evidence are in `comparison/results/calendar/all-day-browser.ics`, `midnight-browser.ics` and `precision-browser.json`. The pointer automation did not leave the native details panel open; keyboard activation did. No product defect is concluded from that pointer-tool behavior. Download used the explicit browser control; neither physical-device behavior nor calendar-client import is verified.

The full suite remains 719 passing tests plus one documented expected reader failure; the single journey test now covers eight tasks. The changed TypeScript harness passes formatting/lint/type checks. No application or SDK behavior changed, so archive 4244611d… remains current. No package refresh, publication, deployment or calendar write occurred.

## Fractional-second reminder copy

A real browser check found that `Remind me to call Sam April 3, 2027 at noon plus 0.5 seconds` calculated correctly but displayed only 12:00 PM and copied only whole seconds. The point result and copy now use the same clock format: minutes for minute-aligned clocks, seconds when present, and three fractional digits when needed. This preserves the original calculator's supported millisecond result without expanding duration grammar or changing parser/SDK semantics.

Four regression cases cover minute alignment, 30 seconds, positive half-second and subtracting one millisecond across a minute boundary. Chrome at 320px displays `12:00:00.500 PM CDT` without horizontal overflow. Keyboard copy completes a real clipboard write with `call Sam`, `Saturday, April 3, 2027`, and `12:00:00.500 PM CDT · America/Chicago (UTC-05:00)` on separate lines. Evidence: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/fraction-copy-browser.json`.

Clipboard readback permission was denied. A delegating wrapper recorded the actual write argument and completion; it did not replace the write with a successful stub. An initial pointer-run capture preceded completion and was not counted as success; the subsequent keyboard run completed before capture. This proves the scoped write path, not a paste into another application. The task browser session was closed. Whole-second-only calendar-file limits remain explicit; this change does not claim fractional-second calendar export.

723 tests pass plus one documented expected reader failure. Changed source passes formatting/lint/type checks; production build passes with the existing large-bundle warning. SDK artifact 4244611d… is unchanged and remains current. No publication, deployment or calendar write occurred.

## Thirty-second reminder through correction, copy and file

Reminder and recurrence duration recognition now accepts positive whole seconds using the existing complete interval resolver and duration bound. No unit conversion, DST policy or fractional calculator behavior changed. Interval and occurrence display/copy now use the precision-preserving clock format, so thirty-second endpoints remain visible. Fractions and nonpositive reminder durations remain unresolved.

Two new inspected tasks cover April 3 numeric-date correction followed by a thirty-second reminder, and a bounded Sunday recurrence selecting the second November 1 clock with thirty-second endpoints. Ten scripted files pass both readers. The full second-reader command still exits 1 for the preserved DST and timezone probe failures. Prior eight-task reports remain under `comparison/results/history/eight-journeys-before-seconds/`.

Chrome at 320px completed numeric-date selection, copying and export review by keyboard, followed by an actual download. Independent ICAL readback verifies April 3 17:00:00–17:00:30Z and title `call Sam`. The delegated real clipboard write completes with the thirty-second endpoint; readback remains unverified. Editing to zero seconds removes export. No horizontal overflow occurs. File/state/hash evidence: `comparison/results/calendar/short-reminder-browser.ics` and `.json`. No actual calendar-client import or physical-device claim is made.

724 tests pass plus the documented expected reader failure; changed source checks and build pass with the existing bundle warning. Archive 4244611d… predates this parser change. SDK example assertions and documentation now include seconds; current-package verification is reopened. Publication, deployment and calendar writes remain unauthorized.

## Current seconds-duration SDK artifact

Archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/seconds/tempus-date-core-0.1.0.tgz`.
SHA-256: `e0f4bb16b847b7f3cd011a40de518024eb46b9b13595db87c4b9d1e6017bfe6a`.
A fresh scripts-disabled consumer installation matches all 40 files. Updated Node journeys pass 22.12.0 and 26.8.1; strict NodeNext browser/Worker declarations pass. Adjacent `verification.json` binds raw results and copied consumer sources to the archive.

The original copied browser example uses its fixed September 12 reference. Keyboard selection of the second November 1 clock resolves a bounded Sunday thirty-second reminder to November 1 and 8 at 07:30:00–07:30:30Z, preserving input, event text and result focus. Editing duration to zero removes resolved output. The copied local Worker checks the same input, explicit choice and edit rejection; installed package bytes remain unchanged. Both task-local servers stopped, with no listeners on 5184/8788. This does not verify deployed Workers, other browsers, physical devices or calendar imports.

Five alternating desktop processes per engine: Tempus/gpu-time import-through-first p50 25.189/16.730 ms; batch-100 p50 28.733/10.738 ms; integration gzip 142,735/52,903 bytes. Warm-single p50 0.194/0.198 ms and p95 1.747/0.454 ms. Both match 11,100 timed preview items in four inspected cases. The close warm medians do not establish an advantage; cold, batch and bundle measurements still favor gpu-time. Prior artifact reports are preserved in `comparison/results/performance/history/cadence-4244611d/`. This is development evidence, not a frozen comparison or general accuracy ranking.

## Reproducible client diagnostic pack

Added `comparison/calendar/client-import-pack.mjs` and the optional `--client-import-pack` second-reader path. Four finite authored files isolate exact UTC recurrence, DTEND elapsed duration, first repeated-clock interpretation and omission/counting of a generated missing clock. Total 2,377 bytes; repeated generation preserves all four hashes. Files contain no alarms, attendees, organizer, attachments, remote URLs or scheduling METHOD. The generator never opens or writes a calendar.

Both readers pass the UTC control. ical.js fails the three DST cases; Python passes repeated-clock interpretation but fails exact duration and missing-clock omission. The initial UTC control omitted its first occurrence during ICAL iteration when DTSTART was not also listed in RDATE; the final control repeats that value without changing its expected recurrence set, and records the behavior. Exact expected/observed values, versions and file hashes are retained under `comparison/results/calendar/client-import-pack/`. The Python command still exits 1 for known failures; ten current app correction files continue passing.

[Client review instructions](../calendar-client-check.md) separate file validation from actual imports, require version/UID/endpoint/default-alarm observations and preserve the no-write boundary. RFC 5545 sections 3.3.5, 3.3.10 and 3.8.5.3 were rechecked against the primary source. No actual client check, public action, app or SDK change occurred. These finite diagnostic rules do not truncate a user schedule or replace the unbounded export goal.

## Cached Firefox and WebKit runtime coverage

The existing Playwright 1.59.1 installation matches cached Firefox build 1511 (148.0.2) and WebKit build 2272 (26.4). No browser, dependency or system automation setting was installed or changed. Safari.app is installed (26.6.2), but it was not automated in this check. These older cached headless test engines are not evidence for a current retail-browser release or physical phone.

The exact e0f4bb16… archive passes the SDK repeated-clock thirty-second reminder journey in Firefox with Tab navigation. WebKit's initial plain-Tab attempt skipped the choices and failed the keyboard-target assertion; that raw result remains in `browser-engines.json`. A separate Option-Tab run passes correction, both exact intervals, input/event retention, result focus and invalid-duration edit. This matches the navigation distinction in [Apple's keyboard guidance](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac), checked September 13. No tabindex workaround or changed system preference was introduced.

Both engines also complete the main app's `Remind me to call Sam 03/04/2027 at noon for 30 seconds` journey at 320px, with explicit America/Chicago browser timezone. Keyboard correction and export review precede actual downloads. Independent ICAL readback verifies `call Sam`, April 3 17:00:00–17:00:30Z. Editing duration to zero removes export. No page errors or horizontal overflow were observed; full-page screenshots were inspected. Native date-entry fields scroll differently, while the complete recognized phrase remains visible below the result.

Scripts, raw SDK/app reports, actual files and screenshots reside beside the current archive under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/seconds/`. `verification.json` now binds them by hash; all 40 installed files and the archive remain unchanged. Test browsers closed and the task-local SDK server was stopped. These results do not establish screen-reader usability, Safari.app/retail Firefox compatibility, device performance, calendar-client imports or competitive superiority. No source behavior changed.

## Complete alternative reminder recovery

`tomorrow at noon or Friday at 2pm` previously returned a generic clarification without selectable answers. Two complete points/intervals joined by one `or` now offer context-bound alternatives using the existing clause resolver. Reminder and full source spans remain intact. Partial/conditional/negated/three-way alternatives and branches needing their own unresolved date or clock choice still do not receive misleading complete choices. Strict v2 behavior is unchanged; explicitly confirmed replacements and alternatives disable replay through its selection-free API.

Browser inspection caught thirty-second endpoints being rounded in choice labels. The shared label formatter now includes nonzero seconds or milliseconds. Tests cover both selected branches, context/edit invalidation, qualifiers and precise labels. The eleventh scripted journey selects Friday's thirty-second interval without borrowing the first branch's thirty-minute duration. All eleven files pass both readers; broader reader commands still exit 1 for known failures. Prior ten-task evidence is preserved in `comparison/results/history/ten-journeys-before-alternatives/`.

Chrome at 320px completes keyboard choice and export review, then saves the actual file. Independent ICAL readback verifies `call Sam`, September 18 19:00:00–19:00:30Z. Editing Friday's time restores the question and removes export. No horizontal overflow is observed. Evidence: `comparison/results/calendar/alternatives-browser.ics` and `.json`. No client import or physical-device evidence is claimed.

734 tests pass plus the documented expected reader failure. Source checks and build pass with the existing bundle warning. The retained e0f4bb16… archive predates this parser/label change; current-package verification is reopened. No push, publication, deployment or calendar write occurred.

## Current alternatives SDK artifact

Archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/alternatives/tempus-date-core-0.1.0.tgz`.
SHA-256: `96b0b0acf7b475bc446f6f18baf209f877539aecd0c1c99d40c3e85ae0f186df`.
A fresh scripts-disabled consumer install matches all 40 files. Updated consumer journeys pass Node 22.12.0 and 26.8.1; installed strict NodeNext browser/Worker declarations pass. Adjacent `verification.json` binds the raw results and copied consumer configuration to the archive.

Chrome channel 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 headless engines pass the packed example at 320px. Keyboard selection of Friday from the complete two-alternative reminder preserves `call Sam`, the original input, result focus, September 18 19:00:00–19:00:30Z and `apiReplay: false`. The offered label includes `2:00:30 PM CDT`. Editing Friday's clock restores clarification. WebKit uses Option-Tab. Local workerd verifies the same labels/endpoints and rejects the old choice after a changed input. Copied browser remains unchanged; copied Worker uses this fixed probe. Browsers closed and task-local SDK/Worker servers stopped. This does not verify Safari.app, retail Firefox, physical devices or deployed Workers.

Current packed desktop baseline: Tempus/gpu-time import-through-first p50 26.088/18.287 ms; batch-100 p50 30.449/11.450 ms; integration gzip 142,880/52,903 bytes. Warm-single p50 0.155/0.215 ms and p95 1.806/0.521 ms. Both match 11,100 timed previews in four development cases. Cold start, batches and bundle cost still favor gpu-time; this does not establish a general ranking. Prior evidence is preserved under `comparison/results/performance/history/seconds-e0f4bb16/`. No source behavior, public deployment or calendar state changed in this artifact-verification step.

## Shared-source provenance refresh

September 13 registry metadata still identifies gpu-time 0.2.1 with the same package commit and integrity; the earlier observation is preserved locally. The comparison and journey runners now snapshot every shared TypeScript implementation file, pinned timezone data/license, their runner/scorer inputs and package/lockfiles. This does not claim a complete installed-dependency hash closure.

Both runner tests pass. All 36 comparison and 34 journey source hashes match current bytes; all 31 comparative grades and eleven complete journey records match the preserved prior reports. History lives under `comparison/results/history/before-complete-source-provenance/`. No fixture expectations or scoring semantics changed. Current SDK archive `96b0b0ac…` remains unchanged. Calendar-client, device, independent-evaluation and known export/reader gates remain open; no external actions occurred.

## Schedule contract reconciliation

A contract review found stale statements that contradicted implemented arithmetic clock recovery, group next-date confirmation, multi-week cadence and scoped recurrence export. The contract now distinguishes a preview-only interpretation from the separate complete export planner. It preserves the open future-clock, client-import and broader language gates. Matrix status names explicit alternatives and whole-second durations without changing acceptance criteria.

The focused arithmetic, correction, interval, group-clock, cadence and recurring-file suites pass: 67 tests across six files. This confirms the scoped implementation statements, not broad language coverage or client compatibility. No runtime behavior or SDK artifact changed. The next recovery gap is staged ambiguity inside an alternative; current handling remains unresolved without selectable branch recovery.

## Staged clarification inside alternatives

Explicit `or` alternatives now retain branch-specific decisions through existing clarification resolvers. A numeric-date choice can lead to a repeated-clock choice, followed by a separate final alternative selection. Identical date ambiguities in the two branches remain independent. Unsupported branches do not yield a partially resolved event; edits invalidate the full decision context. The former negative test for a supported numeric ambiguity is replaced by complete recovery assertions, without changing comparative fixture expectations.

735 tests pass plus the documented expected reader failure; production build passes with the existing bundle warning. Chrome 153 at 320px completes November 1 date selection, the second 1:30 AM occurrence and final branch selection, then downloads the file. Independent ICAL readback verifies `call Sam` and 07:30:00–07:30:30Z. Editing duration restores clarification and removes export. The question handler now focuses the next question when no finished result exists; the revised browser probe proceeds by Tab/Enter without resetting focus between questions. No page errors or horizontal overflow were observed.

Raw browser script/results and actual file are under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-nested-alternatives/`. This is an additional inspected browser journey, not another comparative corpus case or independent user task. No calendar-client import occurred. Archive `96b0b0ac…` predates this source change and must be refreshed; prior comparison reports are preserved under `comparison/results/history/before-nested-alternatives/`. Broader correction recovery, device and evaluation gates remain open.

## Current staged alternatives SDK artifact

Archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/nested/tempus-date-core-0.1.0.tgz`.
SHA-256: `2f6a32f038a0d1b63e6c5f3b3402247a460e45c8c779ae114ad5b6864d65c3b4`.
All 40 installed files match a fresh scripts-disabled consumer. The Node integration example now includes branch date selection, second repeated-clock selection, final alternative selection and stale-edit rejection. Node 22.12.0 and 26.8.1 pass. A duplicate import introduced while extending the example was caught by lint and removed before consumer runs; scoped checks now pass.

The unchanged copied browser example passes the same three choices by keyboard in Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 headless engines at 320px. WebKit uses Option-Tab. All retain input, `call Sam`, November 1 07:30:00–07:30:30Z, result focus and `apiReplay: false`; an edit restores clarification. No page errors or horizontal overflow were observed. A copied fixed Worker probe passes the same endpoints and stale-edit check in local workerd. Installed strict NodeNext declarations pass for browser and Worker consumers.

Adjacent `verification.json` binds the archive, all installed files, consumer code and raw results by hash. Temporary SDK ports 5184/8788 have no listeners after shutdown; the main development app remains separate. No physical-device, Safari.app, retail Firefox, deployed Worker or calendar-client evidence is claimed. Packed performance still belongs to prior archive `96b0b0ac…` and must not be attributed to this archive. No push, publication, deployment or calendar write occurred.

## Repeatable staged journey and current packed performance

The twelfth scripted task records three prescribed decisions: November 1 in the second alternative, its second repeated 1:30 AM, then the final branch choice. Every intermediate value must reject file preparation. The completed task verifies original input/event, exact thirty-second endpoints, independently parsed file bytes and invalidation after edits. Previous eleven-task reports remain under `comparison/results/history/eleven-journeys-before-staged-alternatives/`.

All twelve files pass ICAL and the locked Python reader. The broader Python command still exits 1: DTEND duration, missing-clock and timezone diagnostics retain their documented failures. It reports 12/12 bounded files, 1/1 fixed unbounded file and 7/8 timezone fixtures. This adds regression coverage, not independent evaluation or calendar-client proof.

Current archive `2f6a32f0…` was measured in five alternating fresh processes per engine on the same desktop workload. Tempus/gpu-time import-through-first p50 is 23.794/16.623 ms, warm-single p50 0.147/0.199 ms and p95 1.699/0.483 ms, batch-100 p50 28.704/10.697 ms. Integration gzip is 143,101/52,903 bytes. Both match all 11,100 timed previews drawn from four inspected examples. gpu-time retains the smaller bundle and faster cold/batch measurements; these descriptive runs do not establish comparative task completion or general accuracy. Process memory snapshots remain in the raw JSON and are not peak memory measurements. Prior reports are preserved under `comparison/results/performance/history/alternatives-96b0b0ac/`. No runtime code, SDK bytes, public state or calendar changed.

## Staged keep/replace recovery

Corrections now reuse branch-specific clarification with a separate correction namespace. Original and replacement dates retain independent answers; numeric/clock recovery still requires final keep/replace confirmation. Tests verify both outcomes with distinct durations, source/event retention, strict-replay exclusion and invalidation after input/timezone changes. Conditional, negated, incomplete and second-event cases retain their existing rejection checks.

The thirteenth repeatable journey resolves November 1 and its second repeated 1:30 AM in the replacement, then explicitly replaces Friday. Intermediate answers cannot prepare a file. All thirteen generated files pass ICAL and the locked Python reader; the broader reader command still exits 1 with retained DST/timezone failures. Previous reports are saved under `comparison/results/history/before-staged-corrections/`.

Chrome 153 at 320px completes all three decisions by keyboard with focus moving through the questions, downloads the actual file, and restores clarification/removes export after an edit. Independent ICAL readback confirms `call Sam`, November 1 07:30:00–07:30:30Z. No page errors or horizontal overflow were observed. Raw script, browser results and actual file reside under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-staged-corrections/`. No client import or physical-device check occurred.

737 tests pass plus the documented expected reader failure; build passes with the existing bundle warning. Current source checks pass. Archive `2f6a32f0…` and its performance/runtime evidence predate this change, so the package gate is reopened. Acceptance criteria and comparative fixture expectations are unchanged; more development journeys do not establish competitive superiority. All changes remain local.

## Current staged corrections SDK artifact

Archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/corrections/tempus-date-core-0.1.0.tgz`.
SHA-256: `202de38c77621d4052add5a0a7aeade0161d7c3b35fd85d4bfe59cf02c5fb278`.
All 40 files match the clean scripts-disabled install. The Node example verifies both keep and replace after date/clock clarification, preserving distinct thirty-minute versus thirty-second intervals, event/input and stale-edit rejection. Node 22.12.0 and 26.8.1 pass. Installed strict NodeNext browser/Worker declarations pass.

Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 headless engines complete staged replacement by keyboard at 320px. The copied browser retains input, event, November 1 07:30:00–07:30:30Z, result focus and disabled strict replay, then restores clarification on edit. WebKit uses Option-Tab. Local workerd passes the same complete replacement and stale-edit probe. Raw code/results and installed-file hashes are bound in adjacent `verification.json`. Task-local ports 5184/8788 have no listeners after shutdown. No device, Safari.app, deployed Worker or calendar-client proof is claimed.

Packed performance now measures this archive: Tempus/gpu-time import-through-first p50 23.892/16.841 ms, warm-single p50 0.152/0.204 ms and p95 1.703/0.475 ms, batch-100 p50 28.890/10.789 ms, integration gzip 143,152/52,903 bytes. Both match 11,100 timed previews from four inspected cases. Cold/batch speed and bundle cost still favor gpu-time. Memory snapshots are retained, not peak-memory measurements. Prior reports remain under `comparison/results/performance/history/nested-2f6a32f0/`. No superiority claim, dependency upgrade or external write follows from these measurements.

## Keyboard recovery audit

Four inspected main-app paths were exercised in headless desktop Chrome at 320px: numeric point, numeric thirty-second interval, bounded repeated-clock recurrence and staged keep/replace correction. Tab/Enter reaches every selected control. Change interpretation/clock choices focuses the restored question, preserves the input and removes the previous result and download control. Staged Restart choices returns from the clock question to the numeric-date question. Clear focuses the empty input and removes both result and error. Invalid text then produces an error without the old result; editing to a valid phrase restores output.

All four pass with no observed page errors or horizontal overflow. Inspection initially suggested a focus timing risk in synchronous handlers; runtime evidence and the existing `flushSync` parent callback show that these paths work, so no speculative focus patch was made. This confirms keyboard recovery only, not announcement quality, screen-reader navigation or physical-phone usability. The recurrence preview's verbose clock-policy wording remains a copy-review concern, not a failure established by this probe.

Script, raw results and hashes of the relevant UI source are under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-keyboard-recovery/`. No runtime code or SDK bytes changed. Browser closed; no calendar file was imported and no external state changed.

## Recurrence clock-note hierarchy

Moved the verbose selected-clock notes below the event and occurrence preview, into a native `Clock choice details` disclosure. `Change clock choices` remains visible beside it. All original notes remain available; copied preview text and export data are unchanged. This avoids leading the result with policy prose while retaining the selected offset and occurrence-specific scope.

The four keyboard recovery paths still pass in desktop Chrome 153 at 320px. A separate probe verifies notes are collapsed initially, Tab/Enter expands the disclosure, the UTC-06:00 choice remains present, and horizontal width remains 320px. Closed/open screenshots were inspected. Source checks, production build and diff whitespace validation pass; the existing bundle warning remains. No new unit tests were added for this disclosure-only change.

Raw scripts, reports, screenshots and source hashes are under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-clock-details/`. No physical-device or screen-reader validation is claimed. SDK `202de38c…`, parsing and file semantics are unchanged. No external state changed.

## Offline-after-load app checks

The browser context was set offline after the app's initial asset load. Desktop Chrome at 320px then completed staged correction and an actual file download. Independent ICAL readback verifies `call Sam`, November 1 07:30:00–07:30:30Z. Point, interval, bounded recurrence and staged-correction recovery also pass change interpretation, restart, clear and invalid-to-valid edits offline. Original calculator `January 31, 2027 plus 1 month minus 1 day` yields February 27, preserving written-order clamping.

Request listeners attached after initial load observed no requests during these paths; page-error lists remain empty. Source inspection finds explicit API replay's fetch in `api-docs.tsx`, invoked by its replay handler. This replay path was not invoked and is not claimed to work offline. Static source inspection and the tested paths do not constitute a complete production privacy/security audit.

Scripts, results, actual file and evidence/source hashes are under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-offline/`. This is after-load offline operation, not offline startup, durable caching, physical-device testing or calendar-client import. Browser contexts closed. No code, SDK artifact, cloud setting or external state changed.

## Direct action reminder journey

An exploratory ten-phrase check of archive `202de38c…` found `Call Sam tomorrow at noon` unsupported despite the equivalent prefixed reminder working. Generic appointment titles, explicit date lists, fractional reminder shorthand and monthly recurrence also remain gaps. Direct action commands now reuse the existing bounded reminder recognizer without synthesizing an input prefix, preserving original event/source spans and capitalization. The action list and qualifier rejection rules are unchanged. Strict calculator/API v2 receives no new grammar.

Tests cover direct point, interval and recurrence values, multiword targets, source spans and negative/conditional/incomplete commands. The fourteenth scripted task completes a direct command through numeric-date, repeated-clock and replacement choices. All fourteen files pass both readers. The broader Python command still exits 1 for documented rule/timezone failures. Previous reports remain under `comparison/results/history/before-direct-reminders/`.

Chrome 153 at 320px completes that task by keyboard, downloads the actual file and restores clarification/removes export after an edit. Independent ICAL readback confirms `call Sam`, November 1 07:30:00–07:30:30Z. No page errors or horizontal overflow were observed. Raw browser evidence is under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-direct-reminders/`. No actual client import occurred.

748 tests pass plus the documented expected reader failure; build and scoped checks pass with the existing bundle warning. SDK `202de38c…` predates this change, so current-source package verification is reopened. No comparative fixture expectation, acceptance criterion, dependency or external state changed. These development results do not establish competitive superiority.

## Current direct command SDK artifact

Archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/direct/tempus-date-core-0.1.0.tgz`.
SHA-256: `eb9abfa9d73c906df1b8f0ccc5d5879cd1e526b85db9d79b4312fd8e178bd472`.
All 40 installed files match the fresh scripts-disabled consumer. Package documentation now describes the bounded direct-action grammar. The Node example verifies original event casing/spans and unresolved conditions; its full existing assertions pass on Node 22.12.0 and 26.8.1.

The installed package completes direct-command date/clock/replacement choices in Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 headless engines at 320px. It retains `call Sam`, input, November 1 07:30:00–07:30:30Z, focus and disabled strict replay; edits restore clarification. WebKit uses Option-Tab. A copied fixed workerd probe verifies the same values and stale-edit rejection. Installed strict NodeNext declarations pass. Adjacent `verification.json` binds installed files and raw runtime evidence by hash. Task-local ports 5184/8788 have no listeners after shutdown.

Current packed performance: Tempus/gpu-time import-through-first p50 25.789/16.703 ms, warm-single p50 0.178/0.186 ms and p95 1.717/0.439 ms, batch-100 p50 28.881/10.751 ms; integration gzip 143,159/52,903 bytes. Both match 11,100 timed previews from four inspected examples. These are descriptive desktop CPU measurements with process memory snapshots, not phone, peak-memory, human-task or general-accuracy evidence. gpu-time retains lower cold/batch costs and a smaller bundle. Prior reports are preserved under `comparison/results/performance/history/corrections-202de38c/`.

No physical-device, Safari.app, retail Firefox, deployed Worker or calendar-client proof is claimed. No parser changes, dependency upgrades, publications or external writes occurred during artifact verification.

## Ordinary command-bar comparison probe

Added a rerunnable eight-input qualitative probe against the built workspace SDK and pinned gpu-time 0.2.1 CPU. Raw results preserve intent, explicit context and complete parser responses; there is no aggregate score. The existing 31-case corpus is unchanged. Several known Tempus failures deliberately appear, so this is inspected development evidence, not a holdout.

Both return matching temporal values for a direct noon call and ninety-minute reminder. gpu-time additionally matches the generic appointment title, half-hour interval and monthly day-one preview that Tempus leaves unsupported. Both fail the explicit two-date list. Tempus rejects the negated scheduling instruction and asks a numeric-date question; gpu-time extracts a date and selects March 4 respectively. Those are disagreements with the declared scheduling policy, not evidence of general superiority. Event extraction, full rule semantics and exports are not scored by this probe.

The next bounded journey is half-hour duration with clock correction and complete output. Generic titles, explicit date lists and monthly recurrence remain open. Scoped formatting/lint/type checks pass after removing an unnecessary await on the synchronous parser disposal method. No runtime behavior, SDK archive or external state changed. Results live at `comparison/results/exploratory/command-bars.json`; reproduce with the script in `comparison/exploratory/`.

## Half-hour reminder recovery

The exact duration phrase `for half an hour` now normalizes to thirty elapsed minutes inside the existing interval and recurrence parsers. Original input and spans are not rewritten. Prefix/suffix intervals and repeating bounds/exclusions pass; compound/vague/trailing qualifiers remain unresolved. Calendar arithmetic and strict v2 grammar are unchanged.

The fifteenth scripted journey preserves the half hour through November 1 date selection and its second repeated 1:30 AM start, then independently checks the complete file. All fifteen generated files pass ICAL and locked Python readback. The broader Python command still exits 1 with known rule/timezone failures. Prior reports remain under `comparison/results/history/before-half-hour/`.

Chrome 153 at 320px completes a half-hour replacement by keyboard, downloads the actual file and removes export when duration is edited to zero. Independent readback confirms `call Sam`, November 1 07:30:00–08:00:00Z. No page errors or horizontal overflow were observed. Raw browser evidence resides under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-half-hour/`. No calendar-client import occurred.

754 tests pass plus the documented expected reader failure. Source checks and build pass with the existing bundle warning. Archive `eb9abfa9…` and the qualitative command-bar report predate this change; package verification is reopened, and the old probe remains explicitly historical. No holdout or comparative expectation changed. No external state changed.

## Current half-hour SDK artifact

Archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/half-hour/tempus-date-core-0.1.0.tgz`.
SHA-256: `7ce524381da5c5e5616c12cdf64f424b0f62286ad9b9cd757a5f169dab044c9d`.
All 40 installed files match. Node examples pass on 22.12.0 and 26.8.1, including half-hour date/clock selection, preserved source wording and invalid-duration edit. Package documentation names this exact phrase without promising arbitrary fractional reminders. Installed strict NodeNext declarations pass.

Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 headless engines complete the half-hour replacement by keyboard at 320px, retain input/event and November 1 07:30–08:00Z, and restore clarification on edit. WebKit uses Option-Tab. Local workerd passes the same replacement and stale-edit check. Adjacent `verification.json` binds the artifact, all installed files and raw evidence. Task-local ports 5184/8788 have no listeners after shutdown. No physical device, Safari.app, deployed Worker or calendar-client proof is claimed.

Packed performance: Tempus/gpu-time import-through-first p50 26.718/16.620 ms, warm-single p50 0.145/0.199 ms and p95 1.671/0.448 ms, batch-100 p50 29.628/10.800 ms; integration gzip 143,218/52,903 bytes. Both match 11,100 previews from four inspected cases. Prior reports remain under `comparison/results/performance/history/direct-eb9abfa9/`. gpu-time retains lower cold/batch cost and a smaller bundle; these desktop results do not establish a general ranking.

The ordinary-input probe was refreshed only after preserving `comparison/results/exploratory/history/before-half-hour/command-bars.json`. The half-hour interval now resolves to the intended September 13 17:00–17:30Z; the other Tempus outputs and gpu-time occurrence/rule/diagnostic outputs remain unchanged. Generic titles, monthly recurrence and date lists remain unfinished. No parser code, acceptance criteria, holdout or external state changed in this artifact-verification step.

## Confirmed appointment-title journey

Free-form word-based labels before a supported date suffix now produce an explicit title-confirmation question. No event resolves until that decision is made; subsequent date and clock choices retain the title and original spans. Existing temporal-boundary, negative/conditional and unsupported-suffix checks remain. Additional tests cover a generic appointment, leading/trailing whitespace, date/clock chaining and recognized modal/prose negatives. This is a user-confirmed title policy, not independent semantic accuracy evidence.

The sixteenth scripted task confirms `Dentist appointment`, November 1 and its second repeated 1:30 AM before validating the complete half-hour file. The harness and Python reader now use each journey's expected event title, defaulting to existing `call Sam` expectations. All sixteen files pass both readers; the broader command still exits 1 with retained rule/timezone failures. Previous journey reports remain under `comparison/results/history/before-title-confirmation/`.

Chrome 153 at 320px completes title/date/clock choices by keyboard and saves the actual file. Independent ICAL readback verifies `Dentist appointment` and November 1 07:30:00–08:00:00Z. Editing duration removes export and restores an unresolved outcome. No page errors or horizontal overflow were observed. Raw browser script/results/file are under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-event-title/`. No calendar-client import or physical-device evidence is claimed.

762 tests pass plus the documented expected reader failure; scoped checks and build pass with the existing bundle warning. Archive `7ce52438…` and the exploratory probe predate this behavior. Current-source package verification is reopened. The primary comparison expectations and acceptance criteria are unchanged. All work remains local.

## Confirmed-title recovery and replay boundary

Follow-up inspection found title-only confirmation did not expose the result's change action and could leave strict v2 replay available without carrying the title decision. Confirmed-title results now retain `selectedChoice` metadata and set `apiReplay: false`. Occurrence results offer the existing change-interpretation action even without a clock override; clock-note disclosures remain conditional on actual notes.

Desktop Chrome at 320px verifies both a point title and recurring title: confirm by keyboard, inspect the result, revisit the title question without losing input, and remove the old result. Strict replay is absent. No page errors or horizontal overflow were observed. Evidence lives under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-title-recovery/`. Full suite remains 762 passes plus the documented expected reader failure; build and scoped checks pass with the existing bundle warning.

## Current confirmed title SDK artifact

Archive: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/title/tempus-date-core-0.1.0.tgz`.
SHA-256: `1edbaacbb6fdaaf69aacace9b99a491298d5ce6d518a76cc4d2b77a71f3d8053`.
All 40 installed files match. Updated documentation/example describe title confirmation and recovery. Node 22.12.0 and 26.8.1 pass the full example, including title/date/clock choices, expected half-hour endpoints, retained title and stale-edit rejection. Installed strict NodeNext browser/Worker declarations pass.

Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 headless engines complete the same title/date/clock journey at 320px. Input, `Dentist appointment`, November 1 07:30–08:00Z, focus and disabled strict replay remain correct. An invalid-duration edit removes the resolved result. WebKit uses Option-Tab. Local workerd passes the complete title journey and stale-edit check. Raw evidence and installed-file hashes are bound by adjacent `verification.json`. Ports 5184/8788 have no listeners after shutdown. No device, Safari.app, deployed Worker or calendar-client proof is claimed.

Packed performance now measures this archive: Tempus/gpu-time import-through-first p50 24.587/17.210 ms, warm-single p50 0.245/0.199 ms and p95 1.752/0.470 ms, batch-100 p50 29.249/10.864 ms, integration gzip 143,518/52,903 bytes. Both match 11,100 timed previews from four inspected examples. gpu-time is lower on these timing measures and bundle cost; no general ranking follows. Prior reports remain under `comparison/results/performance/history/half-hour-7ce52438/`. The qualitative command-bar probe has not yet been refreshed for title confirmation. No external state changed.

## Spring-gap fortnight reminder

The current journey harness includes a seventeenth inspected task: `Remind me to call Sam every other Sunday at 2:30am for half an hour starting 2026-03-08 until 2026-04-19 except 2026-04-05`. The authored choice moves the missing March 8 clock to 3:30 AM. Expected UTC intervals are March 8 08:30–09:00, March 22 07:30–08:00 and April 19 07:30–08:00. Later clocks retain 2:30 AM; the fortnight anchor, half-hour duration, title and exclusion survive correction and export. Editing invalidates the answer.

`pnpm exec vp test run comparison/journeys.test.ts` passes its one harness test containing all 17 journeys. ical.js and the locked Python reader agree on all 17 files. `uv run --offline --locked --script comparison/calendar/second-reader.py --require-rule-conformance` exits 1 because its separate duration-rule fixture still fails; it also passes its one fixed-offset file. This invocation did not request the optional timezone candidate suite and does not supersede its earlier 7/8 result.

Prior sixteen-journey reports, files and the prior Python report remain under `comparison/results/history/journeys-before-spring-cadence/`. The current reports are `comparison/results/journeys.json` and `comparison/results/calendar/second-reader.json`. This adds source-to-file evidence only: no new browser task, calendar-client import, physical-device or independent human-completion result. No parser implementation change was needed.

### Spring-gap browser download

The same spring-gap fortnight task now passes in local Chrome 153.0.8010.36 at a 320×900 viewport with a fixed March 7 reference and America/Chicago timezone. Tab/Enter selects 3:30 AM; focus reaches the result. Opening export produces all three intervals, and Enter downloads the file. The original input and event title remain intact, the page has no horizontal overflow or reported page errors, and editing removes the old download and restores the question.

Both ical.js and the locked Python reader reproduce the three expected intervals from the actual downloaded bytes. This remains desktop browser evidence, not a physical phone, screen reader or calendar-client import.

Artifacts: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-spring-journey/` contains `browser.mjs`, `browser.json`, `schedule.ics`, the locked Python reader and `second-reader.json`. Initial harness attempts checked export before its asynchronous plan completed and moved focus before the result-focus callback; those checks failed. Waiting for the observable result focus and enabled download resolves the harness timing issue. No application source changed.

## Blocked export edit recovery

Blocked recurrence export now offers **Edit schedule** when there is no selectable clock question. The button focuses the original input at its end without changing its text, choices or bounds. The user remains responsible for choosing whether to change the schedule.

Local Chrome 153.0.8010.36 at 320×900 verifies the complete recovery path with a January 1 reference: an ongoing Sunday 1:30 AM half-hour reminder is blocked by a future repeated clock; Tab/Enter activates Edit schedule; text stays unchanged and the caret reaches its end; the user types ` until 2026-01-18`; all three January intervals become downloadable. Both ical.js and the locked Python reader reproduce the actual downloaded intervals and title. An invalid subsequent edit removes the old download. No horizontal overflow or page errors were observed. Scoped format/lint/type checks pass.

Artifacts are retained in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-export-recovery/`. This is an explicit change to a finite schedule, not completion of the original ongoing task. Ongoing clock-policy and duration gates remain open. No physical-device, screen-reader or calendar-client import is claimed. The UI change postdates the sealed security snapshot; the SDK archive and parser are unchanged.

## Per-instance civil-date cache

A source optimization retains the immutable `Temporal.PlainDateTime` conversion within each `ZonedDate`. Repeated year/day/civil-field access no longer reparses the same ISO string. It does not cache input results across calls or change timezone lookup, arithmetic, ambiguity or export policy.

A task-local Node 26.8.1 CPU profile of the installed `0341e306…` archive identified Temporal conversion work and `toPlainDateTime` among the sampled costs. Profiling used an in-process inspector session, with no listening inspector port. All 697 source tests and scoped formatting/lint/types pass after the change; the SDK build passes.

Five alternating Node processes per version compare the old installed archive with current emitted source on the unchanged four-case workload. Median warm single is 0.290 → 0.243 ms; batch ten 3.003 → 2.654 ms; batch hundred 25.022 → 20.712 ms. All 11,100 measured previews per version match. These are preliminary local observations with different package locations, not a new packed-runtime or browser comparison. Raw profile, harness and before/after samples are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-profile/`.

The existing packed archive and browser benchmark predate this change. Repacking, supported-runtime verification, current-source journey evidence and a new browser measurement remain open. The current source must not inherit the old archive's validation claim. The source change also postdates the sealed security snapshot.

## Packed civil-date cache candidate

New local archive SHA-256: `c1f8d2a03b727683da99683cb69a444cd610172c8f030a187a20af655884e3c0`. It remains private `@tempus-date/core` 0.1.0 and is retained separately under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/civil-cache/`. The previous `0341e306…` archive is unchanged. All 52 installed files match the new archive. Installation used the existing pnpm 11.24.0 executable with `--offline --ignore-scripts`; no tool or dependency upgrade was requested or performed.

Parser, calendar and correction-state examples pass under Node 22.12.0 and 26.8.1. Strict installed NodeNext declarations pass for browser and Worker consumers. Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 pass the existing 320px keyboard repeated-clock selection, complete nine-interval download, restart, retained-input and invalid-edit checks.

Local Wrangler 4.131.1/workerd verifies the pending clock question, selected complete nine-occurrence plan/file and unresolved numeric-date rejection. It does not test Worker stale-choice recovery or UI behavior. All three browser downloads pass ical.js; those files and the Worker file pass the locked Python reader. Task-local ports 5184 and 8788 have no remaining listeners after cleanup.

`verification.json`, six Node logs, `browser-check.json`, four `.ics` files, `worker-result.json` and `second-reader.json` retain the evidence. The new archive still needs refreshed comparative performance measurements. Physical devices, Safari.app, retail Firefox, deployed Workers, screen readers and calendar-client imports remain unverified.

## Current production build refresh

After the civil-date cache and Edit schedule changes, `pnpm build` exits 0. TypeScript project checking and Worker/client bundles complete. The client JavaScript bundle is 887.78 kB / 261.79 kB reported gzip; the existing over-500-kB warning remains. This verifies build output, not deployed behavior, device performance or resolution of the unrelated whole-repository formatting failure. The build was local; no deployment occurred.

The preview/export UI source review found existing explicit preview labels, complete-file status and no-calendar-created wording. No wording change was warranted. `tasks.md` was consolidated to remove contradictory current/historical archive and journey counts while retaining all open gates.

## Uncertain reminder false accept

Before the fix, `Call Sam maybe tomorrow at noon` and its `probably` variant resolved immediately, putting the qualifier in the event title. The action-label path now returns `needs-clarification` for maybe/perhaps/probably/possibly before the temporal suffix. Original text remains unchanged; no event is selected. Existing generic-title and cancellation policies are unchanged.

All 701 source tests pass, including direct and prefixed forms of each word and edited definite reminders. Local Chrome 153.0.8010.36 at 320×900 verifies keyboard editing from the uncertain phrase to `Call Sam tomorrow at noon`, an explicit download at September 13 17:00Z with title Call Sam, and removal of the download after editing back to probably. ical.js reads the actual downloaded file. No page errors or horizontal overflow were observed. Artifacts are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-uncertain-reminder/`. No calendar-client import occurred.

The initial new test needed explicit TypeScript narrowing; that test-only issue was corrected. The change postdates archive `c1f8d2a0…`, its measurements and the sealed security scan. A new packed release candidate must include and verify this fix before publication. This closes the observed false accept and its edited recovery path, not broader intent recognition.

## Packed uncertainty-fix candidate

Current private archive SHA-256: `e2360d1405dc84625039065fac8b8ac90d7b51d27fcecd49ca9d94ee4ef217ea`, retained under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/uncertainty/`. All 52 installed files match the archive after an offline, scripts-disabled installation. Earlier archives are unchanged.

The durable Node example now checks maybe/perhaps/probably/possibly in direct and prefixed reminders, retained input, and the corrected definite noon result. Parser/calendar/state examples pass on Node 22.12.0 and 26.8.1. Strict installed browser/Worker declarations pass. Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 verify uncertainty rejection, correction to a definite point and disabled/enabled download state, followed by the existing nine-interval keyboard download/restart/invalid-edit journey at 320px.

Local Wrangler 4.131.1/workerd verifies the four uncertainty outcomes, definite noon recovery, pending recurrence question, complete nine-occurrence plan/file and unresolved numeric-date export rejection. Browser files pass ical.js; all three browser files and the Worker file pass the locked Python reader. No calendar-client import or physical-device check occurred. Raw scripts/results, declarations config, archive identity and files are retained beside the archive.

Comparative timing reports still describe archive `c1f8d2a0…`; they must not be relabeled as measurements of this fix. The current archive has runtime correctness evidence, not refreshed timing or a new sealed security scan.

## Negative-clause false accept

The follow-up audit found that the cancellation check recognized don't but missed cannot and common negative contractions. Direct reminders could absorb them into an event title. The guard now recognizes the standard negative forms with straight or curly apostrophes; it does not reject ordinary name apostrophes such as O’Toole.

All 710 source tests and scoped formatting/lint/types pass. Local Chrome 153.0.8010.36 at 320px verifies retained negative input with no export, keyboard editing to a definite Call Sam reminder, explicit download at September 13 17:00Z read by ical.js, and export invalidation after restoring a negative clause. No page errors or overflow were observed. Artifacts are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-negative-reminder/`. No calendar-client import occurred.

This source change postdates archive `e2360d14…`. Finish the adjacent modifier audit before the next repack; do not carry previous packed correctness or timing claims onto the changed source. The guard is a conservative lexical boundary, not general English negation understanding.

## Bounded modifier audit closeout

The seventeen-case reminder-modifier audit identified two additional false accepts, tentatively and optionally. Both now use the same unresolved uncertainty boundary as maybe/perhaps/probably/possibly, including the generic-title proposal path. The original failing report is retained; the fixed audit exits 0. This is a bounded development audit, not independent language accuracy evidence.

All 712 source tests, SDK build and scoped format/lint/type checks pass. Local Chrome at 320px verifies tentatively → explicit keyboard edit to a definite reminder → downloaded noon event read with ical.js → optionally invalidates export. Artifacts are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-modifier-recovery/`. No page errors, overflow or calendar-client import occurred. The accumulated negative/uncertain-label fixes now need one refreshed packed candidate; archive e2360d14 remains historical for these changes.

## Packed modifier-audit candidate

Archive `3ec6621ca3297d8e82fcc9462233d8e1a69448c82ebae63324c7d29ec8daa674` includes the accumulated uncertainty and negative-clause fixes. It is retained separately in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/modifiers/`. All 52 installed files match after an offline, scripts-disabled installation. The durable Node example includes the six uncertainty words, negative clauses and the O’Toole name control.

Parser/calendar/state examples pass on Node 22.12.0 and 26.8.1; strict installed browser/Worker declarations pass. Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 verify all six uncertainty forms, four negative clauses, O’Toole, definite-edit recovery and the nine-interval keyboard download/restart/invalid-edit path at 320px. Local Wrangler 4.131.1/workerd passes modifier outcomes, definite recovery, pending recurrence choice, complete nine-occurrence plan/file and unresolved numeric-date export rejection.

All three browser downloads pass ical.js. Those files and the Worker file pass the locked Python reader. The archive directory retains identity, six Node logs, browser results, Worker JSON, four files and reader results. Task-local listeners are closed afterward. No physical-device, screen-reader, deployed Worker or actual calendar-client import is claimed. Comparative timings still refer to c1f8d2a0, and the sealed security scan predates these changes.

## Modifier-candidate performance refresh

The settled `3ec6621c…` archive now has Node and Chrome CPU measurements and optional calendar bundle costs. All first/warmup/timed previews match in their recorded scopes. Node batch-100 median is 20.599 ms and Chrome 26.95 ms, versus gpu-time 10.775/8.10 ms. The calendar entry adds 15,032 minified / 5,046 gzip bytes over parsing. No superiority, device, battery, peak-memory or user-completion claim follows.

Raw Node results remain in `comparison/results/performance/packed/`; Chrome in `browser-modifiers/`; calendar bundle in `calendar-bundle-modifiers/`. The previous packed directory is preserved under `history/before-modifier-fixes/`; prior Chrome/calendar results remain separately available. New reports record the executable and runtime-library versions, including zlib. No parser or package source changed during measurement.

## Shared occurrence resolution preparation

Extracted point/interval resolution and occurrence-specific clock choices from weekly enumeration in `interpret-recurrence.ts`. No new recurrence grammar or export policy is enabled. SDK compilation and 92 checks across recurrence interpretation, selection, clocks, cadence, recurring files and the 17 development journeys pass. These are source checks; archive `3ec6621c…` remains the earlier packed candidate. Monthly implementation, actual calendar-client import, independent evaluation and physical-device access remain open.

The broader source run also passes all 712 checks in 34 files, and scoped formatting/lint/type analysis passes. No browser or packed-runtime rerun was performed for this extraction.

## Monthly correction and export milestone

Local artifacts: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-monthly-journey/`. Chrome 153.0.8010.36 at 320 px used keyboard selection for day-30 last-valid-day policy, preserved input, downloaded four half-hour intervals (January 30, February 28, April 30, May 30; March 30 excluded), and removed export on edit. No page errors or horizontal overflow. The downloaded file SHA-256 is `eab72f3aae8a951ff872c73a48d1f83ea0b9c301b7993e8c1e91b43daff26519`; ical.js and Python readers agree. Ongoing skip/last-day-31 files separately pass Python expansion through December 2028. File validation is not calendar-client import.

Initial ongoing clamping with `BYMONTHDAY=28,29,30,31;BYSETPOS=-1` failed ical.js: after February 29 it emitted March 28 and 29. The 31st now uses `BYMONTHDAY=-1`; ongoing day-29/30 clamping remains blocked. Ongoing monthly intervals also remain unfinished pending date-aware interval preflight. The failed expectation remains protected by tests of correct day anchors and blocked unverified encoding; no reader failure was relabeled as success.

The source run passes 722 checks and the existing 17-journey replay (723 test cases together); SDK compilation and scoped lint/types pass. Production build passes with 891.67 kB client JavaScript / 262.97 kB reported gzip and the existing large-bundle warning. Archive `3ec6621c…` predates this work. No new packed-runtime, performance, formal security or physical-device evidence is claimed.

## Monthly interval and packed-runtime follow-up

The monthly interval preflight searches actual preceding monthly dates around each transition and checks shifted end clocks against their original recurrence date and exclusions. This permits ordinary monthly half-hour and overnight intervals while retaining the block for future repeated endpoints or offset-spanning intervals. Both readers agree on 4,799 half-hour occurrences over 2026–2425 (one exclusion); file SHA-256 `f1f37eb028be18042b2f360c7260fe493bf5f39be323d459a4e5702a6d41a529`. Artifacts: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-monthly-interval/`. This is file expansion, not actual client import.

Current packed archive is `953106eb40f0cf821a6859b99aeabfe675447f57dafd36a4d4fede54979f06f1`, in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/monthly/`. All 54 installed files match. Node 22.12/26.8.1 each pass parser, calendar, state and monthly examples; strict installed-package browser/Worker declarations pass. Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 pass monthly keyboard choice/download/restart/edit invalidation plus existing weekly and modifier checks at 320 px. Local Wrangler 4.131.1/workerd passes weekly and monthly plan/file checks. All eight weekly/monthly runtime files pass locked Python readback. No physical-device, retail Safari/Firefox or deployed Worker claim is made.

Tooling corrections: the initial Vite command was unavailable; the existing `vp dev` started the task-local server. A host Python artifact write rejected its unsupported `newline` parameter after all Worker assertions passed; byte writing saved the checked files. These were harness failures, not application failures. Both task-local validation servers were stopped and their ports verified without listeners.

All 726 source checks and the 17-journey replay pass (727 test cases combined); SDK compilation, scoped checks and production build pass. Client bundle is 892.79 kB / 263.17 kB reported gzip, with the existing size warning. No performance rerun or new formal security scan is claimed for this archive. Day-29/30 ongoing clamping, clock-change policy, actual calendar-client import, physical devices and independent evaluation remain open.

The main app also passes an ongoing monthly keyboard/download/edit check at 320 px in Chrome 153. Four sampled downloaded starts/ends match the expected rule; the Python reader checks all 4,799 occurrences in that downloaded file. Editing the phrase closes the export panel; reopening it for a 14-day duration shows the offset-change error and disables download. Two initial harness runs incorrectly expected removal/visibility without reopening the panel. Both failed reports are retained beside the passing browser report; no application change was made for these harness assumptions.

## Monthly clamp diagnosis and current performance

`comparison/calendar/monthly-clamp.mjs` and the locked Python companion generate/read five UTC rule candidates over 2026–2425. Artifacts are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-monthly-clamp/`. Both commands exit 1: ical.js 2.2.1 passes 1/5 and Python passes 3/5. Python correctly expands both BYSETPOS clamps; ical.js begins emitting March 28 where March 29/30 was intended. RSCALE/SKIP=BACKWARD skips February in ical.js and raises an unbounded-rule error in Python. Both pass last-day-31. RFC 7529 defines the RSCALE behavior and warns about unsupported clients. No failing candidate was enabled in the application, and no actual client import was attempted.

The pinned comparator remains gpu-time 0.2.1; the registry version was checked again on September 13. Current archive `953106eb…` now has refreshed Node, Chrome and bundle evidence. Prior packed output was copied to `comparison/results/performance/history/before-monthly/packed/` before the new run. Five alternating Node runs per engine match all 11,100 timed previews each. Node import-through-first medians: 25.927/17.759 ms; batch-100: 21.508/11.224 ms (Tempus/gpu-time). Ten fresh Chrome runs complete with no unexpected requests: import-through-first 17.6/14.0 ms, batch-100 27.55/8.10 ms. Both use the same four inspected inputs.

Parsing bundle: 508,954/144,444 minified/gzip bytes for Tempus versus 110,286/52,903 for gpu-time. Calendar integration adds 17,352/5,483 bytes. Median post-GC process growth after measured work: RSS 94.64/30.48 MiB, heap-used 4.90/1.50 MiB. These are process snapshots, not peak memory or isolated allocations. See `comparison/performance/README.md` and the linked raw reports. No monthly-export performance, physical-device, battery, GPU, human-completion or independent accuracy claim follows from these measurements.

## Explicit date-list journey

Added a finite collection resolver for full explicit dates separated by `and`, retaining event text, absolute item spans, written order and date-only precision. Numeric-date, clock and full-day confirmation answers are context-bound. Date changes clear that item's dependent clock choices. Timed points do not acquire an invented end; date-only entries export as DATE values. Full years/independent times are required; shorthand/shared-time lists remain unsupported.

An implementation edit initially inserted a collection variable into the ordinary interval handler: 33 checks failed with `ReferenceError: groups is not defined`. The scope mistake was corrected; the complete source/journey suite now passes. Type checking then identified older interval-only test consumers that assumed every collection row has an end; those existing endpoint assertions now explicitly require the end while preserving their exact expected values. No expected timestamp was weakened.

Eleven new source checks pass. The complete source run passes 737 checks plus the existing 17-journey replay (738 test cases combined). SDK compilation, scoped checks and production build pass. Client output is 896.34 kB / 264.13 kB reported gzip with the existing size warning.

Artifacts: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-date-list/`. Chrome 153 at 320 px selects November 1 for `11/01/2026`, selects its second 1:30 AM, preserves input, downloads both point events, restarts the questions and rejects a trailing uncertain edit. No page errors/overflow. A second path displays/exports an untimed November 8 as a date alongside November 9 at noon. Both downloaded files pass ical.js and locked icalendar 7.3.0 readback. File hashes: `157bd8777932f594fea4d05d716ebb376b0d55431ef2dcb091925b856197ea75` (two timed points), `2d1b7535f4ba58d914f4469b9a64e18be1bf654b8eaeda9166680aec5157cc18` (mixed precision). These are file/browser checks, not calendar-client imports or physical-device evidence.

The eight-input command-bar probe was rerun after preserving its prior report. The explicit two-date input now resolves correctly in Tempus; gpu-time 0.2.1 returns no occurrences for that input. Both match the monthly day-one preview. No aggregate accuracy or superiority score follows. Archive `953106eb…`, runtime evidence and performance reports remain historical relative to this new source until repacking and validation.

## Shared-time clarification and packed date-list candidate

Review found that mixed untimed/timed lists were being accepted under an unconfirmed scope assumption. The parser now asks which written clock/range/duration applies to each untimed date or whether it should remain date-only. Date, time-scope and DST answers are separate; replacing the time choice preserves the numeric-date answer but clears dependent clocks. Earlier mixed-list evidence remains historical; its silent assumption is superseded by explicit confirmation.

A valid 187-character, 13-date list needs 38 answers. Before the fix, the 32-prior-answer cap dropped old decisions and the regression reached 50 answers without completion. The bounded capacity is now 64, shared by accumulation, interpretation and SDK validation; the regression completes in exactly 38 answers with all 13 selected instants. No input/event limit was reduced to avoid the failure.

Main app artifacts: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-date-list-scope/`. Chrome 153 at 320 px completes numeric-date → time-sharing → repeated-clock correction → two-event download → restart/edit. A second path explicitly keeps an item date-only. Both files pass independent readback; no page errors/overflow. Hashes: `47428da79bd067092feab8a32ea34c9c9fcbae039308cc3e4957833048551dc2` and `75512e86dee9c7c4b3e7105d9e175f9732fded7926ff473b015156a901c69653`.

Current archive: `b4d401b7fb3d362f2f0fb1f96da5733d28291a7270ad584e9557e97acdc56112`, retained in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/date-list/`. All 56 installed files match. Five examples (parser, calendar, state, monthly, date-list) each pass on Node 22.12/26.8.1; installed browser/Worker declaration checks pass. Chrome 153.0.8010.36, cached Firefox 148.0.2 and WebKit 26.4 pass date-list, monthly and earlier correction/invalid-edit checks at 320 px. Local Wrangler 4.131.1/workerd resolves the three list choices, prepares both timed and mixed-precision files, and preserves prior weekly/monthly checks. All eight new list files pass both ical.js and locked icalendar 7.3.0. Eight prior weekly/monthly runtime files also pass their locked Python checks. These are local runtime/file results, not calendar-client imports, physical-device results or deployed Worker checks.

All 740 source checks plus the existing 17-journey replay pass (741 test cases combined). SDK compilation and production build pass; client output is 896.88 kB / 264.31 kB reported gzip, with the existing size warning. A test-only lint preference was corrected after the full run. Prior archive `953106eb…` and its performance reports are retained and do not measure this candidate. No new formal security scan or independent evaluation is claimed.

The final README pass removed a stale sentence claiming shared-time lists were unsupported. Archive `52d5c981e82c611fecbe200737bda4593afb4e92923f53bcfe671d0409d45aca` in `date-list-docs/` supersedes `b4d401b7…`. The archive comparison proves that only README.md changed: all code, declarations, manifest, dependency declarations and remaining files are identical. All 56 installed files match; all ten Node example runs pass again. Browser/Worker evidence is retained against the identical code bytes rather than falsely reporting a second browser run. Both temporary runtime-validation servers were stopped; ports 5184/8788 have no listeners. The main app development server was left alone.

## Date-list source and presentation review

Limited review of list resolution, selected-answer replay, SDK bounds and serializer/download wiring is recorded in `docs/security-review.md`; scope hashes and archive differences are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-list-review/`. The packed 52d5c981 candidate accepts 64 prior IDs, rejects 65 and ignores stale IDs without changing the exact reference instant. No new formal security scan or live-host verification was performed.

The review corrected collection-export wording that still called point/date entries “ranges”. It now describes separate events, date-only entries becoming all-day events and timed points having no added duration. Chrome 153 passes four checks (timed/mixed collections at 320 and 1280 px) with keyboard opening of the export panel, no overflow and no page errors. No download or calendar write was needed for these copy checks. SDK bytes are unchanged by the UI-only correction.

The matrix's current-state rows were consolidated to reflect monthly/list support, selectable time scope, 17 scripted journeys and available Chrome measurements. Detailed historical findings remain below those rows; no capability gate or expected result was relaxed.

The presentation-only follow-up passes scoped formatting/lint/types and production build. Client output is 897.06 kB / 264.36 kB reported gzip with the existing size warning. The parser/SDK archive is unchanged; no redundant parser performance or whole-source test run is claimed for this copy change.

## Release checklist reconciliation

The release checklist now identifies one current SDK candidate, separates source/file/download/import evidence, and lists unfinished recurrence journeys before broader grammar. The matrix acceptance criteria and goal are unchanged. Older measurement and implementation paragraphs were preserved in `product-matrix-history.md`; the evaluation readiness record now identifies archive `52d5c981…`, 17 scripted journeys and the separately measured archive `953106eb…`. Evaluation readiness remains false.

Local recheck: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-release-reconciliation/verification.json`. Both archive hashes match, all 56 installed files exactly match the current archive, and only README differs between the current and browser-tested archives. The current source package matches those bytes except for the packed manifest's omitted trailing newline; all manifest fields match. The initial exact source-manifest assertion failed on that newline. A subsequent scratch-script syntax error was corrected before the successful check. No product code or expected runtime result was changed.

The ten retained Node example results and three retained browser reports pass; linked document paths exist. This documentation pass did not rerun runtime journeys or performance and did not perform calendar imports. Shorthand lists were considered but left open to keep unfinished export journeys ahead of grammar expansion. No external action occurred.

## Current list archive performance

Archive `52d5c981e82c611fecbe200737bda4593afb4e92923f53bcfe671d0409d45aca` was measured from its separately installed package after every installed file was checked against the archive. The same four-case workload and pinned gpu-time 0.2.1 were retained. Previous packed reports were copied to `comparison/results/performance/history/before-current-list/packed/` before replacement; earlier browser/calendar reports remain intact.

Five fresh alternating Node processes per engine yield Tempus/gpu-time batch-100 empirical p50 21.216/10.668 ms, initialization-through-first 24.475/16.544 ms and warm-single p50/p95 0.258/1.338 versus 0.196/0.453 ms. Each engine's 11,100 checked timed previews match. Ten fresh Chrome processes complete with matching previews and no unexpected requests: batch-100 medians 27.90/8.20 ms and import-through-first 17.4/14.0 ms. Browser medians average the middle pair for even samples; Node retains its empirical percentile method. Browser resources and its task-local loopback server close in the harness's finally blocks.

Parsing bundles are 512,926/145,658 minified/gzip bytes for Tempus versus 110,286/52,903 for gpu-time. Tempus adds 3,972/1,214 bytes over the prior measured archive. Combined parsing/calendar is 530,298/151,094, adding 17,372/5,436 to parsing. Median post-work, post-GC RSS growth is 94.75/30.84 MiB; heap growth is 4.55/1.50 MiB. These snapshots include runtime/JIT and are not peak memory or isolated package allocations.

Reports: `comparison/results/performance/packed/`, `browser-current-list/` and `calendar-bundle-current-list/`. The unchanged four inputs do not measure list correction, export or human task completion. Timing differences across successive Tempus runs are descriptive, not a controlled regression attribution. gpu-time is faster and smaller in this workload; no competitive superiority, physical-device or independent-evaluation gate closes. Product code is unchanged.

## Two-series monthly clamp diagnostic

A local diagnostic addresses ongoing day-29/30 clamping without BYSETPOS or RSCALE/SKIP. Each file contains two distinct UIDs: an ordinary-month series and a February-last-day series. Both are unbounded. This is not a transparent substitute for one editable calendar series.

`comparison/calendar/monthly-split.mjs` writes candidates and checks ical.js expansion. The locked `monthly-split.py` independently checks the same file hashes, ordered instants, two UID groups and 30-minute durations. Both commands exit 0 for all four cases (UTC/Chicago × day 29/30); each has 4,798 occurrences in 2026–2425 after two exact exclusions. Artifacts and per-file hashes are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-monthly-split/`. The previous five-candidate probe and its failures were not overwritten.

No application export, SDK behavior or calendar client changed. Arbitrary starts/clocks and editing/deletion remain unverified; the current blocks remain. A product question about an explicit two-series opt-in is pending. Passing two readers does not answer that product question or authorize imports.

## Calendar failure codes and packed integration

Calendar file failures now retain their display `reason` and include a `CalendarFileFailureCode`: unresolved input, recurring-function requirement, missing point mode, required export clarification, blocked export, empty schedule or invalid file. The calendar entry exports the type. Callers can branch on `code` without matching human wording; the recurring resolver still supplies the exact question/choices. No export policy, accepted input, file serialization or side-effect permission changed.

Three new source cases cover input/precision routing, an export question outside the preview → explicit repeated-clock answer → complete nine-event file, blocked/stale input, metadata repair and empty output. All 743 source checks plus the 17-journey replay pass (744 test cases combined). The production build passes; its existing size warning reports 897.32 kB client JavaScript / 264.43 kB gzip. Scoped formatting/lint/type checks pass.

Current archive: `f5d114901252852f1d14e163e0af761607c963a8e2572923ccc02907500d438e`, retained under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/failure-codes/`. All 56 installed files match. Five examples each pass on Node 22/26; an installed strict TypeScript consumer exhaustively maps all failure codes. Three desktop browser engines (Chrome 153.0.8010.36, Firefox 148.0.2, WebKit 26.4) and local Wrangler 4.131.1/workerd pass all seven failure codes, metadata recovery and the selected nine-event file. The locked Python reader independently validates all four runtime files' exact endpoints. The browser checks execute the SDK through intercepted local assets; they do not repeat the prior keyboard/download UI journeys or perform calendar-client imports. The local Worker was stopped and port 8788 is clear.

Compared with `52d5c981…`, changed package files are the finite/recurring serializer JavaScript, calendar export entry JavaScript, their affected declarations and README. Parsing bundle SHA-256 is unchanged (`e3e67a7c…`), so prior Node/Chrome parsing measurements describe the same bundled parsing code; no new runtime timing run is claimed. Current combined parsing/calendar bundle is 530,558 minified / 151,170 gzip bytes, adding 17,632 / 5,512 to parsing. [Bundle report](../../comparison/results/performance/calendar-bundle-failure-codes/report.md). Historical archives, UI journeys, performance and failing recurrence probes remain preserved. The two pending export-policy decisions remain unanswered.

## Same-month shorthand reminder journey

`Call Sam September 14 and 16, 2026 at noon` now uses the one written month/year while retaining the original item spans. Sharing the written clock still asks a concrete question. The first item must name the month, one unambiguous year must be present, and every piece must fit the supported grammar. Missing years, conflicting shared years, mixed-month shorthand, duplicates, invalid dates and trailing qualifiers remain unresolved. The reference is not used to invent a missing year.

Nine new source cases cover correction-to-file, original event/spans, stale-year edits, date-only precision/written order and negative cases. All 752 source checks plus the 17-journey replay pass (753 test cases combined); production build passes with the existing 897.83 kB / 264.58 kB gzip client warning. Scoped formatting/lint/type checks pass. The first edit-script attempt had a JavaScript quoting syntax error before changing source; the corrected edit and all reported tests subsequently passed.

Main-app artifacts: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-shorthand-journey/`. Chrome 153 at 320/1280 px verifies missing-year rejection → manual year correction → keyboard time choice → both-event download → restart/year edit/invalid edit. Input and focus survive, no page errors/overflow occur, and screenshots were inspected. Both downloads pass ical.js and locked icalendar 7.3.0 readback: September 14/16, 2026 at 17:00 UTC, title Call Sam, no added duration. This is a desktop browser journey, not physical-device or actual calendar-client import evidence.

Current packed archive: `4ec180308a16144daa73f3c154d22868f8f47fcd9c4bcebf81d2be2ec1b452df`, under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-sdk-verification/shorthand/`. All 56 installed files match; the changed files versus `f5d11490…` are the list resolver JavaScript/declaration and README. Five examples each pass on Node 22/26; strict installed TypeScript checks pass. Chrome 153.0.8010.36, Firefox 148.0.2, WebKit 26.4 and local Wrangler 4.131.1/workerd pass the shorthand question/selected result and retained failure-recovery/nine-event checks. The locked Python reader validates all four shorthand files and all four recurring files. The Worker was stopped and port 8788 is clear.

Prior runtime/performance artifacts remain preserved. The current parser postdates the measured parsing bundle, so those timings are historical again; no performance or superiority claim is made for this new path. No export-policy decision, calendar write or deployment was assumed.

## Portable development evidence snapshot

The reproduction audit found that generated comparison/journey reports were ignored and the comparison's source hashes predated calendar failure-code work. `comparison/export-evidence.mjs` initially exited 1 on that stale provenance before writing any snapshot. Earlier working reports/files were preserved under `comparison/results/history/before-review-snapshot/`, then the comparison, scoring and journey harnesses passed all 13 test cases. Per-family timestamp/value summaries are unchanged.

`comparison/evidence/shorthand-development/` now retains 31 comparison cases, 17 authored journeys and their 17 validated files. All raw outcomes and limitations remain intact. The manifest covers 22 evidence files plus exporter identity; source hashes remain inside the reports. The directory is not Git-ignored and is still uncommitted/local. No public release occurred.

Verification passes the intact snapshot and rejects a modified-file scratch copy. Export also rejects an existing destination. Probe results are retained in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-evidence-export/verification.json`. Inspection found no user-home/private-temp paths in the copied authored reports; only the selected comparison/journey material was copied, not arbitrary scratch output.

The initial formatter check flagged the exact generated report bytes. Four narrow formatter ignore patterns now preserve snapshot report JSON/Markdown; code, index documents and manifests remain checked. Scoped format/lint/type checks pass and manifest integrity passes after the check. Hashes are not signatures or independent expected answers. Separate SDK/browser, performance and diagnostic-reader artifacts are still not fully portable, and all device/import/evaluator gates remain open.

## Portable monthly diagnostic evidence

`comparison/evidence/monthly-compatibility/` preserves nine diagnostic calendar files, expected date arrays, both readers' outputs, source hashes, process exit codes and reproduction instructions. A fresh local rerun of the unchanged single-/two-series harnesses produced the same nine `.ics` byte sequences as the earlier retained artifacts. Both single-series commands exit 1 as expected (ical.js 1/5; Python 3/5); both two-series commands exit 0 (4/4 each). Failures remain included.

JSON whitespace was normalized before freezing; decoded reader reports and expectation arrays were compared exactly with the earlier artifacts. All 24 retained evidence files pass `shasum -a 256 -c SHA256SUMS`. This snapshot is non-ignored but remains local and uncommitted. It closes only these diagnostics' portability gap; separate runtime/performance/other-reader artifacts, independent evaluation, devices and actual calendar imports remain open. No app, SDK, export policy or external state changed.

## Portable packed-Node verification

`examples/sdk/verify-package.mjs` replaces the manual Node package-verification sequence with a reproducible local command. It builds/packs into a new scratch directory outside the repository, installs offline with lifecycle scripts disabled, verifies every installed archive file, runs the five examples with the invoked Node executable, and type-checks copied browser/calendar/Worker consumers against installed declarations. Failures retain a nonzero result and report; no servers, publication or calendar actions are started.

The current runner passes on Node 22.12.0 and 26.8.1. Both produce archive `4ec18030…`, verify all 56 installed files, pass all five examples and pass declarations. pnpm 11.24.0 performed build/install; the named Node executable ran the integration examples. The initial Node 26 run was retained, then repeated after refining the output-directory guard to distinguish `..name` from a parent directory. Negative checks reject a repository destination and an existing scratch directory with no directory creation or prior-report modification.

Portable reports and reproduction instructions are in `comparison/evidence/packed-node/`; four retained files pass their checksum list. The reports' runner hash matches the current repository script. Original scratch installations remain under `2026-09-13-tempus-portable-sdk-node22`, `...-node26-final` and `...-controls` in the Codex scratch directory. Report values were formatted before freezing; no host paths were copied. These checks establish Node integration and installed declarations, not independent compiler provenance, browser/Worker execution, physical devices or calendar-client imports. The SDK artifact and app behavior are unchanged.

## Portable packed Worker verification

The current `4ec18030…` archive passed the repository package runner in a new offline installation (56 matching files). Copied `verification-worker.ts` passed strict NodeNext/ES2023/DOM checking and ran through local Wrangler 4.131.1 workerd. GET `/verify` returned 200; GET `/` and POST `/verify` returned 404. The server was stopped after checking.

All seven export failure codes, metadata recovery and stale-answer rejection passed. The diagnostic produced a complete nine-event weekly file after selecting the future repeated clock, a two-point shorthand date-list file after shared-time clarification, and a four-event bounded monthly file after short-month policy selection. The locked Python reader independently matched endpoints, titles and timed-point precision in all three. [Retained reports and reproduction](../../comparison/evidence/packed-worker/README.md).

This adds portable runtime evidence without changing SDK or app behavior. It does not close ongoing export failures, deployed Worker validation, physical-device testing, actual client import or independent evaluation. Development checks do not establish competitive superiority.

## Portable packed browser correction and download journeys

The current `4ec18030…` installation passed `examples/sdk/verify-browser.mjs` in Chrome, Firefox and WebKit at 320/1280 px. Installed SDK bytes and copied example source were checked before execution. Each run corrected the future November repeated clock, downloaded nine weekly intervals, restarted, corrected shared-time scope in a two-date reminder and downloaded two timed points. It verified input retention, result focus, stale-answer invalidation, invalid-input cleanup, blocked ongoing export, no horizontal overflow and no unexpected external page requests.

All twelve actual downloads passed `read-browser-files.py` with locked icalendar 7.3.0 and recurring-ical-events 3.8.2. Exact expected endpoints, title and point precision were checked independently of the SDK result. [Portable files, reports and reproduction](../../comparison/evidence/packed-browser/README.md).

This developer example displays long JSON; the 320px Chrome screenshot was visually inspected. Programmatic focus followed by Enter verifies keyboard activation, not full Tab traversal. Desktop viewport resizing does not provide physical-phone evidence. No SDK/app behavior changed, no calendar was imported and no competitive claim follows from these authored tasks. The temporary example server was stopped after verification.

## Packed keyboard traversal failure

Replaced direct focus and input filling in the browser runner with Tab/Shift-Tab navigation, keyboard selection/text insertion and Enter. It now records each focus transition and explicitly marks per-run failures. The original packed SDK and example source were unchanged.

The final six-run command exits 1: Chrome/Firefox pass at 320/1280 px; WebKit fails both widths while trying to reach the repeated-clock clarification button. Tab alternates between the input and an unfocused document. An earlier forward-only Firefox attempt also failed after download; Shift-Tab reaches the earlier controls. These facts are retained separately, not normalized into a universal pass. [Reports and limits](../../comparison/evidence/packed-keyboard/README.md).

No root cause is yet proven. Browser/OS keyboard configuration and actual Safari behavior need investigation. Eight files from completed runs are retained, but this milestone makes no new independent-reader claim. The all-browser reader refuses the failed report as intended. The task-local server was stopped afterward. No app/SDK behavior, machine settings or calendars changed.

## WebKit native keyboard control and Option-Tab journey

A minimal native input/two-button/link form reproduces WebKit 26.4’s ordinary-Tab sequence: input, unfocused document, input. Option-Tab reaches both buttons and the link. Apple documents distinct Tab/Option-Tab navigation and related preferences. This supports a navigation-mode explanation for the SDK failure; no specific machine preference value was inspected or changed.

The runner now accepts an explicit `--webkit-option-tab` mode and records it. Chrome/Firefox retain Tab/Shift-Tab; WebKit uses Option-Tab/Shift-Option-Tab. All six 320/1280px journeys pass on the unchanged `4ec18030…` SDK and example. All twelve downloads pass independent Python readback. [Reports, native control and reproduction](../../comparison/evidence/packed-option-tab/README.md).

The default ordinary-Tab failures remain frozen. No application workaround or silent test fallback was added. Actual Safari.app, physical devices, screen readers, main-app usability and calendar-client imports remain separate gates. The local server was stopped after checking.

## Readable calendar SDK example

Changed only the developer example presentation: event title, timezone, authoritative local dates/offsets, file count, first-three preview and separate ongoing label precede actions. Raw JSON is optional. Clarification/restart focuses the readable interpretation. Date-only, point-duration and exclusive-end semantics stay visible.

Current unchanged SDK `4ec18030…` passed clean packed installation (56 files), five Node 26 examples and installed strict TypeScript checking with the new consumer. Six browser/viewport journeys pass, including diagnostic disclosure keyboard activation, stale output, date-only and all-day interval rendering. WebKit uses explicit Option-Tab. Twelve actual downloads pass independent readback; the 320px Chrome screenshot was visually inspected. [Retained evidence](../../comparison/evidence/readable-sdk/README.md).

Initial presentation type errors were corrected. An initial browser run encountered empty JSON before module initialization; the runner now waits for initialization. Failed scratch reports remain, and no failure is counted as a pass. No app/SDK behavior, machine settings, deployments or calendars changed. The temporary server was stopped after checking.

## Exact-duration fixture correction control

Inspected the retained RRULE/DTEND fixture against RFC 5545: its two-hour exact-duration expectation is unchanged, but its VCALENDAR lacked required PRODID. Added a separate hash-bound diagnostic that retains the historical file and generates a version differing only by PRODID. Both ical.js 2.2.1 and locked Python readers still return March 8 07:00–08:00Z rather than 07:00–09:00Z; both commands exit 1. [Portable reproduction and reports](../../comparison/evidence/duration-control/README.md).

The fixture is authored independently of the exporter. This confirms the scoped reader mismatch survives the fixture correction; it does not identify a new exporter defect or justify ongoing export. Expected answers and original reports were preserved. No calendar, publication or external report was written.

## SDK recurrence contract documentation correction

The README described every recurrence through `rule.weekdays`, contradicting the monthly discriminated union. It now requires frequency-specific access and documents monthly day/short-month fields. Export guidance now distinguishes a finite complete occurrence set from an ongoing rule's preview; no preview is relabeled as the full ongoing schedule.

Archive `e2293d2d7279e51e10c50fa31bfd827dfd08dfc738d80294fa6a412d3554fb7c` passes the package runner on Node 26.8.1 (56 matching files, five examples, strict installed consumers) and both extracted README TypeScript snippets. Only README.md differs from `4ec18030…`; all other 55 installed files are byte-identical. [Retained evidence](../../comparison/evidence/sdk-contract-docs/README.md). Earlier Node 22/browser/Worker execution is not claimed as a fresh run. No runtime behavior or acceptance gate changed; all work remains local.

## Same-month shared-year clarification

Source now asks an explicit shared-year question for yearless same-month lists, before shared-time clarification. Choices offer the reference's local year and next year within supported bounds; neither is automatic, and another year can be written explicitly. Replacing the year clears dependent list decisions. Original source spans/text remain unchanged; invalid dates and unoffered IDs cannot produce an export. The app's optional choice disclosure now says Interpretation choices because it includes years as well as clocks.

All 755 source checks plus the 17-journey replay pass (756 test cases, 38 files). Build passes with the existing bundle warning: client 898.73 kB / 264.81 kB gzip. Five changed source/UI files pass formatting, lint and type checks. The main-app Chrome journey at 320/1280 px completes year → shared time → two-event download → edit reset. Both files independently read back with exact dates/title/no invented duration. The narrow screenshot was inspected. [Evidence](../../comparison/evidence/year-choice/README.md).

Packed candidate e2293d2d predates this implementation. New package examples, browser/Worker integration and broader year-selection edge cases remain the next verification step; no old package evidence is relabeled. No calendar-client import, deployment or publication occurred.

## Packed shared-year reminder verification

Archive `906f3a6f9e0d4cf73cd18e281f0dc9ed2d2b6312b35d3475562a6d39dd8d8004` includes the shared-year implementation and updated README. All 56 installed files match. Five examples pass on Node 22.12.0 and 26.8.1; the list example checks year → time → complete file plus year replacement and input/timezone/reference invalidation. Installed strict TypeScript consumers and the updated Worker compile.

Six browser/viewport runs pass the existing weekly recovery and new yearless list task; WebKit uses explicit Option-Tab. Twelve actual downloads independently read back. Local workerd (Wrangler 4.131.1) also passes year/time selection, source spans and stale-answer checks plus retained failure-code/weekly/monthly diagnostics. Three Worker files pass independent readback. [Retained reports and file hashes](../../comparison/evidence/year-sdk/README.md).

This supersedes the earlier pending-package status only for the scoped shared-year path. No new source behavior was added during this verification turn. Both task-local servers stopped. No publication, deployment, real calendar import, device evidence or independent evaluation is claimed.

## Current shared-year archive performance

Measured installed archive 906f3a6f with the unchanged four-input CPU workload after copying the prior packed reports to history/before-year-choice/packed. Registry lookup still returns gpu-time 0.2.1 and the pinned integrity. All 56 installed files match. Five alternating fresh Node processes per engine and ten Chrome processes complete with matching previews. New browser/calendar output directories preserve earlier measurements.

Node Tempus/gpu-time import-through-first p50: 25.040/17.600 ms; batch100: 20.808/10.829 ms; single p50/p95: 0.159/1.402 versus 0.196/0.439 ms. Chrome import-through-first median: 17.40/13.80 ms; batch100: 27.25/8.05 ms. Parsing bundle: 146,124 versus 52,903 gzip bytes. Calendar integration adds 5,511 gzip bytes. [Retained samples, memory measurements and scope](../../comparison/evidence/performance-year/README.md).

The lower Tempus Node single p50 does not outweigh the higher p95 or establish general speed. Year clarification, correction latency, export, devices, peak memory and human completion remain unmeasured. No source, deployment or package publication changed during this turn.

## Shared-year task in the reusable journey corpus

Added one authored task to the reusable source-to-file replay: choose a shared year, share noon, retain two points/title/spans, reject intermediate exports, validate the complete file and invalidate answers after edits. The harness now checks collection item spans and explicitly rejects invented DTEND/DURATION for timed points; reader-provided point ends are normalized only for comparison.

All 18 scripted tasks pass. The comparison/scoring/journey command passes 13 test cases across three files; the 31-case per-family and value summaries are unchanged. The strict locked Python reader passes all eighteen journey files and its fixed ongoing control but exits 1 for the known duration-conformance diagnostic. Optional candidate suites were not rerun. [Current snapshot](../../comparison/evidence/year-journeys/README.md) and [independent file readback](../../comparison/evidence/year-journey-readback.json) retain the evidence; every reader hash matches the snapshot's exact file bytes.

Prior working reports were copied to history/before-year-journey; the historical immutable snapshot remains untouched. No parser/SDK behavior, device, real-calendar import or independent evaluation changed. Additional repetitions do not establish superiority.
