# Ordinary command-bar inputs

Run `pnpm build:sdk`, then `node comparison/exploratory/command-bars.mjs` from the repository root. The [raw report](../results/exploratory/command-bars.json) keeps eight inspected inputs, authored task intent and both complete outputs. It uses the built workspace SDK and pinned gpu-time 0.2.1 CPU with an explicit September 12, 2026 reference and America/Chicago timezone.

This is a qualitative development probe. It does not alter the 31-case comparison corpus, grade human completion, validate exports or establish an accuracy ranking. Expected temporal intent was written before inspecting these gpu-time responses. Tempus failures were already known when selecting several inputs. Event-text and source-span equivalence are not scored here.

| Task                                    | Tempus                         | gpu-time 0.2.1 observation                                                                       |
| --------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Call Sam tomorrow at noon               | Resolves                       | Matching timestamp                                                                               |
| Dentist appointment next Tuesday at 2pm | Unsupported                    | Matching timestamp                                                                               |
| Tomorrow at noon for half an hour       | Unsupported                    | Matching start and end                                                                           |
| Tomorrow at noon for 90 minutes         | Resolves                       | Matching start and end                                                                           |
| Two explicitly dated noon calls         | Unsupported                    | No occurrences; reports multiple months in one calendar date                                     |
| Every month on the first at noon        | Unsupported                    | Matching three-occurrence preview and a monthly day-one rule; full recurrence/export unvalidated |
| Do not call Sam tomorrow                | No expression                  | Returns the mentioned date; conflicts with our no-event scheduling policy                        |
| Call Sam 03/04/2027 at noon             | Selectable date-order question | Returns March 4; conflicts with our clarify-first policy                                         |

The half-hour duration journey has since been implemented and verified in source/browser checks. The refreshed probe now resolves that interval; the prior raw report is preserved under `results/exploratory/history/before-half-hour/`. Other observed outcomes remain unchanged. Generic titles and monthly recurrence remain substantial replacement gaps. The date-list failure is shared; that does not remove it from Tempus's contract. Recognition coverage and safe scheduling decisions need separate evidence.

## Reminder modifier audit

Run `pnpm build:sdk`, then `node comparison/exploratory/reminder-modifiers.mjs NEW-output-directory`. The output directory must not exist. Seventeen inspected cases check uncertain/negative/conditional wording, direct reminders and ordinary-name controls. The check includes whether a calendar file can be prepared; it never writes to a calendar account. It is not an independent evaluation or comparative score.

The first valid run failed two cases: tentatively and optionally were accepted as title words and allowed export. `results/exploratory/modifier-audit/report.json` retains those failures. After extending the existing uncertainty rule, all seventeen cases pass in `modifier-audit-fixed/report.json`. The initial harness attempt omitted explicit `pointMode: instant` and stopped before writing a report; it was corrected before recording the audit.

The bounded audit is complete. It does not establish a general semantic negation/uncertainty classifier. A manual edit to a definite instruction remains necessary for these unsupported uncertain forms.

The September 13 explicit-list refresh preserves the prior raw command-bar report in `results/exploratory/history/before-date-lists.json`. Tempus now returns both September 14/16 noon points in the authored list case; gpu-time 0.2.1 returns no occurrences for that exact input. Both now match the monthly day-one preview. This is a narrow inspected development observation, not a comparative task-completion or language-accuracy ranking. File and browser evidence is recorded separately in the release verification log.
