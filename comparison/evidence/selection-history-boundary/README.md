# Clarification-history argument boundary

The previous packed SDK accepted `selection.previous = Array(1)` in a direct `parse` call. The sparse array's empty slot bypassed `.some()`. Snapshotting then materialized that slot as `undefined`, so a reusable parser could fail later on the same context. This was inconsistent argument validation, not evidence of an accepted malicious date or changed calendar policy.

`optionsSnapshot` now checks `Array.from(previous)`, matching the existing batch-input boundary. Array holes are validated as non-string elements. `parse`, nonempty and empty `parseMany`, and `createParser` reject the malformed argument immediately with TypeError. Valid histories and all calendar behavior remain unchanged. No dependency or public API was added.

The regression fails before the fix and all five SDK tests pass afterward. Archive `b1cbd22abe5d87385eb47dcfd3d8528ca6c38206250e6112f12774bc0f5d3395` passes seven examples on Node 22.12 and 26.8, installed consumer types and 56-file equality. Targeted packed checks on both runtimes verify immediate argument rejection plus valid multi-answer reminder parity across single, batch and reusable APIs. The 31-case/25-journey replay remains unchanged. Scoped lint passes. Only `dist/sdk.js` differs from the previous a7 archive.

This is a narrow SDK boundary fix. The latest broad browser, Worker and performance reports retain a7f9e298; they were not rerun or relabeled for this archive. The previous full source suite is still scoped to its earlier source snapshot; this milestone ran targeted SDK checks and package consumers. Public API guarantees, independent consumer evaluation, physical devices and actual calendar imports remain open. No push, publication, deployment or calendar write occurred.
