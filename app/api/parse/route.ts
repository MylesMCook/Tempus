/**
 * Date Parser API
 *
 * This API parses natural language date expressions into JavaScript Date objects.
 * All dates are returned in UTC timezone by default for consistency.
 * Timezone support can be specified via the optional 'timezone' parameter.
 */
import { type NextRequest, NextResponse } from "next/server"
import { parseNaturalLanguageDate } from "../../lib/date-parser"
import { headers } from "next/headers"
import rateLimit from "../../lib/rate-limit"
import { z } from "zod"
import { metrics } from "@/lib/monitoring"
import { trackAPIUsage, trackError } from "@/lib/analytics"

// Update the querySchema to properly handle timezone
const querySchema = z.object({
  expression: z
    .string()
    .min(1)
    .max(200)
    .transform((str) => str.trim()),
  format: z.string().optional(),
  preserveDayOfMonth: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  timezone: z.string().optional().default("UTC"),
})

// Response schema for better type safety
type ApiResponse = {
  expression: string
  date: string
  timestamp: number
  formatted?: string
  meta?: {
    type: "relative" | "weekday" | "date-math" | "advanced"
    components?: string[]
    timezone?: string
  }
  settings?: {
    format?: string
    preserveDayOfMonth?: boolean
    timezone?: string
  }
}

// Create rate limiter instance with more permissive limits
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 1000, // Increased from 500
})

export async function GET(request: NextRequest) {
  const startTime = performance.now()
  let success = false
  let statusCode = 200
  const searchParams = new URL(request.url).searchParams
  const expression = searchParams.get("expression")
  const format = searchParams.get("format") || undefined
  const preserveDayOfMonth = searchParams.get("preserveDayOfMonth") || undefined
  const timezone = searchParams.get("timezone") || undefined

  try {
    // Get IP for rate limiting
    const ip = headers().get("x-forwarded-for") ?? "anonymous"

    // Apply rate limiting - increased to 120 requests per minute per IP
    try {
      await limiter.check(120, ip)
    } catch {
      statusCode = 429
      return NextResponse.json(
        {
          error: "Too many requests",
          details: "Please try again in a minute",
        },
        {
          status: statusCode,
          headers: {
            "Retry-After": "60",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        },
      )
    }

    // Validate the input
    const result = querySchema.safeParse({
      expression,
      format,
      preserveDayOfMonth,
      timezone,
    })

    if (!result.success) {
      statusCode = 400
      return NextResponse.json(
        {
          error: "Invalid input",
          details: result.error.issues,
        },
        {
          status: statusCode,
          headers: {
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        },
      )
    }

    // Parse the date expression with settings
    const parserOptions = {
      preserveDayOfMonth: result.data.preserveDayOfMonth,
    }

    // Add this after the date is parsed
    // Handle timezone conversion if specified
    const parsedDate = parseNaturalLanguageDate(result.data.expression, parserOptions)
    if (!parsedDate) {
      statusCode = 400
      return NextResponse.json(
        { error: "Could not parse date expression" },
        {
          status: statusCode,
          headers: {
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        },
      )
    }

    // Always include timezone information in the response
    const timezoneValue = result.data.timezone || "UTC"
    const response: ApiResponse = {
      expression: result.data.expression,
      date: parsedDate.toISOString(), // Always ISO format (implicitly UTC)
      timestamp: parsedDate.getTime(),
      meta: {
        type: determineExpressionType(result.data.expression),
        components: extractComponents(result.data.expression),
        timezone: timezoneValue,
      },
    }

    // Format the date if a format was provided
    let formattedDate: string | undefined = undefined
    if (result.data.format) {
      try {
        const { format } = await import("date-fns")
        formattedDate = format(parsedDate, result.data.format)
      } catch (error) {
        console.error("Error formatting date:", error)
      }
    }

    // Add formatted date if available
    if (formattedDate) {
      response.formatted = formattedDate
    }

    // Update the settings section to include timezone
    const settings: Record<string, any> = {}
    if (result.data.format !== undefined) settings.format = result.data.format
    if (result.data.preserveDayOfMonth !== undefined) settings.preserveDayOfMonth = result.data.preserveDayOfMonth
    if (result.data.timezone !== undefined) settings.timezone = result.data.timezone

    if (Object.keys(settings).length > 0) {
      response.settings = settings
    }

    success = true

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    statusCode = 500
    success = false

    // Track the error
    if (error instanceof Error) {
      trackError(error, { path: "/api/parse" })
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        requestId: crypto.randomUUID(),
      },
      {
        status: statusCode,
        headers: {
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    )
  } finally {
    // Record metrics
    const duration = performance.now() - startTime
    metrics.addMetric({
      timestamp: Date.now(),
      duration,
      success,
      expression: expression ?? "",
      statusCode,
    })

    // Track API usage
    trackAPIUsage(expression ?? "", success, duration)
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  )
}

function determineExpressionType(expression: string): ApiResponse["meta"]["type"] {
  const expr = expression.toLowerCase()

  if (expr.includes("before") || expr.includes("after") || expr.includes("plus") || expr.includes("minus")) {
    return "date-math"
  }

  if (expr.includes("from now") || expr.includes("ago")) {
    return "relative"
  }

  if (expr.includes("next") || expr.includes("last")) {
    return "weekday"
  }

  return "advanced"
}

function extractComponents(expression: string): string[] {
  const components: string[] = []
  const expr = expression.toLowerCase()

  // Extract time units
  const units = ["day", "week", "month", "year"]
  units.forEach((unit) => {
    if (expr.includes(unit) || expr.includes(unit + "s")) {
      components.push(unit)
    }
  })

  // Extract weekdays
  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  weekdays.forEach((day) => {
    if (expr.includes(day)) {
      components.push(day)
    }
  })

  // Extract operators
  const operators = ["before", "after", "plus", "minus", "from now", "ago"]
  operators.forEach((op) => {
    if (expr.includes(op)) {
      components.push(op)
    }
  })

  return components
}
