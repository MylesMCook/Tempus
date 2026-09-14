# Tempus

An explainable date engine for short English instructions. Calculate a date, inspect the steps and correct uncertain details. Existing date ranges and repeating patterns are also supported.

[Open Tempus](https://tempus-total.funnydomainname.com/)

1. Enter a calculation, such as `January 31 2027 plus 1 month plus 1 month`.
2. Check the interpretation. Answer any clarification question; follow the visible calculation steps for date arithmetic.
3. Copy the result. **Developer tools** exposes JSON; calendar files are another output format.

Calculations run in your browser. Your phrase is sent to the server only if you choose **Check API result**. The starting time stays fixed until you edit the phrase or choose **Refresh now**.

After the app finishes loading, schedule preparation and calendar downloads also work offline, including their first use. Opening or reloading the app offline is not supported.

Tempus supplies date interpretation for other applications. The website is a playground for the engine; the local TypeScript package is a preview integration surface. It does not require an account.

## Run locally

You need Node.js 22.12 or newer and pnpm 10.33.0. No Cloudflare account or API key is needed.

```sh
git clone https://github.com/MylesMCook/TempusTotal.git
cd TempusTotal
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address printed in the terminal.

## Current direction

Development is focused on the engine and its small reference playground. New feature families are paused while we evaluate whether its arithmetic, explanations and correction help unfamiliar users. See the [product focus and decision gate](docs/product-focus.md).

## Contribute

Found a wrong date or something confusing? [Report it](https://github.com/MylesMCook/TempusTotal/issues/new/choose). Include what you typed and what you expected.

For code changes, start with [Contributing](CONTRIBUTING.md).

## Reference

- [Date rules and supported phrases](docs/date-rules.md)
- [API](docs/api.md)
- [Local TypeScript package candidate](packages/core/README.md) and [integration examples](examples/sdk/README.md)
- [Product matrix and remaining gaps](docs/product-matrix.md)
- [Deploy to Cloudflare](docs/cloudflare-workers.md)
- [Privacy](https://tempus-total.funnydomainname.com/privacy) and [security reports](SECURITY.md)

[MIT license](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)
