# Missing item year across December and January

September 13, 2026. Input: `Call Sam December 31 and January 1, 2027 at noon`, reference 2026-09-12T16:00:00Z, America/Chicago. Choose 2026 for December 31, then At noon for that date. The result preserves January 1, 2027 and produces two noon CST points: 2026-12-31T18:00Z and 2027-01-01T18:00Z. No year rollover is silently inferred.

The scope is a mixed-month list naming every month with exactly one distinct written year. Missing item years are asked individually using the written year and its adjacent years; other years can be written explicitly. Existing global same-year choices remain separate. Changing an item year clears its dependent choices; selecting its time retains its year. Invalid dates and unoffered years cannot produce a file.

All 750 shared-source tests and production build pass after correcting a TypeScript annotation found by the first SDK build. The existing bundle warning remains (900.12 kB client / 265.21 kB gzip). Main-app Chrome at 320/1280 px passes year → time → two-event download → input edit; editing January 1 to January 2 reopens the question and removes export. Original input, title and spans are retained. Both saved files pass locked Python icalendar 7.3.0 readback with exact starts, title and no invented end/duration. The 320 px screenshot was inspected.

Keyboard checks use direct focus/Enter, not full traversal. No physical-device, screen-reader, actual calendar-client import or independent evaluation is claimed. Archive 7d1907c6 and the 19-task replay predate this source change; packed runtime/replay refresh remains next work. Raw runners remain in local scratch `2026-09-13-tempus-item-year`. Nothing was pushed, published, deployed or written to a calendar.
