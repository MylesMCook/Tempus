import { expect, it } from "vite-plus/test";
import { calculateDate } from "../../shared/date-parser";
import { resultClockFormat, safeFormatDate } from "./options";

it.each([
  ["April 3, 2027 at noon", "12:00 PM CDT"],
  ["April 3, 2027 at noon plus 30 seconds", "12:00:30 PM CDT"],
  ["April 3, 2027 at noon plus 0.5 seconds", "12:00:00.500 PM CDT"],
  ["April 3, 2027 at noon minus 0.001 seconds", "11:59:59.999 AM CDT"],
])("preserves the calculated clock in displayed and copied results: %s", (input, expected) => {
  const result = calculateDate(input, {
    timezone: "America/Chicago",
    reference: "2026-09-12T16:00:00Z",
  });
  if (!result.ok) throw new Error(result.error.message);
  expect(
    safeFormatDate(
      new Date(result.result.timestamp),
      result.timezone,
      resultClockFormat(result.result.local),
    ),
  ).toBe(expected);
});
