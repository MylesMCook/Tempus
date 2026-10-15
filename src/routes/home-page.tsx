"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { appendSelection, parse, type ClarificationSelection } from "@/shared/sdk";
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
    () => parse(expression, { timezone: settings.timezone, reference, selection }),
    [expression, settings.timezone, reference, selection],
  );
  useEffect(() => {
    if (selection)
      (
        document.getElementById("calculated-date") ?? document.getElementById("calculation-error")
      )?.focus();
  }, [selection]);

  return (
    <div className="bg-page">
      <main
        id="main"
        className="t-page-enter mx-auto w-full max-w-6xl px-4 pb-10 pt-10 sm:px-8 sm:pt-14"
      >
        <header className="mb-8 lg:mb-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Date math, with the steps.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Write a date in your own words. See where it lands and how it gets there.
          </p>
        </header>
        <section className="flex w-full flex-col gap-6">
          <DatePicker
            expression={expression}
            onExpressionChange={setExpression}
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
