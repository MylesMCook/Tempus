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
    <div className="min-h-screen bg-slate-50">
      <main className="container flex flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 text-center">
          <div className="inline-flex items-center justify-center gap-2 text-primary">
            <Clock3 className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.24em]">TempusTotal</span>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              A phrase in. A date out.
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Find the date you mean. Try “next friday” or “in 3 days,” then copy the result.
            </p>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <DatePicker expression={expression} onExpressionChange={setExpression} />
        </section>

        <section className="mx-auto w-full max-w-3xl">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-col gap-2">
              <CardTitle>Examples</CardTitle>
              <CardDescription>
                Choose a phrase to calculate, then edit it to make it yours.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DateExpressionTabs
                examples={examples}
                onExampleClick={(value) => {
                  setExpression(value);
                  document.getElementById("date-expression")?.focus();
                }}
              />
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-3xl">
          <details className="group rounded-lg border bg-background p-4 sm:p-5">
            <summary className="cursor-pointer font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
              Use the API
            </summary>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Test a request using your expression and settings.
            </p>
            <ApiDocs expression={expression} onExpressionChange={setExpression} />
          </details>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-background/80">
        <div className="container flex flex-col gap-3 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4" />
            <span>TempusTotal</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span>Dates calculated in your browser.</span>
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
