# Release status

[PR #7](https://github.com/MylesMCook/TempusTotal/pull/7) landed as `ec6e01c`. Cloudflare version `1a9e0cc8-0ed8-46b0-bfae-c876794d07e0` serves the clarification and SDK-guidance fixes. The SDK remains unpublished. Previous version `228380e5-5b2f-4ec9-8ca4-69adebe55f4d` is the rollback target.

[Copilot review and triage](../comparison/copilot-review/README.md): three distinct models, reproduced findings and rejected suggestions. Current checks pass: 1,181 tests plus the existing expected failure, types/lint/build, CI audit, fresh SDK install, packed-SDK/browser journeys and [live fixes](../comparison/copilot-review/live-fixes.json). [Both-host checks](../comparison/copilot-review/live-report.json) pass. No engine or infrastructure change.

## Retained evidence from the preceding UI release

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
