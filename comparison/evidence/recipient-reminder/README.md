# Recipient reminder completion

The observed input “Buy apples for Sam tomorrow at noon” previously failed because the label boundary treated for as temporal syntax. A supported action can now propose the complete title when for is followed by one to three capitalized name words. The user confirms that title before calendar interpretation continues. Existing duration/recurrence boundaries and global uncertainty/negation checks remain in place.

The bounded form rejects date-like names such as May and does not cover lowercase names, arbitrary purpose clauses or multiple quantities. It is not general recipient extraction. Unsupported suffixes must not become a confirmed title. Eleven added source cases cover ordinary names, recipient/date/DST correction, spans, complete file output, edit invalidation and temporal/conditional negative controls.

The full source/comparison run passes 952 tests with one expected failure across 57 files. Build and scoped lint pass. The first build failed because the new test fixture omitted required title metadata; that failure is retained, and the corrected build succeeds. The existing large-chunk warning remains.

Packed archive e7ac31c41806e7e1bd799d07bac2df438ac95d342250c789a8a621c93f45fbe2 passes seven Node26 examples, installed types and all 56 installed-file checks. A separate installed recipient consumer passes on Node22.12 and Node26.8.1. The retained 31-case/25-journey replay matches every result and file hash. It does not add the recipient task to that comparison denominator.

Ten built-app Chrome journeys pass at 320 and 1280 desktop widths: prior invoice, quantity, schedule and title cases plus the new recipient case. They use direct focus and Enter, retain original input, expose the selected interval, save actual files, reject stale choices after recipient edits and check overflow. Separate Python readers match all ten files. The recipient file retains Buy apples for Sam and the November 1, 2026 interval from 07:30 to 08:00 UTC. The 320px result screenshot was visually inspected. This is not sequential-keyboard coverage, a physical phone, an independent user study or calendar-client import.

The new archive has not had a full current Worker, offline-browser or performance refresh. Their earlier evidence stays attached to its original archive. No deployment or calendar write occurred. Task-local built server 5175 was stopped; main dev server 5174 was preserved. Known ongoing-duration conformance and independent-evaluation/device gaps remain open.
