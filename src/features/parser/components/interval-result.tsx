import { useState } from "react";
import type { Interpretation } from "@/shared/interpret-date";
import { Button } from "@/components/ui/button";
import { safeFormatDate, resultClockFormat } from "../options";
import { CalculationTrace } from "./calculation-trace";

export function IntervalResult({
  interpretation,
  expression,
  onChangeInterpretation,
}: {
  interpretation: Extract<Interpretation, { status: "resolved" }>;
  expression: string;
  onChangeInterpretation: () => void;
}) {
  const [feedback, setFeedback] = useState("");
  if (interpretation.value.kind !== "interval") return null;
  const { start, end, allDay } = interpretation.value;
  const format = (local: string) =>
    allDay ? "EEEE, MMMM d, yyyy" : `EEEE, MMMM d, yyyy 'at' ${resultClockFormat(local)}`;
  const first =
    safeFormatDate(new Date(start.result.timestamp), start.timezone, format(start.result.local)) ??
    start.result.iso;
  const last =
    safeFormatDate(new Date(end.result.timestamp), end.timezone, format(end.result.local)) ??
    end.result.iso;
  const copyText = [
    interpretation.event?.text,
    `Start: ${first}`,
    `End (exclusive): ${last}`,
    start.timezone,
    allDay ? "All-day interval" : "Timed interval",
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <section
      id="calculated-date"
      tabIndex={-1}
      aria-label="Calculated interval"
      className="grid gap-4"
    >
      {interpretation.selectedChoice ? (
        <Button variant="link" onClick={onChangeInterpretation}>
          Change date interpretation
        </Button>
      ) : null}
      <div role="status" aria-live="polite" aria-atomic="true">
        <h2 className="text-sm font-medium text-emerald-800">Your date range is ready</h2>
        {interpretation.event ? (
          <p className="mt-2 break-words text-lg font-semibold">{interpretation.event.text}</p>
        ) : null}
        <dl className="mt-3 grid gap-3">
          <div>
            <dt className="text-sm text-muted-foreground">Start</dt>
            <dd className="break-words text-xl font-semibold">{first}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">End · not included</dt>
            <dd className="break-words text-xl font-semibold">{last}</dd>
          </div>
        </dl>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          {start.timezone} · {allDay ? "All day" : "Timed range"}
        </p>
      </div>
      <p className="break-words text-sm" aria-label="Recognized date phrase">
        {expression.slice(0, interpretation.source.span.start)}
        <mark className="rounded bg-amber-100 px-1 text-amber-950">
          {interpretation.source.text}
        </mark>
        {expression.slice(interpretation.source.span.end)}
      </p>
      <Button
        className="min-h-12"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(copyText);
            setFeedback("Date range copied");
          } catch {
            setFeedback("Copy was blocked. Select the dates and copy them manually.");
          }
        }}
      >
        Copy date range
      </Button>
      <p role="status" className="text-sm">
        {feedback}
      </p>
      <p className="text-sm text-muted-foreground">
        Preview only. No reminder or calendar event has been created.
      </p>
      <details className="border-t pt-3">
        <summary className="cursor-pointer py-2 text-sm">How this range was calculated</summary>
        <h3 className="mt-3 font-medium">Start</h3>
        <CalculationTrace calculation={start} />
        <h3 className="mt-3 font-medium">End</h3>
        <CalculationTrace calculation={end} />
        {interpretation.assumptions.map((assumption) => (
          <p key={assumption} className="mt-2 text-sm text-muted-foreground">
            {assumption}
          </p>
        ))}
      </details>
    </section>
  );
}
