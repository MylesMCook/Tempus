# Packed calendar integration bundle cost

All public exports retained; browser ESM bundles with dependencies. No code splitting or runtime timing.

| Entry | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| parse | 526409 | 149578 |
| calendar | 515189 | 146602 |
| combined | 544707 | 155286 |

Adding calendar exports to the parsing bundle adds 18298 minified bytes and 5708 gzip bytes.

- Bundle cost only; no measured download, latency, memory, battery or device result.
- Separate parse/calendar bundles duplicate shared code; their sizes must not be added as a combined integration estimate.
- All exports retained; a consumer using fewer exports may produce a different bundle. No competitor comparison.

Archive SHA-256: 756fbb4ec523da3ac1bba687507eba72c2b42aa2a9de767e01d0e9d765cbbf59
