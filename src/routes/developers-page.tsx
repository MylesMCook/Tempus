"use client";

import type { KeyboardEvent, ReactNode } from "react";

const PACKAGE_EXAMPLE = `import { parse } from "@tempus-date/core";

const result = parse("Call Sam tomorrow at noon", {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
});

// Branch on result.status before using a date.
// Resolved values include their kind and source text.`;

const API_EXAMPLE = `curl --get 'https://tempus.funnydomainname.com/api/parse' \\
  --data-urlencode 'expression=jan 31 2026 plus 1 month' \\
  --data-urlencode 'timezone=America/Chicago' \\
  --data-urlencode 'reference=2026-01-26T19:30:00.000Z'`;

// Matches the result panel on the home page.
const card = "min-w-0 rounded-2xl border bg-background p-5 shadow-xs sm:p-7";

function onCodeSampleKeyDown(event: KeyboardEvent<HTMLPreElement>) {
  if (
    (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
    event.currentTarget.scrollWidth > event.currentTarget.clientWidth
  ) {
    event.preventDefault();
    event.currentTarget.scrollBy({
      left: event.key === "ArrowRight" ? 40 : -40,
    });
  }
}

function CodeSample({ label, children }: { label: string; children: string }) {
  return (
    <pre
      tabIndex={0}
      role="region"
      aria-label={label}
      onKeyDown={onCodeSampleKeyDown}
      className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl border bg-page p-4 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:break-normal sm:whitespace-pre"
    >
      <code>{children}</code>
    </pre>
  );
}

function SpecList({
  rows,
}: {
  rows: ReadonlyArray<{ id: string; term: ReactNode; detail: ReactNode }>;
}) {
  return (
    <dl className="mt-6 divide-y border-y text-sm">
      {rows.map((row) => (
        <div key={row.id} className="grid gap-1 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
          <dt className="font-medium text-foreground">{row.term}</dt>
          <dd className="text-muted-foreground">{row.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

function PathCard({ href, title, children }: { href: string; title: string; children: ReactNode }) {
  return (
    <li className="min-w-0">
      <a
        href={href}
        className="flex h-full flex-col gap-2 rounded-2xl border bg-background p-5 shadow-xs transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="font-semibold tracking-tight">
          {title}{" "}
          <span aria-hidden className="text-primary">
            →
          </span>
        </span>
        <span className="text-sm leading-relaxed text-muted-foreground">{children}</span>
      </a>
    </li>
  );
}

export function DevelopersPage() {
  return (
    <main
      id="main"
      className="t-page-enter mx-auto w-full max-w-6xl px-4 pb-10 pt-10 sm:px-8 sm:pt-14"
    >
      <header className="mb-8 lg:mb-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Developers</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Parse English into dates. Use the playground, the unpublished TypeScript package, or{" "}
          <code className="text-foreground">GET /api/parse</code>.
        </p>
      </header>

      <nav aria-label="Integration paths">
        <ul className="grid gap-4 sm:grid-cols-3">
          <PathCard href="/" title="Playground">
            Try a phrase, answer any questions, then copy JSON from Developer tools. Parsing stays
            on your device unless you choose Check API result.
          </PathCard>
          <PathCard href="#package" title="TypeScript package">
            <code className="text-foreground">@tempus-date/core</code> is not on npm. Pack a tarball
            from this repository. The public API may change.
          </PathCard>
          <PathCard href="#api" title="HTTP API">
            Date calculations only. Use the package for clarification and recurrence.
          </PathCard>
        </ul>
      </nav>

      <section id="package" className={`${card} mt-8 scroll-mt-6 lg:grid lg:grid-cols-2 lg:gap-10`}>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">TypeScript package</h2>
          <p className="mt-3 leading-relaxed">
            Parse one phrase or a batch. Reuse a parser with a fixed context. The package is not
            published yet.
          </p>
          <p className="mt-4 leading-relaxed">
            Branch on <code>result.status</code> before using a date. When the status is{" "}
            <code>needs-clarification</code>, show the question and choices. Do not pick a date
            silently.
          </p>
          <SpecList
            rows={[
              {
                id: "resolved",
                term: <code className="font-mono text-xs">resolved</code>,
                detail: (
                  <>
                    Use the value. <code className="text-foreground">kind</code> is point, interval,
                    collection or recurrence.
                  </>
                ),
              },
              {
                id: "needs-clarification",
                term: <code className="font-mono text-xs">needs-clarification</code>,
                detail:
                  "Show the offered question and choices, if present. Otherwise show the error and let the user edit.",
              },
              {
                id: "unsupported",
                term: <code className="font-mono text-xs">unsupported</code>,
                detail: "Show the reason and let the user edit.",
              },
              {
                id: "no-expression",
                term: <code className="font-mono text-xs">no-expression</code>,
                detail: "Keep the text; there is no date to act on.",
              },
            ]}
          />
          <p className="mt-4 leading-relaxed">
            Clear previous choices when the phrase, timezone or reference changes. A recurrence
            includes a preview, not necessarily every occurrence.
          </p>
          <p className="mt-4 leading-relaxed">
            Optional <code>@tempus-date/core/calendar</code> prepares complete schedules and files.
            Calendar-client imports and physical-device behavior remain unverified. Keep the result
            inspectable before your app acts on it.
          </p>
        </div>
        <div className="mt-6 min-w-0 lg:mt-10">
          <CodeSample label="TypeScript package example">{PACKAGE_EXAMPLE}</CodeSample>
          <p className="mt-3">
            <a
              className="inline-block py-2 text-primary underline underline-offset-4"
              href="https://github.com/MylesMCook/Tempus/tree/main/packages/core"
            >
              Package source
            </a>
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            From the repository root, run <code className="text-foreground">pnpm build:sdk</code>,
            then <code className="text-foreground">pnpm pack</code> in <code>packages/core</code>.
            Install the tarball by absolute path. CommonJS is not provided.
          </p>
        </div>
      </section>

      <section id="api" className={`${card} mt-6 scroll-mt-6 lg:grid lg:grid-cols-2 lg:gap-10`}>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">HTTP API</h2>
          <p className="mt-3 leading-relaxed">
            <code>GET /api/parse</code> returns a calculated date as JSON. No API key. It does not
            clarify ambiguous input or expand recurrences. Check API result on the playground sends
            the highlighted date phrase, not a full reminder sentence.
          </p>
          <SpecList
            rows={[
              {
                id: "expression",
                term: <code className="font-mono text-xs">expression</code>,
                detail: "Required. The phrase to calculate. Up to 200 characters.",
              },
              {
                id: "timezone",
                term: <code className="font-mono text-xs">timezone</code>,
                detail: "Optional. An IANA timezone, such as America/Chicago. Defaults to UTC.",
              },
              {
                id: "reference",
                term: <code className="font-mono text-xs">reference</code>,
                detail:
                  "Optional. A starting instant with an offset, such as 2026-01-26T19:30:00Z. Defaults to the request time; reuse it to reproduce a result.",
              },
              {
                id: "format",
                term: <code className="font-mono text-xs">format</code>,
                detail:
                  "Optional. A date-fns display format, such as yyyy-MM-dd. Does not change the calculation.",
              },
            ]}
          />
        </div>
        <div className="mt-6 min-w-0 lg:mt-10">
          <CodeSample label="HTTP API request example">{API_EXAMPLE}</CodeSample>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            That request returns 28 February 2026 at midnight in Chicago:{" "}
            <code className="text-foreground">2026-02-28T06:00:00.000Z</code>.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            About 120 requests per minute per IP at each Cloudflare location. HTTP 429 means wait a
            minute; HTTP 503 means try again shortly. Invalid, unknown or repeated parameters return
            HTTP 400. URLs over 4,096 characters return HTTP 414. Responses are not cached.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Engine v2 removed <code>preserveDayOfMonth</code>. Omit it from requests. The API is
            stateless; your integration owns storage and external actions. Request URLs include the
            phrase.{" "}
            <a className="text-primary underline underline-offset-4" href="/privacy">
              Privacy details
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
