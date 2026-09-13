# Desktop CPU development baseline

Tempus input: installed archive a8a1cbb41947e294d08d82a3fcb39dddd485574daff86b22f3e20e7423bc35ca.

Five fresh processes per engine; alternating order. Milliseconds, empirical p50 / p95. OS filesystem caches are not cleared. This is a four-case development workload, not general accuracy or device evidence.

| Engine | Import | Initialize | First parse | Import through first result | Warm single | Batch 10 | Batch 100 | Correct timed items |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tempus | 19.408 / 24.372 | 0.035 / 0.036 | 5.599 / 5.951 | 25.005 / 30.359 | 0.229 / 1.470 | 2.918 / 3.610 | 21.173 / 23.606 | 11100 / 11100 |
| gpu-time | 4.406 / 4.445 | 0.047 / 0.050 | 12.185 / 12.301 | 16.637 / 16.765 | 0.197 / 0.476 | 1.236 / 1.853 | 10.776 / 12.393 | 11100 / 11100 |

## Browser bundle cost

Same esbuild settings; all public entry exports retained, dependencies included. These are integration bundles, not npm tarball sizes or measured network transfers.

| Engine | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| tempus | 525855 | 149404 |
| gpu-time | 110286 | 52903 |

Raw JSON includes each timing sample, exact observed preview checks, environment, versions, source hashes and process memory snapshots after explicit GC. Snapshots are not peak memory or isolated library allocations. CPU only; no browser runtime, GPU, phone, battery or user-task measurements. Matching previews do not validate recurrence exports.
