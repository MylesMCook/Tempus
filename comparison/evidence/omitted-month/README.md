# Omitted month: complete reminder journey

September 13, 2026. `Call Sam September 30 and October 2 and 4 at noon` now asks which written month applies to the third date. Choose October 4, 2026 for all dates, then noon for the first and second items. The result retains the input and event title, and exports September 30, October 2 and October 4 at 17:00 UTC in written order. Original item spans remain unchanged; no duration is invented.

Month answers survive later year/time answers. Replacing a month clears that item's dependent choices; changing the input invalidates the selection. Invalid September 31 and an unoffered month cannot produce a file. Source checks include month → individual year recovery as well as the shared-year journey.

The main-app repository runner passes at 320/1280 px in Chrome 153.0.8010.36. It uses direct focus/Enter, waits for the application's focus handoff, downloads the complete three-event file, edits 4 to 5, and checks that clarification returns and export disappears. Both files pass the locked Python reader with exact starts, title and no invented end/duration. The previous two-date reminder also passes with the updated runner; its report is retained, with files/readback in scratch.

Two failed attempts are retained. The first had one missing-choice timeout and one unopened-download timeout. The second reached edit recovery at both widths but incorrectly expected “October 4” after changing the input to “5.” Correcting that expectation and waiting for the app's focus handoff produced the passing final run. These were runner failures; the first download timeout's cause was not independently isolated. Click and keyboard probes both reached the complete export preview. No application focus behavior was changed to make the runner pass.

The 752-test shared suite and build passed before the final added history regression; the final date-list suite passes all 36 cases. Four changed JavaScript/TypeScript files pass formatting/lint/types without warnings. The build retains its bundle-size warning. See provenance.json for source hashes and scopes.

[Run it](../../../examples/app/README.md) with `--omitted-month`, then use the locked reader on the new run directory. Desktop widths are not physical devices or screen-reader evidence. File reading and browser download are not calendar-client import. SDK archive 11018566 and the twenty-task replay predate this source delta; new packed runtime and replay verification remain next work. No competitive claim, publication, deployment or calendar write follows.
