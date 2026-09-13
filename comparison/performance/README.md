# Desktop CPU performance pilot

Run `pnpm benchmark:cpu` from the repository root after installing the locked dependencies. The command builds the current SDK, checks the preview comparator, then writes [raw results](../results/performance/report.json) and a [readable report](../results/performance/report.md). Generated reports and bundles stay local and are ignored by Git.

The workload is four inspected development examples: a point, weekday, overnight range and weekly recurrence. Both parsers receive the same explicit timezone/reference and produce three recurrence occurrences. This measures a shared supported subset; it does not estimate language accuracy. Repeating the same four examples 11,100 times does not create 11,100 independent accuracy cases.

## Current candidate measurements

[Archive a7f9e298](../evidence/current-a7f-resources/README.md) refreshes current packed Node/Chrome timings, CPU/allocation profiles, bundles and memory. Tempus has a lower Node single median but a higher Chrome single median in this run; gpu-time leads startup, batches, size and tails. Full profile outputs match e70. The experiment below retains its original artifact identities.

## Earlier controlled optimization

[Archive e70f6d12](../evidence/snapshot-resources/README.md) removes repeated snapshot formatting after profiling packed 5866c6b3. Five alternating pairs preserve full outputs and reduce median traced-calculator, correction and nine-event export times by roughly 18%, 5% and 12%. One preview pair regresses slightly. Current Node/Chrome reports include per-input latency, startup, throughput, bundles and process memory.

gpu-time remains ahead on measured startup, batches, size and pooled single-call tails. Tempus has a lower current Node single median; Chrome medians tie at reported precision. Chrome cold start and process RSS did not improve against the baseline. No rewrite, added dependency, trace removal or general memory/speed claim follows.

Physical devices, energy, peak memory and independent task completion remain unmeasured. Four repeated inputs are not representative language coverage. [Provisional budgets](../../docs/performance-budgets.md) supplement the unchanged product matrix; prior reports below retain their original identities.

## Previous range-policy candidate measurements

[Current retained reports](../evidence/performance-range-policies/README.md) measure archive `e33ab0ca…` against pinned gpu-time 0.2.1 on the same four preview inputs. Node import-through-first p50 is 24.954/17.035 ms and batch-100 p50 is 21.491/10.722 ms (Tempus/gpu-time). Chrome p50 is 17.80/14.00 ms and 28.50/8.10 ms respectively. Parsing bundles are 149,116/52,903 gzip bytes.

gpu-time leads startup, batches, size and single-call tails. Tempus has a lower Node warm-single p50 (0.134/0.197 ms) but a higher p95 (1.454/0.440 ms). Chrome warm-single p50 is tied at reported precision. Do not flatten this into an overall speed win for either product.

All checked previews match. Correction, export, physical devices, peak memory, battery and human completion remain unmeasured. The registry was not queried during timing; refresh before freezing an independent comparison. [Prior range-archive reports](../evidence/performance-range/README.md) remain intact, as do the historical results below. Their original use of “current” refers to their own artifact date.

## Historical shared-year candidate measurements

[Historical retained reports](../evidence/performance-year/README.md) measure archive `906f3a6f…` against pinned gpu-time 0.2.1 on the same four-case workload. The registry returned the same version/integrity on September 13. Node import-through-first p50 is 25.040/17.600 ms (Tempus/gpu-time), batch-100 p50 is 20.808/10.829 ms, and warm-single p50/p95 is 0.159/1.402 versus 0.196/0.439 ms. Tempus's lower single p50 comes with a higher tail; it is not a general speed win.

Chrome import-through-first median is 17.40/13.80 ms and batch-100 median is 27.25/8.05 ms. Parsing bundles are 514,339/146,124 minified/gzip bytes for Tempus and 110,286/52,903 for gpu-time. Calendar integration adds 17,632/5,511 bytes. Post-GC median Node RSS/heap growth is 94.45/4.56 MiB versus 30.47/1.50 MiB; these are not peak or isolated package allocations.

All checked previews match. The workload does not measure year clarification, interactive recovery or calendar export. The earlier Node result is preserved in `results/performance/history/before-year-choice/packed`; old browser/calendar outputs remain untouched. Current source and packed SDK are measured here, but physical-device and independent evaluation gates remain open.

## Historical pre-year-choice measurements

Current archive `4ec18030…` adds same-month shorthand and postdates the measurements below. The `f5d11490…` bundle-equality statement describes the previous candidate only. No timing for the new shorthand path is claimed.

Prior archive `f5d11490…` adds calendar failure codes. Its parsing bundle has the same SHA-256 as measured `52d5c981…`; the timings below retain that original artifact identity. Current combined parsing/calendar is 530,558 minified / 151,170 gzip bytes, adding 17,632 / 5,512 to parsing. [Current calendar bundle](../results/performance/calendar-bundle-failure-codes/report.md).

Archive `52d5c981…` has [Node results](../results/performance/packed/report.md), [Chrome results](../results/performance/browser-current-list/report.md) and [calendar bundle costs](../results/performance/calendar-bundle-current-list/report.md). Installed files are verified against the archive before measurement. The comparator remains pinned gpu-time 0.2.1, last registry-checked September 13; it was not queried again in this run.

Node batch-100 empirical p50 is 21.216/10.668 ms (Tempus/gpu-time); Chrome median is 27.90/8.20 ms. Import-through-first medians are 24.475/16.544 ms in Node and 17.4/14.0 ms in Chrome. Node warm-single p50/p95 is 0.258/1.338 ms versus 0.196/0.453 ms. All checked previews match. The workload remains four inspected examples and does not measure list correction or calendar export.

Parsing bundles are 512,926 minified / 145,658 gzip bytes versus gpu-time's 110,286 / 52,903. Combined parsing/calendar is 530,298 / 151,094 bytes, adding 17,372 / 5,436 bytes to parsing. Tempus parsing grew by 3,972 minified / 1,214 gzip bytes compared with archive `953106eb…`. Median process growth after work and explicit GC is 94.75/30.84 MiB RSS and 4.55/1.50 MiB heap; these include runtime/JIT overhead and are not peak memory or isolated package allocations.

The measured workload favors gpu-time for startup, single calls, batches and bundle size. Differences between successive Tempus timing runs are descriptive; they are not a controlled regression attribution. The previous packed report is preserved in `results/performance/history/before-current-list/packed/`; previous browser/calendar reports remain in their original directories. Physical-device and independent task-completion gates remain open.

## Method

- Five fresh Node processes per engine, alternating execution order. Process startup is excluded; OS filesystem caches are not cleared.
- Measure module import, parser initialization, first parse and their combined time separately. Force gpu-time's CPU backend; there is no GPU fallback comparison.
- For single calls and batches of 10/100, run four untimed warm-up calls, then 20 measured calls. Rotate the same cases so the overall input mix matches. Construct inputs and validate returned previews outside the timed region.
- Report empirical p50/p95, retaining every raw sample. These are descriptive percentiles, not confidence bounds; runs on an active desktop can be noisy.
- Compare exact ordered occurrence counts, start/end instants and recurrence presence. Equivalent ISO offsets compare equally; extra nonzero sub-millisecond precision fails the second-precision workload check. This comparator does not validate all-day flags, recurrence exports, diagnostic quality or interactive correction.
- Record process RSS, heap, external and array-buffer snapshots after explicit GC, before import, after first parse and after measured work. They include Node/JIT/Intl overhead and are not peak memory or isolated library allocations.
- Bundle each public package entry with esbuild, dependencies included, all exports retained, identical browser/ES2022/minification settings. Record raw and gzip byte counts plus hashes. These are integration bundles, not npm tarballs, browser execution or measured downloads.

The JSON records runtime/hardware, package/tool versions, dirty Git state, workload, emitted SDK source hashes, harness/lockfile hashes, observed previews and raw measurements. Correctness failures remain visible alongside timings. A faster rejection or incomplete answer is not a product win.

## September 12 pilot

Apple M4 Pro, arm64 macOS, Node 26.8.1, esbuild 0.28.1; Tempus local 0.1.0 candidate and gpu-time 0.2.1. Both matched every timed preview in this workload. The [pilot raw snapshot](../results/performance/history/2026-09-12-desktop-cpu-v1.json) is retained locally separately from the latest generated report.

| Measurement                 |    Tempus p50 | gpu-time CPU p50 |
| --------------------------- | ------------: | ---------------: |
| Import through first result |     21.569 ms |        16.548 ms |
| Warm single input           |      0.353 ms |         0.194 ms |
| Batch of 10                 |      5.531 ms |         1.228 ms |
| Batch of 100                |     49.044 ms |        10.664 ms |
| Minified integration bundle | 195,187 bytes |    110,286 bytes |
| Gzip integration bundle     |  58,706 bytes |     52,903 bytes |

These measurements favor gpu-time's CPU path. Tempus also showed larger process memory growth in this pilot; the snapshots cannot attribute that growth to individual components. Profile calendar evaluation, repeated parsing and dependency cost before changing architecture. Preserve the trace and correctness requirements while optimizing.

Phone/Safari/browser runtime, battery, GPU batches, other input families and user-task performance remain unmeasured. Neither a universal speed claim nor numerical acceptance budgets follow from this pilot. Freeze claim-specific budgets after representative device baselines, before independent evaluation.

## Timezone validation optimization

A CPU profile of the emitted SDK pointed to repeated `calculateDate` work. Instrumenting `Intl.DateTimeFormat` after SDK import counted 1,800 constructor calls over 400 mixed inputs. These constructors checked the same named timezone repeatedly; their formatting output was unused.

The core now retains at most 64 successfully validated timezone strings. It caches neither expressions nor calculated results. Date resolution, reference validation, DST rejection and trace generation still run for every input. Invalid zones are not cached. The same constructor probe now makes two calls (Chicago and the UTC clock workspace).

The [post-change raw run](../results/performance/history/2026-09-12-zone-validation-cache.json) uses the same five-process protocol and four cases. All timed previews still match. Tempus median warm single/batch-10/batch-100 times are 0.297/4.305/38.316 ms, compared with 0.353/5.531/49.044 ms before this change. gpu-time CPU remains faster at 0.198/1.240/10.797 ms in the new run. The Tempus gzip bundle grows by 43 bytes to 58,749 bytes.

This is a measured local improvement, not parity or a device-wide speed guarantee. The 427-test suite passes; all 26 development comparison cases preserve identical Tempus raw results, traces and diagnostics. Tests exercise more than 64 zones, invalid zones, changed references and repeated DST clocks. Further profiling is needed before choosing another optimization.

## Post-duration desktop refresh

The unchanged four-case workload was rerun against the emitted local SDK and installed gpu-time 0.2.1, using the same five fresh-process protocol. Raw results are retained in `results/performance/history/2026-09-12-recurring-duration.json` relative to `comparison/`; the preceding latest report was also preserved. All 11,100 measured items per engine match expected previews; these are repeated samples of four inputs, not 11,100 independent language cases.

Tempus / gpu-time p50: import through first result 22.005 / 16.688 ms; warm single 0.262 / 0.196 ms; batch 10 4.501 / 1.216 ms; batch 100 38.212 / 10.678 ms. Integration bundles are 203,516 / 110,286 bytes minified and 61,310 / 52,903 bytes gzip. The added capabilities have not closed the CPU or bundle-size gap. No significance, phone, battery, peak-memory or general-speed claim follows from this active-desktop run. This run imports emitted SDK source; packed-runtime checks are separate evidence.

## Avoiding a redundant clock conversion

A current 4,000-input CPU profile showed Temporal conversion work dominating samples. Inspection found that each explicit range resolved an arbitrary UTC date solely to compare the end clock. The interval resolver now uses the existing validated clock grammar for that comparison; the real endpoint still receives full calendar/timezone/DST resolution. Invalid clocks retain the original evaluator diagnostics. No result cache or new dependency was added.

The same five-process workload reports Tempus p50 batch 100 at 31.284 ms versus 38.212 ms before; batch 10 at 3.879 versus 4.501 ms. Warm single 0.268 versus 0.262 ms did not improve. gpu-time remains faster, at 10.714 ms for batch 100. The Tempus integration bundle increases by 15 gzip bytes to 61,325. These descriptive runs do not establish statistical significance or device-wide performance. Raw output is preserved in `results/performance/history/2026-09-12-clock-grammar.json` relative to `comparison/`.

All 31 development raw interpreter and strict-calculator results match before/after, including traces and diagnostics. A separate direct comparison matched 300 old/new interval candidates across Chicago, Lord Howe, Kathmandu and Apia with invalid, overnight, repeated/skipped clocks and date-transition inputs. 571 tests, checks and build pass. Profile and old-source snapshot are in task scratch at `/Users/mylescook/Documents/Codex/2026-09-12-tempus-performance/`; the comparison imported unchanged current dependencies for both implementations. This is development regression evidence, not independent evaluation.

## Packed SDK measurement

The runner can measure an installed archive without rebuilding or importing the workspace SDK:

```sh
node comparison/performance/run.mjs --packed /absolute/consumer/node_modules/@tempus-date/core /absolute/tempus-date-core-0.1.0.tgz
```

Both paths are required. Before any timing, every archived file must match the installed copy byte for byte. A mismatched older archive was tested and rejected at `dist/interpret-recurrence.js`. The package's declared ESM entry is used for both timing and bundling. The report records archive SHA-256, archived-file hashes, installed path and harness/runtime metadata. Dependencies come from that clean consumer's installation; this byte comparison covers the package archive, not an independent audit of every transitive dependency. The existing emitted-source mode remains available without arguments.

Packed output lives separately in [results/performance/packed/report.json](../results/performance/packed/report.json) and [report.md](../results/performance/packed/report.md), preserving earlier emitted-source reports. No registry access occurs during timing. The four inputs, contexts, trial order, warm-ups and measurements are unchanged. The first packed run exposed a harness variable-shadowing error in bundling; it was corrected before the successful complete run. No failed partial timings were reported as a completed run.

Historical September 12, 2026 baseline (Chicago): the `after-past-occurrences` clean consumer/archive, SHA-256 `bd7a2f467fe3f03f59aa0932952429800b8e711a31cd8e069b5b3ce49ce20a66`, was measured on the same M4 Pro/Node 26.8.1 host against gpu-time 0.2.1 CPU. This is not the current archive; use the linked packed report for current results. Both produced 11,100/11,100 matching timed previews: repeated samples of four cases, not independent accuracy examples.

| Measurement                 |    Tempus p50 |  gpu-time p50 |
| --------------------------- | ------------: | ------------: |
| Import through first result |     22.028 ms |     16.396 ms |
| Warm single                 |      0.316 ms |      0.196 ms |
| Batch 10                    |      4.054 ms |      1.229 ms |
| Batch 100                   |     31.857 ms |     10.690 ms |
| Minified integration bundle | 205,077 bytes | 110,286 bytes |
| Gzip integration bundle     |  61,704 bytes |  52,903 bytes |

Median per-process after-work minus before-import RSS was 97,959,936 bytes for Tempus and 31,784,960 for gpu-time; corresponding heap-used deltas were 3,668,632 and 1,570,488 bytes. These are post-GC process snapshots including runtime/Intl/JIT overhead, not peak use or isolated library allocation. Raw records preserve all four memory fields and samples. The evidence still favors gpu-time on this particular workload. Browser execution, physical-phone performance, battery and broader inputs remain unmeasured; no significance or universal performance claim follows.

## Optional calendar bundle

Run `node comparison/performance/calendar-bundle.mjs installed-package-directory archive.tgz new-output-directory` to measure all parsing exports, all calendar exports and both together. The runner verifies installed package files against the archive before bundling. The output directory must be new; it retains generated entry modules, bundles, esbuild metadata and a report with archive/script identities.

[Current results](../results/performance/calendar-bundle/report.md) use archive `0341e306…`: parsing 506,402 minified / 143,542 gzip bytes; calendar alone 501,187 / 142,762; combined 521,434 / 148,584. Calendar adds 15,032 minified / 5,042 gzip bytes to this parsing bundle. These generated entry modules differ from the direct-entry performance harness, so its gzip byte counts need not be identical even with unchanged SDK bytes.

Standalone bundles duplicate shared dependencies; do not add their sizes to estimate combined use. All public exports are retained, with no code splitting. Bundler metadata attributes 289,016 combined minified bytes to pinned timezone data, 126,424 to Temporal and 35,171 to JSBI; those byte counts are not independent gzip sizes. This measurement does not justify dropping timezone coverage or changing calendar semantics. Runtime latency, memory, network transfer and device performance are separate work.

## Desktop browser CPU measurement

```sh
node comparison/performance/browser.mjs comparison/results/performance/packed /absolute/NEW-output-directory /absolute/playwright-core/index.mjs
```

Requires an existing `playwright-core` installation and Chrome. Pass its absolute ESM entry path explicitly, as with the SDK browser verifier. The runner does not install dependencies or discover a package from a parent directory. The earlier two-argument command is no longer accepted; use the third path argument. The runner verifies both retained browser bundles against the packed report's hashes, serves only fixed local assets on an ephemeral loopback port, and closes its browser processes and server afterward. It does not rebuild the SDK or fetch model assets. Output directories must be new. A partial run retains its completed samples with `completed: false`.

Five alternating fresh Chrome processes per engine use the same four inspected inputs as the Node workload. Each batch size has four warmups and twenty measured calls; every result is checked outside timing. Import includes an uncompressed loopback fetch, compilation and evaluation. OS caches remain warm. Browser timer quantization limits small-call comparisons. No CPU throttling or physical-phone emulation is claimed.

The September 13 Chrome 153.0.8010.36 run completed ten processes against the `0341e306…` packed candidate and gpu-time 0.2.1. Every first, warmup and measured preview matched. Median import-through-first was 17.3/13.9 ms (Tempus/gpu-time); warm single 0.3/0.2 ms, batch ten 4.15/1.0 ms and batch hundred 33.7/8.1 ms. gpu-time was faster in this workload. These numbers do not estimate language accuracy, user completion or device performance.

[Raw samples](../results/performance/browser-packed/report.json) and [scoped summary](../results/performance/browser-packed/report.md) remain local. No device, battery, peak-memory, GPU or calendar-export timings were measured. Bundle identity links the prior build evidence; it does not independently authenticate the complete dependency closure.

## Civil-cache archive refresh

Archive `c1f8d2a0…` now has refreshed [Node results](../results/performance/packed/report.md) and [Chrome results](../results/performance/browser-civil-cache/report.md). All checked previews match. Node median batch-100 is 20.390 ms for Tempus and 10.767 ms for gpu-time; Chrome is 27.0/8.0 ms. Node import-through-first is 24.570/16.656 ms; Chrome is 17.7/14.5 ms. Tempus has a lower Node warm-single median (0.128/0.199 ms), but a higher p95 (1.401/0.475 ms); that does not establish a general speed advantage.

Prior packed results remain in `results/performance/history/before-civil-cache/packed/`; prior Chrome results remain in `results/performance/browser-packed/`. These are separate development runs, not controlled device studies.

A compression audit found two Node 26.8.1 executables with different zlib implementations: Homebrew reports 1.2.12 and the other local binary reports 1.3.2.1-motley. Identical gpu-time bundle bytes gzip to 52,903 and 52,447 bytes respectively. Do not attribute that difference to package code. The audit is retained beside the current packed report. Future runners record executable paths and complete runtime-library versions; existing reports retain their original metadata and hashes.

## Prior monthly archive measurements

The following is retained historical evidence; “current” refers to the milestone at which it was recorded.

### Monthly measurement record

The latest measured archive is `953106eb…`. Current SDK `52d5c981…` includes later list changes and has not been measured here; these reports must not be presented as its timings.

Archive `953106eb…` has refreshed [Node results](../results/performance/packed/report.md), [Chrome results](../results/performance/browser-monthly/report.md) and [calendar bundle costs](../results/performance/calendar-bundle-monthly/report.md). The registry still reported gpu-time 0.2.1 on September 13; that remains the pinned comparator.

Node batch-100 median is 21.508/11.224 ms (Tempus/gpu-time); Chrome is 27.55/8.10 ms. Import-through-first medians are 25.927/17.759 ms in Node and 17.6/14.0 ms in Chrome. All checked previews match. These remain four-case development measurements and do not measure monthly export or correction journeys.

The parsing bundle is 508,954 minified / 144,444 gzip bytes versus gpu-time's 110,286 / 52,903. Combined parsing/calendar is 526,306 / 149,927 bytes, adding 17,352 / 5,483 bytes in this build. Median process RSS growth after measured work and explicit GC is 94.64/30.48 MiB; heap-used growth is 4.90/1.50 MiB. These process snapshots include runtime/JIT overhead and are neither peak memory nor isolated package allocations.

The current measurements favor gpu-time for startup, batches and bundle size. A lower Tempus Node single-call median does not establish a general latency advantage: its p95 is 1.389 ms versus 0.471 ms. Node executable and runtime-library versions are recorded. Prior packed reports remain in `results/performance/history/before-monthly/`; earlier browser and calendar bundle directories remain intact.
