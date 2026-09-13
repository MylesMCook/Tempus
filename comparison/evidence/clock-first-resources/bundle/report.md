# Packed calendar integration bundle cost

All public exports retained; browser ESM bundles with dependencies. No code splitting or runtime timing.

| Entry | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| parse | 527519 | 149946 |
| calendar | 515189 | 146602 |
| combined | 545818 | 155717 |

Adding calendar exports to the parsing bundle adds 18299 minified bytes and 5771 gzip bytes.

- Bundle cost only; no measured download, latency, memory, battery or device result.
- Separate parse/calendar bundles duplicate shared code; their sizes must not be added as a combined integration estimate.
- All exports retained; a consumer using fewer exports may produce a different bundle. No competitor comparison.

Archive SHA-256: b8ffb7e04e46eeaaf1e1dcf6c07875b2f805e2497dee50f03280ec0afd14e051
