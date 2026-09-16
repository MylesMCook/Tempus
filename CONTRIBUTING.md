# Contributing

[Run the app locally](README.md#run-locally), then make one small change.

## Report a problem

[Open an issue](https://github.com/MylesMCook/Tempus/issues/new/choose) with what you tried, what you expected, and what happened. A screenshot helps with layout problems.

For a wrong date, open **Developer tools → Copy calculation details** in the app. This includes the phrase, timezone, and starting time needed to repeat it. Remove anything private before posting.

You can report confusing behavior without proposing a fix. If you want a few things to try, use the [review guide](docs/review-guide.md). Current guides are in the [docs hub](docs/README.md).

For a vulnerability, use the [private reporting instructions](SECURITY.md).

## Submit a change

1. Make the change. For date calculations, add a test with a fixed timezone, starting time, and an expected date calculated separately from the parser.
2. Run the checks below.
3. Open a pull request explaining the problem and what changed. Call out any change to existing date behavior.

```sh
pnpm validate
```

`pnpm validate` runs check, test, build, and `pnpm audit --audit-level=high`. For UI journeys, keep `pnpm dev` running and see [AGENTS.md](AGENTS.md); they need Chrome and the installed `playwright-core` package.

For UI changes, try a phone-width window and keyboard navigation. Check that errors explain what to do next. Typing a phrase must keep working locally; sending it to the API must remain a separate action.

Pull requests run checks without Cloudflare credentials.

For parser coverage work, run `pnpm compare` and inspect the [local comparison report](comparison/README.md). Known unsupported phrases stay visible there; protected arithmetic cases must keep passing.

## Find the code

| To change…                           | Start here                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------- |
| Which phrases are accepted           | [grammar.ts](src/shared/date-engine/grammar.ts)                             |
| Date arithmetic or calculation steps | [date-parser.ts](src/shared/date-parser.ts)                                 |
| API validation and HTTP responses    | [parse-api.ts](src/shared/parse-api.ts), [worker/index.ts](worker/index.ts) |
| The interface and saved preferences  | [src/features/parser](src/features/parser/)                                 |
| Docs, deploy, and product direction  | [docs/README.md](docs/README.md)                                            |

The app uses React and TypeScript, with Tailwind/Radix components and a Cloudflare Worker. Temporal handles timezone arithmetic; date-fns-tz formats dates. See [deployment notes](docs/cloudflare-workers.md) when you need to publish a build.
