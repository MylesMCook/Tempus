# Desktop CPU development baseline

Tempus input: installed archive a7f9e298c3c3152e0cddc7e439819ed0aba83a2471e81adc78a646e9737ca21b.

Five fresh processes per engine; alternating order. Milliseconds, empirical p50 / p95. OS filesystem caches are not cleared. This is a four-case development workload, not general accuracy or device evidence.

| Engine | Import | Initialize | First parse | Import through first result | Warm single | Batch 10 | Batch 100 | Correct timed items |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tempus | 20.005 / 20.547 | 0.034 / 0.039 | 5.907 / 6.170 | 25.692 / 26.671 | 0.160 / 1.310 | 2.585 / 3.193 | 20.359 / 23.134 | 11100 / 11100 |
| gpu-time | 4.593 / 5.278 | 0.051 / 0.081 | 12.405 / 13.804 | 17.060 / 18.324 | 0.210 / 0.491 | 1.233 / 1.958 | 10.817 / 11.379 | 11100 / 11100 |

## Browser bundle cost

Same esbuild settings; all public entry exports retained, dependencies included. These are integration bundles, not npm tarball sizes or measured network transfers.

| Engine | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| tempus | 527902 | 150061 |
| gpu-time | 110286 | 52903 |

Raw JSON includes each timing sample, exact observed preview checks, environment, versions, source hashes and process memory snapshots after explicit GC. Snapshots are not peak memory or isolated library allocations. CPU only; no browser runtime, GPU, phone, battery or user-task measurements. Matching previews do not validate recurrence exports.
