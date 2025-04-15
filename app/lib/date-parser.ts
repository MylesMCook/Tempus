import {
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  nextFriday,
  nextMonday,
  nextSaturday,
  nextSunday,
  nextThursday,
  nextTuesday,
  nextWednesday,
  previousFriday,
  previousMonday,
  previousSaturday,
  previousSunday,
  previousThursday,
  previousTuesday,
  previousWednesday,
  setDate,
  addHours,
  subHours,
  addMinutes,
  subMinutes,
  addSeconds,
  subSeconds,
  addMilliseconds,
  subMilliseconds,
} from "date-fns"

interface Token {
  type: "number" | "unit" | "modifier" | "relative" | "weekday" | "month" | "operator" | "text" | "ordinal"
  value: string
}

interface TimeOperation {
  amount: number
  unit: string
  direction: 1 | -1
}

// Get the setting from localStorage if available
function getPreserveDayOfMonthSetting(): boolean {
  if (typeof window === "undefined") return true

  try {
    const settings = localStorage.getItem("parserSettings")
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.preserveDayOfMonth !== undefined ? parsed.preserveDayOfMonth : true
    }
  } catch (e) {
    console.error("Error reading settings:", e)
  }

  return true // Default to true if setting not found
}

// Constants for time conversions
const DAYS_PER_MONTH = 30.436875 // Average days per month
const DAYS_PER_YEAR = 365.25 // Average days per year including leap years
const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR

class DateExpressionParser {
  // Add this property to the class
  private preserveDayOfMonthOverride: boolean | null = null

  // Add this method to the class
  setPreserveDayOfMonth(value: boolean): void {
    this.preserveDayOfMonthOverride = value
  }

  // Update the getPreserveDayOfMonth method to use the override if set
  private getPreserveDayOfMonth(): boolean {
    if (this.preserveDayOfMonthOverride !== null) {
      return this.preserveDayOfMonthOverride
    }
    return getPreserveDayOfMonthSetting()
  }

  private readonly monthMap: Record<string, number> = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  }

  private readonly weekdayMap: Record<string, (date: Date) => Date> = {
    sunday: nextSunday,
    monday: nextMonday,
    tuesday: nextTuesday,
    wednesday: nextWednesday,
    thursday: nextThursday,
    friday: nextFriday,
    saturday: nextSaturday,
  }

  private readonly previousWeekdayMap: Record<string, (date: Date) => Date> = {
    sunday: previousSunday,
    monday: previousMonday,
    tuesday: previousTuesday,
    wednesday: previousWednesday,
    thursday: previousThursday,
    friday: previousFriday,
    saturday: previousSaturday,
  }

  private readonly numberWords: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
    hundred: 100,
    thousand: 1000,
    million: 1000000,
    half: 0.5,
    quarter: 0.25,
  }

  private parseReferenceDate(tokens: Token[]): Date | null {
    // Find the month token
    const monthToken = tokens.find((t) => t.type === "month")
    if (!monthToken) return null

    // Find the month index to look for day and year tokens
    const monthIndex = tokens.findIndex((t) => t.type === "month")
    const dayToken = tokens[monthIndex + 1]
    const yearToken = tokens[monthIndex + 2]

    // Validate day token
    if (!dayToken || dayToken.type !== "number") return null

    const month = this.monthMap[monthToken.value]
    const day = Number.parseFloat(dayToken.value)

    // Check for year token, if not found use current year
    const year =
      yearToken && yearToken.type === "number" ? Number.parseFloat(yearToken.value) : new Date().getFullYear()

    if (!month || isNaN(day) || isNaN(year)) return null

    return new Date(year, month - 1, day)
  }

  private getRelativeDate(input: string): Date | null {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (input.toLowerCase()) {
      case "now":
        return now // Return current date and time
      case "today":
        return today
      case "yesterday":
        return subDays(today, 1)
      case "tomorrow":
        return addDays(today, 1)
      default:
        return null
    }
  }

  private getNextWeekday(weekday: string, baseDate: Date = new Date()): Date {
    const weekdayFn = this.weekdayMap[weekday]
    if (!weekdayFn) return baseDate

    // Get the next occurrence of the weekday
    const nextDate = weekdayFn(baseDate)

    // If we're looking for "next" weekday and the next occurrence is this week,
    // we should add 7 days to get to next week's occurrence
    const today = new Date(baseDate)
    const daysDiff = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // If the next occurrence is within the current week (less than 7 days away),
    // add 7 days to get to next week's occurrence
    if (daysDiff < 7) {
      return addDays(nextDate, 7)
    }

    return nextDate
  }

  private getPreviousWeekday(weekday: string, baseDate: Date = new Date()): Date {
    const weekdayFn = this.previousWeekdayMap[weekday]
    if (!weekdayFn) return baseDate

    // Get the previous occurrence of the weekday
    let prevDate = weekdayFn(baseDate)

    // If the previous occurrence is today, we need to go back one more week
    // to get to "last" weekday
    const daysDiff = Math.ceil((baseDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff === 0) {
      prevDate = subDays(prevDate, 7)
    }

    return prevDate
  }

  private tokenize(input: string): Token[] {
    if (!input?.trim()) return []

    const processed = input
      .toLowerCase()
      // Replace word numbers with their numeric values
      .replace(
        /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|half|quarter)\b/g,
        (match) => this.numberWords[match]?.toString() || match,
      )
      // Handle fractions like "1/2" or "1/4"
      .replace(/(\d+)\/(\d+)/g, (_, numerator, denominator) => {
        return (Number.parseFloat(numerator) / Number.parseFloat(denominator)).toString()
      })
      .replace(/(\d+)(st|nd|rd|th)/g, (_, num) => num)
      .replace(/[,;]/g, " ")
      .replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g, (_, month, day, year) => `${month} ${day} ${year}`)
      .replace(/(\d{1,2})-(\d{1,2})-(\d{4})/g, "$1 $2 $3")
      .replace(/\+/g, " plus ")
      .replace(/-/g, " minus ")
      .trim()
      .replace(/\s+/g, " ")

    const tokens = processed
      .split(" ")
      .filter(Boolean)
      .map((word) => {
        // Match both integer and decimal numbers
        if (/^-?\d+(\.\d+)?$/.test(word)) {
          return { type: "number", value: word }
        }
        if (/^(days?|weeks?|months?|years?|hours?|minutes?|seconds?)$/.test(word)) {
          return { type: "unit", value: word.replace(/s$/, "") }
        }
        if (["minus", "from", "plus", "in", "and", "before", "after", "ago", "next", "last"].includes(word)) {
          return { type: "modifier", value: word }
        }
        if (["now", "today", "yesterday", "tomorrow"].includes(word)) {
          return { type: "relative", value: word }
        }
        if (Object.keys(this.weekdayMap).includes(word)) {
          return { type: "weekday", value: word }
        }
        if (this.monthMap[word]) {
          return { type: "month", value: word }
        }
        return { type: "text", value: word }
      })

    return tokens
  }

  private findBaseDate(tokens: Token[]): Date | null {
    // Check for reference date patterns (e.g., "may 1")
    const monthIndex = tokens.findIndex((t) => t.type === "month")
    if (monthIndex !== -1 && tokens[monthIndex + 1]?.type === "number") {
      return this.parseReferenceDate(tokens)
    }

    const weekdayIndex = tokens.findIndex((t) => t.type === "weekday")
    if (weekdayIndex !== -1) {
      const nextIndex = tokens.findIndex((t) => t.value === "next")
      const lastWeekdayIndex = tokens.findIndex((t) => t.value === "last")
      const weekday = tokens[weekdayIndex].value

      // Handle "last" weekday first as it's more specific
      if (lastWeekdayIndex !== -1 && lastWeekdayIndex < weekdayIndex) {
        const prevDate = this.getPreviousWeekday(weekday)
        return prevDate
      } else if (nextIndex !== -1 && nextIndex < weekdayIndex) {
        // When explicitly using "next", always get next week's occurrence
        const nextOccurrence = this.getNextWeekday(weekday)
        return nextOccurrence
      } else {
        // If no modifier, treat as upcoming occurrence (this week or next)
        const now = new Date()
        const weekdayFn = this.weekdayMap[weekday]
        if (!weekdayFn) return now
        return weekdayFn(now)
      }
    }

    // Handle other cases
    const firstToken = tokens[0]
    if (firstToken?.type === "number") {
      // If it's just a number with no unit, we should interpret it as a day of the current month
      if (tokens.length === 1) {
        const now = new Date()
        const day = Number.parseFloat(firstToken.value)

        // Validate the day number
        if (isNaN(day) || day < 1 || day > 31) return null

        // Create a date with the specified day in the current month
        const result = new Date(now.getFullYear(), now.getMonth(), day)

        // If the day is in the past this month, move to next month
        if (result < now) {
          result.setMonth(result.getMonth() + 1)
        }

        return result
      }

      // Otherwise, use current date as base for operations
      return new Date()
    }

    const lastIndex = tokens.findIndex((t) => t.value === "last")
    if (lastIndex !== -1 && tokens[lastIndex + 1]?.value === "month") {
      return new Date()
    }

    if (tokens.some((t) => t.value === "ago")) {
      return new Date()
    }

    const fromIndex = tokens.findIndex((t) => t.value === "from")
    const nowIndex = tokens.findIndex((t) => t.value === "now")
    if (fromIndex !== -1 && nowIndex !== -1 && nowIndex === fromIndex + 1) {
      return new Date()
    }

    if (tokens.some((t) => t.value === "in")) {
      return new Date()
    }

    const relativeToken = tokens.find((t) => t.type === "relative")
    if (relativeToken) {
      return this.getRelativeDate(relativeToken.value)
    }

    // Special case for standalone "now"
    if (tokens.length === 1 && tokens[0].value === "now") {
      return new Date()
    }

    return null
  }

  private preserveDateOfMonth(originalDate: Date, newDate: Date): Date {
    // Check if we should preserve the day of month based on settings
    if (!this.getPreserveDayOfMonth()) {
      return newDate
    }

    // Get the original day of month
    const originalDay = originalDate.getDate()

    // Create a new date with the same day of month
    return setDate(newDate, originalDay)
  }

  private parseTimeOperations(tokens: Token[]): TimeOperation[] {
    const operations: TimeOperation[] = []
    let currentAmount: number | null = null

    // Handle "X units before/after" patterns
    const beforeIndex = tokens.findIndex((t) => t.value === "before")
    const afterIndex = tokens.findIndex((t) => t.value === "after")

    if (beforeIndex !== -1 || afterIndex !== -1) {
      const direction = beforeIndex !== -1 ? -1 : 1
      const splitIndex = beforeIndex !== -1 ? beforeIndex : afterIndex
      const relevantTokens = tokens.slice(0, splitIndex)

      // Process all number-unit pairs before the before/after token
      for (let i = 0; i < relevantTokens.length; i++) {
        const token = relevantTokens[i]
        if (token.type === "number") {
          currentAmount = Number.parseFloat(token.value)
        } else if (token.type === "unit" && currentAmount !== null) {
          operations.push({
            amount: currentAmount,
            unit: token.value,
            direction: direction,
          })
          currentAmount = null
        }
      }

      return operations
    }

    // Handle other patterns
    const defaultDirection = tokens.some((t) => t.value === "ago") ? -1 : 1
    let currentDirection = defaultDirection

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.value === "minus") {
        currentDirection = -1
        continue
      }
      if (token.value === "plus") {
        currentDirection = 1
        continue
      }
      if (token.type === "number") {
        currentAmount = Number.parseFloat(token.value)
        continue
      }
      if (token.type === "unit" && currentAmount !== null) {
        operations.push({
          amount: currentAmount,
          unit: token.value,
          direction: currentDirection,
        })
        currentAmount = null
        currentDirection = defaultDirection
      }
    }

    return operations
  }

  private applyOperations(baseDate: Date, operations: TimeOperation[]): Date {
    let result = new Date(baseDate)
    const originalDay = baseDate.getDate()

    // Sort operations to apply years first, then months, weeks, and days
    const sortOrder = { year: 0, month: 1, week: 2, day: 3, hour: 4, minute: 5, second: 6 }
    const sortedOperations = [...operations].sort(
      (a, b) => sortOrder[a.unit as keyof typeof sortOrder] - sortOrder[b.unit as keyof typeof sortOrder],
    )

    for (const op of sortedOperations) {
      // Handle fractional values by splitting into whole and fractional parts
      const wholePart = Math.floor(op.amount)
      const fractionalPart = op.amount - wholePart

      switch (op.unit) {
        case "day": {
          // For days, apply the whole part first
          if (wholePart > 0) {
            result = op.direction === 1 ? addDays(result, wholePart) : subDays(result, wholePart)
          }

          // Then handle the fractional part as hours
          if (fractionalPart > 0) {
            const hours = Math.round(fractionalPart * HOURS_PER_DAY)
            result = op.direction === 1 ? addHours(result, hours) : subHours(result, hours)
          }
          break
        }
        case "week": {
          // For weeks, convert to days
          const totalDays = op.amount * 7
          const wholeDays = Math.floor(totalDays)
          const fractionalDay = totalDays - wholeDays

          // Apply whole days
          if (wholeDays > 0) {
            result = op.direction === 1 ? addDays(result, wholeDays) : subDays(result, wholeDays)
          }

          // Apply fractional day as hours
          if (fractionalDay > 0) {
            const hours = Math.round(fractionalDay * HOURS_PER_DAY)
            result = op.direction === 1 ? addHours(result, hours) : subHours(result, hours)
          }
          break
        }
        case "month": {
          // For months, apply the whole part first
          if (wholePart > 0) {
            // Convert whole months to years if possible
            if (wholePart >= 12) {
              const years = Math.floor(wholePart / 12)
              const remainingMonths = wholePart % 12

              // Add/subtract years
              result = op.direction === 1 ? addYears(result, years) : subYears(result, years)

              // Add/subtract remaining months
              if (remainingMonths > 0) {
                const monthResult =
                  op.direction === 1 ? addMonths(result, remainingMonths) : subMonths(result, remainingMonths)
                result = this.preserveDateOfMonth(baseDate, monthResult)
              }
            } else {
              // For smaller number of months
              const monthResult = op.direction === 1 ? addMonths(result, wholePart) : subMonths(result, wholePart)
              result = this.preserveDateOfMonth(baseDate, monthResult)
            }
          }

          // Handle fractional part of months as days
          if (fractionalPart > 0) {
            const days = Math.round(fractionalPart * DAYS_PER_MONTH)
            result = op.direction === 1 ? addDays(result, days) : subDays(result, days)
          }
          break
        }
        case "year": {
          // For years, apply the whole part first
          if (wholePart > 0) {
            result = op.direction === 1 ? addYears(result, wholePart) : subYears(result, wholePart)
            // Preserve day of month for whole years
            result = this.preserveDateOfMonth(baseDate, result)
          }

          // Handle fractional part of years as months and days
          if (fractionalPart > 0) {
            // Convert fractional years to months
            const months = Math.floor(fractionalPart * 12)
            const remainingFraction = fractionalPart - months / 12

            // Apply months
            if (months > 0) {
              const monthResult = op.direction === 1 ? addMonths(result, months) : subMonths(result, months)
              result = this.preserveDateOfMonth(baseDate, monthResult)
            }

            // Apply remaining fraction as days
            if (remainingFraction > 0) {
              const days = Math.round(remainingFraction * DAYS_PER_YEAR)
              result = op.direction === 1 ? addDays(result, days) : subDays(result, days)
            }
          }
          break
        }
        case "hour": {
          // For hours, apply the whole part first
          if (wholePart > 0) {
            result = op.direction === 1 ? addHours(result, wholePart) : subHours(result, wholePart)
          }

          // Then handle the fractional part as minutes
          if (fractionalPart > 0) {
            const minutes = Math.round(fractionalPart * MINUTES_PER_HOUR)
            result = op.direction === 1 ? addMinutes(result, minutes) : subMinutes(result, minutes)
          }
          break
        }
        case "minute": {
          // For minutes, apply the whole part first
          if (wholePart > 0) {
            result = op.direction === 1 ? addMinutes(result, wholePart) : subMinutes(result, wholePart)
          }

          // Then handle the fractional part as seconds
          if (fractionalPart > 0) {
            const seconds = Math.round(fractionalPart * SECONDS_PER_MINUTE)
            result = op.direction === 1 ? addSeconds(result, seconds) : subSeconds(result, seconds)
          }
          break
        }
        case "second": {
          // For seconds, apply the whole part first
          if (wholePart > 0) {
            result = op.direction === 1 ? addSeconds(result, wholePart) : subSeconds(result, wholePart)
          }

          // Then handle the fractional part as milliseconds
          if (fractionalPart > 0) {
            const milliseconds = Math.round(fractionalPart * 1000)
            result = op.direction === 1 ? addMilliseconds(result, milliseconds) : subMilliseconds(result, milliseconds)
          }
          break
        }
      }
    }

    return result
  }

  parse = (input: string): Date | null => {
    try {
      if (!input?.trim()) return null

      const tokens = this.tokenize(input)
      if (!tokens.length) return null

      const baseDate = this.findBaseDate(tokens)
      if (!baseDate) {
        return null
      }

      const operations = this.parseTimeOperations(tokens)
      const result = this.applyOperations(baseDate, operations)

      return result
    } catch (error) {
      console.error("Error parsing date expression:", error)
      return null
    }
  }

  // Expose internal methods for debugging
  debug = (input: string) => {
    try {
      if (!input?.trim()) return { tokens: [], baseDate: null, operations: [], result: null }

      const tokens = this.tokenize(input)
      if (!tokens.length) return { tokens, baseDate: null, operations: [], result: null }

      const baseDate = this.findBaseDate(tokens)
      if (!baseDate) return { tokens, baseDate: null, operations: [], result: null }

      const operations = this.parseTimeOperations(tokens)
      const result = this.applyOperations(baseDate, operations)

      return {
        tokens,
        baseDate,
        operations,
        result,
      }
    } catch (error) {
      console.error("Error in debug:", error)
      return { error: error.message }
    }
  }
}

const parser = new DateExpressionParser()

// Update the parseNaturalLanguageDate function to accept options
export const parseNaturalLanguageDate = (expression: string, options?: { preserveDayOfMonth?: boolean }) => {
  // Override the preserveDayOfMonth setting if provided in options
  if (options?.preserveDayOfMonth !== undefined) {
    // Temporarily override the setting for this parse operation
    const originalSetting = getPreserveDayOfMonthSetting()

    // Create a custom parser instance with the provided setting
    const customParser = new DateExpressionParser()
    customParser.setPreserveDayOfMonth(options.preserveDayOfMonth)

    // Parse with custom settings
    return customParser.parse(expression)
  }

  // Use default parser with settings from localStorage
  return parser.parse(expression)
}

export const debugDateParser = parser.debug.bind(parser)
