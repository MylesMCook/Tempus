# Reuse numeric-date label formatting

September 13, 2026. Candidate `bd06963f2facb68dce9e2aadb79b21d9cfd2583a004a60b6e7b33e9706f0aa7e` changes only `dist/clarify-numeric-date.js` from archive `a8a1cbb41947e294d08d82a3fcb39dddd485574daff86b22f3e20e7423bc35ca`. A single lazy UTC formatter replaces repeated Temporal date-label formatting. Calendar validity, choice IDs/expressions, original input, spans, clock resolution, traces and selection invalidation are unchanged. No result cache, dependency or public API was added.

## What the memory probe found

Each lane discards 5,970 ambiguous-date results over ten cycles. Fixed lanes always use Chicago; varied lanes traverse all 597 bundled timezone names. Yield lanes permit an event-loop turn between cycles, with explicit garbage collection. Two fresh processes per lane were run before the change, then two afterward. These phase-ordered memory runs are descriptive; they are not a randomized or statistically conclusive memory study.

| Lane                          | Before RSS growth, MiB (two runs) | After RSS growth, MiB (two runs) |
| ----------------------------- | --------------------------------: | -------------------------------: |
| Fixed timezone, uninterrupted |                   155.78 / 156.83 |                    36.12 / 35.50 |
| All zones, uninterrupted      |                   157.58 / 158.30 |                    59.25 / 59.27 |
| Fixed timezone, yielding      |                   157.19 / 156.45 |                    36.14 / 36.69 |
| All zones, yielding           |                   158.33 / 159.02 |                    59.00 / 59.72 |

Before the change, constructor instrumentation observed 23,880 date-label formatter constructions plus two other initialization calls. Afterward, it observed one reused date-label formatter and one other initialization call. Fixed-zone growth was almost as large as varied-zone growth before the change; yielding did not materially reduce it. This evidence supports removing repeated label construction. It does not attribute every remaining resident page to a specific native allocator.

Post-GC JavaScript heap growth remains about 3.7–4.3 MiB. RSS includes runtime, JIT and native allocation, and instrumentation adds overhead. The difference between fixed and varied zones remains. These are process snapshots, not peak memory, library-only allocation, energy, battery or proof that no leak exists. The previous 157 MiB stress result remains retained with its original archive. The new scoped runs fall below the provisional 128 MiB containment figure; broader resource and device gates remain open.

## Alternating latency comparison

Five fresh processes per candidate alternate before/after order. Each lane has ten warmups then 100 measurements per process. Milliseconds, pooled empirical p50 / p95. CPU/constructor instrumentation is absent from these timing runs. All complete-output hashes match across all ten runs.

| Work                                          |        Before |         After |
| --------------------------------------------- | ------------: | ------------: |
| Four shared previews                          | 1.097 / 1.451 | 1.057 / 1.342 |
| Calculator with trace                         | 0.091 / 0.117 | 0.090 / 0.113 |
| Numeric-date and DST correction, three parses | 1.102 / 1.524 | 0.714 / 0.942 |
| Nine-event file with full preflight           | 2.079 / 2.638 | 2.038 / 2.542 |

Correction computation improves about 35% at the median and 38% at p95 in this workload. The smaller differences in other lanes are not claimed as improvements. This is neither an independent usability test nor proof of statistical significance. Human decision time, rendering, physical devices and actual client import are excluded.

Parsing is 525,933 minified / 149,419 gzip bytes, an increase of 78 / 15 bytes. Combined parsing/calendar is 544,231 / 155,111; the calendar increment is 18,298 / 5,692. Bundle settings and runtime compression are recorded. No new gpu-time timing run occurred: the [latest shared CPU comparison](../current-sdk-costs/README.md) belongs to a8a1cbb4 and still must not be represented as current bd06963f timings. No competitive speed or overall superiority claim follows.

## Correctness and runtime verification

- 909 source/comparison tests pass with one expected failure. The new regression check compares labels across years 1, 99, 100, 1582, 1900, 2000, 2026 and 9999, every month and representative boundary/leap days against the previous formatter. Existing invalid-date, gap, choice and stale-answer tests pass.
- All 56 installed files match the new archive; seven examples pass on Node 22.12.0 and 26.8.1. The 31-case/22-journey replay matches complete results, stages and file hashes.
- Nine static packed-browser startup/correction probes pass in Chrome, Playwright Firefox and WebKit. The changed numeric-date path preserves the pre-load input, both choices, the selected DST interval and edit invalidation. This is targeted current-archive browser coverage; the full 84-download keyboard suite remains evidence for the previous archive.
- Local workerd passes its diagnostic, and separate icalendar/recurring-ical-events readers verify all fifteen files. No actual calendar-client import occurred.
- Production build and lint/type checks pass. The existing large-chunk warning remains. Whole-repository validation, independent evaluation, real-device testing and post-scan review remain open. Task-local servers were stopped; the main app remains on 5174.

## Reproduction

Run `node comparison/performance/retention.mjs VERIFIED-INSTALL NEW-OUTPUT` for the constructor/memory lanes. The parent verifies installed-package hashes before spawning each fresh process. Internal mode arguments are worker entry points and assume that parent verification. Keep before/after outputs separate.

For alternating latency, invoke the existing `profile.mjs` timing worker for each already-verified archive, five trials alternating candidate order, and retain its JSON output. The paired reports here record the profile script hash and full-output equality. Package verification, startup and Worker reproduction use the commands in examples/sdk/README.md. Retained generated bundles use .js.gz; decompress before comparing against recorded bundle hashes.
