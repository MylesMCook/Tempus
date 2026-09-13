# Current candidate desktop performance

Archive `e33ab0ca30d3670a2bd47928bc403872a5ca4c9c92408923461c9a94afe1fe53` was measured against pinned gpu-time 0.2.1 on the same four inspected preview inputs. Five fresh Node 26.8.1 processes per engine and five fresh Chrome 153 instances per engine alternate execution order. The host is the same M4 Pro Mac; filesystem caches are not cleared. These are descriptive active-desktop results, not a controlled attribution of changes since older runs.

| Measurement | Tempus | gpu-time CPU |
| --- | ---: | ---: |
| Node import through first result, p50 | 24.954 ms | 17.035 ms |
| Node warm single, p50 / p95 | 0.134 / 1.454 ms | 0.197 / 0.440 ms |
| Node batch 10, p50 | 2.807 ms | 1.225 ms |
| Node batch 100, p50 | 21.491 ms | 10.722 ms |
| Chrome import through first result, p50 | 17.80 ms | 14.00 ms |
| Chrome warm single, p50 / p95 | 0.20 / 2.00 ms | 0.20 / 0.80 ms |
| Chrome batch 10, p50 | 3.60 ms | 1.00 ms |
| Chrome batch 100, p50 | 28.50 ms | 8.10 ms |
| Parsing bundle, minified / gzip bytes | 525,209 / 149,116 | 110,286 / 52,903 |
| Node post-work RSS growth, median | 95.14 MiB | 30.69 MiB |
| Node post-work heap growth, median | 4.65 MiB | 1.50 MiB |

**gpu-time leads startup, batches, bundle size and warm-single tails in this workload.** Tempus has a lower Node warm-single p50; Chrome warm-single p50 is effectively tied at the reported precision. Neither observation establishes an overall speed or product win.

All checked previews match, including 11,100 repeated Node items per engine. These are repetitions of four inspected examples, not independent accuracy cases. Browser runs recorded no unexpected requests. Process memory includes runtime/JIT overhead and is measured after GC; it is neither peak memory nor isolated package allocation.

Combined Tempus parsing/calendar is 543,421 minified / 154,765 gzip bytes, adding 18,212 / 5,649 bytes to parsing. Bundle size is not measured network transfer. The workload omits correction, complete export, physical devices, GPU, battery and human completion. No budgets, regression significance or superiority claim is inferred from these numbers.

Reproduce with the existing packed Node runner, then the browser runner against its exact bundles and a new output directory, and the calendar-bundle runner against the same installed archive. See [method and commands](../../performance/README.md). All installed package files were checked against the archive before Node measurement; Chrome verifies emitted bundle hashes. Browser and calendar runners closed their task-local processes; no app service changed.

Previous Node working output was copied to `comparison/results/performance/history/before-range-policies/packed` before measurement. Earlier retained reports and browser/calendar outputs remain intact. Raw reports here redact only home-directory paths; provenance.json records original hashes and summary methods. No code change, package publication, deployment or calendar write occurred. The registry was not queried during this measurement; the pinned 0.2.1 release was last checked earlier on September 13 and must be refreshed before freezing evaluation.
