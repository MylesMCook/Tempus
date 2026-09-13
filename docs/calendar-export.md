# Calendar export validation

This document retains the export investigation history. Older availability statements describe earlier prototypes; use the [schedule contract](schedule-contract.md#calendar-export-boundary) for implemented behavior and the [release checklist](release-checklist.md) for current evidence and open gates. A file-reader result is not a calendar-client import.

## September 13: correction to missing-clock diagnostics

Our earlier generated-gap conformance expectation was wrong. [RFC 5545 verified erratum 4271](https://www.rfc-editor.org/errata/eid4271) distinguishes invalid dates (skip) from nonexistent local times (apply section 3.3.5, using the pre-gap offset). For Chicago March 8, 2026 at 02:30, the expected instant is 08:30Z. Both current diagnostic readers return 07:30Z, so the corrected case still fails.

The version 2 [client diagnostic pack](calendar-client-check.md) and ongoing-event generator now use the corrected expectation. Explicit EXDATE skipping remains a separate chosen policy. Original files and reports are preserved in `comparison/results/calendar/history/before-erratum-4271/`; earlier omission-based conclusions below are historical and superseded. This is a diagnostic correction, not an enabled automatic clock policy or proof of calendar-client compatibility.

Re-run: sixteen bounded journey files, the fixed-offset file, and captured Chicago point/workday files pass the locked Python reader. The aggregate command exits 1: duration, missing-clock and other recurrence probes still fail; timezone candidates remain 7/8. No client import occurred. App/SDK source and archive `1edbaacb…` are unchanged by this correction.

Current local surface: file preparation and a web download interface are implemented for points, intervals and finite collections. The private SDK candidate exposes calendar-file preparation through its optional calendar entry point. These scheduling changes have not been published or deployed; no calendar write or reminder delivery is enabled. Bounded recurrence-set download is now implemented locally. Unbounded fixed-future-offset rules and conflict-free zoned point rules now work locally. Zoned intervals also work when endpoint and contained-transition preflight passes. Future-clock policies, intervals spanning offset changes and actual calendar-client import remain open gates.

`src/shared/calendar-file.ts` prepares a string from a resolved interpretation and explicit metadata: a unique UUID, creation timestamp and title. It performs no I/O and does not read the clock. The local interface ties its download action to the currently displayed interpretation and resets export state after edits.

## Host integration boundary

The SDK returns ordinary JavaScript values. A resolved result or clarification context key is not authentication, user consent or proof that a form still contains the same input. The host must keep the result with its original input, timezone and reference, clear dependent selections after edits, and obtain an explicit action on the current interpretation before downloading or writing externally.

Do not accept a client-supplied serialized result as authorization for a server-side calendar write. Validate the request and its authorization in the host, and derive the interpretation from the original input/context. The SDK does not maintain a user session or know whether the host has changed its form. The existing API v2 remains the strict calculator; it does not expose this calendar-write workflow.

The app's export component remounts when input, timezone, reference or interpretation changes. Recurring preparation additionally binds its response to the initiating request object, cancels old workers and disables download until a current file is ready. [Current built-app lifecycle evidence](../comparison/evidence/export-boundary-review/README.md) verifies scoped cancellation, title/input edits, unavailable-worker recovery and late-response handling. This does not certify an unrelated host integration.

## Unbounded rules with fixed future offsets

The current export path can serialize a repeating point or interval without an end date when the pinned database explicitly has a fixed POSIX future rule and no remaining offset transitions after the first event. This is checked across the supported four-digit-year range. It does not infer permanence from recent observations; the file cannot predict or automatically adopt later timezone legislation.

The file contains one UTC event with a weekly RRULE and explicit excluded UTC starts. Local weekdays are shifted when UTC falls on another day. It preserves point precision, exact interval duration and the original event text. There is no UNTIL or preview-sized COUNT. An unbounded first-clock override that changes the written repeating time remains unsupported. Existing bounded export still resolves every occurrence. The written source is reparsed before choosing a mode, so inconsistent preview metadata cannot drop an explicit bound.

The UI distinguishes the next three displayed occurrences from the repeating rule in the file. A Tokyo reminder at Monday 00:30 for 30 minutes, excluding September 21, 2026, was downloaded through the local browser. Its UTC Sunday rule independently produces September 13, September 27 and October 4 at 15:30Z–16:00Z. The test expands 1,100 occurrences without stopping. Another test covers multiple weekdays and an overnight Kathmandu range. At that milestone, Chicago and Casablanca retained the unfinished future-clock-change message. The scoped zoned paths below now supersede that restriction.

Evidence: `comparison/calendar/unbounded-file.test.ts`, source fixture `comparison/results/calendar/unbounded-fixed-tokyo.ics`, second-reader report `unbounded-fixed-second-reader.json`, and actual browser file `unbounded-browser.ics` in the same result directory. The second reader uses recurring-ical-events 3.8.2 and icalendar 7.3.0. Browser edit recovery closes export and clears download feedback. An initial Blob capture returned null; the successful evidence comes from the browser's actual saved download, not that capture. These are file/download checks, not calendar-client import.

At that fixed-offset milestone, 631 tests, checks and builds passed. Those app-only export changes left the then-current SDK archive's emitted code, documentation and license unchanged; package manifest comparison accounts for pnpm pack's trailing-newline normalization.

## Ongoing zoned points

A weekly point rule can now export with local DTSTART/EXDATE and an embedded pinned timezone when future start-clock preflight finds no gap or repeat. No duration or end date is added. Chicago noon across DST with an excluded Monday passes both readers and an actual browser download; see [current evidence](release-verification.md#ongoing-zoned-point-export). Future-clock conflicts and intervals spanning offset changes remain unsupported. The known reader failures are retained, and actual calendar-client import remains unverified.

## Value contract

Ongoing zoned intervals are also supported when both endpoint clocks pass conflict checks and no occurrence contains an offset change. Preflight checks the most recent non-excluded active start for each weekday at each transition, including overnight starts and an end exactly at a transition. Multi-week rules retain their anchored phase. A 400-year Gregorian cycle contains 20,871 weeks; preflight covers the combined calendar/cadence cycle, capped at the supported year 9999, rather than assuming every cadence resets after 400 years. The file uses an explicit elapsed duration; no reader-dependent duration change is accepted. The Chicago Monday 9–5/exclusion download passes both readers. Intervals spanning clock changes remain blocked; actual calendar-client import is unverified.

| Interpretation                    | File representation                                       |
| --------------------------------- | --------------------------------------------------------- |
| Point, explicit exact-time choice | UTC `DTSTART`, without an invented end/duration           |
| Point, explicit all-day choice    | `DTSTART;VALUE=DATE`; one civil day                       |
| Timed interval                    | UTC `DTSTART` and complete exclusive `DTEND`              |
| All-day interval                  | Civil `DATE` start and exclusive end                      |
| Finite collection                 | One event per complete interval, each with a distinct UID |
| Unresolved interpretation         | No file; return a reason                                  |

There is no implicit midnight-to-all-day conversion. Point precision and clock-source fields now distinguish dates from supplied, reference and arithmetic clocks. The local export interface uses these fields to display the representation before the user requests a file; internal point export still requires an explicit mode. Selecting all-day for a clock-bearing point is a deliberate change of representation that must be shown before export.

UTC timestamps preserve timed instants across DST. The description retains the source date phrase, original timezone and interpretation assumptions. Date-only values remain civil dates. Sub-second event times are rejected because this format path cannot retain their precision; creation metadata alone is truncated to seconds. Recurrence previews are never serialized as if they were the whole repeating rule.

Text properties escape punctuation and newlines. Lines use CRLF and fold at 75 UTF-8 bytes without splitting a Unicode scalar. Invalid controls, malformed Unicode, invalid metadata and empty/oversized collections fail without returning a partial file. No attendee, organizer, alarm, external URL or scheduling method is generated.

## Evidence and remaining gates

Tests use **ical.js 2.2.1** as an independent reader. It is a pinned development dependency, not a runtime serializer or app dependency. Tests verify exact point/range instants, all-day exclusive boundaries, every finite range and UID, the second repeated DST clock, property escaping and Unicode folding. They also reject unresolved dates, recurring previews and unsupported precision.

An independent parser round trip establishes more than checking our own output strings, but does not establish calendar-client compatibility or validate a repeating rule. Before releasing export:

- Show the complete chosen calendar representation using the implemented point precision.
- Verify keyboard/phone export, cancellation, errors and stale-result invalidation.
- Import generated files in a real calendar client using a disposable test calendar, with explicit authorization for that write.
- Validate complete recurrence rules, local timezone behavior, exclusions and truncation independently; retain the existing recurrence rejection until then.

The contract follows [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545): content lines (§3.1), date/time and text values (§3.3), and event start/end semantics (§3.6.1). Reader API documentation: [ical.js](https://kewisch.github.io/ical.js/api/). Neither reference substitutes for application-level verification.

The independent reader also verifies a range whose start and end use different occurrences of a repeated clock. The file preserves both selected UTC instants and the original source text. This remains internal serializer evidence, not calendar-client import evidence.

## Local web export candidate

Resolved points, intervals and finite collections now have an optional Export to calendar disclosure. It describes the representation before the explicit Download calendar file action. Date-only points become all-day events; time-bearing points retain their exact instant without an invented duration. The editable title defaults to the event label or date phrase. Empty titles disable download. No network request or calendar write is made.

Changing the phrase, reference, timezone or interpretation remounts the export controls, resets the title and closes the disclosure. Unresolved results have no export control. Resolved recurrence uses the bounded export flow described below. Errors retain the current input and allow retry. Feedback says download was requested, because the browser does not report completed file saving.

Verified in a 320px desktop browser: keyboard disclosure/download, generated all-day and noon file contents through Blob instrumentation, whitespace-title validation, hidden export after ambiguous input, and a simulated download failure. Independent serializer tests cover intervals and finite collections. Physical devices, actual calendar-client import and complete recurring export remain release gates; this local candidate is not deployed.

The export disclosure lists every file event independently of the calculator's custom display format. Timed rows include seconds, any milliseconds, timezone and UTC offset; all-day rows show complete civil dates. This closes a preview gap where arithmetic seconds could be exported without being visible in the minute-only result summary. Fractional seconds are displayed but still rejected by file preparation, without rounding.

Boundary tests independently check years 0001 and 9999 as parsed calendar fields and verify the file's four-digit representation. A valid local date whose UTC instant falls outside the export year range is rejected. The reader formats year 0001 as `1`; tests compare calendar meaning separately from serialization spelling.

## Recurring export groundwork — not connected to download

`calendar-timezone.ts` now generates an explicit VTIMEZONE transition table from the runtime's timezone data for caller-specified coverage. Coverage must be ordered, no longer than ten calendar years and within years 0001–9999; transition count is capped at 64. These are helper resource limits, not implicit limits on a user's schedule. Unbounded schedules must not be shortened to fit. This helper is internal, performs no network access and is not in the SDK entrypoint.

The table uses explicit STANDARD observances with offset-before/offset-after values, without guessed annual rules or timezone abbreviations. Tests with the independent ical.js reader cover Chicago, Lord Howe's half-hour transitions, Kathmandu and Apia's skipped date, including a change exactly at the coverage start. Generated timezone blocks are only verified within the requested interval; they must not be reused as unbounded timezone definitions.

Authored calendar fixtures using these generated blocks independently expand a local weekly RRULE across DST, preserve an excluded date and an inclusive UTC UNTIL, and apply a RECURRENCE-ID override selecting the second repeated clock without shifting later weeks. These fixtures verify the chosen serialization primitives. They are **not** proof that the app can serialize a complete user schedule yet.

Remaining implementation: build the full rule from the interpretation, validate every relevant bounded occurrence (not just preview rows), retain explicit override instants and range ends, handle unbounded timezone coverage without inventing a cutoff, and connect a current-result export preview. Real client imports remain separate. The semantics reference is [RFC 5545, recurrence and timezone components](https://www.rfc-editor.org/rfc/rfc5545); the runtime timezone source is distinct from the independent file reader.

## Complete bounded recurrence download

The local app now validates all upcoming occurrences through an explicit end date when the export disclosure opens. The normal three-row preview does not determine the file. The internal complete resolver caps work at ten calendar years and 1,000 occurrences; exceeding a limit returns no file and does not change the schedule. A DST ambiguity outside the preview asks for a date/endpoint choice before enabling download. Export choices can be restarted and are discarded with input/context changes.

The file represents one finite recurrence set: one UID, UTC RDATEs for every start, and RECURRENCE-ID components with exact occurrence endpoints. The first date is explicitly included in RDATE as well as DTSTART; independent-reader testing caught its omission during expansion otherwise. This representation preserves exclusions and changing elapsed durations without deriving a constant duration from the first range. It is not an editable weekly RRULE or an unbounded promise. Instants use timezone rules available at generation time; future rule changes will not recalculate those fixed dates. Duplicate start instants are rejected rather than silently merged. The earlier VTIMEZONE/RRULE groundwork remains separate from this UTC recurrence-set path.

The bounded weekday reminder journey now completes through file download: all four September 14/15/17/18 ranges are visible and independently read from the browser-generated file, including the fourth date omitted from the preview. A later November DST ambiguity blocks download until selected; all ten resulting dates are then shown. Keyboard correction/restart focus and 320px containment pass. `recurring-browser.ics` in the SDK release scratch directory records the downloaded bounded file. Real calendar-client imports remain unverified.

Unbounded schedules remain unavailable for export. The full matrix gate remains open until unbounded rule semantics, calendar-client behavior and relevant device paths are established. Public SDK export APIs are also still absent.

## Unbounded rule investigation: a reader disagreement

A reproducible authored fixture now checks `DTSTART` March 1, 2026 01:00 Chicago, `DTEND` 03:00, and three weekly Sunday instances. Run:

```sh
node comparison/calendar/rule-probe.mjs --require-conformance
```

With pinned ical.js 2.2.1 this command **fails its conformance gate** and records `conforms: false`. The generated fixture and raw result are local under `comparison/results/calendar/`. The ordinary test suite does not absorb this known reader failure as a passing export test.

RFC 5545 §3.8.5.3 assigns the same exact duration to recurrences defined with DTEND. The master is two elapsed hours, so the March 8 occurrence starts 07:00Z and must end 09:00Z (04:00 CDT). ical.js reports an end of 08:00Z (03:00 CDT), only one elapsed hour. Installed `Event.getOccurrenceDetails` adds the master's duration to local calendar fields. This probe therefore cannot serve as a passing recurrence-duration oracle. It does not establish how Apple, Google or Outlook will import the file.

This matters because Tempus's written `from 1am to 3am` rule deliberately preserves both local endpoints, while a simple RRULE plus DTEND preserves the initial elapsed duration. A reader returning the desired wall-clock result can disguise an invalid serialization strategy. Existing bounded explicit-UTC files use per-occurrence ends and do not rely on that strategy; their point, interval, recurrence and timezone tests were rerun after this finding.

The same standard distinguishes nominal DURATION from exact DTEND duration, chooses the first occurrence of a repeated local DATE-TIME, and excludes nonexistent times generated by a recurrence rule. Those defaults cannot silently replace Tempus's explicit choices. [RFC 5545 §§3.3.5, 3.3.10 and 3.8.5.3](https://www.rfc-editor.org/rfc/rfc5545.html).

### Implementation path and remaining decisions

1. Establish reader conformance against authored exact-duration, nominal-day, repeated-clock and nonexistent-clock fixtures. Keep expected results based on the declared standard, not captured library output. Obtain a second implementation or real-client evidence before selecting a rule validator.
2. Select a versioned timezone definition source with future observance rules. The current bounded transition table cannot be reused indefinitely; never infer permanent annual rules from a short runtime sample.
3. Distinguish point, elapsed-duration, calendar-duration and independently written endpoint schedules in the export contract. A single master DTEND is insufficient for the last category across DST. Keep that gap explicit while evaluating faithful rule/exception representations; do not mark the full gate done after implementing only easy cases.
4. Future ambiguity behavior needs an explicit series policy visible before an indefinite file is accepted. Current per-occurrence choices do not authorize new future choices. Any proposed policy must preserve original input and show its effect; it is not implemented or approved by this investigation.
5. Validate complete generated rules, exclusions and selected overrides, then verify actual calendar-client imports with authorization. Retain bounded export as the current implemented path; an end date must remain a user choice.

This investigation changes the evidence requirements for the open gate. It does not enable unbounded downloads, change parser policy, write calendars, add a dependency or establish that all calendar clients share this reader behavior.

## Second-reader verification

A second implementation, `recurring-ical-events` 3.8.2 with `icalendar` 7.3.0, produces the same March 8 one-hour DTEND discrepancy. Agreement between these readers does not close the standard-conformance gate. It is not evidence that real calendar clients all behave the same way.

The second reader independently expands all three current scripted correction files: numeric reminder duration, replacement range and bounded recurring reminder with second-clock choice and exclusion. Exact endpoints, `call Sam` titles and file hashes match their declared expectations. It also reads the previously captured browser weekday file as September 14, 15, 17 and 18, 14:00Z–22:00Z. That last file is historical browser-download evidence; this check does not claim a fresh download or calendar import.

Reproduce from the repository root:

```sh
node comparison/calendar/rule-probe.mjs
pnpm test run comparison/journeys.test.ts
uv run --locked --script comparison/calendar/second-reader.py
```

Add `--browser-file /absolute/path/recurring-browser.ics` to check the captured four-range file. Add `--require-rule-conformance` to enforce the separate rule gate; it currently exits 1, while reporting four passing bounded files when the optional file is included. Raw output is in `comparison/results/calendar/second-reader.json`. The script is a local validation tool only: its PEP 723 dependencies and adjacent uv lock pin this Python environment; no Python or reader dependency is added to the app or SDK.

The runner binds generated journey files to the current replay's hashes and checks that the authored rule fixture matches the JavaScript probe. The query window is January 2026 through January 2028, covering these declared fixtures only. It cannot certify arbitrary files outside that range, all-day behavior, unbounded recurrence, alarms, invitations or client-specific import behavior. Reader versions, Python version, script/lock hashes, raw rows and failure state are recorded.

## Timezone source evaluation

`@touch4it/ical-timezones` 1.9.0 was inspected without installation. Its npm archive passes the published SHA-512 integrity check; archive SHA-256 is `092dfe30a0891ea14a77b485a78d5cda0069a74ea8d560c78c0654fdede4c34e`. Published January 9, 2023, its sampled files identify Olson **2018g-rearguard**. Its Almaty file gives noon September 12, 2026 as 06:00Z; current runtime data gives 07:00Z. Its Node filesystem-based API also does not directly fit browser/Worker execution. Do not adopt this package's stale data. Archive size is 30,520 bytes (233,068 unpacked); size alone is not a reason to accept it.

The [tzurl project](https://github.com/ical4j/tzurl) publishes generated VTIMEZONE data. Captured direct HTTPS files identify **2026d**, matching the [IANA release page](https://www.iana.org/time-zones) at inspection. Chicago contains ongoing annual observance rules and correctly maps the sampled July/December 2046 noon clocks to 17:00Z/18:00Z; Almaty September 2026 noon maps to 07:00Z. These samples establish only those conversions under the captured rules, not future legislation or full-zone correctness.

The Yellowknife URL returned `TZID:America/Edmonton`. The probe rejects this identity until the alias mapping is verified against the chosen IANA release. An exploratory conversion that overrode the returned TZID appeared to disagree with the parser; that is **not a confirmed parser defect**, because the source identity was not established. Node 26.8.1 reports ICU 78.3/tzdata 2026a, so data-version drift remains a real compatibility concern even when sampled clocks match.

Captured files and the inspected archive are under `/Users/mylescook/Documents/Codex/2026-09-12-tempus-timezone-source/`. Reproduce the offline check after `pnpm build:sdk`:

```sh
node comparison/calendar/timezone-source-probe.mjs /absolute/captured-files /absolute/tzdata2026d.tar.gz --require-parser-agreement
```

It records content hashes, source metadata, expected/observed clocks and parser agreement in `comparison/results/calendar/timezone-source.json`. The identity gate currently exits 1. No source files were vendored into the application. Before adoption: verify aliases, choose a reproducible versioned generation/update process and license provenance, reconcile export data with parser data, validate affected transitions, and keep timezone loading outside the default parser bundle. A live mutable endpoint is not a pinned release artifact or a reason to require network access during parsing.

### Alias resolved; runtime mismatch confirmed

The official [IANA 2026d archive](https://data.iana.org/time-zones/releases/tzdata2026d.tar.gz), SHA-256 `0cb2aa8e333c3dc049badc42a0c61f21987b8cd44e107fa900bad764aacc7767`, declares `America/Yellowknife` as a backward link to `America/Edmonton`. Its northamerica source defines the new fixed -06:00 era. The probe now resolves that alias from the selected archive and checks the component's declared data revision; it no longer treats this verified alias as an unknown identity. Other mappings still require validation.

The strict probe remains failed for a different, now-confirmed reason: Yellowknife noon December 1, 2026 is 18:00Z under the 2026d definition, but the emitted SDK on Node 26.8.1/Intl tzdata 2026a returns 19:00Z. Compiling the official northamerica source with the installed `/usr/sbin/zic` into task scratch and reading its Edmonton TZif with Python `ZoneInfo.from_file` independently confirms 18:00Z. No system timezone files or installed runtime were changed.

This supersedes the earlier unresolved-alias assessment. The earlier caution was appropriate until source identity was established; it must not remain the current blocker. A newer timezone block cannot silently be paired with an older parser interpretation. Cross-runtime data consistency is now a concrete release gap, including for existing calculations in affected zones, not merely a future-export concern. Implement a shared pinned data strategy or an explicit compatibility boundary before making cross-runtime reproducibility claims; do not infer that all zones or all runtimes fail from this one case.

The package README now states the runtime-data dependency and this known mismatch. Its older matching-clock group limitation was also corrected to match the implemented confirmation behavior. No SDK executable code changed in this investigation; the previously verified archive remains runtime evidence, but its README predates these documentation corrections and must be refreshed before release.

## Pinned-data provider prototype

**Current decision:** do not adopt the JSON provider below. The TZif investigation identifies structural era-boundary errors. Earlier passing probes remain limited evidence, not approval of this dependency.

### Current backend investigation: compiled TZif

The three Gaza failures were not caused by the nearby-transition speed patch. The JSON provider treats source-local era boundaries as UTC. Its packaged JSON also encodes year-only boundaries incorrectly: the source Gaza boundary `1996` appears as December 31, 1996, and `2010` appears after the following March 2010 boundary. Sorting these timestamps reorders source eras. Correcting three output examples would leave the representation problem intact.

A separate scratch reader uses IANA's compiled TZif transitions and explicit POSIX footer rules. It does not derive permanent rules from sampled years, mutate Intl, read system timezone files or enter the app bundle. [RFC 9636](https://www.rfc-editor.org/rfc/rfc9636.html#section-3) defines these boundaries and explicitly marks `-00` time types as unspecified. The prototype rejects those types rather than inventing a timezone.

| Check                             | Observed result                                                                                             | Limit                                                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Original compiled-IANA comparison | All 5,760 cases match, including Gaza                                                                       | Inspected development cases                                                                                                          |
| Wider comparison                  | 31,959 clocks across 597 compiled zone names; 165 disagreements                                             | Includes seasonal samples in years 1, 1900, 1996, 1999, 2010, 2026, 2100, 2400 and 9999; exact transition boundaries for eight zones |
| Disagreement inspection           | All 165 are historical unspecified-time rejections across 16 zone names; no other sampled offset mismatches | Python ZoneInfo returns an offset for these periods; this is not a green all-cases result                                            |
| Exploratory data size             | 344 unique TZif files: 205,404 raw bytes; base64 JSON plus aliases: 287,813 bytes / 75,700 gzip             | Excludes reader/loader; not the installed SDK bundle or a loading benchmark                                                          |

The scratch results above are preserved. The reader and reproduction scripts now live in `comparison/calendar/`; follow the [archive-to-oracle instructions](../comparison/calendar/README.md). The builder verifies the pinned archive, retains its license and records compiler/source/output hashes. Explicit fat TZif output expands the same boundary-sampling policy to **33,513 cases**, retaining the same 165 unspecified-history differences and no other sampled offset mismatches. The command still exits **1**. Two same-host builds produce identical hashes for all 597 files; a pinned compiler-source build remains open.

Current reports are in `/Users/mylescook/Documents/Codex/2026-09-12-tempus-timezone-rebuild/`: `build-manifest.json`, `tzif-oracle-manifest.json`, `tzif-boundary-report.json` and `repeat-build.json`. The comparison validates oracle and compiled-file identities. The independent interpreter is Python `ZoneInfo.from_file`, using those task-local files. No host data update occurred. The reader is experimental comparison code, not application or SDK code.

Runtime follow-up: the portable eight-case probe plus unspecified-history refusal passes Node 26.8.1, Chrome 150 and local workerd. The fat-data probe costs 179,073 gzip bytes. Slim output is smaller but introduces 126 additional mismatches against the same boundary clocks; Python reproduces one file-to-file Gaza discrepancy. See [runtime and format findings](../comparison/calendar/README.md#runtime-and-format-findings). This host-compiler format failure is now resolved by the task-local pinned IANA 2026d compiler: both formats match the unchanged 33,513 clock expectations, apart from the 165 unspecified-history refusals. Correct slim data is 76,430 gzip bytes before reader code. Repeated compiler and data builds match. No application code uses this provider.

Before adoption: validate supported TZif/footer forms and unspecified-history handling; pin a reproducible compiler/data build and license provenance; verify browser/Worker behavior and loading cost; then use one backend consistently for calculation, clarification, formatting and export. Unknown historical data needs a visible unavailable result, not an invented UTC date or a misleading success count. The current application still uses runtime Intl data, so its confirmed Yellowknife mismatch remains unresolved. Neither this comparison nor more internal tests establishes independent product accuracy.

A scratch-only prototype evaluates `timezonecomplete` 5.15.1 with `tzdata` 1.0.51 (IANA **2026d**). The library normally pins older tzdata 1.0.49; the scratch pnpm workspace explicitly overrides that dependency and records its lockfile. No dependency was added to Tempus. The scratch install used pnpm 11.24.0, which ignores the older package.json `pnpm.overrides` location; the override was moved into its pnpm-workspace.yaml before measurement.

The candidate enumerates offsets from the database's transition API, converts each candidate civil clock to an instant, and retains only candidates whose actual offset agrees. It does not select a default. Six authored Node cases pass: Yellowknife December 2026 (18:00Z), Chicago's repeated 1:30 (both instants), Chicago's nonexistent 2:30 (zero), Lord Howe's half-hour repeat (both), Apia's skipped day (zero) and Kathmandu's quarter-hour offset. These are targeted provider checks, not full parser integration or proof for years 0001–9999.

A browser bundle initially failed because the library's dynamic Node data loading did not include the JSON dataset. Explicit data import plus `TzDatabase.init(data)` fixes that in Chrome 150; Yellowknife, the Chicago repeat and gap match the Node results. The source import needs the JSON import attribute for Node; after adding it, all six Node checks pass. The complete provider/data bundle is **326,166 bytes minified / 57,182 gzip** with esbuild browser/ES2022 settings. This is a provider-only prototype, not a new Tempus bundle or a speed comparison. The task-local server on 5185 was stopped.

Prototype source, tests, lockfile and bundle are at `/Users/mylescook/Documents/Codex/2026-09-12-tempus-timezone-source/provider/`. It remains scratch work because the public database API is a singleton: explicit initialization can affect another consumer of the same library. Before adoption, establish an isolated database instance through a supported API or choose another implementation; preserve the SDK's lack of global configuration changes. The added bundle cost also needs an integration measurement and loading design.

The next implementation must route all conversions consistently: reference instants, anchor clocks, arithmetic steps, endpoint choices, recurrence boundaries and export observances. Retain Temporal's civil arithmetic and existing trace policy where possible. Replacing only the export timezone block or only one parser path would retain the confirmed inconsistency. Preserve strict API shapes and rerun protected behavior against the same data revision; compare intentional rule updates separately from regressions. This is a concrete backend integration requirement, not approval to change host runtimes or silently apply DST defaults.

### Private-bundle isolation and boundary cost

The scratch provider's self-contained browser/ESM bundle encloses its own copy of the database implementation and dataset. `isolation.mjs` verifies in Node 22.12.0 and 26.8.1 that importing it preserves a separately imported timezonecomplete consumer's database. Resetting that consumer to deliberately different test data does not change the provider's Kathmandu result. `Intl.DateTimeFormat` retains its identity. The test restores the separate consumer afterward. This demonstrates bundle-level isolation without calling a private constructor; it does not justify importing the unbundled singleton into the SDK.

A fresh-process boundary probe (`boundary-timing.mjs`, raw `boundary-timing.json` in the same scratch directory) found a material performance problem: Node 26.8.1 took about **4,890 ms** to enumerate Chicago candidates for December 1, 9999. The preceding current-year case took 5.118 ms; UTC year 0001 took 1.079 ms; bundle import took 7.195 ms. This single diagnostic run is not a benchmark distribution or a comparison with gpu-time. It is enough to reject the prototype unchanged as the calculator's full-range backend. Correct output alone does not satisfy responsive task completion.

The shared-state concern has a demonstrated isolation route, but adoption remains open: find a bounded-cost full-range lookup strategy or a different provider, then integrate every timezone conversion and validate the protected calculator, correction journeys, package runtimes and browser behavior. Do not silently narrow the supported year range, substitute host data for slow cases, or infer future rules from samples to make this probe pass. No provider code or dependency was added to the app or SDK.

### Nearby-transition patch: faster, with inherited failures

Inspection traced the far-future cost to linear history scans in `stateAt` and `getTransitionsTotalOffsets`. A scratch copy of timezonecomplete now uses its existing nearby-year transition calculation after the final explicit transition era, and limits transition enumeration to the requested years. The original installed dependency and unmodified bundle remain untouched. The patch is preserved as `nearby-transition-lookup.patch` in the provider scratch directory; it is not an upstream release or an adopted dependency.

The patched/unmodified comparison matches 57 sampled cases across eight zones, including years 0001 and 9999, historical offsets, gaps and repeats. In that diagnostic run the Chicago year-9999 lookup took 3.199 ms versus 4,767.969 ms unmodified. This supersedes the unchanged prototype's timing as a description of the patched candidate, but remains a single-run observation, not a performance distribution or a product benchmark.

A stronger check compiles the official IANA 2026d regional source files into scratch TZif files using the installed `zic`, then uses Python `ZoneInfo.from_file` and UTC round trips to enumerate valid instants. The deterministic grid covers eight zones; years 1900, 2011, 2026, 2100, 2400 and 9999; six months; four dates; and five clock hours. **5,757 of 5,760** conversions agree. Three failures occur in Gaza on October 1, 1900 at 00:00, 01:00 and 02:00. The unmodified provider returns the same incorrect results, including a spurious second candidate at 02:00. These are inherited disagreements with compiled IANA data, not passing ambiguity checks.

Raw oracle/results, original/patched bundles, comparison scripts and hashes are retained in the provider scratch directory. The oracle is inspected development evidence, not an untouched language-evaluation set. Matching 57 old/new samples does not erase these independent failures. The candidate remains unfit for integration until the inherited era-boundary issue, complete transition behavior and the full calculator/SDK paths are validated. No historical range restriction or host-data fallback was introduced to hide the mismatches.

## Future-clock policy investigation

The app still blocks ongoing ambiguous clocks and intervals containing offset changes. The probe now tests candidate representations before adding a policy control. [RFC 5545 §3.3.5](https://www.rfc-editor.org/rfc/rfc5545#section-3.3.5) interprets repeated local values as the first occurrence and explicit missing values using the pre-gap offset. [§3.3.10](https://www.rfc-editor.org/rfc/rfc5545#section-3.3.10) instead omits nonexistent occurrences generated by a recurrence rule. Those are different cases; a single implicit “DST default” would hide that distinction.

| Candidate                                                         | ical.js 2.2.1            | Python reader                                           | Implication                                                                                                              |
| ----------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Weekly 1:30 AM across autumn repeat                               | Chooses second clock     | Chooses first clock                                     | Raw local recurrence cannot reliably preserve the intended clock across these readers                                    |
| Weekly 2:30 AM across spring gap                                  | Includes a wrong instant | Includes a missing-time instance                        | Neither reader implements omission in this case                                                                          |
| Explicit initial 2:30 AM in spring gap                            | Wrong instant            | Expected initial instant absent from the checked window | Initial DTSTART needs separate handling                                                                                  |
| Explicit missing-date EXDATE                                      | Passes desired omission  | Passes desired omission                                 | Candidate for an explicit skip policy; full future-date coverage still required                                          |
| EXDATE plus UTC RDATE for first repeated clock                    | Matches desired output   | Excludes replacement                                    | Rejected proposal; exclusion precedence prevents treating this as a valid repair                                         |
| RECURRENCE-ID override with first or second UTC start             | Both choices pass        | Both choices pass                                       | Candidate for preserving an explicit repeated-clock choice                                                               |
| RECURRENCE-ID override with exact UTC start/end across spring DST | Preserves two hours      | Preserves two hours                                     | Candidate for fixing elapsed-duration export without changing the user's duration                                        |
| Override that shifts missing 2:30 AM to 3:30 AM                   | Matches desired output   | Matches desired output                                  | Reader behavior only; membership/standards semantics remain unresolved because the generated missing instance is omitted |

The three raw clock-policy failures reproduce with `comparison/calendar/chicago-policy-control.ics`, a separately authored minimal modern-US timezone using an opaque TZID. This narrows them beyond our generated timezone definition. The Python reader disables host TZID substitution. The control is for these 2026 cases, not a complete historical timezone.

Run `node comparison/calendar/ongoing-event-probe.mjs --browser-point comparison/results/calendar/zoned-point-browser.ics --browser-workday comparison/results/calendar/zoned-workday-browser.ics --require-conformance`, followed by the full second-reader command in release verification. Both commands intentionally exit 1 while known failures remain. Exact candidate files, policy descriptions, endpoint expectations, observed values and file/timezone hashes are in `comparison/results/calendar/ongoing-events/`; the previous report is retained in its `history/` directory. The probe now registers exception components when reading overrides and labels app/browser files separately from authored candidates.

Next implementation: enumerate every affected occurrence across the declared export range, preserve per-occurrence choices and exceptions, and serialize exact overrides where their semantics are established. Prove resource/file-size limits and distant occurrences before exposing a future policy. Do not serialize only the displayed preview or silently invent an end date. A one-transition file probe is not an unbounded-rule guarantee. Gap-shift semantics and real client imports remain separate gates.

## Full-range override candidate: not ready for export

The development enumerator in `comparison/calendar/interval-overrides.ts` checks every recorded/future transition through an explicit supported end, preserving exclusions and all overlapping intervals. It only handles exact elapsed durations; ambiguous starts still require separate policy work. A work limit throws without returning a partial set. It is not used by the app or SDK export path.

For Chicago Sunday midnight plus four elapsed hours, from March 1, 2026 through year 9999, excluding March 8, 2026, the candidate needs **15,947 occurrence overrides**. An independent modern-US transition-date calculation agrees on every affected date. The file is **3,285,872 bytes**; generation took about **1.24 seconds** on the available desktop in the initial run. Neither this time nor the file size is a phone measurement or an approved product budget. Two source tests verify full affected-date coverage and overlapping 15-day occurrences; they do not certify file interoperability.

The Python reader checked ten March/November windows across 2026, 2037, 2100, 2400 and 9999 with embedded timezone data. **Nine passed; November 9999 failed with `year 10000 is out of range`.** The checks took **81.15 seconds**. The exhaustive ical.js run was still consuming CPU after more than 180 seconds; it was explicitly cancelled after the Python boundary failure made the representation unsuitable for a full-range compatibility claim. That run is incomplete, not a pass or a conformance failure.

Artifacts under `comparison/results/calendar/override-coverage/` include the generated file, generator report with source/file hashes, sampled Python results and the JavaScript cancellation record. Reader hashes still match the regenerated file. Earlier one-transition passes remain valid within their narrow scope.

Reproduce generation with `pnpm exec vp test run comparison/calendar/override-coverage.test.ts`. `node comparison/calendar/override-file-probe.mjs` attempts exhaustive reading and can be expensive. Add `--override-coverage comparison/results/calendar/override-coverage` to the full second-reader command to repeat the sampled checks; this currently exits 1. No calendar import, physical-device test or app behavior change occurred.

Do not enable this multi-megabyte strategy as ordinary ongoing export. Next work must establish a compact, faithful representation or an explicitly reviewed export-range policy without silently shortening the user's schedule. Preserve the single-series semantics and original intent; switching to unrelated events or inventing an end date is not a completed recurrence task. Real calendar-client evidence remains necessary even for a representation that passes both development readers.
