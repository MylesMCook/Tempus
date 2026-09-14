# Tempus product focus

## Objective and authority

One reusable TypeScript engine produces inspectable dates, intervals and schedules. The website is its reference consumer. Use the [product focus](docs/product-focus.md); retain the [matrix](docs/product-matrix.md) as an inventory, not a parity backlog. New feature families are paused. The user now authorizes publishing the tested calculator-focused iteration through the normal Git/Cloudflare release path. No calendar writes or unrelated service changes. The private SDK is not being published to npm.

## Active Copilot critique pass

[Reviews, triage and evidence](comparison/copilot-review/README.md). Copilot CLI 1.0.83 installed through `gh copilot` and authenticated using the existing GitHub credential.

- [x] Run distinct Copilot models as occasional user, keyboard power user and SDK integrator.
- [x] Reproduce findings and select small fixes within existing supported behavior.
- [ ] Verify affected journeys and release checks; merge and deploy.
- [x] Record rejected findings and remaining gaps; synthetic critiques are not user studies.

## Completed Writer and UI pass

- [x] Shorten site copy and primary docs; keep rules, warnings and technical contracts precise.
- [x] Compact the calculation trace and remove duplicate schedule output; preserve correction, previews and export.
- [x] Separate quickstarts/current status from reference material and historical evidence.
- [x] Verify links, examples, copy-dependent tests and browser layout.
- [x] Merged PR #6 as `6c8a414`; deployed `228380e5-5b2f-4ec9-8ca4-69adebe55f4d`. Both hosts and three-browser live journeys pass. [Review and evidence](docs/writer-ui-review.md).

## Completed calculator release

- [x] Support bounded calculator questions while preserving original spans, full validation and uncertainty.
- [x] Lead the playground with calculations and visible steps; keep schedule support discoverable.
- [x] Fresh blind arithmetic probes, full tests, production browser journeys and deployment dry run.
- [x] Merged PR #5 as `de265f0`; deployed version `7e6b8cbf-63cb-4beb-b4d0-c1a3884d9b13`. Both hostnames and three-browser live calculation/correction/complete-copy checks pass.

## Synthetic diagnostic lane

- [x] Run separate blind case-author, oracle-review and public-SDK developer subagents. Freeze 12 cases and capture both engines’ raw output.
- [x] Check clarification branches and distinguish semantic mismatch from successful resolution. [Report and reusable runner](comparison/agent-evaluation/README.md).
- [ ] Triage timer/title interpretation, misleading duration diagnostic and complete-output validation wording. No parser fixes or feature expansion in this pass.

This lane does not satisfy independent human evaluation. Cursor is installed but logged out; Ollama is available but was not loaded.

## Active decision gate

- [x] Narrow project and README to the explainable engine; preserve current supported behavior.
- [x] Define independent task protocol, continuation thresholds and maintenance/stop condition.
- [x] Inspect timezone guarantees and probe host differences: 10 disagreements and 17 unavailable historical samples; no correctness verdict from this comparison.
- [x] Prepare [independent evaluation handoff](comparison/independent-evaluation/README.md), empty case/observation templates and candidate identity. No study outcomes are claimed.
- [ ] Independent author/reviewer and six unfamiliar participants: unavailable. No messages sent.
- [ ] Run frozen complete-task evaluation; decide whether to continue, focus on arithmetic, or maintain/archive.

Next action: arrange independent evaluation. Until then, limit code work to demonstrated correctness failures or regressions; no new feature families or timezone replacement.

## Milestones

### Completed size-pruning pass

- [x] Preserve the dirty worktree in a source archive and capture bundle/dependency baseline under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-pruning`.
- [x] Trace imports; remove unused UI scaffolding, orphan hooks and the inactive React Router shell. Keep the Redwood application and public engine intact.
- [x] Remove dependencies used only by deleted files; verify lockfile changes do not upgrade retained packages.
- [x] Measure page delivery duplication and test a smaller delivery strategy while preserving offline-after-load behavior.
- [x] Verify complete journeys, keyboard/layout, copy/export and offline output; record measured size changes and remaining costs.

Fresh [bundle comparison](docs/bundle-comparison.md): core 151,938 gzip bytes versus gpu-time 0.3.0 at 53,272 (2.85x). Registry version checked; isolated consumer only. Calendar integration adds 6,104 gzip bytes. No new timing claims.

Pruning evidence: [size report](docs/size-pruning.md). Removed 35 direct dependencies; CSS is 69% smaller raw. Rejected separate Worker delivery after its first offline preparation failed. Final three-browser journeys and separate file readers pass. No external release actions.

### Completed engine consolidation

- [x] Inspect current checkout, product matrix, release records and SDK/app boundaries; preserve earlier work.
- [x] Route parsing, clarification and preparation through public engine contracts. Hosts retain rendering, Worker lifecycle, clock/UUID capture, copying and downloads.
- [x] Remove repeated context snapshots, the redundant finite-preview pass and the app's synthetic calculation prop. Share selection validation. Keep recurrence recognition/iteration together rather than add an unnecessary pipeline.
- [x] Classify legacy IDs into typed decision families and apply explicit invalidation rules. Preserve the public selection shape. Twelve dependency cases and 1,296 representative before/after selection combinations pass.
- [x] Verify candidate archive `0d1d2ddb` against the production playground in three browsers: arithmetic/trace, corrected date, complete DST-corrected recurrence/JSON/file, negation/cancellation/unsupported input and stale answers. Compare full results and file semantics; separately expand dates and durations.
- [x] Replay final Worker lifecycle, offline-after-load and keyboard journeys; separate Python readers pass nine downloads. No actual calendar-client import is claimed.
- [x] Profile installed archives before/after and report startup, parsing, batches, correction, file preparation, bundle and memory tradeoffs. Finite export improves; mixed single-input median worsens and combined gzip grows 581 bytes. No general speed or superiority claim.
- [x] Finish final diff, artifact-identity and check audit. Emitted archive files match current code; packed manifest differs only by the final newline. Final three-browser closeout replay passes against the production build. Dependencies, product matrix and deployment configuration are unchanged.

## Evidence and remaining gaps

[Architecture and contract](docs/engine-first.md), [current evidence report](docs/engine-consolidation-evidence.md), and [release checklist](docs/release-checklist.md) are the handoff. Raw local artifacts are in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-engine-consolidation`.

Final checks, types, lint and production build pass. Suite: 1,164 passing tests plus one existing expected failure concerning an independent reader's Chicago pre-DST instant conversion. The large client-chunk warning remains. This bounded consolidation is verified locally; no external release action was taken.

Physical devices, assistive-technology sessions, independently authored evaluation, unfamiliar users, peak-memory/energy measurements and actual calendar-client imports remain separate unavailable evidence. Existing ongoing-export policy restrictions remain. No recognition features, dependency upgrades or framework/language changes were introduced.

Earlier delivery records are preserved in [task history](task-history.md); their authority does not apply to this local-only work.
