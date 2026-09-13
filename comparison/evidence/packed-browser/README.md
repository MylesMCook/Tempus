# Packed browser journey evidence

The installed SDK archive `4ec180308a16144daa73f3c154d22868f8f47fcd9c4bcebf81d2be2ec1b452df` passed the calendar integration example in Chrome, Firefox and WebKit at 320 and 1280 pixels. Exact browser versions and source hashes are in `report.json`. The runner rechecks every installed SDK file against the packed-install report before browser execution.

Each run selects a future repeated-clock answer, downloads all nine weekly intervals, restarts the choices, then selects shared-time scope for a two-date list and downloads both timed points. It checks retained input, focus on the result after selection, blocked downloads after edits, blocked ongoing export, invalid-input recovery, horizontal overflow and unexpected external page requests. Controls are focused and activated with Enter; full Tab traversal and screen-reader navigation are not measured.

All 12 actual downloads pass the locked independent Python reader: exact dates, endpoints, titles and no invented duration for timed points. The files are retained alongside the browser and reader reports. They are authored development tasks, not independent evaluation. No calendar-client import occurred.

[Reproduction](../../../examples/sdk/README.md#reproduce-the-packed-browser-journeys). Requires installed Playwright browsers and a task-local server. Browser viewport resizing is not physical-device evidence. This JSON-oriented developer example is not the main app; its checks do not establish main-app usability. Six screenshots remain in local scratch evidence; the Chrome 320px image was visually inspected and shows the long JSON output.

Run `shasum -a 256 -c SHA256SUMS` here to verify retained bytes. JSON was formatted before freezing checksums. These files remain local and uncommitted.
