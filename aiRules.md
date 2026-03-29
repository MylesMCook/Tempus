# AI Development Rules

## Project Structure

- Build around the current `Vite+` and Cloudflare shape.
- Keep the app split into small, explicit surfaces:
  - `src/` for the React SPA
  - `src/features/` for parser-focused UI modules
  - `src/routes/` for client routes like `/` and `/privacy`
  - `src/shared/` for parser and API contract logic shared by UI and Worker
  - `src/components/ui/` for shadcn/ui primitives
  - `worker/index.ts` for the Cloudflare Worker entrypoint

## Architecture Rules

1. Default to a simple SPA plus Worker API.
2. Do not reintroduce Next.js, SSR, middleware, or framework-only abstractions unless there is a concrete product need.
3. Keep `/api/parse` stable. Preserve its query parameters and JSON response shape unless there is a deliberate versioned change.
4. Keep parser logic in shared modules so the UI and Worker execute the same behavior.
5. Avoid speculative infrastructure like analytics, pseudo-rate limiting, or monitoring layers unless they are actively needed.

## UI Rules

1. Use `shadcn/ui` as the component baseline.
2. Prefer small route and feature components over large all-in-one screens.
3. Keep the main parser flow fast to scan:
   - expression input
   - preview/result
   - settings
   - API examples
4. Follow Tailwind conventions, but avoid decorative complexity that does not improve the parser workflow.

## Parser Rules

1. Support natural language, relative dates, weekday expressions, and date math.
2. Handle invalid input explicitly and return structured API errors.
3. Preserve test coverage for common expressions and edge cases before changing parser behavior.
4. Treat parser behavior changes as product changes, not refactors.

## Code Style

1. Use TypeScript throughout.
2. Prefer clear, local code over indirection.
3. Keep modules narrow and reversible.
4. Add comments only where the code would otherwise be hard to reason about.

## Validation

1. Use the house `Vite+` flow:
   - `vp check`
   - `vp test`
   - `vp build`
2. Keep local development compatible with the Cloudflare runtime path.
3. Verify `/`, `/privacy`, and `/api/parse` whenever routing or Worker behavior changes.

## Documentation

1. Keep `README.md` aligned with the current stack and commands.
2. Keep `docs/cloudflare-workers.md` aligned with the live deploy shape.
3. Remove stale framework guidance when architecture changes.
