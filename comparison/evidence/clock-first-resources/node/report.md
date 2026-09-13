# Desktop CPU development baseline

Tempus input: installed archive b8ffb7e04e46eeaaf1e1dcf6c07875b2f805e2497dee50f03280ec0afd14e051.

Five fresh processes per engine; alternating order. Milliseconds, empirical p50 / p95. OS filesystem caches are not cleared. This is a four-case development workload, not general accuracy or device evidence.

| Engine | Import | Initialize | First parse | Import through first result | Warm single | Batch 10 | Batch 100 | Correct timed items |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tempus | 19.012 / 19.966 | 0.033 / 0.034 | 5.898 / 6.142 | 25.188 / 25.722 | 0.132 / 1.433 | 2.808 / 3.443 | 21.383 / 23.577 | 11100 / 11100 |
| gpu-time | 4.338 / 4.578 | 0.047 / 0.075 | 12.159 / 12.454 | 16.582 / 17.015 | 0.201 / 0.454 | 1.249 / 1.869 | 10.661 / 11.464 | 11100 / 11100 |

## Browser bundle cost

Same esbuild settings; all public entry exports retained, dependencies included. These are integration bundles, not npm tarball sizes or measured network transfers.

| Engine | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| tempus | 527519 | 149946 |
| gpu-time | 110286 | 52903 |

Raw JSON includes each timing sample, exact observed preview checks, environment, versions, source hashes and process memory snapshots after explicit GC. Snapshots are not peak memory or isolated library allocations. CPU only; no browser runtime, GPU, phone, battery or user-task measurements. Matching previews do not validate recurrence exports.
