export function DevelopersPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Build with Tempus
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Your app takes it from here.
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Tempus turns short English into dates, ranges and recurrence rules. Your application decides
        what to do with them.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-8 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold">Try the interpretation first</h2>
          <p className="mt-2">
            Enter a phrase on the{" "}
            <a className="text-primary underline underline-offset-4" href="/">
              playground
            </a>
            . Check the result and any clarification choices, then open Developer tools to copy the
            JSON. Dates are calculated locally; API replay is a separate, explicit action.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Use the TypeScript package</h2>
          <p className="mt-2">
            The package is a local preview in the repository, not a published npm release. It
            exposes parsing, batches and reusable parsers; calendar-file preparation is an optional
            entry point.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border bg-background p-4 text-sm">
            <code>{`import { parse } from "@tempus-date/core";

const result = parse("Call Sam tomorrow at noon", {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
});

// Branch on result.status before using a date.
// Resolved values include their kind and source text.`}</code>
          </pre>
          <a
            className="mt-3 inline-block py-2 text-primary underline underline-offset-4"
            href="https://github.com/MylesMCook/TempusTotal"
          >
            Source repository
          </a>
          <p className="text-sm text-muted-foreground">
            This deployed preview may be ahead of the repository's published branch. A stable
            package contract and release are still pending.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Keep the decisions with the input</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Show clarification choices instead of choosing an ambiguous date silently.</li>
            <li>Clear old choices when the phrase, timezone or reference changes.</li>
            <li>Distinguish a recurrence preview from the complete occurrence set.</li>
            <li>
              Keep explanations available and let the user inspect the result before your app acts
              on it.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">HTTP API: date calculations</h2>
          <p className="mt-2">
            The existing <code>/api/parse</code> endpoint handles strict date calculations. It does
            not expose the full natural-language clarification and recurrence interface. Use the
            package for those capabilities.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Calendar files are an output format. Actual calendar-client imports and physical-device
            behavior remain unverified. Tempus's API is stateless; integrations own storage and
            external actions.
          </p>
        </section>
      </div>
    </main>
  );
}
