"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { ApiDocs } from "@/features/parser/components/api-docs";
import { DateExpressionTabs } from "@/features/parser/components/date-expression-tabs";
import { calculateDate } from "@/shared/date-parser";
import { useSettings } from "@/features/parser/context/settings-context";
import { DatePicker } from "@/features/parser/components/date-picker";

import { examples } from "@/features/parser/examples";

export function HomePage() {
  const [{ expression, reference }, setInput] = useState(() => ({
    expression: "",
    reference: new Date().toISOString(),
  }));
  const { settings } = useSettings();
  const setExpression = (value: string) =>
    setInput({ expression: value, reference: new Date().toISOString() });
  const calculation = useMemo(
    () => calculateDate(expression, { timezone: settings.timezone, reference }),
    [expression, settings.timezone, reference],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container flex flex-col gap-2 px-4 py-6 sm:px-6 sm:py-8">
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-3 text-left">
          <div className="inline-flex items-center gap-2 text-primary">
            <Clock3 className="size-5" />
            <span className="text-sm font-semibold">TempusTotal</span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find a date.</h1>
            <p className="text-base text-muted-foreground">Type it. See the date. Copy it.</p>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <DatePicker
            expression={expression}
            onExpressionChange={setExpression}
            calculation={calculation}
            reference={reference}
            onRefresh={() =>
              setInput((current) => ({ ...current, reference: new Date().toISOString() }))
            }
          />
        </section>

        <section className="mx-auto w-full max-w-2xl">
          <details className="rounded-xl border bg-background p-4 sm:p-5">
            <summary className="cursor-pointer font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
              More examples
            </summary>
            <div className="mt-3">
              <DateExpressionTabs
                examples={examples}
                onExampleClick={(value) => {
                  setExpression(value);
                  requestAnimationFrame(() => {
                    const result = document.getElementById("calculated-date");
                    result?.focus({ preventScroll: true });
                    result?.scrollIntoView({ block: "nearest" });
                  });
                }}
              />
            </div>
          </details>
        </section>

        <section className="mx-auto w-full max-w-2xl">
          <details className="group rounded-lg border bg-background p-4 sm:p-5">
            <summary className="cursor-pointer font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
              Use the API
            </summary>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Test a request using your expression and settings.
            </p>
            <ApiDocs expression={expression} reference={reference} calculation={calculation} />
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
            <span>Plain-language date calculator.</span>
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
