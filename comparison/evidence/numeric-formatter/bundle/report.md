# Packed calendar integration bundle cost

All public exports retained; browser ESM bundles with dependencies. No code splitting or runtime timing.

| Entry | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| parse | 525933 | 149419 |
| calendar | 515189 | 146602 |
| combined | 544231 | 155111 |

Adding calendar exports to the parsing bundle adds 18298 minified bytes and 5692 gzip bytes.

- Bundle cost only; no measured download, latency, memory, battery or device result.
- Separate parse/calendar bundles duplicate shared code; their sizes must not be added as a combined integration estimate.
- All exports retained; a consumer using fewer exports may produce a different bundle. No competitor comparison.

Archive SHA-256: bd06963f2facb68dce9e2aadb79b21d9cfd2583a004a60b6e7b33e9706f0aa7e
