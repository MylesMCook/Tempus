# Cloudflare deployment

RedwoodSDK 1.7.3 serves the web shell and explicit routes from `src/worker.tsx`; `worker/index.ts` preserves the strict `/api/*` handler. Parsing and calendar-file preparation remain client-side. The existing production Worker is `tempus`, serving `tempus.funnydomainname.com`. Local development uses Cloudflare's Vite plugin and simulated bindings on loopback.

## Reproducible configuration

`wrangler.jsonc` controls the Worker, compatibility date, API routing, logging, 100 ms CPU budget, and `PARSE_RATE_LIMITER` binding (120 requests per 60 seconds). The namespace `2026091201` is reserved for this application; choose a distinct namespace for another application in the same account. Keys include an application prefix and the Cloudflare-provided client IP.

Limits apply per IP and Cloudflare location with eventual consistency. They are an abuse guard, not a global quota or spending cap. Shared networks share a limit. A denied request returns 429 with `Retry-After: 60`; a missing or unavailable limiter returns 503. Normal browser calculations do not call this API.

`public/_headers` protects static assets. RedwoodSDK HTML responses set their own nonce-based CSP and security headers; API responses retain their stricter policy. Cloudflare does not apply `_headers` to Worker-rendered pages. The browser policy allows same-origin scripts and connections, forbids embedding, and retains inline styles required by the existing components. HSTS applies only to the current hostname, without subdomain or preload directives.

The compatibility date remains pinned to preserve date behavior; `nodejs_compat` supports the RedwoodSDK runtime. No database, account or server-action integration is configured. Observability remains enabled with `redact_query_string=true` to strip query strings from Worker logs and traces. This does not erase historical logs or control other hosting records. Version preview URLs are disabled; both existing production hostnames remain enabled. Account plan, log retention, WAF, zone-wide TLS configuration, and account access policies are separate Cloudflare settings.

## Release

```sh
pnpm install --frozen-lockfile
pnpm run deploy
```

The deploy script checks, tests, type-checks, builds, and deploys using the existing Wrangler authentication. For a different account, authenticate with `pnpm exec wrangler login` and choose your own Worker name. Do not copy OAuth tokens into GitHub or source files. Development does not require login.

Pull requests and `main` pushes run `.github/workflows/ci.yml`. Pushes to `main` in this repository also run `.github/workflows/deploy-cloudflare.yml`, which validates, deploys `tempus`, then deploys the `tempus-total` compatibility Worker. Forks do not deploy. Pause production deploys by setting repository variable `CLOUDFLARE_DEPLOY_ENABLED=false`. The workflow needs repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Use a token scoped to this account's Worker deployment permissions.

A successful GitHub Actions deploy is the evidence that automated deployment works. Manual Wrangler OAuth deploys are independent and do not prove the GitHub secrets are valid.

## Verify and recover

Before deployment, run `pnpm exec wrangler deploy --dry-run` after building. Regenerate environment types with `pnpm cf-typegen` when bindings change and compare them with the narrow `Env` interface in `worker/index.ts`.

The production build is in `dist/worker` and `dist/client`; Wrangler uses `.wrangler/deploy/config.json` to select the built entry point.

After deployment, inspect the new version's settings and bindings, then verify `/`, `/privacy`, and a fixed-reference `/api/parse` request on both the custom domain and workers.dev endpoint. Confirm HTTPS, response headers, result/API parity, and browser operation. Test 429 and 503 using the local mocked limiter tests, without flooding production.

Record the previous version before a release. There is no database migration. For rollback, revert the affected commit, install its lockfile, rebuild, and deploy through the same path. A rollback that removes the limiter must restore the matching Worker code and configuration together.

References: [rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [static response headers](https://developers.cloudflare.com/workers/static-assets/headers/), [Wrangler limits](https://developers.cloudflare.com/workers/wrangler/configuration/#limits).

## Tempus hostname migration

The main configuration owns `tempus.funnydomainname.com` and enables `tempus.mylesmcook.workers.dev`. GitHub deploys `tempus` first, then `wrangler.legacy.jsonc`. Manual order is the same: deploy the main Worker, then `pnpm exec wrangler deploy --config wrangler.legacy.jsonc`. The old `tempus-total` Worker remains only for compatibility: browser paths redirect to the new domain; `/api` requests use a service binding to the main Worker, preserving preflight behavior and rate limiting. The compatibility Worker has no database or secrets.

Do not delete the old Worker while old links or integrations exist. Its prior application version `1a9e0cc8-0ed8-46b0-bfae-c876794d07e0` is the pre-migration rollback. Restore that version on `tempus-total` if the new service fails; keep the main service available for clients already using its URL. Domain-local browser preferences start fresh on the new origin; old local storage is not copied or deleted.
