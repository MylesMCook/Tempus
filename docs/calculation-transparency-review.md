# Calculation transparency review

2026-10-15. Cici (Claude Code) reviewed the complete trace component, its tests, engine types, six deterministic engine outputs, and a text description of the supplied screenshot. It did not operate a browser or inspect the whole application. Codex checked the recommendations against local source and additional engine outputs. The user subsequently approved implementation of these recommendations while preserving exact calculation values.

## Recommended improvements

1. **Explain calendar time versus elapsed time beside the affected step.** The trace shows UTC offsets, but leaves the user to infer why adding one calendar day can mean 23 or 25 hours. Add a human-readable elapsed-hours line when the before/after offsets differ, using the existing timestamps. Retain exact From/To values, the offset note and the engine detail. First implementation scope: `StepEndpoints`/`StepNotes` in `src/features/parser/components/calculation-trace.tsx` and its tests; no engine or API change.
2. **Expose the reference used for relative dates.** The starting date is already visible; the captured reference instant is buried under Calculation inputs → Exact UTC values. Place a short reference label beside the starting date, worded as “Reference used,” rather than implying the clock is still live. Reuse existing pinned date-formatting helpers if presenting it locally. Cici's suggestion that local formatting necessarily duplicates timezone logic is unnecessary in this codebase.
3. **Give approximations the same prominence as clamps within the trace.** A fractional-month approximation is currently a muted step note. It deserves an explicit “Approximated” callout. Codex confirmed `DatePicker` already shows `calculation.warnings` in amber above the trace, so this is consistency at the affected step, not a missing global warning. Keep the documented conversion constant and rounding rule; avoid adding another redundant summary.
4. **State that each operation starts from the previous result.** Prefer “Each change applies to the previous result, in the order written.” For January 31 + one month + one month, show why the clamped February 28 becomes March 28. Preserve every intermediate date; do not replace the chain with a combined offset or invent counterfactual results.
5. **Stop presenting whitespace splits as semantic parsing.** `PhraseParts` uses `normalized.split(/\s+/)`. The “Recognized parts” chips do not identify anchors, quantities or operations. Prefer a single “Read as” line, retaining “Typed as” when normalization differs, rather than implying semantic token boundaries. This would change an existing tested presentation and needs approval.

## Verified examples

All use America/Chicago and a reference of `2026-10-15T17:00:00Z`.

| Expression                                | Actual result or explanation                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| today plus 2 weeks minus 3 days           | October 15 → October 29 → October 26; neither operation changes UTC offset                        |
| January 31 2026 plus 1 month plus 1 month | February 28, then March 28; first step contains a clamp note                                      |
| March 7 2026 at noon plus 1 day           | March 8 at noon; 23 elapsed hours                                                                 |
| March 7 2026 at noon plus 24 hours        | March 8 at 13:00; 24 elapsed hours                                                                |
| October 31 2026 at noon plus 1 day        | November 1 at noon; 25 elapsed hours; independently checked by Codex after Cici's review          |
| January 1 2026 plus 0.5 months            | January 16; approximation to 15 calendar days using 30.436875 days/month and nearest-day rounding |
| September 14 2026                         | No operations; starting date is the result                                                        |

## Approved acceptance

The user approved these scenarios with the recommendations. Coverage lives in `src/features/parser/components/calculation-trace.test.tsx` and `examples/app/verify-transparency.mjs`; verification status is recorded in `tasks.md`. They preserve the existing default-closed disclosures.

```gherkin
Scenario Outline: Explain elapsed time across the spring clock change
  Given I calculate "March 7 2026 at noon plus <amount>" in America/Chicago
  When I open the calculation steps
  Then the step says "Clocks go forward 1 hour during this step"
  And it shows "Actual time between these dates: <hours> hours."
  When I open Debug calculation
  Then the existing exact From and To values remain visible

  Examples:
    | amount   | hours |
    | 1 day    | 23    |
    | 24 hours | 24    |

Scenario: Explain the longer autumn calendar day
  Given I calculate "October 31 2026 at noon plus 1 day" in America/Chicago
  When I open the calculation steps
  Then the result remains November 1 at noon
  And the step says "Clocks go back 1 hour during this step"
  And it shows "Actual time between these dates: 25 hours."

Scenario: Keep ordinary calendar arithmetic concise
  Given I calculate "today plus 2 weeks minus 3 days" in America/Chicago using the October 15 reference
  Then the calculation disclosures are initially closed
  When I open the calculation steps
  Then the dates remain October 15, October 29 and October 26
  And neither step has an additional elapsed-time line
```

Elapsed wording retains a leading minus sign for subtraction and decomposes exact integer milliseconds into hours, minutes, seconds and milliseconds without rounding. The displayed From/To values and nested exact UTC values are retained. Every later step states which previous result it starts from, without guessing an operation type from note strings. Approximation callouts retain the original engine explanation and conversion constants. Cici's possible duplicate-note key finding was not demonstrated by the supplied outputs and is not treated as a confirmed defect.

Raw local review: `C:/Users/myles.cook/AppData/Local/Temp/tempus-cici-transparency-review-20261015.txt`. The helper exited successfully and returned the review; Claude also reported a cancelled SessionEnd hook and an unknown `MultiEdit` deny-rule warning. Neither is evidence of a UI/runtime check by Claude.

## Second design pass after user feedback

The user found the first implementation did not improve understanding. Cici's second rescue recommended a date ladder: readable date checkpoints, with each operation between the date it starts from and the date it produces. The final checkpoint is explicitly labeled Result. Exceptions stay beside the operation; after a month clamp, the next operation identifies the actual date it continues from. Ordinary technical notes and exact From/To pairs are grouped after the ladder. Dates use the existing pinned timezone formatter; clock labels retain seconds and milliseconds when present, and appear consistently across the ladder when any clock time or offset changes.

Cici recommended moving raw values to a disclosure. When asked about this change, the user directed Codex to the old debug option, which they preferred for its exact timestamps and richer calculation data. Codex inspected the January implementation at commit `39c7202`, especially `app/components/date-picker/DebugPanel/`. The refined design keeps the date ladder and restores an independently accessible Debug calculation panel. Both start closed. No engine data or API contract changes. Source-only Cici advice is not a browser usability result. Raw design response: `C:/Users/myles.cook/AppData/Local/Temp/tempus-cici-redesign-response.txt`.

Cici's follow-up source review identified the misaligned intermediate timeline dots; Codex corrected their containing block and checked screenshots. Its concern about reformatting snapshot instants was checked against `snapshot()` and `ZonedDate`: timestamps are numbers, and both snapshots and `safeFormatDate` use the same pinned timezone database. No second date parser was added. A real-engine repeated-hour test verifies that 1:30 AM CDT and 1:30 AM CST remain distinguishable, including their exact instants. The reference has a readable label beside the start and its full precision in the exact section. Follow-up review: `C:/Users/myles.cook/AppData/Local/Temp/tempus-cici-ladder-review-response.txt`.

## Historical debug UI and shadcn refinement

The user approved the ladder direction and requested the shadcn skill, then specifically pointed to the older debug UI. The historical layout grouped a debug summary, input analysis, base date, time operations and final result. The restored panel follows that structure using shadcn Card and Badge; primary exceptions use Alert. Sources came from the configured official shadcn registry via CLI and were adapted to the existing Tailwind 4 tokens. No project dependencies were added. The root TypeScript alias now lets shadcn find the existing component directory correctly.

Debug shows the actual engine version, timezone, captured reference, step count, warnings, original/normalized input, base snapshot, every before/after snapshot and original detail, final snapshot, and unchanged calculation JSON. Snapshots include local timestamps, UTC, offsets and epoch milliseconds. It does not recreate unsupported token categories, parser timings, historical settings or browser-derived calendar facts. The JSON block is height-limited and keyboard focusable. The initial restoration kept copying in Developer tools; the later direct comparison below added the approved in-panel copy action.

Cici reviewed this plan and recommended independent access to Debug calculation, one panel with grouped sections, visible warnings and no third disclosure for JSON. These were incorporated. Raw review: `C:/Users/myles.cook/AppData/Local/Temp/tempus-cici-debug-response.txt`.

```gherkin
Scenario: Inspect exact values within the walkthrough
  Given I have a resolved calculation
  And the calculation steps and Debug calculation are closed
  When I open the calculation steps
  And I open Debug calculation with the keyboard
  Then I see the reference, base date, ordered before/after values and final result
  And the local timestamps, UTC, offsets and epoch milliseconds match the engine
  And the warnings and raw JSON match the calculation
  When I close the calculation steps
  Then Debug calculation is hidden as well
```

The existing browser journey verifies this presentation at 320/1280px, including range and recurrence callers, and compares the entire debug JSON object with the SDK calculation. The old visible From/To assertions now explicitly open Debug calculation before checking the same values.

The independent-access design above was superseded by the user's later explicit request to nest Debug under the calculation steps. The current acceptance scenario reflects that request.

The final Cici source review identified an unnamed scrollable JSON region and excessive named section landmarks. The JSON now has a region role labeled by its visible heading; internal debug groups use headings without extra landmarks. Cici also raised a long-label overflow concern. A valid leading-zero amount reproduced overflow at 320px; wrapping the Badge and debug input fixed it, and that case remains in the browser journey. UTC labels and timestamp units were verified against the producer and browser assertions. Other ordinary engine notes are retained in Debug; successful operations do not produce gap/fold resolution notes in this engine, and actual warnings remain in the result UI and debug summary. Raw final review: `C:/Users/myles.cook/AppData/Local/Temp/tempus-cici-debug-final-response.txt`.

## Direct comparison with the historical panel

At the user's request, Cici compared the actual January `index.tsx`, `DebugSummary`, `CalculationSummary` and `TokenVisualization` sources with the current debug component and helpers. The bounded prompt was 23,962 characters, without automatic Git context. Cici had source only, not browser access. Raw comparison: `C:/Users/myles.cook/AppData/Local/Temp/tempus-cici-old-new-compare-response.txt`.

Implemented useful gaps: result UTC and exact signed total elapsed time in the summary; elapsed duration at each operation; weekday in the calculation timezone at every snapshot; explicit timezone labels; highlighted warnings, clamps and approximations inside Debug; explicit zero-step text; preserved engine-input whitespace and character count without the redundant Typed as line. Duration formatting reuses the existing BigInt helper, retaining negative values and milliseconds instead of the old floored, absolute-value totals. Repeated note strings have stable positional keys.

The user approved restoring Copy debug JSON with success, clipboard denial and stale-feedback acceptance. The button copies the same serialized calculation shown in the JSON region, without device data. A polite status reports success or manual-copy guidance. Feedback is tied to the serialized calculation, so changing inputs or a late completion cannot show feedback for different data. The browser runner first failed because this control/status was absent, then verified injected denial, real write/readback, exact write-argument equality with the displayed JSON, and cleared feedback on the next calculation. Windows clipboard CRLF normalization is handled only in readback comparison; the object and write argument remain exact.

Kept full From/To snapshots for inspection rather than collapsing repeated endpoints. Did not restore browser-derived calendar statistics, machine metadata, removed settings, fake token categories or unrecorded parse timing. The current failure variant lacks the old input/reference fields and has a separate error path; it was not expanded. Range and recurrence keep their existing per-date debug panels. No engine/API fields or dependencies changed.

```gherkin
Scenario: Copy the visible debug calculation
  Given Debug calculation is open for a resolved calculation
  When I copy debug JSON
  Then the clipboard contains the same calculation shown in the JSON region
  And the panel announces successful copying

Scenario: Recover from blocked clipboard access
  Given clipboard access is blocked
  When I copy debug JSON
  Then the panel shows manual-copy guidance
  When clipboard access succeeds on retry
  Then the visible calculation is copied successfully

Scenario: Keep copy feedback current
  Given I copied a debug calculation
  When I change the calculation
  Then feedback from the previous calculation is cleared
```

## Reference time versus selected date

The user identified “friday next week” as showing the wrong starting date and requested Debug inside the calculation-steps disclosure. With a captured reference of October 15, 2026 at noon in America/Chicago, the engine correctly resolves Friday, October 23 at midnight. Its `anchor` is the already-selected Friday, not the reference instant. The prior ladder labeled that value Starting date and hid the actual reference in secondary text, making selection look like the starting point.

The walkthrough keeps the reference time visible, then shows the date from the phrase and any arithmetic adjustments. A zero-arithmetic result has one Result checkpoint. After user feedback that the selection block was confusing, Cici recommended removing its instruction-style heading and raw engine description from the readable ladder. Those recorded rules remain unchanged in Debug. Ordinary recorded operation explanations are visible alongside the existing exception notes. No intermediate Mondays or unrecorded arithmetic are invented, and the engine/API/debug values are unchanged. Debug is nested under the same outer disclosure and hidden when it closes.

The regression test first failed because the reference-first selection explanation was absent. Browser coverage compares the complete reference/anchor/operation checkpoint sequence with the engine, distinguishes “friday next week” from “next friday,” and tests nested disclosure visibility. Current examples use the fixed October 15 reference, making the selected dates October 23 and October 16 respectively.

### Readable selection refinement

Cici reviewed the user-marked “Select the date / Use today … Start at midnight” block and recommended replacing it with one date row. Implemented that narrower presentation. Point precision and range/occurrence all-day metadata now control clock visibility, so date-only ladders omit default midnight while explicit midnight and “now” still show the clock. No language is reparsed and no selection operations are invented. Reference time remains visible, including for zero-arithmetic weekday selection. Debug stays nested, with its original descriptions, snapshots and JSON unchanged. Cici reviewed the supplied UI/data description without repository or browser access: `C:/Users/myles.cook/AppData/Local/Temp/tempus-cici-readable.txt`.

Verified after refinement: 33 component tests, full `pnpm validate` (71 files, 1225 passing tests and one existing expected failure, build and zero audit vulnerabilities), plus 32 cases each against dev and production preview at 320/1280px. Browser evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-readable-built-20261015`. Engine/API source diff remains empty; no publication.

## Taste and usability before motion

At the user's request, Claude applied Laws of Taste, then two Laws of UX lenses (Cognitive Load and Law of Proximity), before proposing the last microinteraction polish. Its bounded source/skill prompt was 28,135 characters; it did not inspect the browser or screenshots. Proposal: `C:/Users/myles.cook/AppData/Local/Temp/tempus-taste-ux-response.txt`.

Implemented the static proposal first: reference context sits above the arithmetic list; intermediate dates use a quieter size/weight; result retains the stronger size, badge and accent; neutral connectors stop competing with the result; operation notes sit closer to their resulting dates; supporting text is readable and grouped with Debug. These changes reduce competing focal points and use distance to clarify relationships. Exact values, date formats, explanatory notes, errors and debug content remain intact. Existing reference-first tests now assert the context before the list rather than treating reference time as an arithmetic list item. No assertions about the actual reference date or engine values were removed.

Only after component tests, 32 browser cases and desktop/mobile screenshot inspection passed, added the microinteraction: native opening reveals the trace and nested Debug over 160ms with a 4px lift; chevrons turn over 150ms. Closing remains immediate; no stagger, synthetic progress, timers, new state or dependencies. Reduced motion disables both reveal and chevron transition. Scoped CSS leaves other disclosures unchanged. The new browser assertion first failed on the old `t-enter` animation, then tests the scoped reveal, repeated Enter/Space toggles, immediate closing and reduced motion.

Claude's final source review found no static-layout blockers and confirmed selector precedence and reduced-motion coverage. Followed up its motion observations with native `[open]` selectors, avoiding dependence on a queued toggle event, and `backwards` fill so the settled wrapper has no lingering transform. Browser assertions cover synchronous open-state styling, settled opacity/transform and close/reopen while nested Debug remains open. Existing empty debug lists and repeat-copy announcements were noted as separate pre-existing polish; this pass preserves the approved debug/copy behavior. Raw source review: `C:/Users/myles.cook/AppData/Local/Temp/tempus-taste-final-review.txt`.

Final evidence: `pnpm validate` passed 71 files with 1225 passing tests and one existing expected failure, production build and zero audit vulnerabilities. After the last CSS tightening, `pnpm check` and `pnpm build` passed again. Dev and production-preview browser runs each passed 34 cases, including exact JSON, clipboard recovery, normal/reduced motion, synchronous opening, repeated keyboard toggles, nested Debug persistence and settled opacity/transform. Built evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-taste-motion-built-20261015`. Static 320/1280 screenshots were inspected. Shared engine and Worker API diff remains empty. Verification is Chrome only; no physical phone or screen reader check and no publication.

## Screenshot-driven grouping refinement

Cici reviewed the actual user screenshot through read-only multimodal Claude input, then reviewed the bounded implementation plan. It identified detached note alignment, an overweight reference card, mixed-purpose footer copy and redundant arrows/labels. User approved implementation. Actual critique and plan: `C:/Users/myles.cook/AppData/Local/Temp/tempus-cici-screenshot-critique-20261015.txt` and `tempus-tighten-plan.txt`.

Quieted the reference into one wrapping line with its full local date/year/clock, correct reference-instant abbreviation and explicit timezone. Kept the line before all phrase/result checkpoints. Operation chips remain; ordinary notes align to their text padding, with tight intra-group spacing and a clear pause before the produced date. Clamp, approximation and DST explanations remain beside their step. Removed redundant arrows and the inconsistent first-date label without adding labels. Date-only text now follows the actual result in both zero-step and arithmetic cases; zero-arithmetic explanation follows it. Removed the redundant Debug pointer sentence. Debug remains nested, with its component source identical before/after this pass; exact JSON/copy and raw timestamp checks remain in the browser journey. Existing motion and engine/API are untouched.

Verified this refinement: 35 focused component tests; full `pnpm validate` (71 files,1227 passing tests plus one existing expected failure, production build and zero audit vulnerabilities); 34 transparency cases each against dev and production preview; six calculator journeys. Cici inspected actual 320/1280 screenshots and marked all four earlier criticisms fixed, no blockers. Its reference-noon question is explained by the runner's fixed reference of `2026-10-15T17:00:00Z`, which is noon CDT; the rendered reference and complete raw JSON are asserted against that exact engine input, not an invented noon default. Review: `C:/Users/myles.cook/AppData/Local/Temp/tempus-tighten-final-visual-review.txt`. Built browser evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-tighten-built-20261015`. Browser verification is Chrome only; no publication.

## Four-panel review and narrow typo confirmation

The user marked the unexpected `no plus` event-title question, rich Debug, calendar export and Developer tools. Confirmed the intended phrase was `now plus …`; approved explicit confirmation before calculating, stale-context invalidation and unchanged ordinary event titles. The user then required simple-code and rejected automatic correction or a generalized autocorrect engine. The shared interpreter adds only a literal leading `no plus` recovery when the entire corrected expression validates, using the existing input/reference/timezone-bound selection. It never rewrites input or recaptures the reference at confirmation. Strict calculator and HTTP API still reject the typo. Accepted cases are in `docs/date-rules.md`, with nine unit cases in `src/shared/clarify-typo.test.ts` and real browser bindings in `examples/app/verify-panels.mjs`. The test first failed on the wrong event-title question, then passed for the intended reason.

Cici inspected actual before/after panel screenshots through read-only multimodal CLI. Plan and final review: `C:/Users/myles.cook/AppData/Local/Temp/tempus-panels-cici-plan.txt` and `tempus-panels-cici-final.txt`. Implemented ruled Debug summary/snapshot rows, plain paired endpoints, stronger section boundaries and complete labelled/focusable JSON with horizontal scrolling. Every exact value, warning, signed duration, raw payload and copy behavior remains. Offsets wrap at spaces instead of splitting; DOM-range assertions check each offset remains on one line, and real keyboard checks focus and scroll a long JSON line.

Calendar export now leads with its date and metadata, groups the title label/input, and places import help beside a primary download action. State machines, exclusive-end wording and generated files are unchanged. Developer tools separate on-device inspection from server comparison in responsive columns; copy actions sit beside their values, integration help is in the content header, request expression and precise privacy guidance appear before explicit network actions. Existing request/copy/download handlers, stale responses, rate-limit/error/retry behavior and API replay restrictions remain. No new tabs, modes or dependencies were introduced. Cici's suggestion to recapture time or retain the wrong-title choice was rejected because it conflicts with approved behavior.

Verification: full `pnpm validate` passes 72 files with 1236 tests plus one existing expected failure, production build and audit zero vulnerabilities. The focused group passes 74 tests. The panel runner passes both 320/1280 widths against dev and production preview: exact debug/local clipboard payloads, no API request on open/copy, real API comparison, mocked HTTP 429, offline/retry, stale response, and actual all-day/range/five-occurrence ICS downloads with edited titles. Six calculator journeys also pass. A separate live request confirms the production preview rejects the unconfirmed typo with HTTP 400. Artifacts: `C:/Users/myles.cook/AppData/Local/Temp/tempus-panels-built-20261015` and `tempus-panels-validate-final-20261015.txt`. Final production transparency run passes all34 cases, including offset wrapping and keyboard JSON scrolling. The first parallel run timed out on initial load; the separate unchanged production run passed. Evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-panels-transparency-built-final-20261015`. Browser coverage is Chrome only, without calendar-client import or a screen reader. No publication.
