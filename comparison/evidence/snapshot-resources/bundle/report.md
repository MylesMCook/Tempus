# Packed calendar integration bundle cost

All public exports retained; browser ESM bundles with dependencies. No code splitting or runtime timing.

| Entry | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| parse | 527791 | 150030 |
| calendar | 515189 | 146602 |
| combined | 546090 | 155797 |

Adding calendar exports to the parsing bundle adds 18299 minified bytes and 5767 gzip bytes.

- Bundle cost only; no measured download, latency, memory, battery or device result.
- Separate parse/calendar bundles duplicate shared code; their sizes must not be added as a combined integration estimate.
- All exports retained; a consumer using fewer exports may produce a different bundle. No competitor comparison.

Archive SHA-256: 5866c6b3c4048852dae4f9595bdb47396e512c71aba9623966c808161a970162
