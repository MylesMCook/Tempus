# Synthetic agent evaluation

This lane uses agents as adversarial case authors and simulated developers. It does not replace independent people, validate accessibility or measure user comprehension. Keep its results separate from `independent-evaluation`; the six-person release gate remains pending.

## Run and roles

1. Start a fresh-context case-author agent with only the intended task families, timezone, reference and a 200-character limit. Deny access to implementation, docs, regression fixtures and parser outputs. Ask for inputs, expected behavior, acceptable abstentions and explicit expected instants where justified.
2. Freeze the case file before execution. Assign a separate fresh-context oracle reviewer who sees only that file and context. Have it verify dates with another method and flag ambiguous scoring or coverage gaps. Both roles remain model-generated evidence; separation reduces output-driven case selection but does not establish human independence or remove model correlation.
3. Run the public installed SDK and comparator using the command below. Preserve raw outputs, exceptions, context, case hash, entry hashes and consumer lock hash in a new directory. The runner blocks fetch, forces gpu-time CPU, never writes calendars and does not grade correctness automatically.
4. Assign a separate simulated developer to the public README, declarations and installed package only. Record its mistakes as well as product friction. Do not let it inspect private implementation or silently fix the product.
5. Review the oracle and results manually. Distinguish correct immediate output, assisted/clarified recovery, safe abstention, semantic mismatch and wrong acceptance. Follow clarification branches separately; never count a resolved status alone as task completion. Record edited inputs as exploratory cases, not replacements for the frozen ones.

```sh
node comparison/agent-evaluation/run.mjs   comparison/agent-evaluation/cases-v1.json   /absolute/path/to/installed-consumer   /absolute/path/to/new-output
```

The consumer must contain `@tempus-date/core`, `gpu-time` and a `pnpm-lock.yaml`. The pilot used Tempus archive `0d1d2ddb` and gpu-time 0.3.0. Context is explicitly fixed in the runner at September 13, 2026 15:00 UTC, America/Chicago; gpu-time previews up to three occurrences. If context changes, author and freeze a new corpus. Full occurrence preparation is an additional Tempus lane, not an equivalent preview-size comparison.

## First run

Twelve frozen agent-authored cases: four arithmetic, four date/schedule and four ambiguity/correction/negation. The separate agent reviewer verified all nine specified instants with Python zoneinfo. It also flagged rubric issues and incomplete coverage: the schedule group contains date points, not recurrence or ranges. Permitting abstention avoids rewarding wrong acceptance, but must not turn abstention into successful completion.

Tempus initially returned two title clarifications, eight unsupported results and two no-expression results. None immediately resolved. All eight unambiguous arithmetic/date inputs produced gpu-time instants matching the authored expected instants; that is a result for these sentences, not an overall ranking.

Following Tempus's offered title confirmations resolved “Remind me in 90 minutes.” to the expected point. “Set a timer for 36 hours from now.” became an interval from now to the expected deadline, rather than the requested point-shaped timer target. That is a semantic mismatch for the authored task, despite correct endpoint arithmetic; the title question does not resolve that distinction. Neither case creates an actual reminder or timer.

The three documentation-led developer tasks passed: inspectable arithmetic, numeric-date clarification and complete five-occurrence output. Initial ESM resolution mistakes were harness errors, not SDK defects. The agent needed to navigate declarations and observed documentation/output ambiguity.

## Findings to triage before new features

- **Interpretation/recovery:** confirming an event title can resolve a timer-shaped request as an interval. Review whether the choice explains the resulting shape; do not infer success from `resolved`.
- **Misleading diagnostic:** “Book it for 9/10/2026 at noon.” asks how long the event should last, rather than reaching numeric-date ambiguity. Investigate the existing duration recognizer before proposing broader language support.
- **Usability limitation:** ordinary questions, introductory words, redundant weekday/date information and explicit “in Chicago” wording often abstain. These are coverage limits in this corpus, not authorization to expand the grammar while the feature freeze is active. Some diagnostics demand date-only text despite the broader product promise.
- **Public contract clarity:** recommended `prepareCalendar` is absent from the README export table; complete finite output still contains `validation: "preview-only"`; the README lacks a worked trace-access example. Audit the field's actual meaning before changing a public wire value.
- **Comparator caution:** gpu-time returned an event for a negated, underspecified request and silently chose one numeric-date interpretation without a supplied date-order policy. Its `Next Friday at 3` result did include an AM/PM diagnostic; do not describe that assumption as undisclosed.

Raw cases, reviewer report, per-engine results, clarification branches and developer executable/report are retained under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-agent-eval`. They contain no human participants or calendar imports. Engine code was not changed in this evaluation.

## Other runners available

Cursor CLI version `2026.07.08-0c04a8a` is installed but reports not logged in. Ollama 0.33.3 responds and lists installed models; no model was loaded by this pass. No auth change, model download or service reconfiguration was performed. The executed pilot used Codex subagents. A later cross-model pass can use Ollama with the same separated roles, but small or weak models are stress generators, not reliable proxies for inexperienced people. Review their expected answers before blaming the engine.
