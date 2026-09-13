"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import type { Calculation } from "@/shared/date-parser";
import { appendSelection, type ClarificationSelection } from "@/shared/clarify-numeric-date";
import { interpretDate } from "@/shared/interpret-date";
import { useSettings } from "@/features/parser/context/settings-context";
import { DatePicker } from "@/features/parser/components/date-picker";

export function HomePage({ initialReference }: { initialReference?: string }) {
  const [selection, setSelection] = useState<ClarificationSelection>();
  const [{ expression, reference }, setInput] = useState(() => ({
    expression: "",
    reference: initialReference ?? new Date().toISOString(),
  }));
  const { settings } = useSettings();
  const setExpression = (value: string) => {
    setSelection(undefined);
    setInput({ expression: value, reference: new Date().toISOString() });
  };
  const interpretation = useMemo(
    () => interpretDate(expression, { timezone: settings.timezone, reference, selection }),
    [expression, settings.timezone, reference, selection],
  );
  useEffect(() => {
    if (selection)
      (
        document.getElementById("calculated-date") ?? document.getElementById("calculation-error")
      )?.focus();
  }, [selection]);
  const calculation: Calculation =
    interpretation.status === "resolved"
      ? interpretation.value.kind === "point"
        ? interpretation.value.calculation
        : interpretation.value.kind === "interval"
          ? interpretation.value.start
          : (interpretation.value.occurrences[0]?.start ?? {
              ok: false,
              engineVersion: 2,
              error: {
                code: "range",
                message: "No upcoming occurrences.",
                hint: "Change the schedule boundaries.",
              },
            })
      : { ok: false, engineVersion: 2, error: interpretation.error };

  return (
    <div className="bg-page">
      <main id="main" className="mx-auto w-full max-w-3xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
        <header className="mb-8 max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Natural language → dates
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Turn words into dates.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Dates, time ranges and repeating patterns. Write a phrase, check the interpretation and
            use the result.
          </p>
        </header>
        <section className="flex w-full flex-col gap-6">
          <DatePicker
            expression={expression}
            onExpressionChange={setExpression}
            calculation={calculation}
            interpretation={interpretation}
            hasSelection={Boolean(selection)}
            onChoose={(choice) =>
              flushSync(() => setSelection((previous) => appendSelection(previous, choice)))
            }
            reference={reference}
            onRefresh={() => {
              setSelection(undefined);
              setInput((current) => ({ ...current, reference: new Date().toISOString() }));
            }}
          />
        </section>
      </main>
    </div>
  );
}
