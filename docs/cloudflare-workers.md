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

## Manual steps still required

1. Create the `tempus-total` Worker target in Cloudflare.
2. Add the repo secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`.
3. Run `pnpm run cf-typegen` if you want regenerated Cloudflare type artifacts before deploy.
4. Attach `tempus-total.funnydomainname.com` or the real production domain after preview verification.
5. Verify `/`, `/privacy`, and `/api/parse` on the deployed hostname before retiring any legacy host.

## Notes

- This repo no longer depends on `Next.js`, `OpenNext`, or Vercel-specific runtime integrations.
- Local development now runs through the Cloudflare Vite plugin instead of a split SPA plus proxy setup.
