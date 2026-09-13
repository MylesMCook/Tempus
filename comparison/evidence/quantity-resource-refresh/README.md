# Current SDK resource measurements

Archive `756fbb4ec523da3ac1bba687507eba72c2b42aa2a9de767e01d0e9d765cbbf59`, measured September 13, 2026. Installed files match the archive. The retained 31-case/22-journey replay passes with complete outputs and file hashes unchanged. No parser, dependency or architecture change was made in this refresh.

The existing product goal and nine matrix requirements remain unchanged. Performance supplements complete-task correctness, understandable correction and independent evaluation. These authored desktop measurements do not establish a better overall replacement for gpu-time.

## Equivalent shared parsing

Pinned gpu-time 0.2.1 uses CPU. Five alternating fresh Node processes and five alternating fresh Chrome processes per engine use the same four inspected inputs, context and three-occurrence preview. Every checked preview matches. Full results are computed; only the shared preview is compared. This does not assert equivalent explanation, correction or export capabilities.

Milliseconds below are empirical p50 / p95. Throughput divides 100 inputs by median batch duration.

| Measurement                            |            Tempus |         gpu-time |
| -------------------------------------- | ----------------: | ---------------: |
| Node import through first result, ms   |   25.270 / 26.057 |  16.965 / 19.370 |
| Node warm single, ms                   |     0.164 / 1.466 |    0.198 / 0.510 |
| Node batch 100, ms                     |   21.429 / 24.791 |  10.692 / 11.217 |
| Node median inputs/s                   |             4,667 |            9,352 |
| Chrome import through first result, ms |   17.600 / 18.900 |  13.700 / 14.100 |
| Chrome warm single, ms                 |     0.300 / 2.000 |    0.200 / 0.800 |
| Chrome batch 100, ms                   |   27.900 / 32.100 |    8.100 / 9.300 |
| Chrome median inputs/s                 |             3,584 |           12,346 |
| Node post-work RSS growth, MiB         |             95.00 |            30.61 |
| Node post-work JS heap growth, MiB     |              4.70 |             1.92 |
| Parse minified / gzip bytes            | 526,409 / 149,578 | 110,286 / 52,903 |

Tempus has the lower pooled Node single-call median. gpu-time leads measured startup, batches, bundle size and slower-end single-call latency. The pooled median hides different phrase costs; retain the raw phrase observations rather than generalizing from four inputs. This refresh is not a paired optimization experiment against an older Tempus archive.

Each phrase has only 25 Node single-call observations per engine:

| Phrase                          | Tempus p50 / p95, ms | gpu-time p50 / p95, ms |
| ------------------------------- | -------------------: | ---------------------: |
| tomorrow at noon                |        0.105 / 0.135 |          0.148 / 0.295 |
| next Friday                     |        0.094 / 0.113 |          0.101 / 0.155 |
| Friday 10pm-12am                |        0.332 / 0.447 |          0.224 / 0.289 |
| every Monday from 8 pm to 10 pm |        1.381 / 1.654 |          0.428 / 0.567 |

## Explanation, correction and export

Five fresh processes per lane, ten warmups and 100 measured invocations per process. CPU is median process CPU time per invocation over a 100-call block, including harness overhead. CPU/allocation profiling runs separately from latency measurement.

| Authored computation            | Wall p50 / p95, ms | CPU ms/invocation | Sampled cumulative allocations over 300 invocations, MB |
| ------------------------------- | -----------------: | ----------------: | ------------------------------------------------------: |
| Four complete previews          |      1.089 / 1.423 |             1.525 |                                                     387 |
| Calculator with trace           |      0.090 / 0.124 |             0.123 |                                                      49 |
| Three-parse date/DST correction |      0.729 / 0.992 |             0.941 |                                                     271 |
| Validated nine-event file       |      2.031 / 2.548 |             2.659 |                                                     976 |

Each lane's full output hash agrees across all five processes. The correction input is the existing call-Sam reminder, not the newer quantity-title journey. Human decision time, assistance, errors and abandonment are not measured. Do not compare these lanes with gpu-time's uncorrected single parse.

Initialization samples include Temporal's IndianHelper and module compilation. Warm profiles include Temporal/JSBI conversions and garbage collection; correction also includes ambiguity/failure objects. Export includes calendar operations and full validation. Sampled allocations include objects already collected and omit unsampled/native allocations: these are neither retained nor peak memory.

The existing bounded formatter reuse and single-plan worker preparation remain the justified optimizations. Preserve per-result pinned timezone checks, complete traces, ambiguity prompts and stale-answer rejection. There is no trace-free public parse mode; removing returned fields afterward does not save computation. Calendar is a separate optional entry, and app recurring preparation runs on request in a cancellable worker. Its previous two large-file observations are not remeasured here. This profile does not justify result reuse across edits, a calendar rewrite or a new dependency.

Combined parse/calendar costs 544,707 minified / 155,286 gzip bytes. Calendar adds 18,298 / 5,708 bytes to parse. Pinned timezone data and Temporal remain major costs. Standalone bundles share dependencies and must not be added together. Bundle metadata is retained.

## Retention and release limits

Eight fresh-process stress runs cover fixed/varied zones, synchronous/yielding cycles, two runs per lane. Each processes 5,970 ambiguous-date inputs with explicit GC. Current fixed-zone RSS growth is 36.23–37.20 MiB; varied-zone growth is 58.67–60.34 MiB. JS heap growth is 3.63–4.03 MiB. Each process constructs one numeric label formatter and one other formatter. Constructor instrumentation adds overhead. These results retain the prior optimization's narrow benefit; they do not establish native attribution or bounded retention for all inputs.

The measured SDK cases fit the [provisional desktop budgets](../../../docs/performance-budgets.md). No release-wide pass follows. Current painted-result p95, large-file responsiveness, broad sustained workloads and the full current offline/Worker suite remain separate gates. The older suite stays attached to its own archive.

Cold runs use warm filesystem caches. Node excludes process launch and network; Chrome includes an uncompressed loopback fetch. Five startup samples make empirical p95 the maximum observation. Browser timer quantization limits small-call comparisons. An active desktop, four repeated phrases and authored correction tasks are not an independent comparative study. Registry freshness was not rechecked; the installed comparator remains pinned.

Physical iOS/Android, peak memory, energy per successful task, battery/thermal behavior, real calendar-client imports and independent task completion remain unmeasured. Narrow desktop viewports cannot fill those gaps. No calendars or external services were changed.

## Reproduction

Use `comparison/performance/profile.mjs`, `run.mjs --packed`, `browser.mjs`, `calendar-bundle.mjs` and `retention.mjs` with the verified installation and archive. Preserve the fixed Node output before running; its preceding report is retained at `comparison/results/performance/history/before-quantity-refresh/packed`.

Raw timing reports, profiles, bundle metadata, retention cycles and the replay result are retained here. Profile home paths are sanitized; generated JavaScript is gzip-compressed to keep it outside source linting. `provenance.json` records original and retained hashes. `SHA256SUMS` seals retained files; it is not independent certification.
