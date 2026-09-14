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

`playwright-core` is a dev dependency. Keep **`pnpm dev`** running on port **5174** (default in `vite.config.ts` and journey runners).

```sh
node examples/app/verify-calculator.mjs node_modules/playwright-core/index.mjs /tmp/tempus-run-$(uuidgen)
```

For built-asset / CSP checks, use preview on **5175** and set `TEMPUS_APP_URL=http://127.0.0.1:5175` (see `examples/app/README.md`).

Python second readers:

```sh
uv run --locked examples/app/read-reminder.py /tmp/tempus-run
```

## Code map

- Date engine and API: `src/shared/`, `packages/core/`
- Cloudflare Worker HTTP API: `worker/index.ts`
- App UI: `src/features/parser/`, `src/routes/`
- App entry / CSP: `src/worker.tsx`

## Notes

- Calendar preparation uses an inline bundled Web Worker; it is loaded via dynamic `import()` so the Cloudflare + rwsdk dev server can start (static `?worker&inline` imports break SSR module scanning in dev).
- `comparison/results/` is gitignored; comparison evidence under `comparison/evidence/` is retained history, not setup docs.
