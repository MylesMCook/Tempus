import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Calculation } from "@/shared/date-parser";
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
  calculation: Calculation;
}) {
  const { settings, effectiveDateFormat } = useSettings();
  const [state, setState] = useState<RequestState>({ kind: "idle" });
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  const params = new URLSearchParams({
    expression,
    timezone: settings.timezone,
    reference,
    format: effectiveDateFormat,
  });
  const path = `/api/parse?${params}`;
  const url = new URL(path, window.location.origin).toString();
  const stale = (state.kind === "done" || state.kind === "error") && state.path !== path;

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
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
        calculation.ok &&
        typeof body === "object" &&
        body !== null &&
        "timestamp" in body &&
        body.timestamp === calculation.result.timestamp;
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
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 text-sm">
      <p>
        The API uses the same engine, timezone, and reference time as your calculator. Engine v2
        returns the result and every calculation step.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => void replay()}
          disabled={!expression.trim() || state.kind === "loading"}
        >
          {state.kind === "loading" ? "Checking…" : "Replay with API"}
        </Button>
        <Button variant="outline" onClick={() => void copy(url)} disabled={!expression.trim()}>
          Copy request URL
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Replay sends your phrase, preferences, and reference time to the server. Request URLs may
        appear in hosting logs; avoid confidential information.
      </p>
      <details>
        <summary className="cursor-pointer focus-visible:outline focus-visible:outline-2">
          Request URL and API rules
        </summary>
        <code className="mt-3 block break-all rounded-md bg-muted p-3">{url}</code>
        <p className="mt-3">
          GET /api/parse requires expression. Timezone defaults to UTC; reference defaults to the
          request time. Pass an ISO instant as reference to reproduce a result. Format is optional.
        </p>
        <p className="mt-2">
          Whole days and weeks follow the calendar. Fractional days and weeks add elapsed time.
          Fractional years first become whole months. Remaining calendar fractions use labelled day
          approximations. Each step clamps to the last valid day. The retired preserveDayOfMonth
          option is rejected.
        </p>
      </details>
      <div aria-live="polite" aria-atomic="true">
        {stale ? (
          <p className="mb-2 text-muted-foreground">
            Your inputs changed. Replay again to check the current calculation.
          </p>
        ) : null}
        {state.kind === "error" ? (
          <p role="alert" className="text-destructive">
            {state.message}
          </p>
        ) : null}
        {state.kind === "done" ? (
          <p
            className={
              state.status >= 400 || (!stale && !state.matches) ? "text-destructive" : "font-medium"
            }
          >
            HTTP {state.status} ·{" "}
            {stale
              ? "Previous response"
              : state.matches
                ? "Matches your calculator"
                : state.status >= 400
                  ? "Request rejected; see the response below."
                  : "Result differs from your calculator."}
          </p>
        ) : null}
      </div>
      {state.kind === "done" ? (
        <details open>
          <summary className="cursor-pointer focus-visible:outline focus-visible:outline-2">
            Response JSON
          </summary>
          <pre
            tabIndex={0}
            role="region"
            aria-label="API response JSON"
            className="mt-3 max-h-96 max-w-full overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-50"
          >
            {JSON.stringify(state.body, null, 2)}
          </pre>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => void copy(JSON.stringify(state.body, null, 2))}
          >
            Copy response
          </Button>
        </details>
      ) : null}
    </div>
  );
}
