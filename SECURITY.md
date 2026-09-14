# Security policy

## Reporting a vulnerability

Use the repository's **Security → Report a vulnerability** form when available: [private reporting](https://github.com/MylesMCook/Tempus/security/advisories/new).

If that form is unavailable, open an issue asking for a private security contact, without technical details or sensitive data. Wait for a private channel before sharing a report. Do not include credentials, personal information, or live exploitation instructions in public issues.

Include the affected commit or release, the security boundary involved, expected behavior, and a concise description of the issue. Prefer source references and harmless local evidence. Do not load-test the public service or test unrelated Cloudflare services.

## Scope and support

Security fixes target the latest `main` revision. Older deployments are not maintained separately. This project has no guaranteed response or support timeline.

The site and API are intentionally public. There are no accounts, private records, database, or authenticated actions. Wildcard CORS permits anonymous API use; it does not grant access to credentials. Calculations happen locally unless the user explicitly sends an API request.

The Worker validates input, limits URL and expression size, applies a per-IP rate limit, and returns uncached responses. Cloudflare's rate limiter is approximate and local to each edge location, not a global request or spending cap. Shared networks share the allowance. Worker logs redact query strings, but historical logs and other hosting records may contain API URLs; do not put confidential information in them.

See the [security review](docs/security-review.md) for the dated evidence and remaining operational checks, and [Cloudflare notes](docs/cloudflare-workers.md) for deployment and rollback.
