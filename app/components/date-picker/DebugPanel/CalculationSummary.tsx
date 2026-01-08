"use client"

import { formatInTimeZone } from "date-fns-tz"

interface CalculationSummaryProps {
  baseDate: Date
  result: Date
  timezone: string
}

export function CalculationSummary({ baseDate, result, timezone }: CalculationSummaryProps) {
  const daysDiff = Math.abs(
    Math.floor((result.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
  )
  const hoursDiff = Math.floor(
    Math.abs(result.getTime() - baseDate.getTime()) / (1000 * 60 * 60)
  )
  const minutesDiff = Math.floor(
    Math.abs(result.getTime() - baseDate.getTime()) / (1000 * 60)
  )
  const secondsDiff = Math.floor(
    Math.abs(result.getTime() - baseDate.getTime()) / 1000
  )

  const dayOfYear = Math.floor(
    (result.getTime() - new Date(result.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  )
  const weekNumber = Math.ceil(
    (result.getTime() - new Date(result.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  )
  const quarter = Math.floor(result.getMonth() / 3) + 1

  return (
    <div className="space-y-1 mt-4 pt-3 border-t border-border">
      <div className="flex items-center gap-2">
        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded font-medium">Summary</span>
        <h4 className="font-medium">Calculation Overview</h4>
      </div>

      <div className="mt-2 space-y-2 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2 rounded bg-muted/50">
            <p className="font-medium mb-1">Base Date</p>
            <p>{baseDate.toLocaleString()}</p>
            <p className="text-muted-foreground mt-1">{baseDate.toISOString()}</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="font-medium mb-1">Result Date</p>
            <p>{result.toLocaleString()}</p>
            <p className="text-muted-foreground mt-1">{result.toISOString()}</p>
          </div>
        </div>

        <div className="p-2 rounded bg-muted/50">
          <p className="font-medium mb-1">Time Difference</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="opacity-70">Days:</span> {daysDiff}
            </div>
            <div>
              <span className="opacity-70">Hours:</span> {hoursDiff}
            </div>
            <div>
              <span className="opacity-70">Minutes:</span> {minutesDiff}
            </div>
            <div>
              <span className="opacity-70">Seconds:</span> {secondsDiff}
            </div>
          </div>
        </div>

        <div className="p-2 rounded bg-muted/50">
          <p className="font-medium mb-1">Timezone Display</p>
          <p>
            {formatInTimeZone(result, timezone, "yyyy-MM-dd HH:mm:ss zzz")}
            {timezone !== "UTC" && (
              <span className="block mt-1 text-muted-foreground">
                UTC: {formatInTimeZone(result, "UTC", "yyyy-MM-dd HH:mm:ss 'UTC'")}
              </span>
            )}
          </p>
        </div>

        <div className="p-2 rounded bg-muted/50">
          <p className="font-medium mb-1">Technical Details</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="opacity-70">Unix Timestamp:</span> {Math.floor(result.getTime() / 1000)}
            </div>
            <div>
              <span className="opacity-70">Day of Year:</span> {dayOfYear}
            </div>
            <div>
              <span className="opacity-70">Week Number:</span> {weekNumber}
            </div>
            <div>
              <span className="opacity-70">Quarter:</span> {quarter}
            </div>
          </div>
        </div>

        <div className="p-2 rounded bg-muted/50">
          <p className="font-medium mb-1">Time Components</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="opacity-70">Hours:</span> {result.getHours()}
            </div>
            <div>
              <span className="opacity-70">Minutes:</span> {result.getMinutes()}
            </div>
            <div>
              <span className="opacity-70">Seconds:</span> {result.getSeconds()}
            </div>
            <div>
              <span className="opacity-70">Milliseconds:</span> {result.getMilliseconds()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
