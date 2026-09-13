# Review evidence

Current archive 7d1907c6: [Node/TypeScript and archive diff](precision-sdk/README.md), [direct browser/Worker precision journeys and readback](precision-runtimes/README.md). Prior reports retain their original scope.

Latest source delta: [mixed-month shared-year reminder](mixed-month/README.md) passes main-app correction/download/edit and independent file readback. The [packed candidate](mixed-month-sdk/README.md) and [19-task corpus](mixed-month-journeys/README.md) now pass their recorded checks; older snapshots keep their original scope.

[Current retained development snapshot](year-journeys/README.md): 31 inspected comparison cases and 18 scripted correction-to-file journeys, including explicit shared-year recovery. [Independent readback](year-journey-readback.json) matches all eighteen retained files; its strict command still fails the separate duration fixture. Paths in that reader report are repository-relative; its original report hash is retained. The snapshot manifest covers the exported comparison/journey files; the separate reader report records their matching hashes.

[Historical 17-task snapshot](shorthand-development/README.md): 31 inspected comparison cases, 17 scripted correction tasks and their validated calendar files. The reports include failures, abstentions, raw stages, limitations and source hashes. They are not an independent evaluation or a calendar-client import.

[Monthly compatibility snapshot](monthly-compatibility/README.md) retains both failing single-series candidates and the passing two-series diagnostic, with exact calendar files, expected dates, reader reports, source hashes and reproduction commands. It does not enable either export or establish client compatibility.

[Packed Node evidence](packed-node/README.md) records clean packed installations, five integration examples and installed declaration checks on Node 22/26. The repository now contains the runner; browser execution has its own scoped evidence below.

[Packed Worker evidence](packed-worker/README.md) retains a reproducible installed-SDK diagnostic, all seven failure paths and independent readback of three complete files. This covers local workerd only.

[Packed browser evidence](packed-browser/README.md) retains six desktop browser/viewport runs and twelve independently read downloads. It covers the developer calendar example, not main-app usability or physical devices.

[Packed keyboard traversal](packed-keyboard/README.md) retains the stronger check and its failures: Chrome/Firefox pass, WebKit skips clarification buttons at both viewport widths. Earlier direct-focus evidence does not close this gate.

[Explicit WebKit Option-Tab evidence](packed-option-tab/README.md) includes a minimal native-form control, all six passing journeys and twelve independently read downloads. It preserves the ordinary-Tab failures and does not verify actual Safari or device settings.

[Readable SDK example](readable-sdk/README.md) retains the updated presentation, six browser runs, twelve independently read files and a narrow-screen screenshot. Current consumer hashes differ from the earlier JSON-first example; SDK bytes are unchanged.

[Exact-duration control](duration-control/README.md) preserves the historical fixture and a PRODID-corrected version. Both pinned readers retain the same duration mismatch; the commands fail explicitly.

[Current SDK documentation candidate](sdk-contract-docs/README.md) records archive e2293d2d, its README-only difference from 4ec18030 and fresh Node/declaration/snippet checks. Prior runtime reports retain their original artifact scope.

[Shared-year clarification](year-choice/README.md) retains the current main-app correction-to-file journey and independent readback. Source is ahead of packed candidate e2293d2d; runtime verification remains pending.

[Current shared-year SDK candidate](year-sdk/README.md) records archive 906f3a6f, Node 22/26, browser/Worker correction journeys and fifteen independently read files. Earlier source-ahead/package-pending notes retain historical scope.

[Current packed performance](performance-year/README.md) retains Node/Chrome samples, bundle cost, memory snapshots and the exact four-case workload scope. gpu-time leads startup/batches/size; the mixed single-call result is reported without a general speed claim.

Generated working reports under `comparison/results/` remain ignored. This directory contains selected immutable snapshots intended for repository review. They are currently local, uncommitted files; creating a snapshot does not publish it.

```sh
# Generate current results from the checked-out implementation.
pnpm install --frozen-lockfile
pnpm exec vp test run comparison/comparison.test.ts comparison/scoring.test.ts comparison/journeys.test.ts

# Refuses stale source reports or an existing destination.
node comparison/export-evidence.mjs export comparison/evidence/NEW-name

# Checks retained file bytes against the manifest, without running a parser.
node comparison/export-evidence.mjs verify comparison/evidence/shorthand-development
```

Hashes identify content; they are not signatures, independent expected answers or proof that a historical snapshot describes current source. Review the source hashes and corpus policy alongside the results. Exact JSON/Markdown report bytes are excluded from automatic formatting; use the manifest check instead. Do not edit a snapshot to match later code or reformat its raw reports. Generate a new one and retain the previous record.

The snapshot does not yet preserve every separate SDK/browser, performance, timezone or diagnostic-reader artifact described in the release log. Those remain documented reproduction/evidence gaps. In particular, the known ongoing-export reader failures and missing device/client/evaluator access remain open release gates.
