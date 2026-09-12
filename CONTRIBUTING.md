# Contributing

Start with the [README](README.md#development). Local development needs Node.js 22.12 or newer and pnpm 10.33.0; it needs no Cloudflare account or API token.

Before a pull request, run:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm audit --audit-level=high
```

Keep each change focused. Parser changes need an independently calculated expected date and a regression test with an explicit reference and timezone. Preserve browser/API parity. Explain deliberate changes to calendar, DST, approximation, or error semantics.

For interface changes, check the complete path at narrow and wide widths, keyboard access, visible focus, loading/error recovery, and whether the next action is clear. Preserve local calculation and require an explicit action to send a phrase to the API.

Report bugs with the phrase, timezone, captured reference, expected result, and actual result. **Copy calculation details** supplies the inputs; remove anything private before posting. Screenshots help with layout problems. Use the [review guide](docs/review-guide.md) for broader critique.

Do not post credentials or vulnerability details in public issues. Follow [SECURITY.md](SECURITY.md) for security reports. Pull requests run validation without deployment credentials; deployment is an opt-in maintainer operation.
