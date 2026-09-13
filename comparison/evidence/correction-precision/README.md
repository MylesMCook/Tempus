# Date precision in correction choices

September 13, 2026. Two regression tests reproduced choices that described date-only values as midnight appointments. The correction/alternative description now uses pinned civil dates for date-only points and all-day intervals. Explicit midnight and other timed choices retain their clocks. All-day interval labels explicitly identify the exclusive end. Calendar values and strict calculator behavior are unchanged.

65 targeted correction, precision and calendar tests pass. TypeScript and production build pass, retaining the bundle warning (899.15 kB client JavaScript / 264.96 kB gzip).

Chrome desktop at 320/1280 px completes both tasks, with reference 2026-09-12T16:00:00Z and America/Chicago:

- `Call Sam Friday at noon, actually Saturday instead`: choose “Use September 12, 2026 (date only)”; download an all-day September 12 event.
- `Call Sam tomorrow for 2 days or Friday at midnight for 2 days`: choose the September 13–15 all-day alternative with exclusive end; download exactly that civil-date interval.

Keyboard activation uses direct focus plus Enter, not a full traversal test. Both paths retain input, download successfully, have no horizontal overflow, and clear export after changing Call Sam to Call Jo. The point screenshot was visually inspected. Locked Python icalendar 7.3.0 independently checks all four downloaded files: title, civil-date types, starts, interval ends and absent DURATION. No calendar-client import or write occurred. Physical devices, screen readers and human completion remain unverified.

These authored checks are not independent evaluation. Packed archive 1dbb7a0b predates this description change; its runtime evidence is historical for this delta. Raw browser/reader runners remain in local scratch `2026-09-13-tempus-correction-precision`.
