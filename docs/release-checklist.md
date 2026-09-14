# Release status

The simplified calculator site is live. [PR #6](https://github.com/MylesMCook/TempusTotal/pull/6) landed as `6c8a414`; Cloudflare version `228380e5-5b2f-4ec9-8ca4-69adebe55f4d` serves that build. The SDK remains unpublished. Previous version `7e6b8cbf-63cb-4beb-b4d0-c1a3884d9b13` is the rollback target.

## Verified for that release

- 1,181 tests pass, with one existing expected failure in a calendar reader's timezone conversion.
- Types, lint, formatting, build, dependency audit in CI and deployment dry run pass.
- Chromium, Firefox and WebKit pass calculator, correction, full-copy and export journeys. Live checks cover both hostnames and the HTTP API.
- Offline preparation and keyboard journeys pass. Separate readers check nine downloaded files. A narrow-screen layout was visually inspected.
- Core bundle: 533,494 minified bytes / 152,164 gzip bytes.

[Live results](../comparison/evidence/writer-ui/live-report.json) · [Browser/SDK checks](../comparison/evidence/writer-ui/browser-contract.json) · [Offline checks](../comparison/evidence/writer-ui/offline-keyboard.json) · [File readers](../comparison/evidence/writer-ui/calendar-readers.json)

The [copy/UI review](writer-ui-review.md) records this release’s changes. The engine and its measured bundle are unchanged.

Earlier fresh agent-authored questions exposed limits: two of six unambiguous questions resolved; four stayed unresolved. Both constraint cases stayed unresolved. These are diagnostic cases, not a user study.

## Still open

- [ ] Independent task author, reviewer and six unfamiliar participants for the [product decision](product-focus.md).
- [ ] Physical-phone and assistive-technology checks.
- [ ] Actual calendar-client imports; file-reader success is separate evidence.
- [ ] Stable SDK naming, versioning and compatibility policy before npm publication.
- [ ] Broader wording and the recorded timer/title, duration-diagnostic and output-label issues in [tasks](../tasks.md).

The recorded reader failure and unsupported phrases remain visible; no general accuracy or superiority claim follows from these checks.

## Before the next release

Run `pnpm check`, `pnpm test`, `pnpm build` and the CI dependency audit. Replay the affected browser journeys, run the Cloudflare dry run, then verify the deployed page and fixed-reference API result. Keep the prior version for rollback. Follow the [deployment guide](cloudflare-workers.md).

[Earlier plans, artifact hashes and measurements](release-history.md) retain their original scope. Current work is tracked in [tasks](../tasks.md).
