# Tempus: the engine is the product

The [product focus](product-focus.md) sets the current scope: explainable calculations and correction, with new feature families paused pending independent evaluation. Existing supported behavior remains protected.

Tempus turns short natural-language input into inspectable date data. Applications supply context, present clarification choices, and decide what to do with the result. The website is a reference consumer of that engine.

The product focus sets the acceptance contract; the existing matrix remains a capability inventory. Arithmetic, complete user journeys, correctness, resource efficiency and independent evaluation remain required. Reminder delivery and calendar-account management belong to consuming applications.

## First principles

- Identical input, explicit reference, timezone and decisions produce identical results under the same engine and timezone-data version.
- Missing meaning stays unresolved. Recognition proposes an interpretation; calendar resolution validates it.
- Clarification answers belong to their input and context. Changed input cannot inherit an unrelated answer.
- Results retain source text, precision, boundaries, decisions and inspectable calculation evidence.
- A preview must identify its limits. A complete finite output must not silently truncate.
- The engine performs no network requests, clock reads, clipboard operations, downloads or calendar writes. Hosts own those effects and Worker lifecycle.
- Useful safeguards are part of the result contract, not optional website behavior.

## Existing foundation

`src/shared/sdk.ts` already exposes `parse`, `parseMany`, `createParser` and clarification selection. It wraps the existing interpreter; a replacement engine or extra service layer is unnecessary. The playground calls this entry instead of directly invoking `interpretDate`.

The optional calendar entry now exposes `prepareCalendar(result, options)`. It accepts the public parse result and returns `ready`, `needs-clarification`, or `blocked`. A ready recurrence includes its occurrence data and whether it represents an ongoing rule; private serializer policy fields are not returned. Omit `options.file` for data only, or supply title, UUID, timestamp and point precision for file preparation. A ready data result can still contain a failed file result; consumers must check `file.ok` before download.

Preparation choices use the existing `ClarificationSelection` shape and `appendSelection`. Their opaque context key binds the full interpreted result, including original input, reference and timezone. Structured cloning preserves this identity; editing the input/context or replacing the interpreted result invalidates old choices. The Worker and output components now use this public entry. Clock/UUID capture, rendering, Worker cancellation, clipboard and download remain host effects.

The older raw calendar entry functions remain available for preview-package compatibility. New consumers should use `prepareCalendar`; no public deep imports are supported. The installed candidate and production playground pass the [bounded parity journeys](archive/engine-consolidation-evidence.md). This verifies the local preview contract, not a published cross-version stability guarantee.

## Clarification dependencies and compatibility

`clarification-dependencies.ts` decodes legacy wire IDs into a discriminated decision family, then applies dependency rules. Numeric-date recognition no longer owns that policy. Changing a recurrence boundary clears dependent month/count/occurrence choices; changing a count policy clears downstream occurrence choices. Item date/year/time choices preserve independent list items. Occurrence starts invalidate their dependent ends; arithmetic choices invalidate later arithmetic steps. Interval date changes clear dependent endpoint choices while preserving the existing clock-choice behavior.

`ClarificationSelection` and its ID strings remain unchanged. `appendSelection` keeps chronological history, removes dependent answers, deduplicates and enforces the existing history bound. Input/reference/timezone context changes discard old parsing answers; preparation additionally binds the interpreted result. Twelve focused dependency cases and a baseline-archive comparison across 36 representative IDs and 1,296 selection combinations pass. Unknown IDs still need an actual offered choice to resolve meaning; the comparison is not an exhaustive arbitrary-string compatibility proof.

The website now derives its point calculation or unresolved error directly from the public result. It no longer constructs a competing calculation object from the first schedule occurrence or invents an engine error for an empty schedule. Rendering and HTTP replay consume only the data applicable to their result kind.

## Remaining work

Use the [release checklist](release-checklist.md) for current gates. Keep SDK and website results equivalent, reject stale choices, and preserve complete file output. A stable public API still needs a versioned compatibility commitment.

Only optimize measured costs. Timezone data and Temporal dominate the bundle; moving modules does not remove them. Loading changes must preserve offline availability, reproducibility and startup behavior.

Independent user tasks, physical devices and actual calendar imports remain unverified. Refactoring and passing regression tests do not establish competitive superiority.

## Measured pruning

Resolved finite schedules previously ran recurrence recognition and preview calculation before running complete recurrence calculation. They now enter complete validation directly using the resolved bounded-rule indicator. Unbounded schedules retain their existing rule and timezone checks.

Installed archives `fc6e6308` (before) and `c28b914d` (after) produced identical output hashes for preview, traced arithmetic, corrected interval and nine-occurrence calendar-file workloads in five fresh processes each. File-preparation latency across 500 warm samples changed from p50/p95 2.119/2.764 ms to 1.577/2.087 ms. This is a narrow authored desktop workload, not general throughput, phone, peak-memory or energy evidence. CPU samples implicated calendar arithmetic, Temporal operations, garbage collection and file serialization; the change avoids repeating that work rather than replacing the calendar implementation. The baseline already includes the earlier context-copy pruning, whose benefit was not measured separately.
