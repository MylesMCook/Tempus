# Current packed desktop performance

Archive `906f3a6f9e0d4cf73cd18e281f0dc9ed2d2b6312b35d3475562a6d39dd8d8004`, gpu-time 0.2.1 CPU. The registry still returned the pinned version/integrity on September 13, 2026. All 56 Tempus installed files were checked against the archive before measurement. Same M4 Pro host, Node 26.8.1 and Chrome 153.0.8010.36.

| Measurement                                |            Tempus |         gpu-time |
| ------------------------------------------ | ----------------: | ---------------: |
| Node import through first result, p50      |         25.040 ms |        17.600 ms |
| Node warm single, p50 / p95                |  0.159 / 1.402 ms | 0.196 / 0.439 ms |
| Node batch 10, p50                         |          2.596 ms |         1.232 ms |
| Node batch 100, p50                        |         20.808 ms |        10.829 ms |
| Chrome import through first result, median |          17.40 ms |         13.80 ms |
| Chrome warm single, median                 |           0.25 ms |          0.20 ms |
| Chrome batch 10, median                    |           3.60 ms |          1.00 ms |
| Chrome batch 100, median                   |          27.25 ms |          8.05 ms |
| Parsing bundle, minified / gzip bytes      | 514,339 / 146,124 | 110,286 / 52,903 |
| Node post-work RSS growth, median          |         94.45 MiB |        30.47 MiB |
| Node post-work heap growth, median         |          4.56 MiB |         1.50 MiB |

Tempus has the lower Node warm-single p50 in this run, but a higher p95. gpu-time is faster for startup and batches and smaller in this workload. Neither run-to-run improvements nor these descriptive values establish statistical significance or general superiority. Memory snapshots follow explicit GC; they are neither peak memory nor isolated library allocations.

The workload is four inspected examples: a point, weekday, overnight range and three-occurrence weekly preview. Five fresh Node processes per engine and ten fresh Chrome processes alternate engine order. Node percentiles use the harness's empirical percentile rule; Chrome medians use the middle value or mean of the middle pair. All 11,100 checked Node items per engine and all checked Chrome previews match. Repetitions are not independent accuracy examples. No unexpected Chrome page requests were recorded.

Combined parsing/calendar bundle: 531,971 minified / 151,635 gzip bytes. Calendar integration adds 17,632 / 5,511 bytes to parsing. Bundle sizes are not measured network transfer. The new year clarification journey, correction latency, export expansion, phones, GPU, battery and human completion are not measured here.

Raw timing samples are retained in node.json and chrome.json. Only local home-directory strings were replaced with `<home>`; provenance.json records original report hashes. Other samples, artifact identities and source hashes are unchanged. The original reports remain under comparison/results/performance. The previous Node packed result was copied to history/before-year-choice/packed before measurement; previous browser/calendar reports were not overwritten.

[Reproduction and method](../../performance/README.md). Use the packed runner, then the browser runner against its verified bundles, and the calendar-bundle runner with a new output directory. Preserve prior output before invoking the Node runner, which currently overwrites its designated working-report directory. Run `shasum -a 256 -c SHA256SUMS` here to verify retained bytes. No deployment or package publication occurred.
