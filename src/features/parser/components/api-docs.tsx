"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Copy, Play } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "../context/settings-context";

const apiExamples = [
  "next friday",
  "in 3 days",
  "5 days ago",
  "today plus 2 weeks",
  "1.5 days from now",
  "2 weeks after dec 25",
];

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

export function ApiDocs({
  expression,
  onExpressionChange,
}: {
  expression: string;
  onExpressionChange: (value: string) => void;
}) {
  const [completedPath, setCompletedPath] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<unknown>(null);
  const { effectiveDateFormat, settings } = useSettings();

  const requestPath = useMemo(() => {
    const params = new URLSearchParams();

    if (expression.trim()) {
      params.set("expression", expression.trim());
    }

    if (effectiveDateFormat) {
      params.set("format", effectiveDateFormat);
    }

    params.set("preserveDayOfMonth", String(settings.preserveDayOfMonth));
    params.set("timezone", settings.timezone);

    return `/api/parse?${params.toString()}`;
  }, [effectiveDateFormat, expression, settings.preserveDayOfMonth, settings.timezone]);

  const requestUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return requestPath;
    }

    return new URL(requestPath, window.location.origin).toString();
  }, [requestPath]);

  async function runRequest() {
    if (isRunning) return;
    if (!expression.trim()) {
      toast.error("Enter an expression before hitting the API.");
      return;
    }

    setIsRunning(true);
    setStatusCode(null);
    setResponseBody(null);
    try {
      const response = await fetch(requestPath);
      const body = await response.json();

      setStatusCode(response.status);
      setResponseBody(body);

      if (response.ok) {
        toast.success("Parser API returned a response.");
      } else {
        toast.error(`Parser API returned ${response.status}.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown request failure";
      setStatusCode(0);
      setResponseBody({ error: message });
      toast.error("Request failed.");
    } finally {
      setCompletedPath(requestPath);
      setIsRunning(false);
    }
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>API playground</CardTitle>
        <CardDescription>
          Requests use the expression and display settings above. Relative calendar dates are
          calculated in the server’s timezone, so they can differ from browser results.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {apiExamples.map((example) => (
            <Button
              key={example}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onExpressionChange(example)}
            >
              {example}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="api-expression">Expression</Label>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void runRequest();
            }}
          >
            <Input
              id="api-expression"
              value={expression}
              onChange={(event) => onExpressionChange(event.target.value)}
              placeholder="e.g. in 3 days"
              maxLength={200}
              className="h-11 text-base"
            />
            <Button type="submit" disabled={isRunning || !expression.trim()}>
              {isRunning ? (
                <LoaderCircle className="animate-spin" data-icon="inline-start" />
              ) : (
                <Play data-icon="inline-start" />
              )}
              {isRunning ? "Running" : "Run request"}
            </Button>
          </form>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Format
            </p>
            <p className="mt-1 break-words text-sm">{effectiveDateFormat}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Timezone
            </p>
            <p className="mt-1 break-words text-sm">{settings.timezone}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              preserveDayOfMonth
            </p>
            <p className="mt-1 break-words text-sm">{String(settings.preserveDayOfMonth)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Request URL</Label>
          <div className="rounded-lg border bg-muted/20 p-3 font-mono text-sm break-all">
            {requestUrl}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => copyToClipboard(requestUrl, "Request URL")}
            >
              <Copy data-icon="inline-start" />
              Copy URL
            </Button>
            {responseBody ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  copyToClipboard(JSON.stringify(responseBody, null, 2), "Response body")
                }
              >
                <Copy data-icon="inline-start" />
                Copy response
              </Button>
            ) : null}
          </div>
        </div>

        {statusCode !== null && responseBody !== null ? (
          <div className="flex min-w-0 flex-col gap-3" aria-live="polite">
            {completedPath !== requestPath ? (
              <p role="status" className="text-sm text-muted-foreground">
                Expression or settings changed. Run the request again to update this response.
              </p>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Response</span>
              <Badge variant={statusCode === 0 || statusCode >= 400 ? "destructive" : "secondary"}>
                {statusCode === 0 ? "Network error" : `HTTP ${statusCode}`}
              </Badge>
            </div>
            <pre
              tabIndex={0}
              role="region"
              aria-label="API response JSON"
              className="max-w-full overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-50"
            >
              {JSON.stringify(responseBody, null, 2)}
            </pre>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
