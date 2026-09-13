# Desktop CPU development baseline

Tempus input: installed archive 5866c6b3c4048852dae4f9595bdb47396e512c71aba9623966c808161a970162.

Five fresh processes per engine; alternating order. Milliseconds, empirical p50 / p95. OS filesystem caches are not cleared. This is a four-case development workload, not general accuracy or device evidence.

| Engine | Import | Initialize | First parse | Import through first result | Warm single | Batch 10 | Batch 100 | Correct timed items |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tempus | 21.175 / 23.302 | 0.038 / 0.039 | 6.222 / 6.487 | 27.701 / 29.392 | 0.259 / 1.510 | 2.939 / 3.735 | 22.225 / 24.694 | 11100 / 11100 |
| gpu-time | 4.713 / 4.891 | 0.053 / 0.063 | 12.480 / 12.786 | 17.311 / 17.425 | 0.198 / 0.451 | 1.242 / 1.943 | 11.065 / 11.738 | 11100 / 11100 |

## Browser bundle cost

Same esbuild settings; all public entry exports retained, dependencies included. These are integration bundles, not npm tarball sizes or measured network transfers.

| Engine | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| tempus | 527791 | 150030 |
| gpu-time | 110286 | 52903 |

Raw JSON includes each timing sample, exact observed preview checks, environment, versions, source hashes and process memory snapshots after explicit GC. Snapshots are not peak memory or isolated library allocations. CPU only; no browser runtime, GPU, phone, battery or user-task measurements. Matching previews do not validate recurrence exports.
