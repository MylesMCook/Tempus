import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { appendSelection, type ParseResult } from "@/shared/sdk";
import { Button } from "@/components/ui/button";
import { safeFormatDate, resultClockFormat } from "../options";
import { useCalendarPreparation } from "../use-calendar-preparation";
import { useRecurrenceDecisions } from "../context/recurrence-decisions-context";
import { scheduleCopy, type ScheduleCopyFormat } from "../schedule-copy";
import { scheduleQuantity } from "../schedule-labels";
import { OutputPreview } from "./output-preview";
import { CalculationTrace } from "./calculation-trace";

export function OccurrenceResult({
  interpretation,
  expression,
  reference,
  onChangeInterpretation,
}: {
  interpretation: Extract<ParseResult, { status: "resolved" }>;
  expression: string;
  reference: string;
  onChangeInterpretation: () => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [feedbackOutput, setFeedbackOutput] = useState("");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [format, setFormat] = useState<ScheduleCopyFormat>("text");
  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const { selection, setSelection } = useRecurrenceDecisions();
  const value = interpretation.value;
  const bounded = value.kind === "recurrence" && Boolean(value.rule.count || value.rule.until);
  const request = useMemo(
    () =>
      bounded
        ? {
            interpretation,
            reference,
            selection,
            title: "",
            attempt,
            output: "occurrences" as const,
          }
        : undefined,
    [bounded, interpretation, reference, selection, attempt],
  );
  const preparation = useCalendarPreparation(request);
  const plan = preparation?.ok ? preparation.result : undefined;
  const schedule = bounded && plan?.status === "ready" && plan.schedule ? plan.schedule : value;
  const ready =
    !bounded || Boolean(plan?.status === "ready" && plan.schedule && !plan.schedule.truncated);
  const copiedText = useMemo(
    () =>
      ready && (schedule.kind === "recurrence" || schedule.kind === "collection")
        ? scheduleCopy(interpretation, schedule, expression, reference, format)
        : "",
    [ready, interpretation, schedule, expression, reference, format],
  );
  if (schedule.kind !== "recurrence" && schedule.kind !== "collection") return null;
  const finite = bounded || schedule.kind === "collection";
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const repeatLabel =
    schedule.kind === "recurrence"
      ? schedule.rule.frequency === "monthly"
        ? `Repeats monthly on day ${schedule.rule.dayOfMonth}${schedule.rule.dayOfMonth > 28 ? (schedule.rule.shortMonth === "skip" ? "; skips months without that date" : "; uses the last day in shorter months") : ""}`
        : (schedule.rule.interval ?? 1) > 1
          ? `Repeats every ${schedule.rule.interval} weeks on ${schedule.rule.weekdays.map((day) => dayNames[day - 1]).join(", ")}`
          : schedule.rule.weekdays.length === 7
            ? "Repeats every day"
            : `Repeats ${schedule.rule.weekdays.map((day) => dayNames[day - 1]).join(", ")}`
      : undefined;
  const countLabel =
    schedule.kind === "recurrence" && schedule.rule.count
      ? schedule.rule.countPast === "consume"
        ? `${scheduleQuantity(schedule.rule.count, "scheduled date")} from the written start${schedule.rule.countExclusions === "consume" ? ", before exclusions" : ""}.`
        : `${schedule.rule.countExclusions === "consume" ? `${scheduleQuantity(schedule.rule.count, "scheduled date")} before exclusions` : `${scheduleQuantity(schedule.rule.count, "occurrence")} in total`}.`
      : undefined;
  const clockNotes =
    schedule.kind === "recurrence"
      ? (schedule.rule.clockOverrides ?? []).map((choice) => choice.label)
      : (schedule.selectedClocks ?? []);
  const pageSize = 10;
  const pageStart = page * pageSize;
  const visible = schedule.occurrences.slice(pageStart, pageStart + pageSize);
  const date = (result: { timestamp: number; local: string }) =>
    safeFormatDate(
      new Date(result.timestamp),
      schedule.timezone,
      `EEE, MMM d, yyyy 'at' ${resultClockFormat(result.local)}`,
    ) ?? new Date(result.timestamp).toISOString();
  const prompt = plan?.status === "needs-clarification" ? plan.clarification : undefined;
  const error =
    preparation && !preparation.ok
      ? preparation.error
      : plan?.status === "blocked"
        ? plan.reason
        : undefined;
  return (
    <section
      id="calculated-date"
      tabIndex={-1}
      aria-label={
        schedule.kind === "recurrence"
          ? "Recurring schedule"
          : schedule.occurrences.length === 1
            ? "Listed date"
            : "Multiple date ranges"
      }
      className="grid gap-4"
    >
      <div>
        <h2 className="text-sm font-medium text-emerald-800">
          {schedule.kind === "collection"
            ? `Your listed date${schedule.occurrences.length === 1 ? "" : "s"}`
            : "Your repeating schedule"}
        </h2>
        {interpretation.event ? (
          <p className="mt-2 break-words text-xl font-semibold">{interpretation.event.text}</p>
        ) : null}
        {repeatLabel ? <p className="mt-2 break-words text-sm">{repeatLabel}</p> : null}
        {countLabel ? <p className="mt-2 text-sm">{countLabel}</p> : null}
        <p className="mt-2 break-words text-sm text-muted-foreground">{schedule.timezone}</p>
      </div>
      <div
        id="complete-schedule-status"
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="text-sm"
      >
        {error ??
          (ready
            ? finite
              ? `${scheduleQuantity(schedule.occurrences.length, "date")} ready. Copy includes the complete upcoming set.`
              : "No end date. Copy includes the rule and a labeled preview."
            : "Preparing all dates before copying…")}
      </div>
      {prompt ? (
        <div role="group" aria-label={prompt.question} className="grid gap-2">
          <p className="font-medium">{prompt.question}</p>
          {prompt.choices.map((choice) => (
            <Button
              key={choice.id}
              variant="outline"
              className="h-auto min-h-12 whitespace-normal"
              onClick={() => {
                flushSync(() => {
                  setSelection(
                    appendSelection(selection, { contextKey: prompt.contextKey, id: choice.id }),
                  );
                  setFeedback("");
                  setPage(0);
                });
                document.getElementById("complete-schedule-status")?.focus();
              }}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      ) : error ? (
        <div className="grid gap-2 text-sm">
          {plan?.status === "blocked" ? (
            <p>{plan.hint}</p>
          ) : (
            <Button variant="outline" onClick={() => setAttempt(attempt + 1)}>
              Try preparing again
            </Button>
          )}
          <Button
            variant="link"
            onClick={() => document.getElementById("date-expression")?.focus()}
          >
            Edit phrase
          </Button>
        </div>
      ) : null}
      {visible.length ? (
        <ol
          start={pageStart + 1}
          aria-label={`${ready && finite ? "Complete schedule" : "Preview"} date${schedule.occurrences.length === 1 ? "" : "s"}`}
          className="grid gap-3"
        >
          {visible.map((row, index) => (
            <li key={pageStart + index} className="break-words rounded-md border p-3 text-base">
              {"allDay" in row && row.allDay
                ? safeFormatDate(
                    new Date(row.start.result.timestamp),
                    schedule.timezone,
                    "EEE, MMM d, yyyy",
                  )
                : date(row.start.result)}
              {row.end ? ` → ${date(row.end.result)} (end not included)` : ""}
            </li>
          ))}
        </ol>
      ) : ready ? (
        <p>No upcoming dates remain within these boundaries.</p>
      ) : null}
      {schedule.occurrences.length > pageSize ? (
        <nav aria-label="Review schedule dates" className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous dates
          </Button>
          <span className="text-sm">
            {pageStart + 1}–{Math.min(pageStart + pageSize, schedule.occurrences.length)} of{" "}
            {schedule.occurrences.length}
          </span>
          <Button
            variant="outline"
            disabled={pageStart + pageSize >= schedule.occurrences.length}
            onClick={() => setPage(page + 1)}
          >
            Next dates
          </Button>
        </nav>
      ) : null}
      {!finite ? (
        <p className="text-sm text-muted-foreground">
          {visible.length === 1 ? "This is" : "These are"} the next{" "}
          {scheduleQuantity(visible.length, "date")}, not the whole schedule. Add “for 5
          occurrences” or an end date to copy a complete list.
        </p>
      ) : null}
      <div className="grid gap-2">
        <label htmlFor="schedule-copy-format" className="text-sm font-medium">
          Copy as
        </label>
        <select
          id="schedule-copy-format"
          className="h-11 rounded-md border bg-background px-3 text-base"
          value={format}
          onChange={(event) => {
            setFormat(event.target.value as ScheduleCopyFormat);
            setFeedback("");
          }}
        >
          <option value="text">Text</option>
          <option value="markdown">Markdown</option>
          <option value="json">JSON · complete date data</option>
        </select>
        {ready && copiedText ? (
          <details
            open={previewOpen}
            onToggle={(event) => setPreviewOpen(event.currentTarget.open)}
            className="min-w-0 rounded-md border"
          >
            <summary className="cursor-pointer px-3 py-3 text-sm font-medium">
              Preview{" "}
              {format === "json" ? "JSON" : format === "markdown" ? "Markdown source" : "text"}
            </summary>
            {previewOpen ? (
              <div className="grid min-w-0 gap-2 px-3 pb-3">
                <p id="copy-preview-description" className="text-sm text-muted-foreground">
                  Exactly what Copy puts on your clipboard. Scroll to inspect the full output.
                </p>
                <OutputPreview text={copiedText} format={format} />
              </div>
            ) : null}
          </details>
        ) : null}
        <Button
          className="min-h-12"
          disabled={!ready || !copiedText}
          onClick={async () => {
            setFeedbackOutput(copiedText);
            try {
              await navigator.clipboard.writeText(copiedText);
              setFeedback(
                finite
                  ? `${scheduleQuantity(schedule.occurrences.length, "date")} copied`
                  : "Rule and preview copied",
              );
            } catch {
              setFeedback("Copy was blocked. Select text in the preview and copy it manually.");
              setPreviewOpen(true);
            }
          }}
        >
          {finite
            ? ready
              ? `Copy ${schedule.occurrences.length === 1 ? "" : "all "}${scheduleQuantity(schedule.occurrences.length, "date")}`
              : "Preparing complete output…"
            : "Copy rule and preview"}
        </Button>
        {feedback && feedbackOutput === copiedText ? (
          <p role="status" className="text-sm">
            {feedback}
          </p>
        ) : null}
      </div>
      <p className="break-words text-sm" aria-label="Recognized date phrase">
        {expression.slice(0, interpretation.source.span.start)}
        <mark className="rounded bg-amber-100 px-1 text-amber-950">
          {interpretation.source.text}
        </mark>
        {expression.slice(interpretation.source.span.end)}
      </p>
      {clockNotes.length || interpretation.selectedChoice || selection ? (
        <div className="grid gap-2 text-sm">
          <Button
            variant="link"
            onClick={() => {
              setSelection(undefined);
              setPage(0);
              setFeedback("");
              onChangeInterpretation();
            }}
          >
            Change date or clock choices
          </Button>
          {clockNotes.length ? (
            <details>
              <summary className="cursor-pointer py-2">
                Interpretation choices ({clockNotes.length})
              </summary>
              <ul className="mt-2 grid gap-2">
                {clockNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
      {schedule.kind === "recurrence" ? (
        <details className="border-t pt-3">
          <summary className="cursor-pointer py-2 text-sm">Schedule boundaries</summary>
          <dl className="mt-2 grid gap-2 text-sm">
            <div>
              <dt className="font-medium">Starts on or after</dt>
              <dd>{schedule.rule.starting}</dd>
            </div>
            {schedule.rule.until ? (
              <div>
                <dt className="font-medium">Last start date · included</dt>
                <dd>{schedule.rule.until}</dd>
              </div>
            ) : null}
            {schedule.rule.exceptions.length ? (
              <div>
                <dt className="font-medium">
                  Excluded start date{schedule.rule.exceptions.length === 1 ? "" : "s"}
                </dt>
                <dd>{schedule.rule.exceptions.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
        </details>
      ) : null}
      {visible.length ? (
        <details className="border-t pt-3">
          <summary className="cursor-pointer py-2 text-sm">
            How {visible.length === 1 ? "this date was" : "these dates were"} calculated
          </summary>
          {visible.map((row, index) => (
            <div key={pageStart + index} className="mt-3">
              <h3 className="font-medium">Occurrence {pageStart + index + 1} · start</h3>
              <CalculationTrace calculation={row.start} />
              {row.end ? (
                <>
                  <h3 className="mt-3 font-medium">End</h3>
                  <CalculationTrace calculation={row.end} />
                </>
              ) : null}
            </div>
          ))}
        </details>
      ) : null}
    </section>
  );
}
