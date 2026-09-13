# Packed calendar integration bundle cost

All public exports retained; browser ESM bundles with dependencies. No code splitting or runtime timing.

| Entry | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| parse | 527902 | 150061 |
| calendar | 515199 | 146619 |
| combined | 546201 | 155844 |

Adding calendar exports to the parsing bundle adds 18299 minified bytes and 5783 gzip bytes.

- Bundle cost only; no measured download, latency, memory, battery or device result.
- Separate parse/calendar bundles duplicate shared code; their sizes must not be added as a combined integration estimate.
- All exports retained; a consumer using fewer exports may produce a different bundle. No competitor comparison.

Archive SHA-256: a7f9e298c3c3152e0cddc7e439819ed0aba83a2471e81adc78a646e9737ca21b
