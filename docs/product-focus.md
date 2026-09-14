# Product focus and decision gate

Tempus is an explainable date engine. Its primary job is to calculate dates from short English instructions, expose assumptions and let a person correct an uncertain interpretation. The website demonstrates this contract. Applications using the engine own reminders, accounts and external actions.

Stop pursuing replacement of gpu-time across every marketed use case. Keep supported interval and recurrence behavior working, but freeze new language families, export formats, framework changes and competitive feature parity until evaluation justifies them. Fix incorrect accepted results, broken correction and regressions within the existing contract. Do not delete supported behavior as an incidental cleanup.

## What earns continued development

Use the [independent evaluation handoff](../comparison/independent-evaluation/README.md), empty recording templates and candidate identity. These are prepared; recruitment and the study remain pending.

Run one small decision study before more feature work. This is a practical investment gate, not a statistically representative superiority claim.

- Recruit six unfamiliar intended users: three people who calculate dates and three developers integrating date input. Recruitment and messages require separate authorization; no participants are currently arranged.
- Have a person who did not implement Tempus author 24 tasks before seeing parser outputs: eight date calculations, eight short date/schedule interpretations and eight ambiguity, correction or unsupported-input tasks. Include inconvenient cases for Tempus. Our existing fixtures are regression tests, not this holdout.
- Independently establish expected dates, timezone/reference, accepted interpretations and required clarifications. Freeze the cases, oracle and package hashes before running. The author keeps the holdout inaccessible to implementation work until the evaluation. Disagreements go to a second reviewer; do not choose the answer that favors either engine.
- Compare Tempus and gpu-time 0.3.0 on shared interpretation tasks with the same context and output requirements. Separately evaluate Tempus arithmetic against participants' usual method. Do not count a feature absent from gpu-time as a wrong parser answer. For UI comparisons use equivalent thin interfaces, or explicitly label the result as a comparison of the supplied products and interfaces.
- Give each participant six tasks in balanced tool order. Record unassisted correct completion, unresolved results, confidently wrong accepted results, correction attempts, time, confusion and the final usable output. Record developer integration time and changes needed separately. Consent to any recording; use invented event text and no real calendar writes.

Proceed with bounded engine work only if at least four of six participants complete five of their six tasks correctly without coaching, at least four can identify a specific useful benefit in their work and choose to use Tempus again, and no silently incorrect accepted result remains unresolved in the study. These are provisional go/no-go thresholds, not published accuracy estimates. Report raw counts and failures even if the gate passes.

If useful benefit is confined to arithmetic, retain a small calculator and maintain existing SDK compatibility; do not expand scheduling. If the gate fails, permit one bounded repair pass only when the observed failure has a clear fix, then repeat with fresh tasks and unfamiliar participants. If that also fails, stop feature development and choose maintenance-only or archival. Until people and independent cases are available, the gate is pending; more authored tests cannot satisfy it.

## Timezone decision

Keep the current implementation while evaluating the tradeoff. Pinned rules buy reproducible offsets across host database versions, not guaranteed perpetual correctness. Updating rules remains a maintenance responsibility.

Source inspection shows core offsets come from bundled IANA 2026d data; Temporal supplies calendar/instant operations. Host Intl supplies labels only when civil fields agree, otherwise the UI falls back to a numeric offset. The decoder caches at most 64 distinct zone files. Removing the data is a change to the interpretation contract, not just packaging.

A local Node 26.8.1 probe (host timezone database 2026a) checked six dates across 597 bundled zone names: 3,565 comparable samples, 10 offset disagreements, no host-unsupported names and 17 samples where pinned historical data was unavailable. Examples include a one-hour 2027 offset difference in Casablanca and Edmonton. These differences need an independent rules oracle before assigning correctness. The historical failures also show why bundled data must not be described as universal coverage.

Reproduce with `pnpm build:sdk` and `node comparison/performance/timezone-host.mjs NEW-REPORT.json`. Evidence: `/Users/mylescook/Documents/Codex/2026-09-13-tempus-focus/timezone-host.json`. Six sampled dates do not cover transition boundaries, browser versions or real user demand.

Before adopting host rules, measure actual savings in a disposable integration, compare DST gaps/folds, aliases, historical limits and recurrence files across supported runtimes, and obtain an explicit decision about version-dependent results. Do not add a second timezone backend or a new package solely to experiment. Keep trace, correction and offline-after-load behavior intact. Physical-device coverage and independent timezone adjudication remain missing.

## Release status

Local and unreleased. Public API stability, independent evaluation and actual calendar-client imports remain open. A small bundle alone is not the release gate. The existing matrix is retained as a capability inventory; its broad competitor-parity requirements are no longer the development backlog.
