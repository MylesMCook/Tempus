# Current SDK runtime journeys

Archive `e70f6d12405597b332dfcdf469acdac73b3f90eb6ee3f6408931272a9eb64d5d` passes the existing complete offline browser and local Worker diagnostics. This closes their stale-archive evidence gap after the snapshot-formatting change; it adds no language capability or independent evaluation.

## Offline browser integration

Fourteen authored tasks pass in six desktop contexts: Chrome 153.0.8010.36, Playwright Firefox 148.0.2 and WebKit 26.4, each at 320 and 1280 pixels. Separate icalendar 7.3.0 and recurring-ical-events 3.8.2 readers accept all 84 downloaded files. The installed package and copied integration hashes are checked before running.

Each context loads the static example and then disconnects. A deliberate control fetch fails, and no subsequent request occurs during the recorded clarification, editing and export tasks. The runner checks retained input, keyboard choices, focus, stale-decision invalidation, unresolved download restrictions and actual downloaded files. The readers verify expected dates, interval endpoints, precision, counts and exclusions.

The suite covers weekly recurrence, finite date lists, correction, alternatives, date-only and mixed ranges, occurrence counts and exclusion policies. It predates newer quantity-list, recipient and clock-first browser tasks. Those retain their separately scoped main-app/Node/Worker evidence; this report does not claim that all declared language families have browser journeys.

WebKit uses Option-Tab. Downloads are spaced 1.1 seconds apart. Ordinary-Tab WebKit behavior and historical rapid-download failures are not resolved by this run. Screenshots capture final states, not every intermediate interaction.

## Local Worker integration

The unchanged version-3 diagnostic passes through Wrangler 4.131.1 in local workerd. It verifies failure recovery, quantity and recipient/clock-first clarification, edited-input invalidation, and eighteen calendar files covering weekly, monthly, counts, ranges and date lists. Both separate readers accept those files. The copied diagnostic type-checks against installed package declarations; all 56 installed files match the archive after execution.

The diagnostic accepts no user input and performs no external requests or calendar writes. This is local Worker execution, not deployed Cloudflare evidence. Current Node 22/26 evidence and the implementation change are retained in [snapshot resources](../snapshot-resources/README.md).

## Remaining release gates

No physical device, retail Safari, actual calendar import or independent user was tested. Offline begins after module loading; cold offline website startup and disconnected installation remain unverified. No latency, energy or peak-memory claim follows from these correctness checks. Ongoing-duration conformance and future-clock export restrictions remain unchanged.

The task-local servers on loopback ports 5184 and 8788 were stopped after verification. No persistent service, cloud setting, publication or calendar was changed.

Reproduce with the packed static/Worker commands in [the SDK examples](../../../examples/sdk/README.md), `verify-browser.mjs --webkit-option-tab --offline-after-load`, and the separate Python readers. Retained files include package provenance, Worker configuration/response, browser reports/downloads, reader results, exact runners and the compressed static bundle. SHA256SUMS establishes file integrity, not independent authorship or certification.

Retained TypeScript source copies now use a `.txt` suffix so the project does not compile evidence as source. Their contents are unchanged; the failed build and filename mapping are recorded in [input preservation](../input-preservation/README.md).
