# Release status

[PR #8](https://github.com/MylesMCook/Tempus/pull/8) landed as `03e846f`. The canonical site is [tempus.funnydomainname.com](https://tempus.funnydomainname.com/), served by Worker `tempus`, version `df3c7f40-f513-43c8-98b6-94e9533af521`. The SDK remains unpublished.

The old Worker is compatibility-only, version `04888dfd-aa9a-4804-b581-6533d373def3`: browser URLs redirect; API requests forward internally. Its pre-migration application version `1a9e0cc8-0ed8-46b0-bfae-c876794d07e0` remains the fallback. See [deployment and recovery](cloudflare-workers.md).

[Migration evidence](../comparison/evidence/tempus-rename/README.md): 1,184 tests pass plus the existing expected failure; types/lint/build, CI audit and both deployment dry runs pass. New endpoints pass three-browser calculation, correction and complete-copy checks. Both legacy endpoints preserve API results and CORS preflights. Cloudflare bindings, CPU limits, query redaction and disabled preview URLs were read back.

[Copilot review and triage](../comparison/copilot-review/README.md) retains the preceding SDK install, error-contract and UI-fix evidence. The date engine is unchanged.

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
