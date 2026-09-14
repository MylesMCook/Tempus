import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CalculationSuccess } from "@/shared/date-parser";
import { useSettings } from "../context/settings-context";

type RequestState =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "done";
      path: string;
      status: number;
      body: unknown;
      matches: boolean;
    }
  | { kind: "error"; path: string; message: string };

export function ApiDocs({
  expression,
  reference,
  calculation,
}: {
  expression: string;
  reference: string;
  calculation?: CalculationSuccess;
}) {
  const { settings, effectiveDateFormat } = useSettings();
  const [state, setState] = useState<RequestState>({ kind: "idle" });
  const [copied, setCopied] = useState<string | null>(null);
  const hasExpression = Boolean(expression.trim());
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  const params = new URLSearchParams({
    expression,
    timezone: settings.timezone,
    reference,
    format: effectiveDateFormat,
  });
  const path = `/api/parse?${params}`;
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = origin ? new URL(path, origin).toString() : path;
  const stale = (state.kind === "done" || state.kind === "error") && state.path !== path;

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy was blocked. Select the value and copy it manually.");
    }
  }
  async function replay() {
    if (pending.current || !expression.trim()) return;
    const controller = new AbortController();
    pending.current = controller;
    setState({ kind: "loading" });
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(path, { signal: controller.signal, cache: "no-store" });
      const body: unknown = await response.json();
      const matches =
        response.ok &&
        Boolean(calculation) &&
        typeof body === "object" &&
        body !== null &&
        "timestamp" in body &&
        body.timestamp === calculation?.result.timestamp;
      setState({ kind: "done", path, status: response.status, body, matches });
    } catch {
      setState({
        kind: "error",
        path,
        message: controller.signal.aborted
          ? "The request timed out. Try again."
          : "Couldn’t reach the API. Check your connection and try again.",
      });
    } finally {
      window.clearTimeout(timeout);
      pending.current = null;
    }
  }
  const responseText = state.kind === "done" ? JSON.stringify(state.body, null, 2) : "";
  return (
    <div className="grid min-w-0 gap-5 text-sm leading-relaxed">
      <div className="grid gap-3">
        <p className="text-muted-foreground">
          Send this request to the server and compare the dates.
        </p>
        {!hasExpression ? (
          <p className="rounded-lg bg-muted/60 px-4 py-3">
            Enter a phrase above to build a request.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => void replay()}
            disabled={!hasExpression || state.kind === "loading"}
          >
            {state.kind === "loading" ? "Checking…" : "Check API result"}
          </Button>
          {hasExpression ? (
            <Button variant="outline" onClick={() => void copy(url, "Request URL")}>
              {copied === url ? "URL copied" : "Copy request URL"}
            </Button>
          ) : null}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Sends the phrase or interpreted expression shown below, plus your settings, to Cloudflare.
          Avoid private information.{" "}
          <a className="underline underline-offset-4" href="/privacy">
            Privacy details
          </a>
        </p>
      </div>

      {state.kind !== "idle" ? (
        <div aria-live="polite" aria-atomic="true" className="rounded-lg border px-4 py-3">
          {stale ? (
            <p className="font-medium">Inputs changed. Check again for an updated result.</p>
          ) : null}
          {state.kind === "loading" ? <p>Waiting for the API…</p> : null}
          {state.kind === "error" ? (
            <p role="alert" className="text-destructive">
              {state.message}
            </p>
          ) : null}
          {state.kind === "done" ? (
            <>
              <p
                className={
                  stale
                    ? "text-muted-foreground"
                    : state.matches
                      ? "font-medium"
                      : "font-medium text-destructive"
                }
              >
                {stale
                  ? "Previous response"
                  : state.matches
                    ? "Same date as your calculator"
                    : state.status === 429
                      ? "Too many requests. Try again in a minute."
                      : state.status === 503
                        ? "The API is temporarily unavailable."
                        : state.status >= 400
                          ? "The API couldn’t use this request."
                          : "The dates don’t match."}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">HTTP {state.status}</p>
            </>
          ) : null}
        </div>
      ) : null}

      {state.kind === "done" ? (
        <details className="min-w-0 border-t pt-3">
          <summary className="cursor-pointer py-1 font-medium focus-visible:outline focus-visible:outline-2">
            Response JSON
          </summary>
          <pre
            tabIndex={0}
            role="region"
            aria-label="API response JSON"
            className="mt-3 max-h-80 max-w-full overflow-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed"
          >
            {responseText}
          </pre>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            onClick={() => void copy(responseText, "Response")}
          >
            {copied === responseText ? "Response copied" : "Copy response"}
          </Button>
        </details>
      ) : null}

      {hasExpression ? (
        <details className="min-w-0 border-t pt-3">
          <summary className="cursor-pointer py-1 font-medium focus-visible:outline focus-visible:outline-2">
            Request details
          </summary>
          <div className="mt-4 grid min-w-0 gap-4">
            <p className="font-mono text-xs">
              <span className="font-semibold">GET</span> /api/parse
            </p>
            <dl className="grid min-w-0 gap-3">
              {[
                ["Phrase", expression],
                ["Timezone", settings.timezone],
                ["Reference time", reference],
                ["Date format", effectiveDateFormat],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid min-w-0 gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 break-words font-mono text-xs leading-relaxed">{value}</dd>
                </div>
              ))}
            </dl>
            <label className="grid min-w-0 gap-2 text-xs text-muted-foreground">
              Request URL
              <input
                readOnly
                value={url}
                className="min-w-0 w-full rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground focus-visible:outline focus-visible:outline-2"
              />
            </label>
          </div>
        </details>
      ) : null}

      <details className="min-w-0 border-t pt-3">
        <summary className="cursor-pointer py-1 font-medium focus-visible:outline focus-visible:outline-2">
          API reference
        </summary>
        <div className="mt-4 grid gap-5">
          <div>
            <h3 className="font-medium">
              GET <code className="font-mono text-xs">/api/parse</code>
            </h3>
            <p className="mt-1 text-muted-foreground">
              Returns the date and calculation steps as JSON. No API key needed.
            </p>
          </div>
          <dl className="divide-y">
            {[
              ["expression", "Required", "The phrase to calculate. Up to 200 characters."],
              [
                "timezone",
                "Optional",
                "An IANA timezone, such as America/Chicago. Defaults to UTC.",
              ],
              [
                "reference",
                "Optional",
                "A starting instant with an offset, such as 2026-01-26T19:30:00Z. Defaults to the request time; reuse it to reproduce a result.",
              ],
              [
                "format",
                "Optional",
                "A date-fns display format, such as yyyy-MM-dd. Does not change the calculation.",
              ],
            ].map(([name, requirement, description]) => (
              <div key={name} className="py-3 first:pt-0 last:pb-0">
                <dt className="flex flex-wrap items-baseline gap-2">
                  <code className="font-mono text-xs font-semibold">{name}</code>
                  <span className="text-xs text-muted-foreground">{requirement}</span>
                </dt>
                <dd className="mt-1 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
          <div>
            <h3 className="font-medium">Calendar rules</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Changes run in written order. Whole months and years clamp to the last valid day at
                each step.
              </li>
              <li>
                Whole days and weeks follow the local calendar. Their fractional parts use elapsed
                time.
              </li>
              <li>
                Fractional years become whole months first. Any remaining month or year fraction
                uses a labelled day approximation.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Limits and errors</h3>
            <p className="mt-2 text-muted-foreground">
              About 120 requests per minute per IP at each Cloudflare location. HTTP 429 means wait
              a minute; HTTP 503 means try again shortly.
            </p>
            <p className="mt-2 text-muted-foreground">
              Invalid, unknown, or repeated parameters return HTTP 400. URLs over 4,096 characters
              return HTTP 414. Responses are not cached.
            </p>
            <p className="mt-2 text-muted-foreground">
              Engine v2 removed{" "}
              <code className="break-all font-mono text-xs">preserveDayOfMonth</code>. Omit it from
              requests.
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
