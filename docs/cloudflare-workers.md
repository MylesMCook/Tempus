# Cloudflare deployment

The client is a static SPA; `worker/index.ts` handles `/api/*`. The existing production Worker is `tempus-total`, serving `tempus-total.funnydomainname.com`. Local development uses Cloudflare's Vite plugin and simulated bindings on loopback.

## Reproducible configuration

`wrangler.jsonc` controls the Worker, compatibility date, API routing, logging, 100 ms CPU budget, and `PARSE_RATE_LIMITER` binding (120 requests per 60 seconds). The namespace `2026091201` is reserved for this application; choose a distinct namespace for another application in the same account. Keys include an application prefix and the Cloudflare-provided client IP.

Limits apply per IP and Cloudflare location with eventual consistency. They are an abuse guard, not a global quota or spending cap. Shared networks share a limit. A denied request returns 429 with `Retry-After: 60`; a missing or unavailable limiter returns 503. Normal browser calculations do not call this API.

`public/_headers` protects static responses. Worker responses set their own headers because Cloudflare does not apply `_headers` to them. The browser policy allows same-origin scripts and connections, forbids embedding, and retains inline styles required by the existing components. HSTS applies only to the current hostname, without subdomain or preload directives.

The compatibility date remains pinned to preserve date behavior. Observability remains enabled with `redact_query_string=true` to strip query strings from Worker logs and traces. This does not erase historical logs or control other hosting records. Version preview URLs are disabled; both existing production hostnames remain enabled. Account plan, log retention, WAF, zone-wide TLS configuration, and account access policies are separate Cloudflare settings.

## Release

```sh
pnpm install --frozen-lockfile
pnpm run deploy
```

The deploy script checks, tests, type-checks, builds, and deploys using the existing Wrangler authentication. For a different account, authenticate with `pnpm exec wrangler login` and choose your own Worker name. Do not copy OAuth tokens into GitHub or source files. Development does not require login.

Pull requests and `main` pushes run `.github/workflows/ci.yml`. Automatic deployment is opt-in: set repository variable `CLOUDFLARE_DEPLOY_ENABLED=true` only after configuring valid `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. Use a token scoped to the intended account's Worker deployment permissions. The deploy workflow also restricts itself to `main` and validates before deploying. Forks do not deploy by default.

The original repository's GitHub deployment credential needs replacement through its credential handoff. Manual OAuth deployment works independently; it is not evidence that automated deployment works.

## Verify and recover

Before deployment, run `pnpm exec wrangler deploy --dry-run` after building. Regenerate environment types with `pnpm cf-typegen` when bindings change and compare them with the narrow `Env` interface in `worker/index.ts`.

After deployment, inspect the new version's settings and bindings, then verify `/`, `/privacy`, and a fixed-reference `/api/parse` request on both the custom domain and workers.dev endpoint. Confirm HTTPS, response headers, result/API parity, and browser operation. Test 429 and 503 using the local mocked limiter tests, without flooding production.

Record the previous version before a release. There is no database migration. For rollback, revert the affected commit, install its lockfile, rebuild, and deploy through the same path. A rollback that removes the limiter must restore the matching Worker code and configuration together.

References: [rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [static response headers](https://developers.cloudflare.com/workers/static-assets/headers/), [Wrangler limits](https://developers.cloudflare.com/workers/wrangler/configuration/#limits).
