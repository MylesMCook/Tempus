# Tempus — local development and testing

## Prerequisites

- Node.js **22.12+** (CI uses 24)
- **pnpm 10.33.0** — `corepack enable && corepack prepare pnpm@10.33.0 --activate`
- **Vite+ CLI** (`vp`) on PATH (this environment wraps it in a shell function)
- **Google Chrome** for browser journey scripts (Playwright launches via `channel: "chrome"`)
- **uv** (optional) — second-reader Python scripts under `examples/app/` use inline PEP 723 deps

No Cloudflare account or API keys are required for local work.

## First-time setup

```sh
cd Tempus
vp install --frozen-lockfile   # or: pnpm install --frozen-lockfile
```

## Daily commands

| Goal                         | Command                                                   |
| ---------------------------- | --------------------------------------------------------- |
| Dev server (HMR)             | `pnpm dev` → http://127.0.0.1:5174/                       |
| Production-like local server | `pnpm build && pnpm preview --host 127.0.0.1 --port 5175` |
| Lint, format, types          | `pnpm check`                                              |
| Unit / integration tests     | `pnpm test`                                               |
| Parser comparison report     | `pnpm compare` → `comparison/results/report.md`           |
| Match CI locally             | `pnpm validate`                                           |

## Browser journey tests

`playwright-core` is a dev dependency. Keep **`pnpm dev`** running; `vite.config.ts` binds **127.0.0.1:5174**, which the journey scripts expect.

```sh
node examples/app/verify-calculator.mjs node_modules/playwright-core/index.mjs /tmp/tempus-run-$(uuidgen)
```

`verify-calculator.mjs` always uses port 5174. For built-asset / CSP checks, run `pnpm preview --host 127.0.0.1 --port 5175` and set `TEMPUS_APP_URL=http://127.0.0.1:5175` on any runner that reads that override. See `examples/app/README.md`.

Python second readers:

```sh
uv run --locked examples/app/read-reminder.py /tmp/tempus-run
```

## Code map

- Date engine and API: `src/shared/`, `packages/core/`
- Cloudflare Worker HTTP API: `worker/index.ts`
- App UI: `src/features/parser/`, `src/routes/`
- App entry / CSP: `src/worker.tsx`
- Current docs: `docs/` (hub: `docs/README.md`)
- Historical notes: `docs/archive/`
- Samples and browser journeys: `examples/` (hub: `examples/README.md`)
- Keep `/api/parse` stable. Parser logic stays in shared modules so the UI and Worker match.

## Notes

- Calendar preparation uses an inline bundled Web Worker. The client app preloads that chunk at startup; a static `?worker&inline` import still breaks Cloudflare + rwsdk SSR module scanning in `pnpm dev`.
- `comparison/results/` is gitignored; comparison evidence under `comparison/evidence/` is retained history, not setup docs.
