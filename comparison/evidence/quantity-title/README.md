# Confirm a quantity label, then complete the reminder

September 13, 2026. Archive `756fbb4ec523da3ac1bba687507eba72c2b42aa2a9de767e01d0e9d765cbbf59` supports an explicit title proposal for commands such as `Buy 3 apples tomorrow at noon`. The title must be confirmed before date interpretation can resolve or export. This closes a recorded reminder task gap without silently absorbing a number into event text.

## Scope and safeguards

The bounded form is buy, send or pick up followed by one positive integer or a written number from one through ten, then supported object-label words. An optional remind-me prefix remains in the original input but is excluded from the event label. Clock markers, durations, negation, uncertainty and unsupported trailing qualifiers are not hidden to obtain a result. Extra quantities, fractions, zero, broader verbs and temporal object names remain unsupported. The [schedule contract](../../../docs/schedule-contract.md#quantity-labels-with-confirmation) records these limits.

The first test of `Buy 3 apples on 11/01/2026 at 1:30am for 30 minutes` failed before completing the staged choices. Title-proposal validation did not strip the optional on connector, although final interpretation did. The candidate validation now uses the same connector rule; the original phrase and source offsets remain intact. The staged test passes after that correction. No date, clock, duration or quantity is silently discarded.

## Complete-task evidence

Eighteen new regression cases cover command forms, explicit confirmation, original spans, date/DST choices, complete interval export, quantity edits and negative controls. The full source/comparison run passes 927 tests with one expected failure. Strict calculator/API v2 code is unchanged. Lint/type checks and production build pass; the large-bundle warning remains.

Eight built-app Chrome journeys pass at 320/1280, including the prior identifier cases and the new quantity case. The quantity journey confirms the title, chooses November 1, chooses the second 1:30 AM in Chicago, and downloads a 07:30–08:00 UTC interval retaining `Buy 3 apples`. Changing 3 to 4 returns to title confirmation and removes export eligibility. Separate icalendar 7.3.0 and recurring-ical-events 3.8.2 readers verify all eight actual files against their authored titles, starts, ends and recurrence expansion. Input, current title, overflow and direct-focus/Enter checks pass.

The archive verifier checks all 56 installed files, installed declarations and seven Node examples. Node 22.12.0 and 26.8.1 pass the updated identifier example including quantity correction/export/edit. The retained 31-case/22-journey replay matches complete outputs and file hashes. Nine targeted static packed-browser probes pass in Chrome, Playwright Firefox and WebKit, preserving pre-load input through quantity-title/date/DST choices and invalidating the result after edit.

The current archive has not received the full offline keyboard/download suite or local Worker rerun; those retained reports belong to bd06963f. New quantitative performance measurements are also pending. Do not transfer predecessor archive results without stating that scope.

## Limits and reproduction

These are authored tasks and desktop observations. They are not general quantity extraction, independent user evaluation, sequential-Tab proof for the new main-app journey, physical-phone evidence or calendar-client imports. Existing broader conflicts, ongoing calendar policies and security/deployment gates remain open. No dependency or language rewrite was added. No push, publication, deployment or calendar write occurred; both task-local verification servers were stopped.

Run the normal source tests and package verifier. For the built app, use serve-built.mjs and `TEMPUS_APP_URL=http://127.0.0.1:5175` with verify-event-identifiers.mjs, then read-event-identifiers.py. Version 2 of that report requires all four task IDs at both widths; the reader retains support for older three-task evidence. For the static packed example, use verify-startup.mjs with `--quantity-title`; the default identifier scenario remains available for earlier archives. Use new output directories and retain exact archive/source identities.
