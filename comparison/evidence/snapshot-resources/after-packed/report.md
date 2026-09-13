# Desktop CPU development baseline

Tempus input: installed archive e70f6d12405597b332dfcdf469acdac73b3f90eb6ee3f6408931272a9eb64d5d.

Five fresh processes per engine; alternating order. Milliseconds, empirical p50 / p95. OS filesystem caches are not cleared. This is a four-case development workload, not general accuracy or device evidence.

| Engine | Import | Initialize | First parse | Import through first result | Warm single | Batch 10 | Batch 100 | Correct timed items |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tempus | 19.211 / 19.724 | 0.034 / 0.037 | 5.651 / 5.937 | 24.891 / 25.370 | 0.140 / 1.281 | 2.593 / 3.188 | 20.277 / 23.050 | 11100 / 11100 |
| gpu-time | 4.381 / 4.578 | 0.048 / 0.074 | 12.234 / 12.330 | 16.634 / 16.862 | 0.198 / 0.446 | 1.239 / 1.903 | 10.906 / 11.339 | 11100 / 11100 |

## Browser bundle cost

Same esbuild settings; all public entry exports retained, dependencies included. These are integration bundles, not npm tarball sizes or measured network transfers.

| Engine | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| tempus | 527801 | 150036 |
| gpu-time | 110286 | 52903 |

Raw JSON includes each timing sample, exact observed preview checks, environment, versions, source hashes and process memory snapshots after explicit GC. Snapshots are not peak memory or isolated library allocations. CPU only; no browser runtime, GPU, phone, battery or user-task measurements. Matching previews do not validate recurrence exports.
