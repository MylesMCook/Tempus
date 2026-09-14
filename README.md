# Tempus

Turn short English phrases into dates, ranges and repeating patterns. Inspect the interpretation, resolve ambiguous details and copy the result.

[Open Tempus](https://tempus-total.funnydomainname.com/)

1. Enter a phrase.
2. Check the interpretation. Answer any clarification question; open **Show calculation steps** for date arithmetic.
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
