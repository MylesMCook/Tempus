# Strict performance-preview comparison

The shared benchmark comparator now validates civil dates, complete clock fields and explicit offsets before comparing instants. JavaScript previously normalized February 30 into March 2, allowing an invalid engine output to match a valid expected date.

The change preserves equivalent offsets, leap dates and millisecond values. It rejects nonzero sub-millisecond precision. It changes neither the parser nor the timed workload and adds no dependency.

Verification on September 13, 2026:

- `node comparison/performance/verify.mjs` passes existing and strict-date regressions.
- Seven authored comparator cases pass in each of Chrome 153, Firefox 148 and WebKit 26.4. [Browser results](browser.json) identify the exact comparator source hash.
- The prepared scratch patch previously preserved all 40 retained previews across ten runs of four distinct inputs. That was not an independent corpus or a timing rerun.

This is a post-scan change: security scan `464c7d81-10e8-4bb4-a3e1-d60713bf0871` predates it. Browser checks execute the pure module in disposable pages; they do not test website usability, physical devices or calendar imports. Historical reports remain unchanged. Stale-report handling and symmetric engine exception accounting remain separate follow-ups.
