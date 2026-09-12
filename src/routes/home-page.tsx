"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { calculateDate } from "@/shared/date-parser";
import { useSettings } from "@/features/parser/context/settings-context";
import { DatePicker } from "@/features/parser/components/date-picker";

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
      </main>

      <footer className="border-t border-border/60 bg-background/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <span>TempusTotal</span>
          <Link
            to="/privacy"
            className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
          >
            Privacy policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
