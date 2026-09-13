# Current packed SDK costs

September 13, 2026. Archive `a8a1cbb41947e294d08d82a3fcb39dddd485574daff86b22f3e20e7423bc35ca`. All 56 installed files match the archive. Seven installed examples pass on Node 22/26, and the retained 31-case/22-journey replay matches. This archive includes bounded numeric event labels. Its packed Firefox/WebKit/local Worker paths have not been rerun; their previous evidence belongs to e5a7e1d1.

The existing product goal and nine matrix requirements remain unchanged. Resource efficiency supplements complete-task correctness, correction and independent evaluation. No rewrite, dependency or safeguard removal is justified by these measurements.

## Shared parsing

Pinned gpu-time 0.2.1 uses CPU. Five alternating fresh Node processes and five fresh Chrome instances per engine run the same four inspected phrases, timezone/reference and three-occurrence preview. All checked previews match. Milliseconds are empirical p50 / p95; throughput uses median batch latency.

| Measurement                                |            Tempus |         gpu-time |
| ------------------------------------------ | ----------------: | ---------------: |
| Node cold through first result, ms         |   25.005 / 30.359 |  16.637 / 16.765 |
| Node warm single, ms                       |     0.229 / 1.470 |    0.197 / 0.476 |
| Node batch 100, ms                         |   21.173 / 23.606 |  10.776 / 12.393 |
| Node median batch throughput, inputs/s     |             4,723 |            9,280 |
| Chrome cold through first result, ms       |   18.200 / 18.500 |  14.200 / 14.500 |
| Chrome warm single, ms                     |     0.300 / 2.000 |    0.200 / 0.800 |
| Chrome batch 100, ms                       |   29.100 / 34.300 |    8.100 / 8.400 |
| Chrome median batch throughput, inputs/s   |             3,436 |           12,346 |
| Node median post-work rss growth, MiB      |             95.69 |            30.94 |
| Node median post-work heapUsed growth, MiB |              4.68 |             1.50 |
| Parse minified / gzip bytes                | 525,855 / 149,404 | 110,286 / 52,903 |

These results favor gpu-time for startup, batches, bundle size and single-call tails. A single pooled median hides different costs. Node per-phrase results below have only 25 samples per phrase per engine:

| Phrase                          | Tempus p50 / p95, ms | gpu-time p50 / p95, ms |
| ------------------------------- | -------------------: | ---------------------: |
| tomorrow at noon                |        0.096 / 0.156 |          0.147 / 0.211 |
| next Friday                     |        0.099 / 0.130 |          0.092 / 0.132 |
| Friday 10pm-12am                |        0.348 / 0.505 |          0.229 / 0.302 |
| every Monday from 8 pm to 10 pm |        1.202 / 1.727 |          0.421 / 0.517 |

## Separate Tempus work

Five fresh processes, ten warmups and 100 measurements per lane per process. CPU time is median process CPU per invocation, measured over each 100-call block; it includes harness overhead. These are authored computation tasks, not human completion times or equivalent competitor correction/export comparisons.

| Lane            | Wall p50 / p95, ms | CPU per invocation, ms |
| --------------- | -----------------: | ---------------------: |
| preview         |      1.063 / 1.339 |                  1.507 |
| calculatorTrace |      0.091 / 0.115 |                  0.122 |
| correction      |      1.103 / 1.516 |                  1.365 |
| export          |      2.046 / 2.487 |                  2.623 |

Preview invokes four full-result parses. Calculator includes its complete trace. Correction includes three parses and assertions for numeric-date and repeated-clock choices. Export includes complete-plan validation and a nine-event file. Full output hashes agree across the five runs. There is no public trace-free mode: trimming fields afterward does not save the work.

## Profile findings and justified changes

Current initialization samples still include Temporal's IndianHelper and module compilation. Warm profiles show Temporal/JSBI conversion, grammar/evaluation and garbage collection. Export also spends samples in applyOperation, prepareCalendarFile and line folding. Minified symbols limit attribution; sample counts are not exact call counts. The raw CPU profiles and sampled allocation profiles are retained separately from latency runs.

Across 300 invocations, sampled cumulative allocations are approximately 386 MB for four-preview calls, 47 MB for calculator traces, 304 MB for correction and 980 MB for nine-event files. These include collected objects and exclude unsampled/native allocation. They are neither retained nor peak memory, and do not establish an allocation reduction.

The prior [bounded formatter optimization](../formatter-performance/README.md) improved the authored correction calculation about 13% median / 12% p95 in paired before/after runs with identical outputs. The current refresh is not another paired optimization experiment. Repeated parsing and timezone conversions remain costs; reusing results across edits or skipping calendar preflight would threaten correctness and is not justified.

[Recurring export preparation](../worker-preparation/README.md) now runs on request in a cancellable worker and computes its validated plan once. It preserves stale-response protection and explicit download. Two previous built-app 1,000-event runs observed no long task, but preparation still took about 299–306 ms and added a 144 kB gzip worker. This refresh does not remeasure those app observations or prove lower total CPU/memory.

Current combined parse/calendar integration is 544,153 minified / 155,099 gzip bytes; calendar adds 18,298 / 5,695. Pinned timezone data and Temporal remain the dominant bundle costs. Separate standalone bundle sizes cannot be added; shared dependencies overlap. No lazy timezone-data redesign or calendar replacement is proposed.

## Budgets and limits

The measured small desktop cases fit the provisional SDK latency, throughput and transfer containment targets in [performance budgets](../../../docs/performance-budgets.md). This is not a release-wide pass. The prior 5,970-input timezone stress left about 157 MiB RSS growth, beyond the 128 MiB fixed-workload containment figure; its near-flat post-GC JS heap does not explain native retention. That stress was not repeated here. Large-file preparation wait, broader latency, memory attribution and current package runtime refresh remain open.

Cold measurements use warm filesystem caches; Node excludes process launch/network, Chrome includes an uncompressed loopback fetch. Five cold samples make empirical p95 the maximum sample. Chrome timers are quantized. Four repeated inputs do not estimate general accuracy or comparative usefulness. Registry freshness was not rechecked during timing. No significance claim follows from this active-desktop run.

Physical iOS/Android, peak memory, sustained energy, battery/thermal behavior, actual calendar-client imports and independent task completion remain unmeasured. Narrow desktop viewports are not physical-device evidence. No calendars or external services were changed.

Reproduce with profile.mjs, run.mjs --packed, browser.mjs and calendar-bundle.mjs under comparison/performance. Each verifies archive or bundle identity. Preserve the fixed Node output directory before running it; the previous run is retained at comparison/results/performance/history/before-identifiers-refresh/packed. Raw profiles here replace the local home path with <HOME>; provenance records both hashes. SHA256SUMS seals the retained files, not an independent certification.

Retained generated JavaScript bundles use `.js.gz` to keep compiler output out of source linting. Decompress them to their recorded `.js` names before using the browser runner; the report hashes refer to the decompressed bytes.
