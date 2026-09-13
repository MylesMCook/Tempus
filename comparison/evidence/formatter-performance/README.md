# Packed SDK cost profile and formatter optimization

September 13, 2026. Candidate `3766276269c5e863a4660b7f47bfff9cdf5b93d20afeebdf06b79385520b666b` caches formatting objects for correction labels. It retains at most 32 timezone/style formatters and three civil precision formatters. Every result still checks host civil fields against pinned timezone data; cached labels, interpretations and user decisions are not reused.

This is a modest correction optimization, not a parser speed or memory breakthrough. No dependency, calendar rule, ambiguity policy, trace field or public API changed. The previous archive is `f2adf85cae83f54bb9dd01b4154cefa890fb851c1471c08109567b2f5aa8b701`.

## What the profile identified

- Timezone data contributes 289,016 bytes (55%) to the 525,209-byte previous parsing bundle. Temporal contributes 126,425 bytes and JSBI 35,127 (31% together). These are minified metafile contributions, not additive gzip costs.
- Initialization samples include Temporal's `IndianHelper` and module compilation. Warm CPU and sampled allocations are concentrated in Temporal/JSBI conversions, grammar work and snapshot construction. Minified dependency names limit finer attribution.
- Correction has visible self samples in `timezoneLabel` and `describeZonedInstant`, where each call constructed new Intl formatters. The bounded cache addresses that measured work. It does not change timezone conversion.
- Repeated scheduling calculations still parse expressions and convert references/anchors, and the calculator serializes snapshots for anchors, steps and results. No broader result/context cache was added: public result mutation, edited contexts and clock decisions make naive reuse unsafe. A later optimization must profile call counts and preserve complete outputs.
- Export is already a separate package entry; the app resolves the complete plan on request and generates files on download. Its repeated preflight protects correctness. Trace-free parsing does not exist; discarding an already-built trace would save no parsing work. Neither mechanism was bypassed.

CPU and allocation profiles are separate from latency measurements. Heap sampling includes collected objects at a 16-KiB sampling interval. Over 300 invocations, estimated correction allocations were about 300/301 MB before/after; nine-event export about 979/981 MB. These are cumulative sampled estimates, not retained or peak memory. No allocation reduction is established. Raw redacted profiles are gzip-compressed here; provenance records original and redacted hashes.

## Before/after on the same authored work

Five fresh processes per candidate in alternating order, 100 measurements per lane per process after ten warmups. Node 26.8.1, M4 Pro. Milliseconds, pooled empirical p50 / p95. These calls include small assertion overhead in the correction harness. They exclude user think time, rendering and client import.

| Work per invocation                                        |        Before |         After |
| ---------------------------------------------------------- | ------------: | ------------: |
| Four shared previews, full public result                   | 1.099 / 1.428 | 1.129 / 1.522 |
| Written-order calculator with trace                        | 0.091 / 0.123 | 0.093 / 0.122 |
| Numeric date + repeated-clock correction, three parses     | 1.326 / 1.880 | 1.150 / 1.651 |
| Nine-event finite file, including complete-plan validation | 2.175 / 2.694 | 2.066 / 2.627 |

Correction improves about 13% at p50 and 12% at p95 in this run. Preview/calculator timings do not improve. All output hashes match across all ten runs, including the full correction result and file text. This is not statistical significance or independent usability evidence. Initial unpaired runs are also retained; use paired.json for the before/after conclusion.

## Shared CPU comparison

gpu-time remains pinned at 0.2.1, CPU backend. Both get the same four inputs, context and three-occurrence preview limit. Five fresh Node processes and five fresh Chrome instances per engine, alternating order. Correctness checks pass for these previews only. Repeated items are not independent accuracy samples. Registry freshness was not rechecked in this pass.

| Metric                                           |            Tempus |         gpu-time |
| ------------------------------------------------ | ----------------: | ---------------: |
| Node import through first result p50 / p95, ms   |   25.001 / 25.593 |  16.610 / 17.183 |
| Node warm single p50 / p95, ms                   |     0.255 / 1.433 |    0.200 / 0.444 |
| Node batch 100 p50 / p95, ms                     |   21.484 / 24.088 |  10.714 / 11.093 |
| Node median batch throughput, inputs/s           |             4,655 |            9,334 |
| Chrome import through first result p50 / p95, ms |       18.0 / 19.4 |      14.0 / 14.9 |
| Chrome warm single p50 / p95, ms                 |         0.2 / 1.9 |        0.2 / 0.6 |
| Chrome batch 100 p50 / p95, ms                   |       27.9 / 34.0 |        8.1 / 9.1 |
| Chrome median batch throughput, inputs/s         |             3,584 |           12,346 |
| Parse minified / gzip bytes                      | 525,387 / 149,194 | 110,286 / 52,903 |
| Median post-work RSS / heap growth, MiB          |      95.02 / 4.65 |     30.30 / 1.50 |

The earlier Tempus Node single-median lead is not stable in this run. Per-input Node p50/p95 gives a clearer account (25 samples each): tomorrow/noon 0.108/0.129 vs 0.150/0.308 ms; next Friday 0.095/0.115 vs 0.095/0.122; overnight range 0.329/0.440 vs 0.232/0.264; weekly recurrence 1.187/1.476 vs 0.414/0.488. These four inspected phrases do not represent all inputs in their families.

The cache adds 178 minified / 78 gzip bytes to parsing. Combined parsing/calendar is 543,599 / 154,846 bytes; calendar adds 18,212 / 5,652. gpu-time leads startup, batches, size and slower-end latency here. No comparison of equivalent interactive correction or export capabilities was performed.

Process memory snapshots use explicit GC; they include runtime/JIT/native allocator effects, not isolated library usage. Allocation sampling excludes many native allocations. No peak-memory, physical-phone, battery, thermal, sustained-retention or actual calendar-client evidence is supplied. Startup uses warm filesystem caches and excludes process launch/network. Five cold samples make p95 especially noisy.

## Validation and reproduction

The package verifier checks all 56 installed files against its archive, strict installed types and six examples on Node 26; Node 22 runs the same installed examples. The 31-case / 22-journey retained replay matches complete results, correction stages and file hashes. Three new regression tests protect warmed fold labels, changing precision and per-result pinned-data fallback. Source/comparison tests pass (891 passed, one expected failure); production build and lint/type check pass. The existing large-client-chunk warning remains.

Six paced desktop browser runs also pass (Chrome, Playwright Firefox and WebKit at 320/1280; WebKit Option-Tab). All 84 downloaded files pass separate Python readers. The packed local Worker passes and its fifteen files pass the readers. These are authored file checks, not actual calendar imports or physical-device evidence. Task-local verification servers were stopped afterward.

Fresh checking exposed preserved README snippets being treated as workspace application code and formatting checks against sealed Markdown. Configuration now excludes those exact artifacts from inappropriate checks; installed-package snippet validation and evidence hashes remain their check. Full `pnpm check` still fails on unrelated Rust experiment formatting, which was not changed. This is not a full release pass.

Run `node comparison/performance/profile.mjs INSTALLED-PACKAGE ARCHIVE.tgz NEW-OUTPUT` for archive-verified CPU/allocation profiles and five uninstrumented timing runs. To reproduce the paired schedule, invoke that script's `timing-N` worker mode for each verified candidate, five trials alternating before/after then after/before, collecting stdout JSON. The worker mode assumes the parent's archive verification; do not use it with an unverified installation. Shared comparison uses the existing `run.mjs --packed`, `browser.mjs` and `calendar-bundle.mjs` commands. Preserve old generated outputs before the shared Node runner, which uses a fixed output directory.

The [performance budgets](../../../docs/performance-budgets.md) are provisional engineering targets. Full-task correctness, actual client import, ordinary devices and independent evaluation remain release gates.
