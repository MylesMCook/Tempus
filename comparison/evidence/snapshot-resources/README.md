# Snapshot formatting and current SDK resources

Tempus now formats each calculation state once and copies the resulting fields for its trace and final answer. This removes repeated work without removing explanations, date-range checks, timezone resolution or clarification. No dependency, rewrite, result cache or public option was added.

Baseline archive: `5866c6b3c4048852dae4f9595bdb47396e512c71aba9623966c808161a970162`.
Candidate: `e70f6d12405597b332dfcdf469acdac73b3f90eb6ee3f6408931272a9eb64d5d`.
Measured September 13, 2026, Apple M4 Pro, Node 26.8.1 and desktop Chrome. Every installed archive file was checked before profiling. Retained reports identify tool versions, inputs and artifact hashes.

## Why this change

Before editing, CPU profiles showed substantial work below `snapshot`: 120 of 292 samples in the traced-calculator lane, about 41%. It repeatedly serialized the same immutable calendar state into ISO/local strings. The implementation now carries the last formatted snapshot through the operation loop. Copies preserve separate mutable public objects for the anchor, each step and the result. Reference validation and every new state still use the original validator.

Five alternating pairs of fresh processes compare both archives. Each process runs 100 operations per lane; all ten full-output hashes match, including the calendar file. Times below are empirical p50 / p95 in milliseconds. CPU time is median process CPU per operation, including runtime overhead.

| Operation | Before | After | Before / after CPU ms |
| --- | ---: | ---: | ---: |
| Four full preview parses | 1.070 / 1.362 | 1.010 / 1.290 | 1.528 / 1.417 |
| Calculator with full trace | 0.093 / 0.113 | 0.077 / 0.096 | 0.123 / 0.119 |
| Three-parse date/DST correction | 0.747 / 0.968 | 0.707 / 0.927 | 0.962 / 0.912 |
| Nine-event preparation and file | 2.113 / 2.698 | 1.869 / 2.350 | 2.750 / 2.494 |

Calculator, correction and export medians improved in each pair. Preview improved in four pairs; one regressed 0.7%. The pooled median reductions are approximately 6%, 18%, 5% and 12%. These are small authored computation workloads, not human completion times or population estimates.

Separate sampled-allocation profiles over 300 operations fell from about 387/47/274/989 MB to 348/40/250/874 MB for preview/calculator/correction/export. These samples include collected JavaScript objects. They are not retained heap, peak process memory or battery measurements. Inspector and garbage-collector samples are not exclusively SDK work.

## Current shared CPU comparison

Both packages receive the same four English inputs, reference, timezone and three-occurrence preview. gpu-time is the pinned 0.2.1 CPU path; its registry freshness was not rechecked. Five fresh processes per engine alternate order in each runtime. All checked previews match. This checks dates, endpoints and recurrence presence; it does not establish equivalent diagnostics, correction or export.

| Measurement | Tempus | gpu-time CPU |
| --- | ---: | ---: |
| Node import through first result, p50 / p95 ms | 24.891 / 25.370 | 16.634 / 16.862 |
| Node single, p50 / p95 ms | 0.140 / 1.281 | 0.198 / 0.446 |
| Node batch 100, p50 / p95 ms | 20.277 / 23.050 | 10.906 / 11.339 |
| Node inputs/s from median batch | 4,932 | 9,169 |
| Chrome import through first result, p50 / p95 ms | 18.2 / 18.5 | 13.8 / 14.7 |
| Chrome single, p50 / p95 ms | 0.2 / 1.7 | 0.2 / 0.8 |
| Chrome batch 100, p50 / p95 ms | 26.6 / 30.4 | 8.3 / 8.7 |
| Chrome inputs/s from median batch | 3,759 | 12,048 |
| Post-work Node RSS growth, median MiB | 98.88 | 30.61 |
| Post-work Node JS heap growth, median MiB | 4.69 | 1.50 |
| Parsing minified / gzip bytes | 527,801 / 150,036 | 110,286 / 52,903 |

The current Node single median favors Tempus and Chrome medians tie at reported precision. gpu-time leads startup, batches, size and pooled single-call tails. The baseline refresh had Tempus's Node median at 0.259 ms versus gpu-time's 0.198 ms; do not generalize a pooled median advantage. Four repeated inputs do not establish overall speed or competitive superiority.

### Single calls by input family

Each family has exactly one phrase, repeated 25 times across five processes. This is descriptive per-input timing, not broad family coverage. Chrome's timer precision makes small differences unsuitable for ranking.

| Input | Node Tempus p50 / p95 ms | Node gpu-time | Chrome Tempus | Chrome gpu-time |
| --- | ---: | ---: | ---: | ---: |
| tomorrow at noon | 0.092 / 0.119 | 0.146 / 0.222 | 0.1 / 0.2 | 0.1 / 0.5 |
| next Friday | 0.085 / 0.113 | 0.097 / 0.137 | 0.1 / 0.2 | 0.1 / 0.4 |
| Friday 10pm-12am | 0.300 / 0.364 | 0.224 / 0.293 | 0.4 / 0.5 | 0.2 / 0.9 |
| every Monday from 8 pm to 10 pm | 1.155 / 1.357 | 0.424 / 0.521 | 1.6 / 1.8 | 0.3 / 0.9 |

## Initialization, bundles and deferral

Initialization profiles include Temporal's IndianHelper initialization and module compilation. The candidate Node import/initialization/first-parse medians are 19.211/0.034/5.651 ms. Creating the reusable parser is not the main cold-start cost.

Esbuild attributes 289,016 minified bytes to pinned timezone data, 126,473 to Temporal and 35,093 to JSBI. These are emitted module contributions, not independently additive gzip or CPU costs. Removing calendar coverage or replacing the calendar engine needs separate correctness and compatibility evidence; this profile does not justify it.

Parsing grew six gzip bytes. Combined parsing/calendar is 546,100 minified / 155,814 gzip bytes; calendar adds 18,299 / 5,778 bytes to parsing. `./calendar` remains a separate SDK entry. The app starts recurring-file preparation only when review is opened, uses a worker, and retains cancellation, title debounce and stale-response checks. No export validation was removed.

Full parsing already includes explanation. There is no public trace-free parser lane; deleting returned fields would not measure one. The separate calculator, correction and export lanes above are Tempus-only costs, not equivalent gpu-time product comparisons. Repeated parsing during correction revalidates input/context and choice provenance; this patch does not bypass it.

## Verification and release limits

- 995 source tests pass with one existing expected calendar-reader failure; 59 files pass. The new test checks that consumer mutation cannot alter adjacent trace states or later calls.
- Seven installed examples pass on Node 22.12 and 26.8.1; installed consumer types and all 56 package files match the archive.
- The retained 31-case/25-journey replay matches complete outputs, correction stages and file hashes. This is authored regression evidence, not independent evaluation or actual calendar imports.
- Build/types and scoped lint pass. The build retains its large-chunk warning. Whole-repository checking and broad current Worker/offline browser journeys remain separate gates.

The measured desktop parse, batch, correction, nine-event file, transfer and fixed-workload post-GC figures fit the existing provisional budgets. This is not a release-wide pass. Browser painted-result timing, per-step UI latency, current maximum export, sustained varied-input retention, physical phones, peak memory, energy, independent users and calendar-client imports remain unverified here.

Negative observations remain: Chrome cold median rose from 17.9 to 18.2 ms; median post-work Node RSS grew from 94.69 to 98.88 MiB even though sampled allocations fell. These sequential comparisons do not establish causal regressions, but they prevent claims of universal speed or memory improvement. gpu-time process RSS remained about 31 MiB.

OS filesystem caches remain warm. Node excludes process launch; Chrome cold timing includes loopback module fetch, not a real download. Five startup samples produce a noisy p95 equal to the maximum. No confidence interval, energy protocol or physical-device result is inferred. No holdouts were opened and no calendar, deployment or publication was performed.

Raw before/after reports, alternating runs, module maps, source/runner snapshots and compressed CPU/allocation profiles are retained here. Profile paths replace the home directory with `<HOME>`; other measurements are retained unchanged. `summarize.py` regenerates `summary.json` from retained JSON reports. `paired.py` records the exact local alternating-run procedure; its installation paths require adjustment on another machine. SHA256SUMS checks retained-file integrity, not independent authorship.

Retained TypeScript source copies now use a `.txt` suffix so the project does not compile evidence as source. Their contents are unchanged; the failed build and filename mapping are recorded in [input preservation](../input-preservation/README.md).
