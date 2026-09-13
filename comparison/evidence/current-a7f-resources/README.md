# Current packed SDK resource refresh

Archive **a7f9e298c3c3152e0cddc7e439819ed0aba83a2471e81adc78a646e9737ca21b** was measured on September 13, 2026, Apple M4 Pro, Node 26.8.1 and desktop Chrome. All installed archive files were verified before measurement. gpu-time is pinned 0.2.1 using its CPU path; this run did not query the registry or claim that version is still the newest release.

The latest recipient-condition safeguards retain the earlier optimization and full traced outputs. No implementation, dependency or package bytes changed in this refresh. The earlier [snapshot optimization](../snapshot-resources/README.md) remains the controlled before/after evidence; comparing separate historical refreshes is not a causal optimization experiment.

## Equivalent preview workload

Four inspected inputs: point, weekday, overnight range and weekly recurrence with three preview occurrences. Both libraries receive the same timezone/reference. Values are checked outside timing. This shared capability lane still includes Tempus explanation work: there is no trace-free public parse mode. It is not a comparison of correction or export capabilities. `summary.json` also reports each individual input rather than relying only on pooled percentiles.

Milliseconds are empirical p50 / p95. Five fresh processes per engine, alternating order; warm filesystem caches. Warm samples repeat the same four phrases. Cold p95 is the maximum of only five samples. Neither provides a population latency estimate.

| Metric | Tempus | gpu-time CPU |
| --- | ---: | ---: |
| Node import through first result | 25.692 / 26.671 | 17.060 / 18.324 |
| Node warm single | 0.160 / 1.310 | 0.210 / 0.491 |
| Node batch of 100 | 20.359 / 23.134 | 10.817 / 11.379 |
| Node throughput, inputs/s at median batch | 4,912 | 9,244 |
| Chrome import through first result | 17.6 / 18.1 | 13.8 / 13.8 |
| Chrome warm single | 0.3 / 1.7 | 0.2 / 0.8 |
| Chrome batch of 100 | 26.0 / 29.7 | 8.1 / 8.5 |
| Chrome throughput, inputs/s at median batch | 3,846 | 12,346 |
| Parse integration bundle, minified / gzip bytes | 527,902 / 150,061 | 110,286 / 52,903 |
| Median post-GC process RSS growth, MiB | 96.33 | 30.59 |
| Median post-GC JS heap growth, MiB | 4.67 | 1.50 |

The current Chrome single median is higher, whereas the prior e70 run tied at reported precision. Retain that negative result. Tempus's lower Node single median does not negate its slower tail, startup and batches. Process growth is neither peak memory nor isolated library allocation, and says nothing about battery use.

## Separate Tempus work

Five fresh processes, 100 operations per lane each. Every retained full-output hash matches the earlier e70 profile, including trace/correction results and the nine-event file.

| Lane | p50 / p95 ms |
| --- | ---: |
| Four full preview parses | 0.983 / 1.260 |
| Calculator with full trace | 0.075 / 0.101 |
| Three-parse date/DST correction | 0.696 / 0.951 |
| Nine-event preparation and file | 1.863 / 2.490 |

These times exclude human reading and decisions. They do not establish ease of correction. Existing app export preparation remains on demand; no validation or trace was removed to obtain these results.

## Where the resources go

Separate instrumented profiles retain CPU samples and sampled allocations. Most self samples in each work lane are in Temporal's `index.esm.js` and JSBI, with grammar, calendar arithmetic and timezone handling also visible. Initialization spends 99 of 228 samples in that Temporal module, including 65 in `IndianHelper`; module compilation also appears. These short sampled profiles identify investigation targets, not a sound basis for replacing calendar semantics or choosing a new dependency.

The parse bundle includes 289,016 minified bytes of pinned timezone data, 126,473 of Temporal and 35,093 of JSBI. These module contributions are minified bytes; gzip contributions cannot be added. Parse plus calendar is 546,201 / 155,844 minified/gzip bytes, an increment of 18,299 / 5,783 over parsing.

Sampled JS allocations across 300 operations are approximately 346 MB for the four-parse preview lane, 41 MB for traced arithmetic, 260 MB for three-parse correction and 866 MB for nine-event preparation/export. These include objects collected during work, are sample estimates and are not retained or peak memory. Do not compare the differently sized lanes as equal units of work.

The current measured desktop lanes fit the existing provisional containment budgets. Physical phone cold start, peak memory, sustained energy, thermal behavior and task completion remain unmeasured. Narrow desktop viewports do not fill those gaps. No independent cases, users or actual calendar imports were added, and no overall competitive superiority follows.

## Reproduction and evidence

Run the existing `comparison/performance/run.mjs --packed INSTALLED_PACKAGE ARCHIVE`, `profile.mjs INSTALLED_PACKAGE ARCHIVE NEW_OUTPUT`, `browser.mjs PACKED_RESULTS NEW_OUTPUT PLAYWRIGHT_ENTRY` and `calendar-bundle.mjs INSTALLED_PACKAGE ARCHIVE NEW_OUTPUT`. Preserve previous results before using the fixed packed-results directory. Exact harness snapshots, bundle metadata, samples and source identities are retained here. Raw profiles are gzip-compressed with the local home prefix replaced by `<HOME>`; report hashes still identify the original inputs. `summarize.py` regenerates the summary and checks full-output equality against the earlier profile.
