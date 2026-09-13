# Mixed-month reminder journey

Source/main-app evidence, September 13, 2026. Input: `Call Sam September 30 and October 2 at noon`, reference `2026-09-12T16:00:00Z`, America/Chicago. Choose 2026, then At noon. The complete file contains September 30 and October 2 at 17:00 UTC, title Call Sam, with no invented duration. Editing October 2 to October 3 restores the year question and removes export.

Chrome desktop at 320/1280 px passed keyboard activation (direct focus plus Enter), actual download, edit invalidation and overflow checks. The 320 px screenshot was inspected. This is not full Tab traversal, physical-device or screen-reader evidence. Python icalendar 7.3.0 independently read both saved files and checked dates, title and absent duration/end. No actual calendar import or write occurred.

All 746 shared-source tests passed; production build and TypeScript passed, retaining the bundle warning (898.81 kB client / 264.84 kB gzip). Tests cover selected-year December/January without rollover and refusal of incomplete years/months or discarded qualifiers. No comparison corpus or packed runtime rerun is claimed. Archive 906f3a6f predates this source change.

Raw browser/readback runners remain in local scratch `2026-09-13-tempus-mixed-month-journey`; a portable runner and updated packed journey remain next work. These are authored development cases, not independent evaluation or competitive superiority.
