# Conditional wording must not become a title

Review of the lowercase-recipient candidate found that “Buy apples for mom pending tomorrow at noon” could offer “Buy apples for mom pending” as a title. “Assuming” and “provided” had the same issue. The preceding milestone's checked qualifier contrasts did not cover these cases.

The shared incomplete-condition guard now rejects those words before either ordinary or recipient title extraction. It preserves the original input and returns an unresolved explanation with no title choice or file. This is a corrected recognition boundary, not completion of conditional scheduling. Legitimate titles containing these words also remain unsupported under this conservative policy.

Six casing variants, each checked in ordinary and recipient wording, failed before the change and pass afterward. The full source suite passes 1010 tests with the existing expected calendar-reader failure across 59 files. Build/types and scoped lint pass; the large-chunk warning remains. No strict calculator, timezone, arithmetic, API-v2 or file-serialization code changed.

Candidate `a7f9e298c3c3152e0cddc7e439819ed0aba83a2471e81adc78a646e9737ca21b` passes seven Node22/26 examples, installed types and 56-file equality. The targeted lowercase title/date/DST/file/edit journey still passes on both runtimes. The existing 31-case/25-journey replay remains unchanged.

Sixteen built-app Chrome journeys at 320/1280 pixels and all separate file readbacks pass. Added checks retain each conditional input, show its unresolved state and expose no title choice or export control. The valid mom reminder still completes to 07:30–08:00Z on November 1, 2026, and changing mom to dad invalidates prior choices.

These are authored source/SDK/app checks. They neither establish general conditional-language coverage nor independent superiority. Broad offline/Worker and performance evidence remains on e70f6d12. Physical devices, actual calendar imports, independent evaluation and ongoing-export decisions remain open. The task-local server was stopped; nothing was published, deployed or written to a calendar.
