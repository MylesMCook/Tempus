"use client"

import { DebugInfo } from "../types"

interface DebugSummaryProps {
  inputValue: string
  previewDate: Date | null
  timezone: string
  preserveDayOfMonth: boolean
  debugInfo: DebugInfo | null
}

export function DebugSummary({
  inputValue,
  previewDate,
  timezone,
  preserveDayOfMonth,
  debugInfo,
}: DebugSummaryProps) {
  return (
    <div className="p-3 bg-muted/30 rounded-md border border-border/50">
      <h4 className="text-sm font-medium mb-2">Debug Summary</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <span className="font-medium">Input:</span> {inputValue || "<empty>"}
        </div>
        <div>
          <span className="font-medium">Parse Status:</span> {previewDate ? "Success" : "Failed/Pending"}
        </div>
        <div>
          <span className="font-medium">Timezone:</span> {timezone}
        </div>
        <div>
          <span className="font-medium">Preserve Day:</span> {preserveDayOfMonth ? "Yes" : "No"}
        </div>
        {debugInfo?.performance && (
          <div>
            <span className="font-medium">Parse Time:</span> {debugInfo.performance.parseTimeMs}ms
          </div>
        )}
        {previewDate && (
          <div>
            <span className="font-medium">Result:</span> {previewDate.toISOString()}
          </div>
        )}
      </div>
    </div>
  )
}
