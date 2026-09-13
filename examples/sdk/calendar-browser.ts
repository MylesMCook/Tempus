import { appendSelection, parse, type ClarificationSelection } from "@tempus-date/core";
import {
  prepareCalendarFile,
  prepareRecurringCalendarFile,
  resolveRecurringExport,
  retainOccurrenceDecisions,
} from "@tempus-date/core/calendar";

const input = document.querySelector<HTMLInputElement>("#phrase")!;
const output = document.querySelector<HTMLElement>("#result")!;
const summary = document.querySelector<HTMLElement>("#interpretation-summary")!;
const choices = document.querySelector<HTMLElement>("#choices")!;
const download = document.querySelector<HTMLButtonElement>("#download")!;
const feedback = document.querySelector<HTMLElement>("#feedback")!;
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
let selection: ClarificationSelection | undefined;
let decisions: string[] = [];
function render() {
  const result = parse(input.value, { ...context, selection });
  const plan =
    result.status === "resolved" && result.value.kind === "recurrence"
      ? resolveRecurringExport(result, result.context.reference, decisions)
      : undefined;
  output.textContent = JSON.stringify(
    { result, ...(plan ? { completeExportPlan: plan } : {}) },
    null,
    2,
  );
  summary.replaceChildren();
  const line = (text: string, tag = "p") => {
    const element = document.createElement(tag);
    element.textContent = text;
    summary.append(element);
  };
  const date = (value: { local: string; offset: string }, allDay = false) => {
    const [day, clock] = value.local.split("T");
    return allDay ? `${day} · all day` : `${day} at ${clock} (UTC${value.offset})`;
  };
  if (result.status !== "resolved") {
    line(
      result.status === "needs-clarification" ? "Choose an interpretation" : "No calendar file yet",
      "h2",
    );
    if (!result.clarification) line(result.error.message);
    if (result.error.hint) line(result.error.hint);
  } else {
    const value = result.value;
    line(result.event?.text ?? "Your date", "h2");
    line(result.context.timezone);
    if (plan && !plan.ok) {
      line("The calendar file needs attention.");
      line(plan.error.message);
      if (plan.error.hint) line(plan.error.hint);
    } else {
      const rows =
        value.kind === "point"
          ? [{ start: value.calculation, allDay: value.precision === "date", end: undefined }]
          : value.kind === "interval"
            ? [value]
            : plan?.ok
              ? plan.occurrences
              : value.occurrences;
      line(
        plan?.ok && plan.exportRule
          ? "Repeats without an end date. Upcoming occurrences:"
          : `${rows.length} ${rows.length === 1 ? "event" : "events"} in the complete file.`,
      );
      const list = document.createElement("ol");
      for (const row of rows.slice(0, 3)) {
        const item = document.createElement("li");
        const allDay = "allDay" in row && row.allDay === true;
        item.textContent =
          date(row.start.result, allDay) +
          (row.end ? ` → ${date(row.end.result, allDay)} (end not included)` : "");
        list.append(item);
      }
      summary.append(list);
      if (rows.length > 3)
        line(`Showing the first 3 of ${rows.length} events. All are included in the file.`);
      if (rows.some((row) => !row.end && !("allDay" in row && row.allDay)))
        line("No duration is added to timed points. Your calendar may display its own default.");
    }
  }
  choices.replaceChildren();
  feedback.textContent = "";
  download.disabled =
    result.status !== "resolved" || (plan !== undefined && (!plan?.ok || !plan.occurrences.length));
  download.onclick = () => {
    try {
      // This closure belongs to the current render; editing replaces it and clears decisions.
      const metadata = {
        uid: crypto.randomUUID(),
        stamp: new Date().toISOString(),
        title: result.status === "resolved" ? (result.event?.text ?? input.value) : input.value,
      };
      const file =
        result.status === "resolved" && result.value.kind === "recurrence"
          ? prepareRecurringCalendarFile(result, {
              ...metadata,
              reference: result.context.reference,
              decisions,
            })
          : prepareCalendarFile(result, {
              ...metadata,
              pointMode:
                result.status === "resolved" &&
                result.value.kind === "point" &&
                result.value.precision === "date"
                  ? "date"
                  : "instant",
            });
      if (!file.ok) {
        feedback.textContent = file.reason;
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
      feedback.textContent = "Download requested. No calendar import or reminder was created.";
    } catch {
      feedback.textContent = "The file could not be downloaded. Try again in your browser.";
    }
  };
  const prompt =
    result.status === "needs-clarification"
      ? result.clarification
      : plan && !plan.ok
        ? plan.clockPrompt
        : undefined;
  if (prompt) {
    const question = document.createElement("p");
    question.textContent = prompt.question;
    choices.append(question);
    for (const choice of prompt.choices) {
      const button = document.createElement("button");
      button.textContent = choice.label;
      button.onclick = () => {
        if (result.status === "needs-clarification" && result.clarification) {
          selection = appendSelection(selection, {
            contextKey: result.clarification.contextKey,
            id: choice.id,
          });
          decisions = [];
        } else decisions = [choice.id, ...retainOccurrenceDecisions(decisions, choice.id)];
        render();
        summary.focus();
      };
      choices.append(button);
    }
  }
}
input.addEventListener("input", () => {
  selection = undefined;
  decisions = [];
  render();
});
document.querySelector<HTMLButtonElement>("#restart")!.onclick = () => {
  selection = undefined;
  decisions = [];
  render();
  summary.focus();
};
render();
