import { expect, it, vi } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { parse as interpretDate } from "@/shared/sdk";
import { prepareCalendar } from "@/shared/sdk-calendar";
import type { CalendarPreparationRequest } from "./calendar-preparation";
import { RecurrenceDecisionsProvider } from "./context/recurrence-decisions-context";
import { OccurrenceResult } from "./components/occurrence-result";
import { CalendarExport } from "./components/calendar-export";
import { DevelopersPage } from "@/routes/developers-page";
import { scheduleQuantity } from "./schedule-labels";

vi.mock("./use-calendar-preparation", () => ({
  useCalendarPreparation: (request?: CalendarPreparationRequest) =>
    request
      ? {
          ok: true,
          result: prepareCalendar(request.interpretation),
        }
      : undefined,
}));

it.each([0, 1, 2])("labels %i dates, occurrences, and events", (count) => {
  for (const noun of ["date", "occurrence", "scheduled date", "separate event"]) {
    expect(scheduleQuantity(count, noun)).toBe(`${count} ${noun}${count === 1 ? "" : "s"}`);
  }
});

it("renders singular complete schedule status, copy action, preview and export description", () => {
  const expression = "every Monday at noon for 1 occurrence";
  const reference = "2026-09-12T16:00:00Z";
  const interpretation = interpretDate(expression, { timezone: "America/Chicago", reference });
  if (interpretation.status !== "resolved") throw new Error("Expected resolved schedule");
  const html = renderToStaticMarkup(
    <RecurrenceDecisionsProvider>
      <OccurrenceResult
        interpretation={interpretation}
        expression={expression}
        reference={reference}
        onChangeInterpretation={() => {}}
      />
      <CalendarExport interpretation={interpretation} reference={reference} />
    </RecurrenceDecisionsProvider>,
  );
  expect(html).toContain("1 occurrence in total.");
  expect(html).toContain("1 date ready.");
  expect(html).toContain("Copy 1 date");
  expect(html).toContain("Complete schedule date");
  expect(html).toContain("How this date was");
  expect(html).not.toContain("1 dates");
  expect(html).not.toContain("1 occurrences");
});

it("makes the developer example a named, focusable scroll region with a visible focus ring", () => {
  const html = renderToStaticMarkup(<DevelopersPage />);
  expect(html).toContain('tabindex="0"');
  expect(html).toContain('role="region"');
  expect(html).toContain('aria-label="TypeScript package example"');
  expect(html).toContain("overflow-x-auto");
  expect(html).toContain("focus-visible:ring-2");
});

it("states unpublished package, local parse, API path and clarification contract", () => {
  const html = renderToStaticMarkup(<DevelopersPage />);
  expect(html).toContain("not published yet");
  expect(html).toContain("not on npm");
  expect(html).toContain("Check API result");
  expect(html).toContain("GET /api/parse");
  expect(html).toContain("needs-clarification");
  expect(html).toContain("Do not pick a date silently");
  expect(html).toContain("on your device unless");
  expect(html).not.toContain("Build with Tempus");
  expect(html).not.toContain("Use the date engine");
});
