# Packed calendar integration bundle cost

All public exports retained; browser ESM bundles with dependencies. No code splitting or runtime timing.

| Entry | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| parse | 527801 | 150036 |
| calendar | 515199 | 146619 |
| combined | 546100 | 155814 |

Adding calendar exports to the parsing bundle adds 18299 minified bytes and 5778 gzip bytes.

- Bundle cost only; no measured download, latency, memory, battery or device result.
- Separate parse/calendar bundles duplicate shared code; their sizes must not be added as a combined integration estimate.
- All exports retained; a consumer using fewer exports may produce a different bundle. No competitor comparison.

Archive SHA-256: e70f6d12405597b332dfcdf469acdac73b3f90eb6ee3f6408931272a9eb64d5d
