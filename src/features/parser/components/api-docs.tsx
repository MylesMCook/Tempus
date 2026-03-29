"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Play } from "lucide-react";
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

export function ApiDocs() {
  const [expression, setExpression] = useState("");
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
    if (!expression.trim()) {
      toast.error("Enter an expression before hitting the API.");
      return;
    }

    setIsRunning(true);
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
      setStatusCode(500);
      setResponseBody({ error: message });
      toast.error("Request failed.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>API playground</CardTitle>
        <CardDescription>
          Verify the public contract with the same format, timezone, and preserve settings used by
          the local parser.
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
              onClick={() => setExpression(example)}
            >
              {example}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="api-expression">Expression</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="api-expression"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              placeholder="Try the public /api/parse contract"
              className="h-11 text-base"
            />
            <Button type="button" onClick={runRequest} disabled={isRunning}>
              {isRunning ? <Check data-icon="inline-start" /> : <Play data-icon="inline-start" />}
              {isRunning ? "Running" : "Run request"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Format
            </p>
            <p className="mt-1 text-sm">{effectiveDateFormat}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Timezone
            </p>
            <p className="mt-1 text-sm">{settings.timezone}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              preserveDayOfMonth
            </p>
            <p className="mt-1 text-sm">{String(settings.preserveDayOfMonth)}</p>
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Response</Label>
              <Badge variant={statusCode >= 400 ? "destructive" : "secondary"}>
                HTTP {statusCode}
              </Badge>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-50">
              {JSON.stringify(responseBody, null, 2)}
            </pre>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
