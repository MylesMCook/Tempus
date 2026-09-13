import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { interpretDate } from "./interpret-date";
import { calculateDate } from "./date-parser";
import { prepareCalendarFile } from "./calendar-file";
const options = { timezone: "America/Sao_Paulo", reference: "2018-11-03T12:00:00Z" };
it("keeps a date whose midnight is skipped as date-only, without weakening strict clocks", () => {
  const result = interpretDate("November 4, 2018", options);
  expect(result).toMatchObject({
    status: "resolved",
    apiReplay: false,
    value: { kind: "point", precision: "date" },
  });
  if (result.status !== "resolved" || result.value.kind !== "point")
    throw new Error("Missing date");
  expect(result.value.calculation.result.local).toBe("2018-11-04T01:00:00.000");
  expect(calculateDate("November 4, 2018", options).ok).toBe(false);
  expect(interpretDate("November 4, 2018 at midnight", options).status).toBe("needs-clarification");
  const file = prepareCalendarFile(result, {
    uid: "11111111-2222-4333-8444-555555555555",
    stamp: options.reference,
    title: "day off",
    pointMode: "date",
  });
  if (!file.ok) throw new Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.startDate.isDate).toBe(true);
  expect(event.startDate.toString()).toBe("2018-11-04");
  expect(event.endDate.toString()).toBe("2018-11-05");
});
it.each(["November 3, 2018 for 1 day", "November 4, 2018 for 1 day"])(
  "uses civil exclusive endpoints for %s",
  (input) => {
    const result = interpretDate(input, options);
    if (result.status !== "resolved" || result.value.kind !== "interval")
      throw new Error(JSON.stringify(result));
    expect(result.value.allDay).toBe(true);
    const file = prepareCalendarFile(result, {
      uid: "11111111-2222-4333-8444-555555555555",
      stamp: options.reference,
      title: "day off",
    });
    if (!file.ok) throw new Error(file.reason);
    const event = new ICAL.Event(
      new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
    );
    const day = input.includes("3,") ? 3 : 4;
    expect(event.startDate.toString()).toBe(`2018-11-0${day}`);
    expect(event.endDate.toString()).toBe(`2018-11-0${day + 1}`);
    expect(result.value.end.result.local.slice(11)).toBe(
      day === 3 ? "01:00:00.000" : "00:00:00.000",
    );
  },
);
it("does not move an entirely skipped civil date into the next date", () => {
  const result = interpretDate("December 30, 2011", {
    timezone: "Pacific/Apia",
    reference: "2011-12-28T12:00:00Z",
  });
  expect(result.status).not.toBe("resolved");
});
it("uses the beginning of a repeated-midnight date without selecting an appointment clock", () => {
  const context = { timezone: "America/Havana", reference: "2026-10-30T12:00:00Z" };
  const result = interpretDate("November 1, 2026", context);
  if (result.status !== "resolved" || result.value.kind !== "point")
    throw new Error("Missing date");
  expect(result.value.precision).toBe("date");
  expect(result.value.calculation.result.iso).toBe("2026-11-01T04:00:00.000Z");
  expect(interpretDate("November 1, 2026 at midnight", context).status).toBe("needs-clarification");
});
it("retains numeric source and date-only export after choosing a skipped-midnight date", () => {
  const input = "11/04/2018";
  const first = interpretDate(input, options);
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing date choice");
  const result = interpretDate(input, {
    ...options,
    selection: {
      contextKey: first.clarification.contextKey,
      id: first.clarification.choices[0].id,
    },
  });
  expect(result).toMatchObject({
    status: "resolved",
    apiReplay: false,
    source: { text: input },
    value: { kind: "point", precision: "date" },
  });
});
