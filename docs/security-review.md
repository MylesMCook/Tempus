# Security review — September 12, 2026

This is a dated review record, not a security certification.

## Evidence

- Codex Security completed a standard source scan of `81dce963f255bb1fe04cd8209b753e38518f8c7b`. Independent architecture, HTTP, baseline, and UI-support reviews covered 97 source and support files. No source-backed vulnerabilities were confirmed. Scan ID: `d759b8fa-a7c2-46aa-9d43-3616a58d3e67`.
- Gitleaks 8.30.1 reported no secrets in reachable Git history before this release. Historical metadata checks found no matching local home-directory paths or private network addresses in 411 unique blobs. Pattern scans cannot establish that every historical value is safe to publish.
- Targeted dependency updates removed all advisories reported by `pnpm audit` at review time. The audit covers the installed dependency graph, including development tools. Advisory databases change over time.
- Fresh-checkout verification exposed intermittent false module-resolution errors in Vite+ 0.1.24 (oxlint-tsgolint 0.23.0), matching [upstream issue 987](https://github.com/oxc-project/tsgolint/issues/987). The release uses Vite+ 0.3.1 with its newer type checker; the earlier version is not the release toolchain.
- The hardened build passes 260 tests, source/type checks, and production build. The new tests exercise limiter success, denial, failure, URL limits, and preflight without sending abusive traffic to the public service. Browser calculation, copy feedback, and HTTP 200 API parity work under the production content policy.

The formal scan predates the hardening patch. Its result does not certify the patch, dependencies, live Cloudflare settings, account credentials, or third-party infrastructure. The patch receives focused diff, type, regression, and runtime checks separately.

## Release protections

- Exact API route and method handling; validated, bounded query values; 4,096-character URL ceiling; no database, authenticated resource, or server-side outbound request.
- A Cloudflare rate-limit binding allows approximately 120 requests per 60 seconds per client IP at each edge location. A 100 ms per-invocation CPU budget bounds compute. Neither is a global request or spending cap.
- API responses are uncached and carry browser security headers. Static responses use a same-origin content policy, no embedding, no referrer, restricted browser permissions, and host-only HSTS. Inline styles remain allowed for existing UI components.
- Worker observability remains enabled with query-string redaction. Version preview URLs are disabled. The custom domain and production workers.dev endpoint use the same Worker protections.
- CI uses pinned action commits, read-only repository permissions, frozen installation, checks, tests, build/type validation, and dependency auditing. Deployment requires an explicit repository opt-in and `main`; pull requests do not receive deployment credentials.

## Operational boundaries

The account API confirmed the production custom domain and Worker mapping. HTTPS redirects work. The current Wrangler session cannot read the zone's TLS settings or managed WAF rules, and the dashboard is signed out. Zone configuration and account security policies therefore remain unverified. Do not infer account-wide MFA status from the account's MFA-enforcement setting.

The GitHub deployment token needs replacement through the credential handoff. A manual OAuth deployment does not establish that automated deployment works. Keep deployment opt-in disabled until a successful authorized CI deployment is observed.

The public stateless API intentionally has no authentication. Shared networks share its IP allowance; distributed requests can exceed a single location's limit. Query redaction does not erase old logs or govern other hosting records. The client bundle still exceeds Vite's 500 kB warning threshold; unused legacy UI components also produce peer-dependency warnings on a fresh resolution. These are follow-up maintenance issues, not confirmed source vulnerabilities.

## Publication checklist

- Confirm the proposed MIT license and permission to publish the repository and its history.
- Enable and verify GitHub private vulnerability reporting when the repository becomes public.
- Keep credentials out of source; `.env*` and `.dev.vars*` are ignored. Local agent settings have been removed from tracking.
- Record clean-install, CI, deployment, and live-response evidence in `tasks.md` before release closeout.
- Complete the Cloudflare zone/account review with an authorized signed-in session; retain the remaining uncertainty until that review is done.
