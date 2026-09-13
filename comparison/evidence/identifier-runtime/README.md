# Numeric labels and current SDK runtime verification

Archive `a8a1cbb41947e294d08d82a3fcb39dddd485574daff86b22f3e20e7423bc35ca`, September 13, 2026. The archive verifier checks all 56 installed files and installed declarations; seven examples pass on Node 22.12.0 and 26.8.1. The retained 31-case/22-journey replay matches complete outputs and file hashes. These are authored regression checks, not independent evaluation.

## Bounded input improvement

Numeric labels such as `Visit room 3`, `Pay invoice #123` and `Call person 0` retain their original text and source spans through date and clock clarification. Generic `Room 3` titles still require confirmation. Quantities, arbitrary identifiers and broader prose are not generally supported. Clock, duration, uncertainty and condition words cannot be swallowed to create a result. The [schedule contract](../../../docs/schedule-contract.md#numeric-identifiers-in-event-labels) states the exact boundary.

Seventeen source regression cases cover labels, source spans, numeric-date/DST selection, stale edits, title confirmation and negative controls. The earlier recorded source/comparison run passed 908 cases with one expected failure. The app evidence here contains six authored Chrome journeys at 320/1280: invoice date/DST correction, a three-occurrence room schedule and generic-title confirmation. Original text, actual download, edit invalidation and overflow checks pass; separate Python readers verify all six files. These are main-app Chrome checks, not physical-phone evidence.

## Runtime scope and retained failure

The local workerd diagnostic passes; separate icalendar 7.3.0 and recurring-ical-events 3.8.2 readers verify its fifteen files, including date precision, count policies, intervals and recurrence. The diagnostic uses the installed SDK and was not deployed. File validation is not calendar-client import.

The first packed-browser run failed on Chrome at 320 px before any file download: `SyntaxError: Unexpected end of JSON input` while reading the result. The other five runs passed fourteen journeys each. This failed report is preserved in browser-failed. The development server reported a configuration restart and page reload near startup, but the first report lacks navigation timestamps sufficient to establish causality. No parser or application fix was inferred from that evidence.

The browser runner now retains navigation timestamps, failure stack, HTML and screenshot when available. Assertions, inputs and pacing are unchanged. Startup reliability remains an open issue even if a subsequent run passes. The ordinary-Tab WebKit failure and earlier rapid-download failure remain historical open findings; Option-Tab and paced downloads do not resolve them.

The instrumented retry passes all six runs (Chrome 153.0.8010.36, Playwright Firefox 148.0.2 and WebKit 26.4 at 320/1280), using Option-Tab in WebKit. All 84 downloaded files pass both separate readers. This is a scoped runtime pass with the first-run failure retained, not a startup reliability fix. Task-local servers on 5184 and 8788 were stopped after verification; the main app remains available on 5174.

## Limits

Desktop Chrome, Playwright Firefox/WebKit and local workerd do not establish retail Safari/Firefox, deployed Worker, physical-device, screen-reader, offline or calendar-client behavior. The fourteen packed-browser fixtures and fifteen Worker files cover the existing scheduling integration paths; the new numeric-label-specific journeys were run on Node and main-app Chrome. Independent cases, physical devices and actual imports remain zero.

The [current SDK cost report](../current-sdk-costs/README.md) belongs to this same archive. It does not establish overall superiority. No push, publication, deployment, cloud change or calendar write was performed.

The exact retry runner is retained as `verify-browser-used.mjs.gz` and matches the report hash. Subsequent source formatting only split one diagnostic write call across lines; it did not change assertions or execution.
