"use client"

import * as React from "react"
import { Check, RotateCcw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useSettings } from "../../context/settings-context"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

interface DatePickerSettingsProps {
  timezone: string
  onTimezoneChange: (timezone: string) => void
}

export function DatePickerSettings({ timezone, onTimezoneChange }: DatePickerSettingsProps) {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { toast } = useToast()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const settingsContent = (
    <>
      <div className="p-4 pb-2 border-b">
        <h3 className="font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Date Parser Settings
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Customize how dates are parsed and displayed
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Timezone Section */}
        <div className="space-y-2">
          <Label htmlFor="timezone-select" className="text-sm font-medium">
            Timezone
          </Label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger id="timezone-select" className="h-8 text-sm">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                Browser Default ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </SelectItem>
              <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
              <SelectItem value="Europe/Paris">Central European (CET/CEST)</SelectItem>
              <SelectItem value="Asia/Tokyo">Japan (JST)</SelectItem>
              <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Timezone used for displaying dates. API uses UTC by default.
          </p>
        </div>

        {/* Date Format Section */}
        <div className="space-y-2">
          <Label htmlFor="date-format" className="text-sm font-medium">
            Date Format
          </Label>
          {!settings.isCustomFormat ? (
            <Select
              value={settings.dateFormat}
              onValueChange={(value) => {
                if (value === "custom") {
                  updateSettings({
                    isCustomFormat: true,
                    customFormat: settings.dateFormat,
                  })
                } else {
                  updateSettings({
                    dateFormat: value,
                    isCustomFormat: false,
                  })
                }
              }}
            >
              <SelectTrigger id="date-format" className="h-8 text-sm">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EEEE, MMMM d, yyyy">Tuesday, April 15, 2025</SelectItem>
                <SelectItem value="MMM d, yyyy">Apr 15, 2025</SelectItem>
                <SelectItem value="MM/dd/yyyy">04/15/2025</SelectItem>
                <SelectItem value="yyyy-MM-dd">2025-04-15</SelectItem>
                <SelectItem value="d MMMM yyyy">15 April 2025</SelectItem>
                <SelectItem value="yyyy-MM-dd HH:mm:ss">2025-04-15 14:30:00</SelectItem>
                <SelectItem value="custom">Custom format...</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={settings.customFormat}
                  onChange={(e) =>
                    updateSettings({ customFormat: e.target.value, dateFormat: e.target.value })
                  }
                  placeholder="e.g., yyyy-MM-dd HH:mm"
                  className="h-8 text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateSettings({ isCustomFormat: false })}
                  className="h-8 w-8 hover:bg-primary/5 hover:border-primary/50"
                  title="Back to presets"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                <span>Format tokens:</span>
                <Badge variant="outline" className="font-mono text-[10px] h-4">
                  yyyy
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] h-4">
                  MM
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] h-4">
                  dd
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] h-4">
                  HH
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] h-4">
                  mm
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] h-4">
                  ss
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Parser Behavior Section */}
        <div className="space-y-3 pt-2 border-t">
          <h4 className="text-sm font-medium">Parser Behavior</h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="preserve-day" className="text-sm">
                Preserve Day of Month
              </Label>
              <p className="text-xs text-muted-foreground">
                Keep the same day when adding months/years
              </p>
            </div>
            <Switch
              id="preserve-day"
              checked={settings.preserveDayOfMonth}
              onCheckedChange={(checked) => updateSettings({ preserveDayOfMonth: checked })}
            />
          </div>
        </div>

        {/* Debug Options Section */}
        <div className="space-y-3 pt-2 border-t">
          <h4 className="text-sm font-medium">Debug Options</h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="syntax-highlighting" className="text-sm">
                Syntax Highlighting
              </Label>
              <p className="text-xs text-muted-foreground">Colorize JSON in debug output</p>
            </div>
            <Switch
              id="syntax-highlighting"
              checked={settings.syntaxHighlighting}
              onCheckedChange={(checked) => updateSettings({ syntaxHighlighting: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-expand" className="text-sm">
                Auto-expand Steps
              </Label>
              <p className="text-xs text-muted-foreground">Automatically expand all debug steps</p>
            </div>
            <Switch
              id="auto-expand"
              checked={settings.autoExpandSteps}
              onCheckedChange={(checked) => updateSettings({ autoExpandSteps: checked })}
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-muted/50 flex items-center justify-between border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={resetSettings}
          className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset to Defaults
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-8 text-xs bg-primary hover:bg-primary/90"
          onClick={() => {
            toast({
              title: "Settings saved",
              description: "Your preferences have been applied",
              duration: 2000,
            })
          }}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Apply
        </Button>
      </div>
    </>
  )

  const triggerButton = (
    <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8 hover:bg-primary/10 hover:text-primary">
      <Settings className="size-4" />
      <span className="sr-only">Open parser settings</span>
    </Button>
  )

  if (isDesktop) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover>
              <PopoverTrigger asChild>
                {triggerButton}
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                {settingsContent}
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open parser settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {triggerButton}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto p-0">
        {settingsContent}
      </SheetContent>
    </Sheet>
  )
}
