# Current packed SDK resource refresh

Archive `b8ffb7e04e46eeaaf1e1dcf6c07875b2f805e2497dee50f03280ec0afd14e051`, measured September 13, 2026. The runners verified all installed package files against the archive. No parser, dependency, safeguards or architecture changed in this milestone. Previous 756fbb4e measurements remain retained.

## Shared CPU parsing

Five fresh Node processes and five fresh Chrome processes per engine, alternating engine order. The comparator remains pinned gpu-time 0.2.1 CPU; release freshness was not rechecked in this run. Four inspected inputs use the same reference, timezone and three-occurrence preview. All checked previews match. This does not establish equivalent explanations, corrections, exports or general language accuracy.

Times are empirical p50 / p95 in milliseconds. Throughput uses median batch-100 time.

| Measurement | Tempus | gpu-time |
| --- | ---: | ---: |
| Node import through first result | 25.188 / 25.722 | 16.582 / 17.015 |
| Node warm single | 0.132 / 1.433 | 0.201 / 0.454 |
| Node batch 100 | 21.383 / 23.577 | 10.661 / 11.464 |
| Node inputs/s | 4,677 | 9,380 |
| Chrome import through first result | 17.900 / 21.400 | 14.200 / 14.300 |
| Chrome warm single | 0.200 / 1.900 | 0.200 / 0.800 |
| Chrome batch 100 | 28.200 / 32.400 | 8.100 / 9.000 |
| Chrome inputs/s | 3,546 | 12,346 |
| Node post-work RSS growth, MiB | 94.84 | 30.72 |
| Node post-work JS heap growth, MiB | 4.72 | 1.50 |
| Parse minified / gzip bytes | 527,519 / 149,946 | 110,286 / 52,903 |

Tempus has the lower pooled Node single-call median; Chrome medians tie at reported precision. gpu-time leads measured startup, batches, bundle size and slower-end single-call latency. No claim of overall superiority follows. Raw samples preserve phrase order and per-run observations; repeated inputs are not independent cases.

## Separate Tempus work

Five processes, 100 measured operations per lane per process, with profiling in a separate process. Full output hashes match the earlier quantity-resource profile in all five timing runs.

| Operation | p50 / p95 ms | Median CPU ms/operation |
| --- | ---: | ---: |
| Four full preview parses | 1.080 / 1.406 | 1.498 |
| Calculator with complete trace | 0.090 / 0.117 | 0.122 |
| Three-parse date/DST correction | 0.728 / 0.964 | 0.946 |
| Nine-event calendar preparation/file | 2.004 / 2.484 | 2.610 |

These computation lanes do not measure human decision time or painted UI. The correction fixture predates recipient/clock-first wording; this refresh does not measure the new wording's complete-task latency. There is no public trace-free parser mode. Deleting returned fields would not make a valid basic-only timing measurement.

Initialization CPU samples include Temporal's IndianHelper and module compilation. Warm profiles repeatedly show Temporal calendar operations and JSBI; correction also samples CalculationFailure construction. Inspector overhead appears in profiles and must not be attributed to the SDK. These samples identify work to inspect, not a precise accounting of native CPU costs.

Sampled JavaScript allocations over 300 operations are approximately 388 MB for the four-parse lane, 47 MB for traced calculation, 274 MB for correction and 985 MB for nine-event export. Sampling includes collected objects. These are neither retained heap, peak process memory nor energy measurements. Existing bounded timezone/formatter caches and deferred app export preparation remain in place. No new optimization is justified solely by this refresh.

The combined parse/calendar bundle is 545,818 minified / 155,717 gzip bytes. Calendar adds 18,299 / 5,771 bytes to parsing. Shared code makes standalone gzip sizes non-additive. This is integration bundle size, not actual network transfer.

## Release scope

The measured cold, warm, batch, three-parse correction, nine-event export, bundle and fixed-workload post-GC memory figures fall within the provisional desktop budgets. This does not close painted interaction, per-step timing, 1,000-event worst-case export, varied-input retention, physical-phone, energy or independent evaluation gates. Earlier large-export and retention observations keep their original archive identities.

Five startup samples give a noisy empirical p95 equal to the maximum. OS caches remain warm; Node excludes process launch and Chrome includes loopback module fetch. Browser timers are quantized. Process memory includes runtime/JIT overhead. There are no peak-memory, battery, physical-device, actual-import or independent task-completion results. Current full Worker/offline runtime evidence remains on 4b96da77.

Use the checked-in performance runners and explicit Playwright entry described in `comparison/performance/README.md`. Exact runner snapshots, raw reports, generated bundles and profile provenance are retained here. Hashes prove retained artifact integrity only.
