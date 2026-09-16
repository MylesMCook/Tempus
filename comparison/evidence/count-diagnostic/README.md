# Occurrence-count diagnostic

Five authored tests initially failed: four count requests asked about event duration; the excluded-date request returned a generic exclusion error. The duration control passed. After the source fix, all six tests and the 85-test related recurrence/duration run passed; SDK TypeScript checking passed.

`browser.json` records the visible count error, intact input, absent export action, keyboard edit to an ordinary duration schedule and return to the unsupported count at desktop Chrome widths 320 and 1280. This is viewport emulation and direct input focus, not full keyboard traversal or physical-device evidence. Editing to a duration changes the request; it does not complete the original counted task.

The change only improves the diagnostic. Count support, correction-to-file completion and independent file validation remain open under [the acceptance cases](../../../docs/archive/occurrence-counts.md). Packed archive `47a218ba` is unchanged and does not contain this source fix. No publication, deployment or calendar write occurred.
