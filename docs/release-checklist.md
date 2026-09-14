# Release status

The calculator-focused site is live. [PR #5](https://github.com/MylesMCook/TempusTotal/pull/5) landed as `de265f0`; Cloudflare version `7e6b8cbf-63cb-4beb-b4d0-c1a3884d9b13` serves that build. The SDK remains unpublished.

## Verified for that release

- 1,181 tests pass, with one existing expected failure in a calendar reader's timezone conversion.
- Types, lint, formatting, build, dependency audit in CI and deployment dry run pass.
- Chromium, Firefox and WebKit pass calculator, correction, full-copy and export journeys. Live checks cover both hostnames and the HTTP API.
- Offline preparation and keyboard journeys pass. Separate readers check nine downloaded files. A narrow-screen layout was visually inspected.
- Core bundle: 533,494 minified bytes / 152,164 gzip bytes.

[Live results](../comparison/evidence/calculator-focus/live-report.json) · [Browser/SDK checks](../comparison/evidence/calculator-focus/browser-contract.json) · [Offline checks](../comparison/evidence/calculator-focus/offline-keyboard.json) · [File readers](../comparison/evidence/calculator-focus/calendar-readers.json)

Fresh agent-authored questions exposed limits: two of six unambiguous questions resolved; four stayed unresolved. Both constraint cases stayed unresolved. These are diagnostic cases, not a user study.

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
