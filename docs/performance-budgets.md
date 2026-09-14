# Performance and resource budgets

Latest local resource evidence: [engine consolidation candidate 0d1d2ddb](engine-consolidation-evidence.md) compares installed archives for startup, parsing, batches, trace/correction/export, bundles and memory indicators. Finite export improves; mixed single-input median worsens and combined gzip grows 581 bytes. Measured desktop lanes fit the unchanged provisional targets below. Rendered performance, maximum-size current-candidate timing, sustained varied-input retention, physical devices, peak memory, energy and independent tasks remain unverified. Earlier gpu-time comparisons below retain their original artifact scope; this consolidation is not a new competitive ranking.

These are provisional engineering gates, not competitive claims or a frozen evaluation protocol. Keep the existing product matrix. A fast wrong answer, a hidden ambiguity or a missing explanation fails release regardless of timing. Freeze device-specific budgets with the evaluator before opening holdouts.

## Measure the same work

| Lane                    | Required output and timing boundary                                                                                                                                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared parsing          | Same text, timezone, reference, range semantics and recurrence preview limit. Import, initialization and first result separately; warm parse and batches separately. Check outputs outside the timer. gpu-time uses its CPU backend in our retained comparison.                    |
| Explainable calculation | Include the complete written-order trace, fractions, warnings and before/after snapshots. Tempus currently has no trace-free parsing mode. Removing fields after parsing does not measure a cheaper parser.                                                                        |
| Correction              | Input through every offered answer to a resolved result, with original text and edit invalidation. Report computation per step and total; keep human decision time, errors, assistance and abandonment separate. Do not compare this with a competitor's single uncorrected parse. |
| Export                  | Separately measure plan/clarification, file generation and optional module loading. Specify event count, horizon, DST and duration policy. File validation and actual client import remain separate gates.                                                                         |

Report p50 and p95 with sample counts, per-family results, cold first-use costs, batch throughput, bundle minified/gzip bytes, CPU time and memory scope. Five startup samples give a noisy empirical p95 equal to the largest sample. Four repeated inputs are a development microbenchmark, not a representative population. Use independently authored inputs and paired engine order for product evidence.

## Provisional acceptance targets

Local CPU targets apply to the recorded M4 Pro desktop with pinned Node/Chrome versions and warm filesystem caches. They do not establish phone budgets as passed. MiB/KiB below are binary units.

| Scope                                        | Initial target                                                                        | Why / current gap                                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop SDK cold import through first result | p95 ≤100 ms                                                                           | Enough headroom for ordinary initialization without a visible pause; excludes network and process launch.                                                                                                               |
| Desktop warm shared parse                    | p50 ≤2 ms; p95 ≤10 ms                                                                 | Leaves room for rendering and input handling; report slower families separately.                                                                                                                                        |
| Desktop batch 100                            | p95 ≤100 ms; median throughput ≥1,000 inputs/s                                        | Background developer workload, not permission to block the UI for 100 ms.                                                                                                                                               |
| Desktop correction computation               | p95 ≤16 ms per step; ≤50 ms for the authored three-parse journey                      | Preserve every prompt, label, explanation and stale-answer check. Human completion is a separate measure.                                                                                                               |
| Finite file generation                       | p95 ≤100 ms for nine events; ≤1 s at the supported 1,000-event limit                  | Daily point/duration cases at 1,000 events pass the scoped SDK timing target; harder clocks and browser responsiveness remain open. See the large-export/resource evidence in the release checklist.                    |
| Browser interaction                          | p95 input/answer-to-painted-result ≤100 ms; no task >50 ms during correction          | Requires actual rendering/long-task instrumentation; SDK call timing alone cannot pass it. Long export work needs a responsive progress/cancel path.                                                                    |
| SDK transfer                                 | Parse ≤150 KiB gzip; combined parse/calendar ≤160 KiB; calendar increment ≤8 KiB      | A containment budget around the current pinned-data design, not a claim of being lightweight. Report minified bytes too; gzip contributions cannot be added per module.                                                 |
| Desktop memory                               | Post-GC JS heap growth ≤10 MiB and process RSS growth ≤128 MiB on the fixed workload  | Coarse containment targets, not peak usage or library-only allocation. Also run increasing unique inputs/zones and repeated cycles to detect unbounded retention. Current caches must remain bounded.                   |
| Physical phone interaction                   | Provisional p95 ≤100 ms from answer to painted result; warm single computation ≤16 ms | Unverified on physical iOS/Android. Choose named ordinary devices and test cold/warm, offline, low-memory and sustained use. Desktop narrow viewports do not count.                                                     |
| Phone cold start / energy                    | Budget pending physical baseline                                                      | Measure transfer, parse/compile, first usable result, peak memory and sustained energy per successful task using a declared network/power protocol. No credible battery or thermal limit can be inferred from Node RSS. |

Do not waive correctness to meet a target. A measured miss stays visible with its user impact and a scoped remedy. These initial thresholds need broader task/device baselines and evaluator review; no release-wide pass is established by the small desktop workload.

## Optimization rules

Profile the packed artifact before changing architecture or dependencies. Keep raw CPU and sampled-allocation profiles apart from uninstrumented latency measurements. Repeat a candidate against its original archive, check complete outputs and file bytes, and retain negative results.

Prefer eliminating repeated work over weakening validation. Formatting objects may be reused with bounded retention; timezone labels must still be checked against pinned civil fields for every result. Do not cache mutable public results or reuse answers across edited input/context. Traces remain available and unchanged. Export is already a separate package entry and the app prepares it on request; skip no calendar preflight to improve a parse number.

Pinned timezone data and Temporal carry real bundle/initialization costs. A smaller timezone subset, lazy loading or replacement calendar implementation would change capabilities, offline behavior or compatibility and needs a separate measured design. This profile does not justify a rewrite.

## Current candidate scope

[Archive e70f6d12 measurements](../comparison/evidence/snapshot-resources/README.md) include packed Node/Chrome parsing, per-input p50/p95, initialization, bundles, sampled allocations and alternating before/after trace/correction/export computations. Scoped desktop targets fit. Post-work median RSS growth is about 99 MiB versus gpu-time's 31 MiB; sampled-allocation reductions are not a peak-memory or energy result.

Earlier varied-zone retention and large-file worker observations retain their original archive identities. Current rendered interaction p95, maximum-size export, sustained varied-input retention, physical devices and independent task completion remain open. Do not tune these thresholds to a benchmark win or waive a correctness/recovery failure. Freeze device-specific budgets with the independent evaluator before holdouts.

## Numeric-date stress follow-up

[Candidate bd06963f](../comparison/evidence/numeric-formatter/README.md) reuses one date-label formatter. Across the same 5,970-input stress, fixed/varied-zone RSS growth fell from about 156–159 MiB to 35–60 MiB. These current scoped observations fall below the 128 MiB containment figure; they do not establish peak memory, bounded retention for every workload or physical-device performance. Broader tasks and energy measurements remain required.
