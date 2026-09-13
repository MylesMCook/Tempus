# Desktop CPU development baseline

Tempus input: installed archive e33ab0ca30d3670a2bd47928bc403872a5ca4c9c92408923461c9a94afe1fe53.

Five fresh processes per engine; alternating order. Milliseconds, empirical p50 / p95. OS filesystem caches are not cleared. This is a four-case development workload, not general accuracy or device evidence.

| Engine | Import | Initialize | First parse | Import through first result | Warm single | Batch 10 | Batch 100 | Correct timed items |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tempus | 18.710 / 19.489 | 0.035 / 0.042 | 6.026 / 6.285 | 24.954 / 25.810 | 0.134 / 1.454 | 2.807 / 3.410 | 21.491 / 23.802 | 11100 / 11100 |
| gpu-time | 4.535 / 4.701 | 0.050 / 0.067 | 12.385 / 12.658 | 17.035 / 17.248 | 0.197 / 0.440 | 1.225 / 1.873 | 10.722 / 11.136 | 11100 / 11100 |

## Browser bundle cost

Same esbuild settings; all public entry exports retained, dependencies included. These are integration bundles, not npm tarball sizes or measured network transfers.

| Engine | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| tempus | 525209 | 149116 |
| gpu-time | 110286 | 52903 |

Raw JSON includes each timing sample, exact observed preview checks, environment, versions, source hashes and process memory snapshots after explicit GC. Snapshots are not peak memory or isolated library allocations. CPU only; no browser runtime, GPU, phone, battery or user-task measurements. Matching previews do not validate recurrence exports.
