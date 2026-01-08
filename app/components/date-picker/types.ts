// Shared types for DatePicker components

export interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  onFormattedDateChange?: (formattedDate: string) => void
  className?: string
  /** Controlled input value - if provided, the component becomes controlled */
  inputValue?: string
  /** Callback when input value changes (for controlled mode) */
  onInputValueChange?: (value: string) => void
}

export interface DateParserSettings {
  dateFormat: string
  showWeekday: boolean
  autoExpandSteps: boolean
  syntaxHighlighting: boolean
  preserveDayOfMonth: boolean
  isCustomFormat?: boolean
  customFormat?: string
}

export const DEFAULT_SETTINGS: DateParserSettings = {
  dateFormat: "EEEE, MMMM d, yyyy",
  showWeekday: true,
  autoExpandSteps: true,
  syntaxHighlighting: true,
  preserveDayOfMonth: true,
}

export interface DebugInfo {
  tokens?: Array<{ type: string; value: string }>
  baseDate?: Date
  operations?: Array<{ direction: number; amount: number; unit: string }>
  result?: Date
  input?: {
    raw: string
    length: number
    normalized: string
    timestamp: string
  }
  performance?: {
    parseTimeMs: string
    timestamp: number
  }
  environment?: {
    timezone: string
    browserTimezone: string
    locale: string
    preserveDayOfMonth: boolean
  }
}

// Theme style constants
export const THEME_STYLES = {
  lightBg: "bg-gray-50 border-gray-200 text-gray-800",
  darkBg: "dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-200",
  badgeStyle: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700",
  stepStyle: "bg-gray-200 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200",
  preStyle: "bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200",
  highlightStyle: "text-gray-700 dark:text-gray-300",
  buttonStyle: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400",
} as const
