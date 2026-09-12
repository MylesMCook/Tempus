# TempusTotal

Find the date for `3 weeks ago`, `next Friday`, or `tomorrow at noon`.

[Open the calculator](https://tempus-total.funnydomainname.com/)

1. Enter a phrase.
2. Check the date. Open **Show calculation steps** to see how it was worked out.
3. Choose **Copy date**.

Calculations run in your browser. Your phrase is sent to the server only if you choose **Check API result**. The starting time stays fixed until you edit the phrase or choose **Refresh now**.

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
- [Deploy to Cloudflare](docs/cloudflare-workers.md)
- [Privacy](https://tempus-total.funnydomainname.com/privacy) and [security reports](SECURITY.md)

[MIT license](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)
