# What Tempus does

Tempus focuses on date calculations you can inspect and correct. Existing schedule support stays available; matching every gpu-time feature is no longer the goal. See the [product direction](product-focus.md).

| Job                       | Available                                                                                   | Limits or evidence still needed                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Calculate a date          | Ordered changes, fractions, month-end adjustments and step-by-step output                   | Specific English grammar; arbitrary conversation is unsupported.                      |
| Correct an uncertain date | Offered date/clock choices; original input is retained                                      | Some inputs return an error rather than a choice. Fresh user evaluation is pending.   |
| Interpret schedules       | Points, ranges, date lists and weekly/monthly rules                                         | Supported forms and clock policies are in the [schedule rules](schedule-contract.md). |
| Copy or export            | Text, Markdown, JSON and eligible calendar files; complete finite dates                     | Ongoing/DST restrictions remain. Actual calendar-client imports are unverified.       |
| Integrate the engine      | Local TypeScript package; checked Node, browser and Worker paths                            | Package is unpublished; compatibility policy is unfinished.                           |
| Use it on a phone         | Narrow desktop layouts have been checked                                                    | Physical phones and assistive technology remain untested.                             |
| Keep resource use low     | CPU parsing; [measured bundles](bundle-comparison.md) and [budgets](performance-budgets.md) | gpu-time is smaller. Peak memory and battery cost remain unmeasured.                  |

## Comparison with gpu-time

Version 0.3.0 supports ordered relative arithmetic, month-end clamping and the tested DST day/hour distinction. Tempus's five protected calculator expressions do not prove that those underlying capabilities are absent in gpu-time. Our tested differences are accepted calculator wording, fractional day/week expressions and visible arithmetic steps. [Arithmetic results](arithmetic-comparison.md).

The last direct comparison measured Tempus at 151,938 gzip bytes and gpu-time at 53,272. The later calculator-question release is 152,164 bytes. These public-entry bundles have different capabilities; neither size nor authored tests establish overall product quality.

## How we judge improvements

Check the complete task: input, interpretation, correction and usable output. Record wrong accepted answers separately from abstentions. Preserve source text, timezone, reference, limits and export semantics. Keep calculator, explanation, correction and export performance measurements separate.

Agent-authored cases find regressions and awkward wording. Independent cases and unfamiliar users are still needed to decide whether the product is useful enough to keep expanding. [Decision gate](product-focus.md) · [Release status](release-checklist.md).

[Earlier requirements and measurements](archive/product-matrix-history.md) are retained as history, not an active feature backlog.
