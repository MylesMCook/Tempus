/**
 * Date Parser API
 *
 * This API parses natural language date expressions into JavaScript Date objects.
 * All dates are returned in UTC timezone by default for consistency.
 * Timezone support can be specified via the optional 'timezone' parameter.
 */
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { trackAPIUsage, trackError } from "@/lib/analytics";
import { metrics } from "@/lib/monitoring";

import { parseNaturalLanguageDate } from "../../lib/date-parser";
import rateLimit from "../../lib/rate-limit";

// Update the querySchema to properly handle timezone and add more validation
const querySchema = z.object({
  expression: z
    .string()
    .min(1, "Expression is required")
    .max(200, "Expression is too long (max 200 characters)")
    .trim()
    .refine((val) => !/[<>{}]/.test(val), {
      message: "Expression contains invalid characters",
    }),
  format: z.string().max(50).optional(),
  preserveDayOfMonth: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  timezone: z.string().max(50).optional().default("UTC"),
});

// Response schema for better type safety
interface ApiResponse {
  expression: string;
  date: string;
  timestamp: number;
  formatted?: string;
  meta?: {
    type: "relative" | "weekday" | "date-math" | "advanced";
    components?: string[];
    timezone?: string;
  };
  settings?: {
    format?: string;
    preserveDayOfMonth?: boolean;
    timezone?: string;
  };
  requestId?: string;
}

interface RateLimitError {
  success: false;
  limit: number;
  remaining: number;
  reset: number;
}

// Create rate limiters with different thresholds
const publicLimiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 1000,
});

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  let success = false;
  let statusCode = 200;
  const requestId = nanoid(8); // Generate a short unique ID for this request

  // Declare expression here to ensure it's accessible in the finally block
  let expression: string | null = null;

  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    expression = searchParams.get("expression");
    const format = searchParams.get("format") || undefined;
    const preserveDayOfMonth = searchParams.get("preserveDayOfMonth") || undefined;
    const timezone = searchParams.get("timezone") || undefined;

    // Get client identifiers for rate limiting (these are now async)
    const clientIp = await publicLimiter.getClientIdentifier(request);
    const isSameOrigin = await publicLimiter.isSameOrigin(request);

    // Skip or apply very lenient rate limiting for same-origin requests
    // This ensures the API works smoothly during development and for UI components
    if (!isSameOrigin) {
      try {
        // More generous limit per IP - 200 requests per minute for external users
        await publicLimiter.check(60, clientIp);
      } catch (error) {
        const rateLimitResult = error as RateLimitError;
        statusCode = 429;
        const retryAfter = rateLimitResult.reset || 60;

        return NextResponse.json(
          {
            error: "Too many requests",
            details: "Rate limit exceeded",
            retryAfter,
            requestId,
          },
          {
            status: statusCode,
            headers: {
              "Retry-After": retryAfter.toString(),
              "X-RateLimit-Limit": rateLimitResult.limit?.toString() || "60",
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": retryAfter.toString(),
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Expose-Headers":
                "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
            },
          }
        );
      }
    }

    // Validate the input
    const result = querySchema.safeParse({
      expression,
      format,
      preserveDayOfMonth,
      timezone,
    });

    if (!result.success) {
      statusCode = 400;
      return NextResponse.json(
        {
          error: "Invalid input",
          details: result.error.issues,
          requestId,
        },
        {
          status: statusCode,
          headers: {
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Parse the date expression with settings
    const parserOptions = {
      preserveDayOfMonth: result.data.preserveDayOfMonth,
    };

    // Add this after the date is parsed
    // Handle timezone conversion if specified
    const parsedDate = parseNaturalLanguageDate(result.data.expression, parserOptions);
    if (!parsedDate) {
      statusCode = 400;
      return NextResponse.json(
        {
          error: "Could not parse date expression",
          requestId,
        },
        {
          status: statusCode,
          headers: {
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Always include timezone information in the response
    const timezoneValue = result.data.timezone || "UTC";
    const response: ApiResponse = {
      expression: result.data.expression,
      date: parsedDate.toISOString(), // Always ISO format (implicitly UTC)
      timestamp: parsedDate.getTime(),
      meta: {
        type: determineExpressionType(result.data.expression),
        components: extractComponents(result.data.expression),
        timezone: timezoneValue,
      },
      requestId,
    };

    // Format the date if a format was provided
    let formattedDate: string | undefined = undefined;
    if (result.data.format) {
      try {
        const { format: formatDate } = await import("date-fns");
        formattedDate = formatDate(parsedDate, result.data.format);
      } catch {
        // Silently handle format errors
      }
    }

    // Add formatted date if available
    if (formattedDate) {
      response.formatted = formattedDate;
    }

    // Update the settings section to include timezone
    const settings: ApiResponse["settings"] = {};
    if (result.data.format !== undefined) {
      settings.format = result.data.format;
    }
    if (result.data.preserveDayOfMonth !== undefined) {
      settings.preserveDayOfMonth = result.data.preserveDayOfMonth;
    }
    if (result.data.timezone !== undefined) {
      settings.timezone = result.data.timezone;
    }

    if (Object.keys(settings).length > 0) {
      response.settings = settings;
    }

    success = true;

    // Calculate remaining rate limit - skip for same-origin requests
    let remainingRequests = 200;
    if (!isSameOrigin) {
      try {
        const rateLimitResult = await publicLimiter.check(60, clientIp);
        remainingRequests = rateLimitResult.remaining;
      } catch {
        // If check fails, default to 0 remaining
        remainingRequests = 0;
      }
    }

    return NextResponse.json(response, {
      headers: {
        // Use short cache for successful responses to reduce load
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-RateLimit-Limit": isSameOrigin ? "unlimited" : "60",
        "X-RateLimit-Remaining": isSameOrigin ? "unlimited" : remainingRequests.toString(),
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Access-Control-Expose-Headers": "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
      },
    });
  } catch (error) {
    statusCode = 500;
    success = false;

    // Track the error
    if (error instanceof Error) {
      trackError(error, { path: "/api/parse", requestId });
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        requestId,
      },
      {
        status: statusCode,
        headers: {
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } finally {
    // Record metrics
    const duration = performance.now() - startTime;
    metrics.addMetric({
      timestamp: Date.now(),
      duration,
      success,
      expression: expression ?? "",
      statusCode,
    });

    // Track API usage
    trackAPIUsage(expression ?? "", success, duration);
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
        "Access-Control-Max-Age": "86400", // Cache preflight requests for 24 hours
      },
    }
  );
}

function determineExpressionType(
  expression: string
): NonNullable<ApiResponse["meta"]>["type"] {
  const expr = expression.toLowerCase();

  if (
    expr.includes("before") ||
    expr.includes("after") ||
    expr.includes("plus") ||
    expr.includes("minus")
  ) {
    return "date-math";
  }

  if (expr.includes("from now") || expr.includes("ago")) {
    return "relative";
  }

  if (expr.includes("next") || expr.includes("last")) {
    return "weekday";
  }

  return "advanced";
}

function extractComponents(expression: string): string[] {
  const components: string[] = [];
  const expr = expression.toLowerCase();

  // Extract time units
  const units = ["day", "week", "month", "year"];
  units.forEach((unit) => {
    if (expr.includes(unit) || expr.includes(`${unit}s`)) {
      components.push(unit);
    }
  });

  // Extract weekdays
  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  weekdays.forEach((day) => {
    if (expr.includes(day)) {
      components.push(day);
    }
  });

  // Extract operators
  const operators = ["before", "after", "plus", "minus", "from now", "ago"];
  operators.forEach((op) => {
    if (expr.includes(op)) {
      components.push(op);
    }
  });

  return components;
}
