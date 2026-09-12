# Cloudflare deployment

`TempusTotal` now uses Cloudflare's documented React SPA plus Worker API pattern.

## Runtime shape

- `src/` builds the client SPA.
- `worker/index.ts` serves the `/api/parse` endpoint.
- `wrangler.jsonc` uses `assets.not_found_handling = "single-page-application"` so client routes resolve to the SPA.
- `wrangler.jsonc` uses `run_worker_first = ["/api/*"]` so the parser API is handled by the Worker.

## Commands

```sh
vp install
vp dev
vp check
vp test
vp build
pnpm run deploy
```

GitHub Actions is the normal deploy path. Keep `pnpm run deploy` as a manual
fallback for an intentional local `wrangler deploy`, not as the primary release
flow.

## GitHub Actions

GitHub Actions is the source of truth for validation and deployment.

- pull requests run `vp check`, `vp test`, and `vp build`
- pushes to `main` run `.github/workflows/deploy-cloudflare.yml` on Linux runners
- the Cloudflare Worker target hostname is `tempus-total.funnydomainname.com`
- required repo secrets are `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`

## Current release boundary

The Worker and hostname already exist. GitHub check/test/build work, but its deployment token is invalid. User-authorized releases currently use the existing local Wrangler OAuth session through `pnpm run deploy`. Do not copy OAuth credentials into GitHub. Replacing the GitHub token remains a separate credential handoff.

Verify `/`, `/privacy`, and `/api/parse` on the deployed hostname after every release. Phoenix v2 has no database or server migration. Roll back by reverting the rebuild commit, installing its lockfile, rebuilding, and deploying through the same path.

## Notes

- This repo no longer depends on `Next.js`, `OpenNext`, or Vercel-specific runtime integrations.
- Local development now runs through the Cloudflare Vite plugin instead of a split SPA plus proxy setup.
