"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatePickerModalProps {
  date?: Date | null
  previewDate?: Date | null
  onSelect: (date: Date | undefined) => void
  open: boolean
  setOpen: (open: boolean) => void
}

export function DatePickerModal({ date, previewDate, onSelect, open, setOpen }: DatePickerModalProps) {
  const today = new Date()
  const [calendarDate, setCalendarDate] = useState<Date>(previewDate || date || today)
  const [viewMode, setViewMode] = useState<"day" | "month" | "year">("day")

  // Generate years for selection (10 years back, 10 years forward)
  const currentYear = today.getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  // Month names for selection
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Preserve time from previous date if it exists
      if (previewDate) {
        newDate.setHours(previewDate.getHours())
        newDate.setMinutes(previewDate.getMinutes())
        newDate.setSeconds(previewDate.getSeconds())
      }
    }
    onSelect(newDate)
    setOpen(false)
  }

  const handleMonthChange = (month: string) => {
    const newDate = new Date(calendarDate)
    newDate.setMonth(months.indexOf(month))
    setCalendarDate(newDate)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(calendarDate)
    newDate.setFullYear(Number.parseInt(year))
    setCalendarDate(newDate)
  }

  const goToToday = () => {
    const now = new Date()
    setCalendarDate(now)
    // Don't select the date yet, just navigate to today's view
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(calendarDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCalendarDate(newDate)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                aria-label="Open calendar"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="end">
            <div className="p-3 border-b">
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center gap-1">
                  <Select value={months[calendarDate.getMonth()]} onValueChange={handleMonthChange}>
                    <SelectTrigger className="h-7 w-[110px] text-sm">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month} className="text-sm">
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={calendarDate.getFullYear().toString()} onValueChange={handleYearChange}>
                    <SelectTrigger className="h-7 w-[80px] text-sm">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()} className="text-sm">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Calendar
              mode="single"
              selected={previewDate || date || undefined}
              onSelect={handleCalendarSelect}
              initialFocus
              month={calendarDate}
              onMonthChange={setCalendarDate}
              className="p-3"
            />

            <div className="flex items-center justify-between p-3 border-t bg-muted/20">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={goToToday}>
                Today
              </Button>

              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  handleCalendarSelect(calendarDate)
                }}
              >
                Select
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <TooltipContent>
          <p>Open calendar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
