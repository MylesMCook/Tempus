# Remaining ordinary scheduling tasks

September 13, 2026; packed archive 8d0c2791, with all installed file hashes checked. Five inspected initial-interpretation probes are retained with complete outputs. These are authored development observations, not completed tasks, independent evaluation or competitive scores.

Both explicit relative-date and ISO-date ranges remain unsupported. A recurrence ending after three occurrences remains unsupported and receives a misleading duration question. Daily recurrence resolves in the control case; a generic dentist title receives a concrete title question. Older notes describing daily/monthly/title behavior must not be treated as current capability evidence.

The next work is the [explicit-date-range journey](../../../docs/archive/explicit-date-ranges.md). The recorded intended UTC endpoints were specified for the fixed reference/timezone, but have not passed an implementation or calendar-file check. No failed task is counted as completed merely because it was rejected.

To inspect these results, call the installed SDK's `parse` with each report input and its recorded context. This probe performs no calendar, network or deployment action. The raw scratch runner uses this installation's absolute path; the report and artifact identity are retained for review. Existing comparison and holdout datasets are unchanged.

Review caught an error in the authored daily-control intent: the reference is 11:00 AM Chicago on September 12, so noon that day is still upcoming. The raw note incorrectly starts on September 13. The observed September 12/13/14 preview is consistent with the reference; the intended complete schedule would contain September 12 through 15, four dates. The original note is retained with this correction rather than counted as a parser failure. This illustrates why these authored probes cannot substitute for independently checked expectations.
