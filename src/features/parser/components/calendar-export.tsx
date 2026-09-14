import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appendSelection, type ParseResult } from "@/shared/sdk";
import { prepareCalendar } from "@/shared/sdk-calendar";
import { useRecurrenceDecisions } from "../context/recurrence-decisions-context";
import { useCalendarPreparation } from "../use-calendar-preparation";
import { safeFormatDate } from "../options";
import { scheduleQuantity } from "../schedule-labels";

/** Remount for every input, context or interpretation change. */
export function CalendarExport({
  interpretation,
  reference,
}: {
  interpretation: ParseResult;
  reference: string;
}) {
  const [title, setTitle] = useState(
    interpretation.status === "resolved"
      ? (interpretation.event?.text ?? interpretation.source.text)
      : "",
  );
  const [feedback, setFeedback] = useState("");
  const { selection, setSelection } = useRecurrenceDecisions();
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const request = useMemo(
    () =>
      open &&
      !paused &&
      interpretation.status === "resolved" &&
      interpretation.value.kind === "recurrence"
        ? { interpretation, reference, selection, title, attempt }
        : undefined,
    [open, paused, interpretation, reference, selection, title, attempt],
  );
  const preparation = useCalendarPreparation(request);
  const plan = preparation?.ok ? preparation.result : undefined;
  const prompt = plan?.status === "needs-clarification" ? plan.clarification : undefined;
  const preparedFile = plan?.status === "ready" ? plan.file : undefined;
  const [page, setPage] = useState(0);
  if (interpretation.status !== "resolved") return null;
  const value = interpretation.value;

  const pointMode: "date" | "instant" | undefined =
    value.kind === "point" ? (value.precision === "date" ? "date" : "instant") : undefined;
  const description =
    value.kind === "recurrence"
      ? `${value.rule.countPast === "consume" && value.rule.count ? `${scheduleQuantity(value.rule.count, "scheduled date")} from the written start${value.rule.countExclusions === "consume" ? ", before exclusions" : ""}. Only future events are included.` : value.rule.count ? `${value.rule.countExclusions === "consume" ? `${scheduleQuantity(value.rule.count, "scheduled date")} before exclusions` : `${scheduleQuantity(value.rule.count, "occurrence")} in total`}.` : value.rule.until ? `Every upcoming occurrence through ${value.rule.until}.` : "Repeats without an end date."} Times follow the timezone rules used for this file.${!value.rule.duration && !value.rule.endClock ? " No duration is added; your calendar may display its own default." : ""}`
      : value.kind === "point"
        ? pointMode === "date"
          ? "One all-day event on the date shown above."
          : "One event at the time shown above. No duration is added; your calendar may display its own default."
        : value.kind === "interval"
          ? "One event with the start and end shown above."
          : `${scheduleQuantity(value.occurrences.length, "separate event")}, in listed order. No repetition.${value.occurrences.some((row) => row.allDay) ? " Dates without times become all-day events." : ""}${value.occurrences.some((row) => !row.allDay && !row.end) ? " No duration is added to timed points; your calendar may display a default." : ""}`;
  const events =
    value.kind === "point"
      ? [{ start: value.calculation, end: undefined, allDay: pointMode === "date" }]
      : value.kind === "interval"
        ? [value]
        : (value.kind === "recurrence"
            ? plan?.status === "ready"
              ? (plan.schedule?.occurrences ?? [])
              : []
            : value.occurrences
          ).map((event) => ({ ...event, allDay: "allDay" in event && event.allDay }));
  const pageSize = 10;
  const pageStart = page * pageSize;
  return (
    <details
      className="mt-3 border-t"
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary
        id="calendar-export-toggle"
        className="cursor-pointer py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2"
      >
        Download as calendar file
      </summary>
      <div className="grid gap-3 pb-3">
        <p className="text-sm">{description}</p>
        {value.kind === "recurrence" ? (
          <div
            id="calendar-export-status"
            tabIndex={-1}
            role="status"
            className="grid gap-2 text-sm"
          >
            {paused
              ? "Preparation cancelled."
              : preparation && !preparation.ok
                ? preparation.error
                : plan?.status === "ready"
                  ? plan.ongoing
                    ? `Repeating rule. The next ${scheduleQuantity(events.length, "occurrence")} ${events.length === 1 ? "is" : "are"} shown below; the file keeps repeating.`
                    : `${scheduleQuantity(events.length, "occurrence")} in the complete file.`
                  : plan?.status === "blocked"
                    ? plan.reason
                    : prompt
                      ? prompt.question
                      : "Checking the complete schedule…"}
            {paused || (preparation && !preparation.ok) ? (
              <Button
                variant="outline"
                onClick={() => {
                  setPaused(false);
                  setAttempt(attempt + 1);
                }}
              >
                Try preparing again
              </Button>
            ) : !preparation ? (
              <Button variant="outline" onClick={() => setPaused(true)}>
                Cancel preparation
              </Button>
            ) : null}
            {plan?.status === "blocked" ? <p>{plan.hint}</p> : null}
            {plan?.status === "blocked" ? (
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.getElementById("date-expression");
                  if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                  }
                }}
              >
                Edit schedule
              </Button>
            ) : null}
            {prompt ? (
              <div className="grid gap-2" role="group" aria-label={prompt.question}>
                <p>{prompt.question}</p>
                {prompt.choices.map((choice) => (
                  <Button
                    key={choice.id}
                    variant="outline"
                    className="h-auto min-h-12 whitespace-normal"
                    onClick={() => {
                      const next = appendSelection(selection, {
                        contextKey: prompt.contextKey,
                        id: choice.id,
                      });
                      flushSync(() => {
                        setSelection(next);
                        setFeedback("");
                        setPage(0);
                      });
                      document.getElementById("calendar-export-status")?.focus();
                    }}
                  >
                    {choice.label}
                  </Button>
                ))}
              </div>
            ) : null}
            {selection ? (
              <Button
                variant="link"
                onClick={() => {
                  flushSync(() => {
                    setSelection(undefined);
                    setPaused(false);
                    setFeedback("");
                    setPage(0);
                  });
                  document.getElementById("calendar-export-status")?.focus();
                }}
              >
                Restart export choices
              </Button>
            ) : null}
          </div>
        ) : null}
        {events.length > pageSize ? (
          <nav aria-label="Review file events" className="flex flex-wrap items-center gap-2">
            <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous events
            </Button>
            <p role="status" className="text-sm">
              Events {pageStart + 1}–{Math.min(pageStart + pageSize, events.length)} of{" "}
              {events.length}
            </p>
            <Button
              variant="outline"
              disabled={pageStart + pageSize >= events.length}
              onClick={() => setPage(page + 1)}
            >
              Next events
            </Button>
          </nav>
        ) : null}
        <ol
          start={pageStart + 1}
          aria-label={
            plan?.status === "ready" && plan.ongoing
              ? `Next occurrence${events.length === 1 ? "" : "s"} of the repeating rule`
              : `Event${events.length === 1 ? "" : "s"} in this file`
          }
          className="grid gap-3 text-sm"
        >
          {events.slice(pageStart, pageStart + pageSize).map((event, index) => (
            <li key={pageStart + index} className="min-w-0 rounded-md border p-3">
              {events.length > 1 ? (
                <p className="font-medium">Event {pageStart + index + 1}</p>
              ) : null}
              {(
                [
                  ["Start", event.start],
                  ["End · not included", event.end],
                ] as const
              ).map(([label, date]) =>
                date ? (
                  <p key={label} className="break-words">
                    <span className="font-medium">{label}: </span>
                    {safeFormatDate(
                      new Date(date.result.timestamp),
                      date.timezone,
                      event.allDay
                        ? "EEEE, MMMM d, yyyy"
                        : date.result.timestamp % 1000 === 0
                          ? "EEEE, MMMM d, yyyy 'at' h:mm:ss a zzz"
                          : "EEEE, MMMM d, yyyy 'at' h:mm:ss.SSS a zzz",
                    ) ?? date.result.local}
                    {!event.allDay ? ` (UTC${date.result.offset})` : " · all day"}
                  </p>
                ) : null,
              )}
              <p className="break-words text-muted-foreground">{event.start.timezone}</p>
            </li>
          ))}
        </ol>
        <label htmlFor="calendar-title" className="text-sm font-medium">
          Event title
        </label>
        <Input
          id="calendar-title"
          value={title}
          maxLength={2000}
          onChange={(event) => {
            setTitle(event.target.value);
            setFeedback("");
          }}
        />
        <p className="text-sm text-muted-foreground">
          Downloads an .ics file. It includes the date phrase and timezone. Importing it is a
          separate action in your calendar; no reminder is set.
        </p>
        <Button
          variant="outline"
          className="min-h-12"
          disabled={!title.trim() || (value.kind === "recurrence" && !preparedFile?.ok)}
          onClick={() => {
            try {
              const metadata = {
                title,
                pointMode,
                uid: crypto.randomUUID(),
                stamp: new Date().toISOString(),
              };
              const prepared =
                value.kind === "recurrence"
                  ? undefined
                  : prepareCalendar(interpretation, { file: metadata });
              const file =
                value.kind === "recurrence"
                  ? preparedFile
                  : prepared?.status === "ready"
                    ? prepared.file
                    : undefined;
              if (!file) return;
              if (!file.ok) {
                setFeedback(file.reason);
                return;
              }
              const link = document.createElement("a");
              const url = URL.createObjectURL(new Blob([file.text], { type: file.mimeType }));
              try {
                link.href = url;
                link.download = "tempus-events.ics";
                document.body.append(link);
                link.click();
              } finally {
                link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }
              setFeedback(
                "Download requested. Open the file in your calendar to review and import it.",
              );
            } catch {
              setFeedback("The file could not be downloaded. Try again in your browser.");
            }
          }}
        >
          Download calendar file
        </Button>
        <p role="status" className="text-sm">
          {feedback || (preparedFile && !preparedFile.ok ? preparedFile.reason : "")}
        </p>
      </div>
    </details>
  );
}
