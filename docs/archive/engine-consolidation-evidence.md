# Engine consolidation evidence

September 13, 2026. Local verification only; no publication, deployment or calendar writes.

## Artifacts and reproduction

Baseline archive SHA-256: `fc6e63081ed2f5a35cc68cd64e03c6151034b7ecc4bc63a8ae7b9bca1e292d29`.
Candidate archive SHA-256: `0d1d2ddbc04cfae5eca8c499f63bc7af4aae3f82edf459a423cc0eb9fedba499`.
Both are installed private 0.1.0 archives. Verification compares every installed package file with its tarball. The baseline already contains the initial context-copy optimizations; it does not measure their benefit retrospectively.

[Local artifacts](/Users/mylescook/Documents/Codex/2026-09-13-tempus-engine-consolidation) contain both archives, isolated consumers, raw timing samples, CPU profiles, sampled-allocation profiles, bundle metadata, browser reports and downloaded files. These absolute paths are local review aids, not portable public evidence.

- `comparison/performance/profile.mjs INSTALL ARCHIVE NEW_OUTPUT` verifies archive identity and records five fresh-process latency runs plus separate CPU/allocation profiles.
- `comparison/performance/measure.mjs tempus INSTALL/dist/sdk.js` records startup, four-input parsing, batches and process snapshots. `batch-before-after.json` contains five alternating fresh-process runs per archive.
- `comparison/performance/calendar-bundle.mjs INSTALL ARCHIVE NEW_OUTPUT` retains all public exports in parse, calendar and combined browser bundles.
- `TEMPUS_APP_URL=http://127.0.0.1:5175 node examples/app/verify-engine-contract.mjs CONSUMER ARCHIVE PLAYWRIGHT_ENTRY NEW_OUTPUT` exercises public installed ESM entries against the production playground.
- `examples/app/verify-worker-preparation.mjs` replays cancellation, retry, stale responses, offline output and developer keyboard behavior. `uv run --locked examples/app/read-worker-preparation.py OUTPUT` separately reads its downloads.

## Complete journeys

`candidate/journeys-closeout/report.json` passes in Chrome, Firefox and WebKit at a 390px desktop width after the final production build. Browser time and SDK reference both use `2026-09-12T16:00:00.000Z`, America/Chicago. The preceding `journeys-final` run passes the same assertions.

| Journey                                                                                     | Compared result                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `2026-01-31 plus 1 month minus 1 day`                                                       | Full parse-result equality, date precision, February 28 then February 27 trace steps, visible trace sources. Final instant February 27 at 06:00Z.                                                                                                                                                                |
| `Call Sam 03/04/2027` → March 4                                                             | Full corrected-result equality, retained `Call Sam`, original input/spans and March 4 at 06:00Z. Editing to April/May reopens clarification; the SDK rejects the old context.                                                                                                                                    |
| `Call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08` → second November 1 clock | All nine upcoming starts and 30-minute ends; rule/boundary/source/event equality; complete pretty JSON equals clipboard output; calendar bytes agree after excluding generated UID/DTSTAMP. Separate ical.js expansion verifies September 13–November 8 dates, including the selected November 1 07:30Z instant. |
| Edited recurrence, negation, cancellation and unsupported wording                           | Editing 1:30 to 1:15 reopens the clock question and removes usable old copy output. Stale preparation answers are blocked. `do not call Sam tomorrow`, `cancel the meeting tomorrow`, and `every so often` remain unresolved; full browser/SDK error results agree and download controls are absent.             |

`candidate/worker-final` passes three lifecycle, six offline-after-load and six developer keyboard journeys. Nine lifecycle files pass the separate Python readers; six offline files are checked with ical.js. Chromium clipboard parity reads only values just written by the harness. Firefox/WebKit parity captures clipboard writes. Keyboard activation uses focus/Enter; it is not a full assistive-technology evaluation. These are authored tasks, not independent usability evidence or actual calendar-client imports.

Failed harness attempts are retained: CommonJS resolution was inappropriate for this ESM package; differing ISO reference spelling prevented exact equality; a stale-copy assertion initially looked for an old button name instead of the pending state. Corrected attempts pass. The first intermediate after-profile overlapped the test runner and is excluded from timing conclusions.

The final identity audit matches emitted code and package documentation byte-for-byte against the installed archive. pnpm's packed `package.json` omits the source file's final newline; parsed manifest values are identical. Browser source hashes match current files. The audit retains 17 client-build file hashes and the parity-runner hash. Final checks, 1,164 tests plus one pre-existing expected failure, production build and diff whitespace review pass. Dependency manifests/lockfile, product matrix and deployment configuration are unchanged. The existing expected failure is `comparison/calendar/ongoing-timezone.test.ts`: reader UTC conversion immediately before Chicago spring DST. The build's large client-chunk warning remains.

## Resource comparison

Node 26.8.1 on the local M4 Pro desktop, warm filesystem, no task-local build/test work during retained timing runs. p50/p95 use nearest-rank samples. The four repeated parsing inputs are a small mixed workload, not a language-coverage or competitive ranking. Explanations remain enabled; there is no trace-free parsing mode.

| Measurement                                           |           Baseline |          Candidate |
| ----------------------------------------------------- | -----------------: | -----------------: |
| Import only, median of five processes                 |          21.170 ms |          20.991 ms |
| Parser initialization, median                         |           0.041 ms |           0.033 ms |
| First parse, median                                   |           6.241 ms |           6.556 ms |
| Import through first result, median / maximum of five | 27.278 / 29.631 ms | 27.348 / 28.012 ms |
| Warm mixed single parse, p50 / p95                    |   0.131 / 1.319 ms |   0.259 / 1.359 ms |
| Batch 10, p50 / p95                                   |   2.827 / 3.694 ms |   2.832 / 3.370 ms |
| Batch 100, p50 / p95                                  | 21.788 / 24.175 ms | 21.632 / 24.213 ms |
| Batch-100 median throughput                           |     4,590 inputs/s |     4,623 inputs/s |
| Traced arithmetic, p50 / p95                          |   0.084 / 0.118 ms |   0.083 / 0.098 ms |
| Full date/clock correction computation, p50 / p95     |   0.762 / 1.112 ms |   0.770 / 1.080 ms |
| Nine-occurrence file preparation, p50 / p95           |   2.118 / 2.757 ms |   1.603 / 2.197 ms |
| Parse bundle, minified / gzip bytes                   |  532,727 / 151,705 |  532,847 / 151,938 |
| Combined parse/calendar bundle, minified / gzip bytes |  551,131 / 157,461 |  552,464 / 158,042 |
| Median post-work RSS growth                           |         96.250 MiB |         96.328 MiB |
| Median post-GC JS heap growth                         |          4.766 MiB |          4.782 MiB |
| Sampled allocated bytes across 300 file preparations  |        867.804 MiB |        649.671 MiB |

The finite-preview removal improves the measured export workload. It does not improve every lane: the mixed single-parse median is worse, first parse is slightly slower, and the combined bundle grows 581 gzip bytes. No cause or statistical significance is established for small latency differences. CPU samples concentrate in date arithmetic, Temporal operations, garbage collection and file serialization. Sampled allocations include collected objects and are not live or peak memory. RSS includes the process/runtime. Startup excludes process creation, network and cold storage. Five startup trials provide weak tail evidence.

The new public API was also measured separately in one fresh process: 20 warmups then 500 calls per lane. Nine-occurrence data preparation measured p50/p95 1.211/1.846 ms; preparation plus file serialization measured 1.412/2.079 ms. These include context-key validation and must not be mixed with the older raw-helper timing series. Data-only mode omits serialization; ongoing rule validation still runs when applicable.

The measured lanes fit the existing provisional desktop containment budgets: parse p95 ≤10 ms, batch-100 p95 ≤100 ms, correction journey ≤50 ms, nine-event file p95 ≤100 ms, parse ≤150 KiB gzip, combined ≤160 KiB gzip, post-GC heap growth ≤10 MiB and RSS growth ≤128 MiB. This does not pass the unmeasured maximum-size, rendered-interaction, sustained varied-input, physical-device or energy gates. No thresholds were relaxed.

## Remaining product evidence

Physical iOS/Android access, screen-reader sessions, independently authored evaluation, unfamiliar users, peak-memory/energy instrumentation and actual calendar-client imports remain unavailable. Obtain named devices, evaluator/participants and separately authorized disposable calendar clients for those checks. Existing ongoing-DST/duration restrictions and the expected-failure test remain documented; this consolidation does not widen supported recognition or export policies. No claim of overall superiority to gpu-time follows from this work.
