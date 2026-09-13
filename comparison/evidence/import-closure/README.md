# Packed SDK import closure

September 13, 2026; archive `7d1907c6674485eee8d1df072f5d4b6138a949e88a1f71999377a29f67d8255a`.

Both public ESM entries bundle for the browser platform with all exports retained. Every input file is hashed, every cross-package runtime edge is declared by its importing package, and no output requires external imports. The parse entry uses 22 input modules; the calendar entry uses 23. The only package owners are Tempus 0.1.0, Temporal 0.5.1 and JSBI 4.3.2. The retained manifests show Tempus declares Temporal and Temporal declares JSBI.

The parse entry exports SDK_VERSION, appendSelection, calculateDate, createParser, limits, parse and parseMany. The calendar entry exports prepareCalendarFile, prepareRecurringCalendarFile, resolveRecurringExport and retainOccurrenceDecisions. The reviewed export surface contains no additional helper API.

`examples/sdk/verify-import-closure.mjs VERIFIED-INSTALL NEW-report.json` checks installed file hashes against the prior successful pack verification, bundles each public entry, verifies package ownership/declarations, and records file/manifest hashes and exports. It refuses to overwrite existing reports. It writes a report only; no network, installation, service or calendar mutation occurs.

Four isolated synthetic controls passed: a valid declared dependency is accepted, while an undeclared dependency, a Node filesystem import and changed installed bytes are rejected. These fixture checks are not SDK accuracy tests or an independent review. Their generated files remain in local scratch `2026-09-13-tempus-import-controls`.

This closes the scoped static import/declaration review for this archive. It does not prove absence of dynamic behavior or side effects, validate upstream build provenance, establish vulnerability absence, refresh the sealed security scan, or certify all runtimes. Existing runtime checks are recorded separately. Timezone/compiler provenance, post-scan implementation review and operational hosting review remain open. Package bytes were not changed by this work.
