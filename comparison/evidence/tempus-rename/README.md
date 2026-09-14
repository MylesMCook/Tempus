# Tempus rename verification

GitHub is now `MylesMCook/Tempus`. Its old URL returns 301 to the canonical repository; origin, clone instructions, issue/security links, root package metadata and homepage use the new name. PR #8 merged as `03e846f`.

Cloudflare main Worker `tempus` serves `tempus.funnydomainname.com` and `tempus.mylesmcook.workers.dev`, version `df3c7f40-f513-43c8-98b6-94e9533af521`. [Live checks](live.json) cover both hosts, HTTPS/security headers, API results and three desktop browser journeys.

Only after those checks passed, old Worker `tempus-total` became compatibility version `04888dfd-aa9a-4804-b581-6533d373def3`. [Legacy checks](legacy.json) verify both old hosts: 308 browser redirects preserve paths/queries; API results and OPTIONS preflights match the new service. The test initially expected preflight 204; direct comparison confirmed the existing canonical response is 200, which the legacy service preserves.

[Cloudflare readback](cloudflare.json) confirms custom-domain ownership, main assets/rate-limit bindings, 100 ms CPU limits, query-string redaction, disabled preview URLs, and the legacy service binding. The OAuth credential cannot list DNS records (403); custom-domain provisioning and live HTTPS succeeded. No unrelated DNS records, zone-wide security settings, credentials or persistent data were changed.

1,184 tests pass plus the existing expected calendar-reader failure. Types, lint, formatting, build, CI dependency audit and both deployment dry runs pass. No physical-device, independent usability or actual calendar-import claim follows.

Rollback: the old Worker's pre-migration application version is `1a9e0cc8-0ed8-46b0-bfae-c876794d07e0`. Restore it on `tempus-total` if compatibility forwarding fails, keeping the new service for clients already using it. See the deployment guide. Browser preferences are origin-local and start fresh on the new domain; old storage is untouched. Historical reports and legacy configuration intentionally retain old names.
