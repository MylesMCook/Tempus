"use client"

import * as React from "react"
import { Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TimeSelectorProps {
  previewDate: Date
  timeFormat: "12h" | "24h"
  onTimeFormatChange: (format: "12h" | "24h") => void
  onHoursChange: (hours: number) => void
  onMinutesChange: (minutes: number) => void
  onSecondsChange: (seconds: number) => void
  onDateChange: (date: Date) => void
  formatTime: (date: Date | null) => string
}

export function TimeSelector({
  previewDate,
  timeFormat,
  onTimeFormatChange,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  onDateChange,
  formatTime,
}: TimeSelectorProps) {
  return (
    <div className="border-t pt-3 mt-1 overflow-x-hidden">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium flex items-center gap-1.5">
          <Clock3 className="size-3.5" />
          Time
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-primary">{formatTime(previewDate)}</span>
          <Tabs value={timeFormat} onValueChange={(v) => onTimeFormatChange(v as "12h" | "24h")} className="h-7">
            <TabsList className="h-6 p-0">
              <TabsTrigger value="12h" className="text-xs px-2 h-6">
                12h
              </TabsTrigger>
              <TabsTrigger value="24h" className="text-xs px-2 h-6">
                24h
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">
              Hours: {timeFormat === "12h" ? previewDate.getHours() % 12 || 12 : previewDate.getHours()}
            </Label>
            <span className="text-xs text-muted-foreground">{timeFormat === "12h" ? "1-12" : "0-23"}</span>
          </div>
          <Slider
            aria-label="Adjust hours"
            value={[timeFormat === "12h" ? previewDate.getHours() % 12 || 12 : previewDate.getHours()]}
            min={timeFormat === "12h" ? 1 : 0}
            max={timeFormat === "12h" ? 12 : 23}
            step={1}
            onValueChange={(value) => {
              if (timeFormat === "12h") {
                // Preserve AM/PM when adjusting hours in 12h mode
                const isCurrentlyPM = previewDate.getHours() >= 12
                const newHour = value[0] + (isCurrentlyPM ? 12 : 0)
                onHoursChange(newHour % 24)
              } else {
                onHoursChange(value[0])
              }
            }}
            className="py-1"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Minutes: {previewDate.getMinutes()}</Label>
            <span className="text-xs text-muted-foreground">0-59</span>
          </div>
          <Slider
            aria-label="Adjust minutes"
            value={[previewDate.getMinutes()]}
            min={0}
            max={59}
            step={1}
            onValueChange={(value) => onMinutesChange(value[0])}
            className="py-1"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Seconds: {previewDate.getSeconds()}</Label>
            <span className="text-xs text-muted-foreground">0-59</span>
          </div>
          <Slider
            aria-label="Adjust seconds"
            value={[previewDate.getSeconds()]}
            min={0}
            max={59}
            step={1}
            onValueChange={(value) => onSecondsChange(value[0])}
            className="py-1"
          />
        </div>

        {timeFormat === "12h" && (
          <div className="flex justify-end mt-1">
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "h-7 text-xs",
                previewDate.getHours() >= 12
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "hover:bg-primary/5 hover:border-primary/50",
              )}
              onClick={() => {
                const newDate = new Date(previewDate)
                const currentHours = newDate.getHours()
                newDate.setHours((currentHours + 12) % 24)
                onDateChange(newDate)
              }}
            >
              {previewDate.getHours() >= 12 ? "PM" : "AM"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
