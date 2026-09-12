import { Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Calculation } from "@/shared/date-parser";
import { useSettings } from "../context/settings-context";
import { dateFormatOptions, safeFormatDate, timezoneOptions } from "../options";
import { CalculationTrace } from "./calculation-trace";

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Copy was blocked. Select the value and copy it manually.");
  }
}
export function DatePicker({
  expression,
  onExpressionChange,
  calculation,
  reference,
  onRefresh,
}: {
  expression: string;
  onExpressionChange: (value: string) => void;
  calculation: Calculation;
  reference: string;
  onRefresh: () => void;
}) {
  const { settings, settingsSaved, effectiveDateFormat, updateSettings, resetSettings } =
    useSettings();
  const formatted = calculation.ok
    ? safeFormatDate(new Date(calculation.result.timestamp), settings.timezone, effectiveDateFormat)
    : null;
  const clock =
    safeFormatDate(new Date(reference), settings.timezone, "MMM d, yyyy HH:mm:ss zzz") ?? reference;
  return (
    <div className="grid gap-4">
      <section aria-label="Date calculator" className="rounded-xl border bg-background p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="grid gap-2">
            <Label htmlFor="date-expression" className="text-base">
              What date are you looking for?
            </Label>
            <Input
              id="date-expression"
              aria-describedby={
                expression.trim() && !calculation.ok
                  ? "phrase-help calculation-error"
                  : "phrase-help"
              }
              aria-invalid={Boolean(
                expression.trim() && !calculation.ok && calculation.error.code !== "timezone",
              )}
              value={expression}
              onChange={(event) => onExpressionChange(event.target.value)}
              maxLength={200}
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. tomorrow at 2 pm"
              className="h-12 text-base"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="calculation-timezone" className="text-base">
              Timezone
            </Label>
            <Input
              id="calculation-timezone"
              list="timezone-options"
              value={settings.timezone}
              onChange={(event) => updateSettings({ timezone: event.target.value })}
              maxLength={64}
              aria-describedby={
                !calculation.ok && calculation.error.code === "timezone"
                  ? "timezone-help calculation-error"
                  : "timezone-help"
              }
              aria-invalid={!calculation.ok && calculation.error.code === "timezone"}
              autoComplete="off"
              spellCheck={false}
              className="h-12 text-base"
            />
            <datalist id="timezone-options">
              {timezoneOptions.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </datalist>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <p id="phrase-help">Changes run in the order written.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExpressionChange("")}
            disabled={!expression}
          >
            Clear
          </Button>
        </div>
        <p id="timezone-help" className="text-xs text-muted-foreground">
          Used for calculation and display. Choose a suggestion or enter an IANA timezone.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-3 text-xs text-muted-foreground">
          <span>
            Reference: <time dateTime={reference}>{clock}</time>
          </span>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RotateCcw className="mr-1 size-3" />
            Refresh now
          </Button>
          <span>Captured on edit. Refresh to use the current time.</span>
        </div>
      </section>

      {!expression.trim() ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Enter a phrase or choose an example. Your date and its calculation will appear here.
        </div>
      ) : !calculation.ok ? (
        <section
          id="calculation-error"
          role="alert"
          className="rounded-xl border border-destructive/40 bg-background p-4"
        >
          <h2 className="font-semibold text-destructive">{calculation.error.message}</h2>
          <p className="mt-2 text-sm">{calculation.error.hint}</p>
          {calculation.error.span && calculation.error.span.end > calculation.error.span.start ? (
            <p className="mt-2 break-words text-sm text-muted-foreground">
              Check:{" "}
              <code>
                {expression.slice(calculation.error.span.start, calculation.error.span.end)}
              </code>
            </p>
          ) : null}
          {calculation.error.code === "timezone" ? (
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => updateSettings({ timezone: "UTC" })}
            >
              Use UTC
            </Button>
          ) : null}
        </section>
      ) : (
        <section
          aria-label="Calculated date"
          className="rounded-xl border bg-background p-4 sm:p-6"
        >
          <h2 className="text-sm text-muted-foreground">Your date</h2>
          <div role="status" aria-live="polite" aria-atomic="true" className="mt-2">
            <p
              className={`break-words text-2xl font-semibold tracking-tight sm:text-3xl ${formatted === null ? "text-destructive" : ""}`}
            >
              {formatted ?? "Choose a valid date format."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {calculation.timezone} ·{" "}
              {safeFormatDate(
                new Date(calculation.result.timestamp),
                calculation.timezone,
                "HH:mm:ss.SSS zzz",
              )}
            </p>
          </div>
          {calculation.warnings.map((warning) => (
            <p
              key={warning}
              className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
              role="note"
            >
              {warning}
            </p>
          ))}
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <Button
              onClick={() => formatted !== null && copy(formatted, "Date")}
              disabled={formatted === null}
            >
              <Copy className="mr-2 size-4" />
              Copy date
            </Button>
            <div className="grid max-w-full gap-2">
              <Label htmlFor="date-format">Display format</Label>
              <select
                id="date-format"
                value={settings.isCustomFormat ? "custom" : settings.dateFormat}
                onChange={(event) =>
                  updateSettings({
                    isCustomFormat: event.target.value === "custom",
                    ...(event.target.value === "custom" ? {} : { dateFormat: event.target.value }),
                  })
                }
                className="h-10 max-w-full rounded-md border bg-background px-2 text-sm focus-visible:outline focus-visible:outline-2"
              >
                {dateFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {settings.isCustomFormat ? (
            <div className="mt-4 grid gap-2">
              <Label htmlFor="custom-format">Custom date format</Label>
              <Input
                id="custom-format"
                value={settings.customFormat}
                maxLength={50}
                aria-invalid={formatted === null}
                aria-describedby="format-help"
                onChange={(event) => updateSettings({ customFormat: event.target.value })}
              />
              <p id="format-help" className="text-xs text-muted-foreground">
                Use yyyy for year, MM for month, dd for day, HH:mm for time. Example: yyyy-MM-dd
                HH:mm.
              </p>
            </div>
          ) : null}
          {formatted === null ? (
            <Button
              className="mt-3"
              variant="outline"
              onClick={() =>
                updateSettings({ isCustomFormat: false, dateFormat: "EEEE, MMMM d, yyyy" })
              }
            >
              Restore readable format
            </Button>
          ) : null}
          <details className="mt-5 border-t pt-3 text-sm">
            <summary className="cursor-pointer focus-visible:outline focus-visible:outline-2">
              ISO date and timestamp
            </summary>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">ISO date (UTC)</dt>
                <dd className="break-all font-mono">{calculation.result.iso}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Unix milliseconds</dt>
                <dd className="font-mono">{calculation.result.timestamp}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(calculation.result.iso, "ISO date")}
              >
                Copy ISO
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(String(calculation.result.timestamp), "Timestamp")}
              >
                Copy timestamp
              </Button>
            </div>
          </details>
        </section>
      )}
      {expression.trim() ? (
        <>
          <CalculationTrace calculation={calculation} />
          <Button
            variant="outline"
            className="justify-self-start"
            onClick={() =>
              copy(
                JSON.stringify(
                  {
                    expression,
                    timezone: settings.timezone,
                    reference,
                    format: effectiveDateFormat,
                    calculation,
                  },
                  null,
                  2,
                ),
                "Calculation details",
              )
            }
          >
            Copy calculation details
          </Button>
        </>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {settingsSaved
            ? "Timezone and display preferences stay in this browser."
            : "Browser storage is unavailable. Preferences apply until you reload."}
        </span>
        <Button variant="ghost" size="sm" onClick={resetSettings}>
          Reset preferences
        </Button>
      </div>
    </div>
  );
}
