# Counted schedule SDK candidate

Archive `36928444c25a46792517585163d483b7bcc3f0397014bde17ced492495932711` is a private local 0.1.0 candidate. All 56 installed files match the archive. The installation ran offline with lifecycle scripts disabled; no package was published.

Six integration examples pass on Node 26.8.1 and Node 22.12.0 using the same installed archive. The new count example checks a five-event file beyond the three-row preview, retained input/title/spans, monthly choice and edit invalidation, a repeated-clock choice required beyond the preview, and ordered batch failures for unsupported count-slot cases. The calendar contents are checked in memory; these examples do not import or write calendars and are not independent language evaluation.

Installed TypeScript checks cover the copied browser, calendar-browser and Worker consumers. Static browser import closure passes for both package entry points, with only declared `@js-temporal/polyfill@0.5.1` and `jsbi@4.3.2` dependencies. Static checks do not prove browser or Worker execution.

The Node 22 runner now verifies the existing installation and copied example hashes, then invokes all six examples without rebuilding a second archive. Reproduce with `node examples/sdk/verify-package.mjs NEW-scratch-directory`, then the installed Node 22 executable and `examples/sdk/verify-installed-node.mjs VERIFIED-INSTALL NEW-report.json`. Run `examples/sdk/verify-import-closure.mjs VERIFIED-INSTALL NEW-report.json` separately. The package runner builds and packs locally; the other two runners inspect the installed candidate. Existing evidence outputs are refused.

**Still pending:** current-archive browser/local-Worker execution, counted files in those integrations, refreshed comparison replay, physical devices, actual calendar imports and independent evaluation. Earlier archive `47a218ba` reports retain their original identities; its performance numbers do not measure this candidate. The [main-app counted journeys](../count-journeys-retry/README.md) are source evidence with four independently read downloads, not SDK runtime proof.

Raw reports preserve output and identities with only home paths redacted. Original report hashes are in `provenance.json`. Task-owned example/runner lint passes. No source behavior changed during this packaging turn, and no servers, deployment, cloud settings or external calendars were changed.
