# Omitted-month packed candidate

Archive `8d0c279183fba267c0e4d97441a8159d126b068838ad9f9b186c4ae146602f7b`, September 13, 2026. The private 0.1.0 package includes the omitted-month implementation and corrected README. An earlier successful pack, cc5f2e23, preceded the documentation correction and remains in scratch; it is not this candidate.

All 56 installed files match the archive after offline installation with scripts disabled. All five installed examples pass on Node 22.12.0 and 26.8.1. The date-list example retains earlier cases and now completes month → year → time → three-event file → edit invalidation, checking title, original source spans and no invented duration. Installed browser/calendar/Worker declarations pass TypeScript checks. Static import closure passes for the two package entry points and the declared Tempus → Temporal → JSBI dependencies.

The [new retained development snapshot](../omitted-month-journeys/README.md) contains 31 inspected comparison cases and 21 authored complete tasks. Sixteen harness tests pass; the journey replay counts as one test. Both file readers pass all 21 journey files. The locked Python command with `--require-rule-conformance` still exits 1 on the separate known duration-rule diagnostic. Both 31-case comparison summaries are unchanged. No holdout was used.

Browser and local Worker execution remain pending for this archive. Earlier archive 11018566's runtime results cannot establish this candidate's behavior. Main-app desktop checks belong to the separate omitted-month evidence. Physical devices, actual calendar imports, independent evaluation and final-candidate performance remain unverified. Nothing was published, pushed, deployed or written to a calendar.

Reproduce the packed Node/TypeScript checks using `node examples/sdk/verify-package.mjs NEW-SCRATCH-DIRECTORY`. Run that directory's five copied examples with the target Node runtime. `examples/sdk/verify-import-closure.mjs` takes the verified installation and a new report path. Use the retained reports' archive, file and example hashes to check identity. Static bundling does not prove runtime behavior or upstream provenance.
