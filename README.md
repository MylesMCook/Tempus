# Tempus

Calculate dates in words and see each step.

`January 31 2027 plus 1 month plus 1 month` → **March 28, 2027**

January 31 becomes February 28, then March 28. Tempus shows the month-end adjustment instead of hiding it.

[Open the calculator](https://tempus.funnydomainname.com/) · [Date rules](docs/date-rules.md) · [TypeScript quickstart](packages/core/README.md)

Calculations run on your device. **Check API result** sends the calculation to the server; typing does not. After the app loads, copying schedules and preparing calendar files also work offline. Opening or reloading offline is not supported.

The engine also supports date ranges and repeating schedules. The TypeScript package is unpublished; its API may change.

## Run locally

Use Node.js 22.12+ and pnpm 10.33.0. No API key or Cloudflare account is needed.

```sh
git clone https://github.com/MylesMCook/Tempus.git
cd Tempus
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address printed in the terminal.

## Help improve it

[Report a wrong date or confusing step](https://github.com/MylesMCook/Tempus/issues/new/choose). Include your input and expected result; remove private details.

[Contributing](CONTRIBUTING.md) · [Docs](docs/README.md) · [Current direction](docs/product-focus.md) · [Privacy](https://tempus.funnydomainname.com/privacy) · [Security](SECURITY.md)

## Repository layout

| Path | What it is |
| ---- | ---------- |
| `src/` | Calculator UI, routes, and the shared date engine |
| `worker/` | Cloudflare HTTP API |
| `packages/core/` | Unpublished TypeScript SDK |
| `docs/` | Current product, API, and deploy guides |
| `docs/archive/` | Historical notes and completed task logs |
| `comparison/` | Parser comparison tests and retained evidence |
| [`examples/`](examples/README.md) | Browser journeys and SDK samples |

[MIT license](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)
