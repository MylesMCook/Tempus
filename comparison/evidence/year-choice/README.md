# Same-month reminder year choice

Input: `Call Sam September 14 and 16 at noon`. Fixed reference: September 12, 2026 at 16:00Z, America/Chicago.

The app asks which year applies to all dates, then asks whether noon also applies to the first date. Selecting 2026 and noon produces September 14 and 16 at 17:00Z, retains Call Sam and the original source spans, and downloads both points without invented duration. Editing the input restores the questions and removes the old export panel.

Chrome keyboard activation and download paths pass at 320/1280 pixels. Both downloaded files independently read back with icalendar 7.3.0; the narrow screenshot was visually inspected. This is desktop evidence, not physical-device or full Tab traversal evidence. No real calendar was imported.

The year menu offers the reference's local calendar year and following year within the supported year range. Neither is selected automatically. Users can write another year explicitly. Selecting a different year clears dependent date-list decisions. Invalid dates, conflicting or unoffered answers, mixed-month shorthand and unknown qualifiers do not become resolved exports.

Source tests cover year-before-time sequencing, file endpoints/spans/title, decision replacement/edit invalidation, local-year boundary and invalid-date refusal. The new behavior has not yet been verified in a newly packed SDK or other browsers/runtimes. Archive e2293d2d predates this implementation.

The first UI assertion looked for an optional note while its disclosure was closed. The final path opens Interpretation choices and verifies the selected year there. Scratch browser/readback scripts are retained in the local year-journey directory; this snapshot does not yet provide a portable runner for that app journey.

Run `shasum -a 256 -c SHA256SUMS` here to verify retained bytes. These are authored development checks, not independent language evaluation or superiority evidence.
