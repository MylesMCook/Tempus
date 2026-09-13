# Tempus development

Use the [product matrix](product-matrix.md) for priorities, current capability gaps and acceptance gates. The comparison now runs gpu-time 0.2.1, with historical 0.2.0 evidence preserved. Implement intervals next against the [schedule contract](schedule-contract.md). Holdout governance and numerical evaluation budgets remain open.

The [local comparison](../comparison/README.md) is running. A bounded sentence recognizer now resolves three of the four existing sentence fixtures while the strict evaluator remains available unchanged. Tempus is a working name; this plan does not change the repository, package or domain names.

## Shipped: bounded sentence to one date

Make `Remind me to call Sam tomorrow at noon` return the intended date and highlight the words that determined it. Keep `call Sam` as event text. This interprets a reminder; it does not deliver one.

Implemented contract: interpretation version 1 returns complete points, intervals, finite weekday collections or bounded weekly recurrence, or an explicit unresolved status. Reminder labels now allow multiple words after a supported action, with a conservative temporal boundary and complete suffix validation. Numeric-date, point-clock and complete correction choices are selectable. The [product matrix](product-matrix.md) and [schedule contract](schedule-contract.md) record remaining coverage and evidence gates.

1. Define a new interpretation contract alongside the existing v2 calculator: resolved, needs clarification, no expression, or unsupported. Resolved values must distinguish points, intervals and recurring schedules. Include source spans and explicit assumptions.
2. Implement one sentence-to-date path with the current calendar evaluator. Preserve strict arithmetic behavior and source spans. Compare recognition approaches against the same fixtures before adding a model or another parsing dependency.
3. Add cases for punctuation, negation, corrections, multiple date mentions and unknown words. Show a useful clarification or explicit limitation when recognition is incomplete; do not silently discard an operation.
4. Verify the browser flow, keyboard access, narrow screens and recovery without losing the input. Show the understood date and timezone beside the result, with details behind a disclosure.

Acceptance: all protected arithmetic cases still pass; the new sentence cases resolve completely; cancelled instructions never become suggested events in the acceptance fixtures; existing API clients retain v2 behavior. Add independent variations before implementation and keep a separate evaluation process for future public accuracy claims.

## Following milestones

- Intervals and durations, including overnight ranges, multiple weekday groups and the difference between `for three days from today` and `three days from today`.
- Recurrence, boundaries and exceptions, with previews and independently checked calendar exports.
- A supported TypeScript package for browsers, Node and Workers, plus a runnable integration example and explicit resource limits.
- Browser/device performance, independent language evaluation and user task-completion evidence. Publish supported workloads and remaining failures before making comparative claims.

Use measured constraints to decide whether a language or framework change is needed. The initial source review provides no reason to replace the current TypeScript calendar evaluator.
