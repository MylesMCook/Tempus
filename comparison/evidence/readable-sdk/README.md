# Readable calendar SDK example

The calendar integration now shows the event title, timezone, dates and complete-file count before its actions. Raw structured output is in an optional native disclosure. Long finite files show three dates with the complete event count; ongoing rules are labeled separately. Date-only entries remain all-day and interval ends are labeled exclusive. No calendar or reminder is created by parsing.

All six Chrome/Firefox/WebKit runs at 320/1280 pixels pass the correction, download, restart, edit, blocked-output, date-only and all-day interval checks. WebKit explicitly uses Option-Tab. The diagnostic disclosure opens and closes by keyboard; focus returns to the readable interpretation after choices. All twelve actual downloads pass independent Python readback. The retained 320px Chrome screenshot was visually inspected.

SDK archive `4ec18030…` is unchanged. The new example passed five packed Node examples and strict installed declaration checking on Node 26.8.1; all 56 SDK files match. This is a presentation change to the developer example, not the main app. Physical devices, screen readers, actual Safari and calendar-client imports remain unverified.

The first presentation attempt failed TypeScript checking and was corrected. An initial browser run also read empty JSON before initialization; the runner now waits for the module's result before starting. Both failed attempts remain in local scratch history. No failure was counted as a passing run.

[Reproduce](../../../examples/sdk/README.md#reproduce-the-packed-browser-journeys) using the explicit WebKit mode. `report.json` records current consumer/runner hashes and browser versions; `reader-report.json` records exact file hashes and endpoints. Run `shasum -a 256 -c SHA256SUMS` here to verify retained bytes. JSON was formatted before freezing.
