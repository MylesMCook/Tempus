"use client";

import { useMemo } from "react";
import { Copy, RotateCcw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { parseNaturalLanguageDate } from "@/shared/date-parser";
import { useSettings } from "../context/settings-context";
import { dateFormatOptions, safeFormatDate, timezoneOptions } from "../options";

interface DatePickerProps {
  expression: string;
  onExpressionChange: (expression: string) => void;
}

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

export function DatePicker({ expression, onExpressionChange }: DatePickerProps) {
  const { settings, effectiveDateFormat, resetSettings, updateSettings } = useSettings();

  const parsedDate = useMemo(() => {
    if (!expression.trim()) {
      return null;
    }

    return parseNaturalLanguageDate(expression, {
      preserveDayOfMonth: settings.preserveDayOfMonth,
    });
  }, [expression, settings.preserveDayOfMonth]);

  const formattedDate = parsedDate
    ? safeFormatDate(parsedDate, settings.timezone, effectiveDateFormat)
    : "";
  const formatError = safeFormatDate(new Date(), settings.timezone, effectiveDateFormat) === null;

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
          <Label htmlFor="date-expression" className="text-base">
            What date are you looking for?
          </Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="date-expression"
              aria-describedby="expression-help"
              aria-invalid={Boolean(expression.trim() && !parsedDate)}
              autoComplete="off"
              spellCheck={false}
              maxLength={200}
              value={expression}
              onChange={(event) => onExpressionChange(event.target.value)}
              placeholder="e.g. 2 weeks after may 1"
              className="h-11 text-base"
            />

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline">
                    <Settings2 data-icon="inline-start" />
                    Settings
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  aria-label="Date settings"
                  align="end"
                  className="flex w-80 max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="font-semibold">Date settings</h2>
                    <p className="text-sm text-muted-foreground">
                      Set the date display and month calculations. Preferences are saved in this
                      browser.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="timezone">Display timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => updateSettings({ timezone: value })}
                    >
                      <SelectTrigger id="timezone" aria-describedby="timezone-help">
                        <SelectValue placeholder="Choose a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p id="timezone-help" className="text-sm text-muted-foreground">
                      Changes how the result is displayed. The calculator still uses your browser’s
                      timezone for calendar calculations.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="date-format">Date format</Label>
                    <Select
                      value={settings.isCustomFormat ? "custom" : settings.dateFormat}
                      onValueChange={(value) =>
                        updateSettings({
                          dateFormat: value === "custom" ? settings.dateFormat : value,
                          isCustomFormat: value === "custom",
                        })
                      }
                    >
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Choose a format" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormatOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {settings.isCustomFormat ? (
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="custom-format">Custom format</Label>
                        <Input
                          id="custom-format"
                          aria-describedby="format-help"
                          aria-invalid={formatError}
                          maxLength={50}
                          value={settings.customFormat}
                          onChange={(event) => updateSettings({ customFormat: event.target.value })}
                          placeholder="yyyy-MM-dd HH:mm"
                        />
                        <p id="format-help" className="text-sm text-muted-foreground">
                          Use yyyy for year, MM for month, dd for day, HH:mm for time.
                        </p>
                        {formatError ? (
                          <p role="alert" className="text-sm text-destructive">
                            Invalid format. Try yyyy-MM-dd or reset settings.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="preserve-day">Preserve day of month</Label>
                      <p className="text-sm text-muted-foreground">
                        Keep the same day number when adding months where possible.
                      </p>
                    </div>
                    <Switch
                      id="preserve-day"
                      checked={settings.preserveDayOfMonth}
                      onCheckedChange={(checked) => updateSettings({ preserveDayOfMonth: checked })}
                    />
                  </div>

                  <Button type="button" variant="ghost" onClick={resetSettings}>
                    <RotateCcw data-icon="inline-start" />
                    Reset settings
                  </Button>
                </PopoverContent>
              </Popover>

              <Button
                type="button"
                variant="outline"
                onClick={() => onExpressionChange("")}
                disabled={!expression}
              >
                Clear
              </Button>
            </div>
          </div>

          <p id="expression-help" className="text-sm text-muted-foreground">
            Calculates as you type, using the current date and time in your browser’s timezone.
          </p>
        </CardContent>
      </Card>

      {expression.trim() && !parsedDate ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn’t find a date</AlertTitle>
          <AlertDescription>Try a phrase like “next friday” or “in 3 days.”</AlertDescription>
        </Alert>
      ) : null}

      {!expression.trim() ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Your date will appear here. Type a phrase above or choose an example below.
        </div>
      ) : null}

      {parsedDate ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="gap-2 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your date</CardTitle>
            <div role="status" aria-live="polite" aria-atomic="true">
              {formattedDate === null ? (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-destructive">
                    This format or timezone is invalid. Update settings or reset them to show your
                    date.
                  </p>
                  <Button variant="outline" onClick={resetSettings}>
                    Reset settings
                  </Button>
                </div>
              ) : (
                <p className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                  {formattedDate}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {settings.timezone} · {safeFormatDate(parsedDate, settings.timezone, "HH:mm zzz")}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              className="self-start"
              disabled={formattedDate === null}
              onClick={() => formattedDate !== null && copyToClipboard(formattedDate, "Date")}
            >
              <Copy data-icon="inline-start" /> Copy date
            </Button>
            <details className="border-t pt-4">
              <summary className="cursor-pointer text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                ISO date & timestamp
              </summary>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">ISO date (UTC)</dt>
                  <dd className="break-all font-mono text-sm">{parsedDate.toISOString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Unix timestamp (milliseconds)</dt>
                  <dd className="break-all font-mono text-sm">{parsedDate.getTime()}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(parsedDate.toISOString(), "ISO date")}
                >
                  <Copy data-icon="inline-start" />
                  Copy ISO
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(String(parsedDate.getTime()), "Timestamp")}
                >
                  <Copy data-icon="inline-start" />
                  Copy timestamp
                </Button>
              </div>
            </details>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
