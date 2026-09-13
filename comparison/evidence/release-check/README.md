# Local release-check scope

September 13, 2026. The full release check initially failed formatting in sixteen retained evidence JSON files and one unrelated Rust-spike file. Retained reports already have recorded checksums, so they were not reformatted. The existing `fmt.ignorePatterns` in vite.config.ts now covers JSON under comparison/evidence, alongside the already excluded immutable report/journey Markdown. Source, scripts, configuration and ordinary documentation remain checked.

All 263 files listed by the existing SHA256SUMS manifests match their recorded bytes. This is artifact integrity, not current-source equivalence or independent evaluation. The check does not imply that every evidence file has a checksum manifest.

`pnpm exec vp check --no-fmt` passes with no warnings, lint errors or type errors in 194 files. The task-owned path check passes formatting for 257 files and lint/type checking for 189 files. `pnpm check` still exits 1 solely for aux/misc/rust-wasm-spike/profile.mjs formatting. That unrelated work is preserved. The full command is not reported as green.

The recorded scope and counts precede this evidence document and tracker updates; the final scoped rerun is recorded separately in the task response. No application/SDK behavior, calendar, cloud setting or deployment changed. The configuration change affects formatting exclusions only. To close the full-repository formatting gate, its owner must separately authorize or make the auxiliary formatting change; task-local passing checks do not silently waive it.
