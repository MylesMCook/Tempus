# Arithmetic overlap with gpu-time 0.3.0

Direct CPU probes on September 13, 2026 show that gpu-time shares more calendar arithmetic with Tempus than the five protected anchored-expression cases establish. Do not describe ordered arithmetic or month-end clamping as exclusive Tempus capabilities.

The initial 12 inputs used Tempus's installed candidate and gpu-time 0.3.0 with the same reference/timezone. Five protected arithmetic expressions resolved in Tempus and returned no occurrence in gpu-time. Nine exploratory gpu-time follow-ups then tested alternative wording; these were chosen after seeing outputs and are not a holdout or a scored benchmark.

| Behavior                                                                         | Observed gpu-time result                                                |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `3 weeks ago`, `in 90 minutes`, `2 hours and 15 minutes ago`                     | Matched Tempus instants                                                 |
| `in 1.5 hours`                                                                   | Matched Tempus instant; fractional arithmetic is not universally absent |
| `in 1 day` versus `in 24 hours` across Chicago spring DST                        | Matched Tempus: noon versus 1 PM the next day                           |
| `in 1 month` from January 31, 2026 noon Chicago                                  | February 28 noon; clamps month end                                      |
| `in 1 month and 1 month` from that reference                                     | March 28 noon; applies clamping per operation                           |
| `in 2 days and 1 month` from January 30 noon                                     | March 1 noon                                                            |
| `in 1 month and 2 days` from January 30 noon                                     | March 2 noon; written order matters                                     |
| `jan 30 2026 plus 2 days plus 1 month` and reversed order                        | No occurrence; conflicting-duration diagnostics                         |
| `jan 31 2026 plus 1 month plus 1 month`                                          | No occurrence; conflicting-duration diagnostic                          |
| `one and a half weeks ago`, `0.01 days`                                          | No occurrence; Tempus resolved these protected expressions              |
| `1.5 weeks ago`, `in 0.01 days`, `in half a day`, `in 1.5 days`, `in 1.5 months` | No occurrence in exploratory probes                                     |

The relative-anchor follow-ups preserve noon while the protected explicit date expressions start at midnight. Their dates demonstrate ordered calendar behavior, but their timestamps must not be scored as identical-input matches. Likewise, `2 days before October 1 2026` matched the instant but differed in all-day metadata between the two outputs; instant equality does not establish complete semantic equivalence.

The public gpu-time result exposes occurrences, recurrence rules, spans, diagnostics and timings, not Tempus-style before/after arithmetic steps. Its [README](https://github.com/arikchakma/gpu-time) describes model recognition followed by a TypeScript calendar resolver and no public AST/token-label output. This is a different explanation contract, not evidence that its resolver cannot calculate dates.

Raw inputs, full outputs and the initial reproducible runner are retained at `/Users/mylescook/Documents/Codex/2026-09-13-tempus-arithmetic-comparison`: `run.mjs`, `results.json`, `followups.json`, `order-followups.json`. Registry latest was checked as 0.3.0. Package/runtime paths are recorded in the runner; no dependencies changed or external actions occurred.

Conclusion: Tempus's tested distinctions are anchored calculator grammar, the tested fractional day/week expressions and inspectable arithmetic steps. General relative arithmetic, DST-aware day/hour semantics, written-order shifts and month-end clamping already overlap. These bounded probes neither establish full equivalence nor overall superiority.
