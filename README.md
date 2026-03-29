# TempusTotal

TempusTotal is a natural-language date parser built as a small React SPA with a Cloudflare Worker API.

## Stack

- `Vite+`
- `React + TypeScript`
- `shadcn/ui`
- `Cloudflare Vite plugin`
- `Cloudflare Worker` for `/api/parse`

## Commands

```bash
vp install
vp dev
vp check
vp test
vp build
pnpm run deploy
```

Production deploys are authoritative through GitHub Actions on Linux runners in
[`deploy-cloudflare.yml`](./.github/workflows/deploy-cloudflare.yml). Use
`pnpm run deploy` only as a manual recovery path when you intentionally need a
local `wrangler deploy`.

## Architecture

- `src/` contains the SPA.
- `worker/index.ts` contains the Cloudflare API entrypoint.
- `src/shared/parse-api.ts` preserves the `/api/parse` contract.
- `src/shared/date-parser.ts` contains the parser logic shared by the UI and the Worker.

## Routes

- `/` main parser UI
- `/privacy` privacy policy
- `/api/parse` public parse endpoint

## Cloudflare

The app follows Cloudflare's React SPA plus Worker API pattern.

- SPA routing uses `assets.not_found_handling = "single-page-application"`.
- `/api/*` is routed through the Worker with `run_worker_first`.
- Local development runs through Vite with the Cloudflare Vite plugin so the Worker runtime stays close to production.
- GitHub Actions is the authoritative CI and deploy path.
- The Cloudflare Worker target hostname is `tempus-total.funnydomainname.com`.

See [`docs/cloudflare-workers.md`](./docs/cloudflare-workers.md) for deploy and cutover notes.
