# Independent evaluation handoff

Status: ready for an independent author and facilitator. No independent cases, participants or results exist yet. The active product decision is to maintain the explainable engine, keep existing timezone behavior and pause new feature families. This study decides whether further development earns its cost.

## Before sessions

1. Assign a task author who did not implement Tempus, a separate expected-result reviewer, and a facilitator. Recruit three unfamiliar date-calculation users and three unfamiliar developers. Obtain consent before recording; invented event text is sufficient. Keep participant identities and recordings out of this public repository.
2. The author writes 24 cases: eight arithmetic, eight date/schedule interpretations, eight ambiguity/correction/unsupported inputs. Use the columns in `cases-template.csv`. Keep the completed cases and oracle outside the implementation checkout until the study. Do not seed them with our regression fixtures or tune them after looking at parser answers.
3. The reviewer checks each expected answer against a separately chosen method and records the source or derivation, timezone rules version and acceptable policy alternatives. Unresolved oracle disagreements exclude the case before execution and require a replacement; retain the exclusion record.
4. Assign six Tempus tasks per participant in advance, covering at least two of each family. Across six participants, use all 24 cases, with 12 repeated assignments. Shared interpretation tasks can compare against gpu-time; arithmetic compares against the person's usual method. The author supplies matched variants to limit answer memorization. Alternate tool order by participant. Do not score a missing competitor capability as an incorrect interpretation.
5. Freeze the cases, assignments, oracle, interfaces and artifacts with SHA-256 before showing outputs. `candidate.json` records the current SDK candidate, not a completed study freeze. Record the exact playground build separately: an SDK hash does not identify served UI assets. Keep tools unchanged throughout sessions.

## During sessions

Read the task without suggesting a phrase or explaining the UI. Let the participant inspect, correct and obtain usable output. Stop at completion, abandonment, or a predeclared five-minute task limit. A facilitator may intervene to prevent a real external action; record intervention and mark completion as assisted. Do not write real calendars.

Use `observations-template.csv`: one row per participant/task/tool attempt. Record exact final structured output in a separate file linked by the row. A correct answer requires the independently specified dates, timezone, bounds and event text, or an appropriate unresolved/clarification result when the task requires it. Count confidently accepted wrong outputs separately from abstentions. Merely displaying the right answer is not proof the participant understood or used it.

Record integration setup time and code changes separately from the six task attempts. After the tasks, ask: “Where would this help in your own work?”, “What was confusing?”, and “Would you choose to use this again? Why?” Preserve answers, including negative ones. Do not solicit a favorable comparison.

Compare product interfaces only as provided unless equivalent interfaces were frozen. Do not attribute a UI advantage to parser accuracy. Record device, browser, keyboard/touch input and any assistive technology actually used. Desktop viewport sizes do not count as phone sessions. Calendar-file validation and actual client import remain separate.

## Make the decision

The six-task completion threshold applies to each participant's Tempus attempts; comparator attempts are reported separately. The provisional continuation gate requires at least four of six participants to finish at least five of six tasks correctly without coaching, at least four to describe a concrete benefit and choose Tempus again, and no unresolved silently wrong accepted result. Report both three-person cohorts separately; pooled success must not conceal developer failure. These small-sample thresholds are investment decisions, not population estimates.

- Benefit across intended uses: choose only the next bounded improvement supported by observed failures.
- Benefit confined to arithmetic: keep a focused calculator and existing SDK compatibility; do not expand scheduling.
- Gate fails with a specific repairable cause: allow one bounded repair and rerun with fresh independent cases and participants.
- Second failure, or no meaningful benefit: recommend maintenance-only or archival to the owner. Do not delete the repo or disable production as an automatic consequence.
- Missing participants or cases: pending. Do not invent observations or treat internal tests as substitutes.

See [product focus](../../docs/product-focus.md) for scope and [release checklist](../../docs/release-checklist.md) for other unresolved evidence. This packet is local preparation; it authorizes no recruitment messages, publication or deployment.
