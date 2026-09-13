# Independent evaluation protocol — draft 1

**Status: pilot required; not frozen; no holdout has been opened.** The [product matrix](../../docs/product-matrix.md) remains the acceptance contract. This document specifies the evaluation handoff; it does not certify Tempus or replace missing capability gates.

## Claims to evaluate

Evaluate these jobs separately. Do not combine their results into a universal winner.

| Job                  | Compared result                                                                          | Required interpretation                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Short reminder field | Correct event text and complete date/time, including a chosen interpretation when needed | A usable reminder candidate; a rejected valid reminder is not completion                                    |
| Schedule form        | Every requested interval or occurrence rule, boundaries and exceptions                   | Preserve the whole schedule; a three-row preview is not a validated recurring rule                          |
| Command bar          | Correct direct result or completed correction with original input retained               | Report first-pass parsing and corrected completion separately                                               |
| Original calculator  | Strict v2 result and inspectable arithmetic trace                                        | Protected regression gate; do not market a competitor advantage for arithmetic outside its documented scope |

Library-only comparison uses the same input/context and normalized output contract. Interactive comparison uses a declared integration for each library. If a product lacks a correction UI, do not silently supply an LLM or hand-correct its output: report native capability and separately evaluate a documented caller-built correction flow. Keep implementation effort and dependencies visible.

## Gold interpretation before engine output

An evaluator independent of implementation writes and adjudicates expectations before running either engine. The evaluator must not use either engine as the oracle. A second reviewer checks consequential distinctions: valid/invalid/ambiguous intent, date order, all-day meaning, range endpoints, recurrence, duration and exceptions. Disagreement is retained and adjudicated with a written reason.

Each case records:

- Stable ID, user job, semantic family, language, provenance and paraphrase/template cluster. Variants of one phrase stay in the same development/holdout partition.
- Original text; explicit reference instant, timezone and pinned timezone-data revision. No machine clock or local timezone defaults.
- Intent class: one unambiguous result, multiple acceptable interpretations requiring a choice, invalid request, or no temporal request.
- Original event text and temporal/event spans; punctuation/whitespace normalization permitted by the contract. Store meaningful qualifiers separately so dropping one cannot count as success.
- Date-only values as civil dates, not invented midnight instants. Timed points as exact instants; intervals as start and exclusive end; collections preserve each range and distinguish source order from chronological display order.
- A recurrence's frequency, interval, weekdays, clocks/duration semantics, inclusive source boundaries, excluded start dates and explicit clock choices. Record finite completeness and whether the user's request has an end; do not add one for evaluation convenience.
- Acceptable clarification question/alternatives and the prescribed user intent used to answer. IDs may differ between engines; meaning must match. Mark unsupported or unselectable questions as unfinished.
- Expected usable artifact, if applicable: copy value, complete event set or calendar rule. Required UTC/civil endpoints and recurrence checkpoints come from independently specified semantics.

For arithmetic, the oracle states operation order, clamping, calendar versus elapsed units, fractional remainder policy and every trace step. Correct final timestamps with wrong intermediate reasoning fail trace fidelity. Keep strict v2 evaluation separate from interpreted clarification.

Ambiguous numeric dates require a date-order choice unless an explicit locale policy removes ambiguity. Repeated or missing clocks require an explicit recorded choice or an agreed recurrence policy; do not accept a parser default as the user's intent. Negation, correction, uncertainty and conditional language must not become an unconditional event. Distinguish a documented policy disagreement from an implementation error, but keep both in the published denominator.

## Pilot and sample design

Use a new **development pilot** authored independently from current fixtures. Its cases become inspected development data after review. Pilot results select final budgets, stratification and sample size; they are not a holdout result.

The pilot must cover the three user jobs across dates, arithmetic, event-text extraction, ranges/durations, finite groups, recurrence/boundaries/exceptions, ambiguity/correction, and negative or conditional intent. Include ordinary inputs and known stress families. Template variants are clustered; many variants of one construction are not many independent examples.

Before obtaining holdout contents, the evaluator and product owner must fix and record:

| Decision           | What must be frozen                                                                                             | Current state                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Primary claims     | Exact job, capability scope and minimum useful advantage                                                        | Three job candidates above; no superiority claim approved                                        |
| Sample allocation  | Cases per job/family/intent stratum; cluster counts; exclusion criteria; power/precision justification          | Missing independent pilot                                                                        |
| Error tolerance    | Wrong-accept and valid-abstention limits by job; regression margins                                             | Not agreed; do not infer a tolerance from current scores                                         |
| Uncertainty        | Paired comparison method, confidence level, cluster handling and multiple-claim correction                      | Must be reviewed before holdout; no inferential ranking from the 31-case corpus                  |
| Task study         | Participants, devices, task assignment, counterbalancing, timeout, success definition and sample-size rationale | No participants or physical devices available                                                    |
| Resource budgets   | Cold/warm p95, batch limits, memory and download cost for designated devices; measurement method                | Desktop baseline exists; mobile pilot missing                                                    |
| Export scope       | File semantics, recurrence horizon/checkpoints, clients/versions, import checks and acceptable failure handling | Unbounded DST and actual import gates remain open                                                |
| Execution identity | Exact package/model/tokenizer/data hashes, adapters, scripts, runtime versions, seed, OS/device and browser     | Current Tempus archive and pinned gpu-time are baseline candidates, not a frozen evaluation pair |

Set sample sizes for the claim, not for an attractive workload size. Report uncertainty even with zero observed failures. Do not choose margins after seeing holdout differences. If a planned analysis cannot support its intended claim, report it as exploratory rather than substituting a stronger claim.

## Outcome accounting

Record one primary first-pass outcome per input: complete correct result, correct unresolved/rejection, valid abstention, wrong accepted result, or runtime error. Also record structured reasons and policy disagreements. Then record a separate interactive outcome; an initially ambiguous result can become a completed task only after the prescribed correction yields the complete correct result.

Publish by job and semantic family:

- Complete first-pass resolved results / all valid unambiguous requests.
- Wrong accepted results / all requests **and** / accepted results. Show negative/ambiguous-subset acceptance separately.
- Unresolved valid requests / all valid requests, split by missing capability, legitimate ambiguity and runtime failure.
- Correct completed corrections / correction tasks attempted; correct usable outputs / all tasks attempted. Include cancellations, timeouts and unanswered questions.
- Task time, interactions, restart/edit effort and abandoned tasks. Report distributions, not only means. Do not measure successful tasks alone.
- All-day, event-text/span, qualifier, interval-completeness and recurrence-semantic failures separately from timestamp errors.
- Version/policy disagreements alongside implementation errors. Publish subgroup counts and denominators before any aggregate; disclose the aggregation weights.

An engine exception cannot become a correct rejection. A valid schedule with an empty upcoming set differs from an unrecognized phrase. A correct first preview does not establish recurrence fidelity. The current `comparison/scoring.ts` output is a narrower development metric: its legacy timestamp grade and additional explicit all-day-flag grade cannot produce these full-semantic or task-completion claims unchanged.

## Export and performance evidence

Validate generated file bytes independently of both application and serializer. Check all finite events and exact endpoints, all-day exclusive ends, UIDs, escaping, line folding, exceptions and completeness. For ongoing rules, use independently specified nearby/distant checkpoints and transition boundaries, then actual client imports. Document what remains outside the tested range. Neither agreeing readers nor valid syntax establishes calendar-client behavior.

Use disposable calendar-client tests only with explicit authorization. Keep file generation, actual saved browser download and actual client import as separate recorded stages. Capture the imported date, timezone, all-day status, duration, recurrence and exclusions; a successful import dialog alone is insufficient.

Benchmark the installed artifact, not a workspace alias. Run the same inputs, result contract and occurrence count on both engines; report correctness of timed outputs. Separate import/model loading, initialization, first result, warm single calls and batches. Record cache state, CPU/GPU selection, model download, compressed bundle bytes, process/peak memory method and device details. Alternate engine order; preserve raw samples. Desktop viewport emulation is not mobile runtime, battery or device evidence. Process snapshots after garbage collection are not peak library memory.

## Freeze, custody and reopening

1. Complete the development pilot and settle every missing decision above. Keep current known failures open.
2. Freeze a versioned protocol, claim list, adapters and artifact hashes. Record who reviewed it and when; an agent-generated hash does not establish independent review.
3. An independent custodian creates and hashes the holdout without exposing its inputs or answers to implementation work. Check overlap and paraphrase clusters against development data. Do not put hidden cases in the implementation checkout.
4. Run the frozen comparison once under the planned procedure. Preserve raw outputs, failures and interrupted runs. No selecting the best run after inspection.
5. Publish scoped results only after the capability and evidence gates for that claim pass. Get authorization before any external publication.
6. If implementation inspects a holdout case to fix it, retire that case/cluster into development data. Amend the protocol visibly, freeze new artifacts and obtain replacement unseen data before a new confirmatory evaluation. Preserve the old report.

No independent custodian, evaluator, physical device or authorized calendar import is currently available. The smallest handoff is: assign an evaluator/custodian, run the development pilot, agree on the freeze table, and provide designated device/client access. Until then this remains a draft, and independent superiority claims remain blocked. Local parser, journey, artifact and export work can continue.
