# Quantified item reminder journey

“Buy 3 apples and 2 pears tomorrow at noon” now offers explicit confirmation of the complete title. Positive integer or one-through-ten quantities joined with “and” stay in the title; the date phrase still receives normal calendar and ambiguity resolution. No new dependency or strict calculator/API v2 grammar was added.

The recorded unsupported phrase was removed from the old negative-only test and replaced with successful title/point and complete date/DST/file/edit expectations. The prior test is retained. Three new completion checks failed before implementation; after implementation all 28 quantity checks pass. The complete source suite has 989 passes and one existing expected failure across 58 files. Build/types/scoped lint pass; the existing large-chunk warning remains.

The reminder with November 1 at 1:30 AM requires title, date-order and repeated-clock answers before export. It produces the expected 07:30–08:00 UTC interval, retaining both items and source spans. Changing either tested quantity discards previous answers and blocks stale export. Duration words, conditional/uncertain wording, decimals, zero and the tested second-action forms remain unresolved.

Fourteen built Chrome app journeys at 320/1280 pass, including the new list; separate readers accept all fourteen files. These are authored direct-focus/Enter interactions, not independent users or physical-phone evidence. Browser diagnostic version 5 adds the list while preserving the previous cases.

Current archive `7fd1e1d33ef9692b907bbe24896c053575a2e2bb6bfac88f66cdcd9daae5227f` passes seven Node26 examples, installed consumer types and 56-file equality. Targeted Node22/26 list journeys pass, and the unchanged 31-case/25-journey replay matches. This does not refresh full Worker/offline/performance evidence, which remains on b8ffb7e0. The scored comparison corpus and all nine protected matrix requirements are unchanged.

Comma-separated/arbitrary shopping lists, unquantified additional items, broader commands and multi-action scheduling remain outside this grammar. Independent task evaluation, physical devices, actual calendar imports, ongoing-duration conformance and historical rapid-download failures remain open. No external actions occurred.
