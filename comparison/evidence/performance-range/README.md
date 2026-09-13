# Current archive desktop performance

Archive `47a218ba893908d49fdd132122040df95d107df8508be22fd6ff25a7fad342f4` against pinned gpu-time 0.2.1 CPU, September 13, 2026. All installed Tempus files were verified against the archive. This run did not query the registry; September 13's earlier version/integrity check remains the comparator freshness evidence. Refresh before freezing an independent comparison.

Same Apple M4 Pro host, Node 26.8.1 and Chrome 153.0.8010.36. Five fresh Node processes per engine and ten alternating fresh Chrome processes use four inspected preview inputs. The existing warmup, sample counts and comparator are unchanged. Node, browser and bundle runs were sequential. OS caches were not cleared; this is an active desktop, not an isolated performance lab.

| Measurement                                |            Tempus |         gpu-time |
| ------------------------------------------ | ----------------: | ---------------: |
| Node import through first result, p50      |         25.040 ms |        16.895 ms |
| Node warm single, p50 / p95                |  0.262 / 1.331 ms | 0.197 / 0.508 ms |
| Node batch 10, p50                         |          2.670 ms |         1.224 ms |
| Node batch 100, p50                        |         21.221 ms |        10.660 ms |
| Chrome import through first result, median |          17.40 ms |         14.00 ms |
| Chrome warm single, median                 |           0.30 ms |          0.20 ms |
| Chrome batch 10, median                    |           3.70 ms |          0.90 ms |
| Chrome batch 100, median                   |          28.70 ms |          8.00 ms |
| Parsing bundle, minified / gzip bytes      | 518,543 / 147,267 | 110,286 / 52,903 |
| Node post-work RSS growth, median          |         94.50 MiB |        30.36 MiB |
| Node post-work heap growth, median         |          4.58 MiB |         1.50 MiB |

gpu-time leads these latency and size measurements. All checked previews match, including 11,100 checked Node items per engine. Repeated samples are not independent accuracy examples. Chrome recorded no unexpected requests. Memory snapshots follow explicit GC; they are not peak or isolated package allocations. Combined Tempus parsing/calendar bundle is 536,175 minified / 152,789 gzip bytes; calendar adds 17,632 / 5,522 bytes. Bundle bytes are not measured network transfer.

The workload is a point, weekday, overnight range and three-occurrence weekly preview. It does not measure explicit-date-range correction, any other clarification, export expansion, device latency, GPU, battery or human completion. Differences from previous runs are descriptive and do not establish statistical significance or attribute regressions to a particular change. No general superiority or release-readiness claim follows.

Raw samples are retained with only home-directory paths replaced by `<home>`; provenance.json preserves original report hashes and summary methods. Historical Node packed output was copied to `comparison/results/performance/history/before-explicit-range/packed` before measuring. Earlier browser/calendar outputs were not overwritten. The browser runner closed its task-local server and browser processes on completion.

[Reproduction and method](../../performance/README.md): use the packed Node runner with this installed package/archive, then the browser runner against those exact bundles and a new output directory. The calendar bundle runner also requires a new directory. Preserve existing Node working reports before running, since that runner overwrites its designated output. No application changes, publication, deployment or calendar writes occurred.
