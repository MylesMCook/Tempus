# Bundle comparison after pruning

Measured September 13, 2026 from a fresh packed and installed local SDK. The npm registry returned gpu-time 0.3.0 as latest; the repository still pins 0.2.1. The newer version was installed only in a scratch consumer, with install scripts disabled.

| Public integration                  | Minified bytes | Gzip bytes | Brotli bytes |
| ----------------------------------- | -------------: | ---------: | -----------: |
| Tempus core                         |        532,847 |    151,938 |      110,759 |
| gpu-time 0.3.0                      |        110,657 |     53,272 |       45,750 |
| gpu-time 0.2.1, previous comparator |        110,286 |     52,903 |       45,319 |
| Tempus core + calendar              |        552,464 |    158,042 | Not measured |

Tempus core is 4.82 times the minified size and 2.85 times the gzip size of gpu-time 0.3.0. Calendar exports add 19,617 minified bytes / 6,104 gzip bytes when bundled together with core. Do not add separate core/calendar bundle sizes: shared code would be counted twice.

The fresh SDK archive is still `0d1d2ddbc04cfae5eca8c499f63bc7af4aae3f82edf459a423cc0eb9fedba499`; the preceding pruning did not change its emitted code. Its three largest inputs are pinned timezone data (289,016 minified bytes), Temporal (126,473) and JSBI (35,103), together about 85% of core. File attribution is raw minified code, not independently additive compressed cost.

All entries use esbuild 0.28.1, browser ESM, ES2022, minification, dependencies included and all public exports retained. Compression uses Node gzipSync and brotliCompressSync defaults. Public capabilities are not identical; these are complete public-entry integration costs, not feature-normalized bundles. gpu-time's bundle includes its backend code; selecting CPU at runtime does not establish a CPU-only tree-shaken build. The new gpu-time bundle initialized and parsed on CPU with fetch blocked, so this smoke check did not omit a fetched model. No new latency or memory results are claimed.

Reproduce the core measurements by packing `packages/core` after `pnpm build:sdk`, installing the archive and pinned comparator in a scratch consumer, and running the repository's esbuild binary on each installed public entry:

```sh
node_modules/.bin/esbuild ENTRY --bundle --minify --format=esm --platform=browser --target=es2022 --outfile=OUTPUT --metafile=META
```

Use `comparison/performance/calendar-bundle.mjs INSTALLED-PACKAGE ARCHIVE NEW-OUTPUT` for the verified combined calendar measurement. That runner verifies installed files against the archive before bundling.

Raw bundles, esbuild input maps, hashes, installed lockfile, archive and calendar report are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-bundle-refresh`. `bundles.json` contains compression measurements; `gpu-time-cpu-smoke.json` retains the CPU result. These are local generated assets, not observed CDN transfer sizes. The website's React, Worker and CSS payload is separate; comparing a whole website against a parser library would be misleading. The preceding website CSS reduction remains documented in [size pruning](size-pruning.md).

No project dependencies were upgraded, and nothing was pushed, published or deployed. Bundle size does not establish parsing correctness or overall product superiority.
