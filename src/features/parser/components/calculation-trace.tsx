import type { DebugParseResult } from "@/shared/date-parser";
import { safeFormatDate } from "../options";

function localDate(date: Date) {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    timeZoneName: "short",
  });
}

export function CalculationTrace({
  calculation,
  timezone,
  dateFormat,
  preserveDayOfMonth,
}: {
  calculation: DebugParseResult;
  timezone: string;
  dateFormat: string;
  preserveDayOfMonth: boolean;
}) {
  const { tokens, baseDate, steps, result } = calculation;
  const displayed = result ? safeFormatDate(result, timezone, dateFormat) : null;

  return (
    <details className="rounded-xl border bg-card p-4 sm:p-5">
      <summary className="cursor-pointer font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
        See how it works
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">
        Updates as you type or change settings. Uses the same calculation as the result above.
      </p>
      {!tokens.length ? (
        <p className="mt-4 text-sm">Type a phrase or choose an example to see its calculation.</p>
      ) : (
        <ol className="mt-4 grid gap-5 text-sm" aria-label="Calculation steps">
          <li>
            <h3 className="font-medium">1. Read the phrase</h3>
            <p className="mt-1 text-muted-foreground">
              Normalize words and numbers, then identify each part. Unrecognized text is labelled
              “text” and prevents a calculation.
            </p>
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Recognized parts">
              {tokens.map((token, index) => (
                <li
                  key={`${index}-${token.value}`}
                  className="max-w-full rounded-md bg-muted px-2 py-1 break-all"
                >
                  <span className="font-mono">{token.value}</span>{" "}
                  <span className="text-muted-foreground">({token.type})</span>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <h3 className="font-medium">2. Choose the starting date</h3>
            {baseDate ? (
              <div className="mt-1">
                <p className="text-muted-foreground">{calculation.baseDescription}</p>
                <p className="mt-1 break-words">{localDate(baseDate)}</p>
              </div>
            ) : (
              <p className="mt-1 text-destructive">
                {calculation.error ?? "No valid starting date found."} Try “today plus 2 weeks” to
                see a complete calculation.
              </p>
            )}
            <p className="mt-1 text-muted-foreground">
              Calendar calculations use your browser’s timezone.
            </p>
          </li>
          {baseDate ? (
            <li>
              <h3 className="font-medium">3. Apply time changes</h3>
              <p className="mt-1 text-muted-foreground">
                Larger units run first: years, months, weeks, days, hours, minutes, seconds.
                Preserve day of month is {preserveDayOfMonth ? "on" : "off"}. Month-end dates clamp
                to the last valid day.
              </p>
              {steps.some(({ operation }) => operation.amount % 1 !== 0) ? (
                <p className="mt-2 text-muted-foreground">
                  Fractions use rounded smaller units: days and weeks to hours, months to days
                  (30.436875 days per month), years to months then days (365.25 days per year),
                  hours to minutes, minutes to seconds, and seconds to milliseconds.
                </p>
              ) : null}
              {steps.length ? (
                <ol
                  className="mt-2 grid gap-3 border-l-2 pl-3"
                  aria-label="Time changes in execution order"
                >
                  {steps.map(({ operation, before, after }, index) => (
                    <li key={index}>
                      <p className="font-medium">
                        {operation.direction === 1 ? "Add" : "Subtract"} {operation.amount}{" "}
                        {operation.unit}
                        {operation.amount === 1 ? "" : "s"}
                      </p>
                      <p className="mt-1 break-words text-muted-foreground">
                        From {localDate(before)}
                      </p>
                      <p className="break-words">To {localDate(after)}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2">No additional time changes. The starting date is the result.</p>
              )}
            </li>
          ) : null}
          {baseDate && calculation.error ? (
            <li className="text-destructive">{calculation.error}</li>
          ) : null}
          {result ? (
            <li>
              <h3 className="font-medium">4. Display the result</h3>
              <p className="mt-1 break-all font-mono">{result.toISOString()}</p>
              <p className="mt-1 break-words text-muted-foreground">
                Format this instant in {timezone} using <code>{dateFormat}</code>.
              </p>
              <p className="mt-2 break-words font-medium">
                {displayed ??
                  "Invalid display format or timezone. Reset settings to show the date."}
              </p>
            </li>
          ) : null}
        </ol>
      )}
    </details>
  );
}
