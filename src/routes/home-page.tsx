"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiDocs } from "@/features/parser/components/api-docs";
import { DateExpressionTabs } from "@/features/parser/components/date-expression-tabs";
import { DatePicker } from "@/features/parser/components/date-picker";

const examples = {
  Simple: ["now", "today", "tomorrow", "yesterday", "next friday", "last monday"],
  Relative: ["in 3 days", "2 weeks from now", "3 months ago", "1 year from now", "5 days ago"],
  "Date Math": [
    "today plus 2 weeks",
    "tomorrow minus 3 days",
    "2 weeks plus 3 days",
    "1 month minus 1 week",
    "6 months plus 2 weeks",
  ],
  Fractional: [
    "1.5 days from now",
    "2.5 weeks ago",
    "6.5 months from today",
    "0.5 years from now",
    "today plus 0.25 years",
  ],
  Advanced: [
    "6 months before sep 14",
    "2 weeks after dec 25",
    "3 days before next friday",
    "1 month after last monday",
    "2.5 weeks before may 1",
    "friday next week",
  ],
};

export function HomePage() {
  const [expression, setExpression] = useState("");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.07),transparent_40%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.9))]">
      <main className="container flex flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 text-center">
          <div className="inline-flex items-center justify-center gap-2 text-primary">
            <Clock3 className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.24em]">TempusTotal</span>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Parse natural-language dates without the framework tax.
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Check expressions locally, confirm the API contract, and ship the same parser through
              a small React SPA plus a single Cloudflare Worker endpoint.
            </p>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <DatePicker expression={expression} onExpressionChange={setExpression} />
        </section>

        <section className="mx-auto w-full max-w-4xl">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-col gap-2">
              <CardTitle>Examples</CardTitle>
              <CardDescription>
                Pick one of the common expression patterns and drop it into the parser.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DateExpressionTabs examples={examples} onExampleClick={setExpression} />
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-4xl">
          <ApiDocs />
        </section>
      </main>

      <footer className="border-t border-border/60 bg-background/80">
        <div className="container flex flex-col gap-3 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4" />
            <span>TempusTotal</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span>Cloudflare-first SPA plus Worker API.</span>
            <Link
              to="/privacy"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
