# Calendar verification

These tools inspect files and timezone data. They never write to a calendar account. Passing them does not prove a calendar-client import or a completed human task.

## Pinned timezone investigation

The app and SDK now use the bundled 2026d timezone database through the typed reader. `tzif-prototype.mjs` remains an investigation tool, not a public SDK API. The early runtime and format results below are historical; dated packed-runtime evidence is recorded in [release verification](../../docs/archive/release-verification.md). Current release gates are in [release status](../../docs/release-checklist.md).

Use the official IANA [2026d data](https://data.iana.org/time-zones/releases/tzdata2026d.tar.gz) and [2026d compiler source](https://data.iana.org/time-zones/releases/tzcode2026d.tar.gz). Build into new scratch directories with the existing C toolchain:

```sh
uv run --python 3.13 comparison/calendar/build-zic.py /absolute/tzcode2026d.tar.gz /absolute/tzdata2026d.tar.gz /absolute/new-compiler
uv run --python 3.13 comparison/calendar/build-tzif.py /absolute/tzdata2026d.tar.gz /absolute/new-build /absolute/new-compiler/zic slim
uv run --python 3.13 comparison/calendar/tzif-oracle.py /absolute/new-build
node comparison/calendar/tzif-compare.mjs /absolute/new-build
```

The builder checks the exact archive SHA-256 before reading selected regular files, retains the upstream license, and records source/compiler/output hashes. The format is explicit; use slim with the matching compiler. It refuses existing output directories and never updates system timezone files. A failed build retains its diagnostic manifest. The compiler build checks both archive hashes, records the source inputs and C compiler version, and runs only `make zic`. The data build links that compiler manifest. No install target is run. Cross-host reproducibility remains unverified.

The oracle uses Python `ZoneInfo.from_file` against those generated files, not the host database. It checks file identities before generating seasonal civil clocks across all compiled zones and exact transition boundaries for eight zones. The comparison validates the oracle and file hashes before reading them. Reports remain in the supplied scratch directory.

The matching compiler slim build generates 32,295 cases directly. Passing the retained fat oracle as the optional second argument to `tzif-oracle.py` preserves its additional inputs, giving **33,513 cases across 597 zone names** with identical oracle bytes. It exits **1** for 165 historical unspecified-time disagreements. All 165 are explicit reader refusals where Python supplies an offset; there are no other sampled offset mismatches. Preserve these differences. Do not change the expected results to manufacture a green comparison. RFC 9636 defines `-00` as an unspecified time type; That prototype result predates the typed backend and its explicit unavailable-data outcome.

Two builds using the same compiler produce identical hashes for all 597 files. This proves same-host repeatability only. It does not establish all TZif conformance, supported-runtime behavior, data-loading cost, product accuracy or competitive superiority. The prototype supports normal non-leap-second TZif v2+ data; further reader review and edge-case checks are required before adoption.

The earlier scratch default-compiler run had 31,959 cases. The explicit fat format adds stored transition boundaries, giving 33,513 cases under the unchanged sampling policy. Both raw results are retained; the historical count is not the current reproducible run.

## Runtime and format findings

`tzif-runtime.mjs` is a portable eight-case probe plus an expected unspecified-history refusal. With generated data supplied locally, it passes on Node 26.8.1, Chrome 150 and local Wrangler 4.131.1/workerd. Intl remains unchanged. It covers repeated/skipped clocks, half-hour transitions, Gaza history, Yellowknife 2026 and year 9999. This is experimental reader evidence, not packed-SDK integration or physical-device evidence.

The fat-data probe bundle is 560,222 bytes / **179,073 gzip**. Single diagnostic observations were 5.30 ms for Node import through the probe and 14.90 ms for Chrome's local module import through the probe. Local workerd reports zero for the in-request timer; that value is not useful performance evidence. No timing distribution, production network, phone or peak-memory measurement is claimed. Raw outputs are in `2026-09-12-tempus-timezone-rebuild/runtime/` under the user's Codex scratch directory. Temporary servers were stopped.

The builder also accepts `slim` as its optional fifth argument. **Historical host-compiler failure, resolved below.** It reduces the data module to 75,721 gzip bytes but disagrees on 126 additional clocks from the unchanged 33,513-case fat-build oracle, beyond the 165 unspecified-history refusals. For Gaza September 2, 2073 at 02:00, the fat file gives 00:00Z and the slim file gives the previous day's 23:00Z; Python independently reproduces that file-to-file difference. A smaller artifact cannot be accepted by dropping those boundary checks. The recorded host compiler must be replaced by a task-local build of the matching pinned IANA compiler before selecting a format. Neither candidate was integrated at that investigation stage.

## Existing file checks

- `rule-probe.mjs`: authored RRULE/DTEND conformance fixture; use `--require-conformance` to expose the known ical.js failure.
- `second-reader.py`: pinned independent reader for finite and bounded recurrence files; see its `--help` and adjacent dependency lock.
- `timezone-source-probe.mjs`: captured timezone component identity, revision and parser agreement. The current runtime-data discrepancy remains an open failure.

See [calendar export](../../docs/archive/calendar-export.md) for exact evidence and remaining client-import requirements.

## Typed database integration work

`src/shared/date-engine/timezone-reader.ts` and `timezone-database.ts` now provide a typed reader, case-insensitive named-zone lookup, a bounded decoded-zone cache and a distinct `TimezoneDataUnavailable` error. They use neither Intl nor browser-only decoding APIs. The app and public SDK now use this database. The investigation results above predate that integration.

Generate the bundled data only from the verified compiler build:

```sh
uv run --python 3.13 comparison/calendar/generate-timezone-data.py /absolute/new-build /absolute/fresh-scratch/timezone-data.ts
pnpm exec vp fmt /absolute/fresh-scratch/timezone-data.ts
```

The generator requires successful build manifests, checks the actual compiler bytes against both manifests, validates every compiled file hash and the license hash, and refuses an empty inventory or existing output/license. It deduplicates zone files and retains the upstream license beside the generated source. Create the fresh scratch directory first; inspect and verify the generated result before explicitly replacing the bundled source and license. The generator does not replace them automatically. Its payload hash is recorded in the file. The generated data is 2026d; it does not update itself during parsing.

Twelve focused tests cover offset updates, repeated/skipped clocks, year limits, historical second offsets, unknown-zone rejection and operation without host formatting. The source database can also be bundled with esbuild and supplied to `tzif-compare.mjs BUILD --database /absolute/database.mjs`. The report records the consumed bundle hash. That source-bundle run retains all 33,513 clock inputs and only the same 165 explicit historical-data refusals. Its standalone bundle is **78,971 gzip bytes**; this is not the integrated SDK or app size.

The host-data discrepancy is not fixed until all calculation, clarification and formatting paths use the same backend. Existing packed-SDK checks still describe the earlier executable archive. Rebuild and verify the package after integration.

The conversion layer in `zoned-date.ts` now keeps an instant, named zone and second-precision offset together. Civil arithmetic remains explicit; elapsed arithmetic rechecks the destination offset. Gap choices use an actual recorded transition interval. Date-only handling finds the first real instant of a day and leaves entirely skipped-date rejection to the scheduling caller. A distinct unavailable-history error never becomes a gap suggestion. Nineteen focused database/conversion tests pass, including Gaza's exceptional 2073 gap and exact transition coverage boundaries. These helpers are not yet called by the app or SDK; their addition alone does not close a user-journey gate.

## Matching compiler correction

The task-local IANA 2026d compiler removes all 126 additional fat/slim disagreements against the unchanged 33,513 clocks. The 165 unspecified-history refusals remain; the comparison still exits 1. Reusing prior clock inputs produces the exact previous oracle SHA-256 `a3c024b9998e64f63a0e958b886d8ea68e07a110bda1e1043ea278e0aa83fe94`, so this result did not drop failing cases or change expected answers.

Compiler source archive SHA-256: `2f5c9f7fe29e6b8cb863583667884b8ce17b0a485355a054b591c6bdfcd81791`. Two task-local builds produce compiler SHA-256 `3ba332d915303b1879e8030c982b1c0a62535dfa34da70f9f8894f48e1b0a8e8` and identical hashes for all 597 slim zone files. The platform C toolchain is recorded, not hermetic. `build-zic.py` and `build-tzif.py` preserve build evidence.

The corrected slim data module is 289,107 bytes / **76,430 gzip**, excluding the reader. It passes the eight-case Node runtime probe plus expected unspecified-history refusal. The earlier Chrome/workerd results used fat data; rerun them with the final packaged backend before claiming current SDK compatibility. Reports are in Codex scratch `2026-09-12-tempus-iana-pinned/`, with compiler evidence in `2026-09-12-tempus-iana-compiler-repro/` and the data-size/runtime probe in `2026-09-12-tempus-iana-slim/`.

The old host-generated slim failure remains historical evidence. It is not a defect established for all slim TZif files. Use the matching compiler going forward. App/SDK integration, unavailable-history UX, full reader checks and final package loading measurements remain open.

## Third reader: libical 4.0.5

The task-local static C reader independently checks the finite diagnostic pack and six authored duration cases. It is a development tool, not an app/SDK dependency or calendar client. [Release 4.0.5](https://github.com/libical/libical/releases/tag/v4.0.5) and the [recurrence API](https://libical.github.io/libical/v4/apidocs/icalcomponent_8h.html) were inspected. The source archive URL is `https://codeload.github.com/libical/libical/tar.gz/refs/tags/v4.0.5`; SHA-256 is `cc09a3ac41d60e6144e644bd3fcf97d47106d659c4a0b8965102581401e67c9c`.

Current source, binary, build record and logs are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-libical/`. CMake 4.1.2 was supplied through `uvx`, not installed system-wide. Configure with static core enabled; C++, Java, GLib, GObject introspection, VAPI, documentation, examples and testing disabled; ICU and BerkeleyDB discovery disabled. Build only target `ical` with parallelism 2. No install target is run. The first configure attempt failed because introspection was still enabled; its log is preserved. Compile `libical-probe.c` with clang `-Wall -Wextra -Werror -O2`, the source/build libical include directories and the resulting `build/lib/libical.a`.

Re-run against that exact build, choosing a new output directory:

```sh
python3 comparison/calendar/third-reader.py \
  /Users/mylescook/Documents/Codex/2026-09-13-tempus-libical/probe \
  /Users/mylescook/Documents/Codex/2026-09-13-tempus-libical/build-manifest.json \
  comparison/results/calendar/libical-next-check
```

The runner verifies the source archive, executable and probe-source identities against the build record, then checks the existing pack's file hashes. Output directories must be new so prior results survive. The report exits **1** for the two remaining clock mismatches: 8/10 cases match. UTC control and exact DTEND duration pass. Four elapsed hours, 24 elapsed hours and one calendar day all pass across both spring and autumn. Repeated-clock and missing-clock expectations remain unchanged and fail.

The opaque synthetic TZID must resolve to the file's embedded timezone object. This build does not use ICU/RSCALE; Gregorian probes do not test other calendars. The adapter rejects detached exceptions: an attempted read of the two-year 103-interval browser file stopped at that boundary, so no result is claimed for it. This limitation belongs to the adapter, not a demonstrated library defect. `icalcomponent_foreach_recurrence` is not a substitute for a full calendar-client integration. No real calendar was opened, imported or written.

The next candidate is ongoing **elapsed** duration with an unambiguous start, retaining the existing refusal for ambiguous starts and separate calendar-day/written-end semantics. The positive duration evidence does not close future-clock clarification, broad reader compatibility, supported-range validation or actual client-import gates.

## Ongoing elapsed-duration candidate

The task-local candidate uses Tempus's pinned Chicago timezone definition, renamed to the opaque control TZID so the reader must use the embedded object. It is a local-midnight weekly rule with four elapsed hours and one explicit exclusion. No COUNT or UNTIL is inserted, and no app export policy is enabled.

The initial no-ICU libical build fails weekly dates in 2100, including a plain UTC control with no timezone component. A separate build using the **existing ICU 78.3** installation corrects that failure. Both builds, configuration logs and reports remain in scratch. Neither build validates the later-year cases: 2582 windows have wrong offsets and later windows return no occurrences. The library source contains `ICALTIMEZONE_MAX_YEAR 2582`; this is a reader limitation, not an excuse to shorten Tempus's rule. Do not describe the no-ICU results as applying to all libical configurations.

The ICU-backed reader matches **20,870 occurrences** across 34 windows covering March 1, 2026 through March 1, 2426, against Python `ZoneInfo.from_file` using pinned IANA 2026d. Starts and four-hour ends, including the exclusion, are compared exactly. This is one weekly rule over one Gregorian cycle. It does not cover all zones, cadences, later years, calendar clients or intent recognition.

Generate into a new directory after `pnpm build:sdk`:

```sh
node comparison/calendar/elapsed-duration-probe.mjs /absolute/new-candidate
uv run --python 3.13 comparison/calendar/elapsed-duration-cycle.py \
  /absolute/probe-icu /absolute/build-manifest-icu.json \
  /absolute/new-candidate /absolute/pinned-tzif/America/Chicago \
  /absolute/new-cycle-output
```

The checker verifies candidate, reader and linked ICU identities. It saves every expected/observed row in compressed JSON plus hashes and window summaries. Current output is `comparison/results/calendar/elapsed-duration-cycle/`; smaller successful and failing windows, UTC controls and the candidate are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-elapsed-ongoing/`. The ICU build record is `/Users/mylescook/Documents/Codex/2026-09-13-tempus-libical/build-manifest-icu.json`. The third-reader runner also checks ICU library hashes before reusing a build identity.

A product decision is pending: keep these exports blocked until actual calendar-client verification, or expose them with an explicit experimental compatibility warning. No calendar import or write is authorized by that decision. App and SDK behavior remain unchanged while the decision is pending; the existing acceptance gates have not been relaxed.

## Bundled data integrity

Verify the checked-in TypeScript literals against the retained compiled build without importing or executing JavaScript:

```sh
uv run --offline --python 3.13 comparison/calendar/verify-timezone-data.py src/shared/date-engine/timezone-data.ts /absolute/compiled-build
```

The September 13 check passes all 597 zone names and 344 unique files. It checks the complete literal structure, declared payload digest, strict base64 decoding, Python `ZoneInfo` acceptance of every unique file, equality with every compiled zone and the license. Controls reject an altered digest, duplicate zone and extra statement. The first verifier stalled on a nested regular expression; the retained implementation uses line-by-line literal checks and completes promptly.

Raw results are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-timezone-integrity/`. This is retained-build identity and reader acceptance, not independently authenticated upstream provenance, hermetic compiler proof, exhaustive date correctness or calendar-client import. The sealed security scan remains unchanged; this is subsequent evidence.

## Monthly clamping compatibility

Run the standalone diagnostic against a new directory:

```sh
node comparison/calendar/monthly-clamp.mjs /absolute/new-output
uv run --locked comparison/calendar/monthly-clamp.py /absolute/new-output
```

Both commands deliberately exit nonzero when candidate rules disagree with their expected monthly dates. They generate local probe files only; they do not enable an app export or write a calendar. Five candidates cover days 29/30 with BYMONTHDAY/BYSETPOS or RSCALE, plus a last-day-31 control. Each uses 4,800 expected UTC occurrences across 2026–2425, including leap centuries. Raw reports retain the first mismatch/error and file hashes.

The September 13 run in `2026-09-13-tempus-monthly-clamp` finds 1/5 passing in ical.js 2.2.1 and 3/5 in Python (icalendar 7.3.0 / recurring-ical-events 3.8.2). Python passes both BYSETPOS candidates; ical.js emits additional March dates. RSCALE/SKIP fails both readers: ical.js skips February and Python rejects the unbounded rule. Both pass the BYMONTHDAY=-1 control.

[RFC 7529 section 4.1](https://www.rfc-editor.org/rfc/rfc7529.html#section-4.1) defines RSCALE with SKIP=BACKWARD for invalid dates. Its [compatibility section](https://www.rfc-editor.org/rfc/rfc7529.html#section-6) explicitly addresses clients that cannot process it. Standards validity is not proof of working import. Ongoing day-29/30 clamping remains blocked; bounded complete export is a different, supported task. Do not replace the failing reader, rewrite expected dates or silently split the user's ongoing schedule to make this gate pass.

## Two-series monthly clamping candidate

The earlier single-series BYSETPOS and RSCALE/SKIP failures remain unchanged. A different diagnostic splits one intended monthly reminder into two VEVENTs with distinct UIDs: February's last day every year, and the written day in the other eleven months. Neither series has an invented end date.

Reproduce locally, using a new output directory:

```sh
pnpm build:sdk
node comparison/calendar/monthly-split.mjs /absolute/new-output-directory
uv run --locked comparison/calendar/monthly-split.py /absolute/new-output-directory
```

Recorded artifacts: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-monthly-split/`. Both ical.js 2.2.1 and icalendar 7.3.0/recurring-ical-events 3.8.2 pass four files: days 29 and 30 in UTC and America/Chicago. Each expands to 4,798 noon occurrences over 2026–2425, after one February and one other-month exclusion; every interval lasts 1,800 seconds. The files contain two distinct repeating series. Expected instants are generated with Temporal from each month's intended date, independently of the RRULE expansion.

This is a representation candidate, not enabled application behavior. Actual calendar-client imports, arbitrary start dates, arbitrary clocks and calendar editing/deletion have not been verified. Two series change the user's maintenance task: editing or deleting the entire reminder requires both. A product decision about an explicit opt-in remains pending; no calendar write is authorized. The ongoing day-29/30 application block stays in place.

## Retained monthly compatibility evidence

The [portable monthly snapshot](../evidence/monthly-compatibility/README.md) includes the five single-series candidates and four two-series files, both reader reports, expected date arrays and checksums. A fresh local rerun reproduced all nine prior calendar file byte sequences. The single-series commands still exit 1; the two-series commands exit 0 within their recorded scope. No failing case was omitted and no app behavior was enabled.

## Exact-duration fixture validity control

The historical RRULE/DTEND fixture omitted required PRODID. A new [portable control](../evidence/duration-control/README.md) preserves it and adds only PRODID in a second version. Both pinned readers still shorten the spring-transition occurrence to one elapsed hour instead of the unchanged two-hour expectation; both commands exit 1. This confirms the mismatch survives that fixture correction. The fixture is not generated by Tempus's exporter; no exporter defect or client compatibility follows from this check. Ongoing export policy remains blocked where previously blocked.

## UTC-to-local reader isolation

`node comparison/calendar/utc-conversion-probe.mjs NEW-OUTPUT` checks nine authored clocks in a hand-written finite timezone and exits 1 on any disagreement. `uv run --locked --offline comparison/calendar/read-utc-conversion.py NEW-OUTPUT` reads the same embedded timezone without a system TZID lookup. [Retained results](../evidence/utc-reader-isolation/README.md): ical.js matches 7/9 civil clocks; Python matches 9/9. This isolates a reader behavior without validating every Tempus export. The existing expected failure and actual-import gates remain open.
