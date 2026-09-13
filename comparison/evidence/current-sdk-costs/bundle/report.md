# Packed calendar integration bundle cost

All public exports retained; browser ESM bundles with dependencies. No code splitting or runtime timing.

| Entry | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| parse | 525855 | 149404 |
| calendar | 515107 | 146582 |
| combined | 544153 | 155099 |

Adding calendar exports to the parsing bundle adds 18298 minified bytes and 5695 gzip bytes.

- Bundle cost only; no measured download, latency, memory, battery or device result.
- Separate parse/calendar bundles duplicate shared code; their sizes must not be added as a combined integration estimate.
- All exports retained; a consumer using fewer exports may produce a different bundle. No competitor comparison.

Archive SHA-256: a8a1cbb41947e294d08d82a3fcb39dddd485574daff86b22f3e20e7423bc35ca
