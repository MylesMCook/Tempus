import { formatInTimeZone } from "date-fns-tz";
import { z } from "zod";
import { parseNaturalLanguageDate } from "@/shared/date-parser";

const querySchema = z.object({
  expression: z
    .string()
    .trim()
    .min(1, "Expression is required")
    .max(200, "Expression is too long (max 200 characters)")
    .refine((value) => !/[<>{}]/.test(value), {
      message: "Expression contains invalid characters",
    }),
  format: z.string().max(50).optional(),
  preserveDayOfMonth: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  timezone: z
    .string()
    .max(50)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Invalid timezone")
    .optional()
    .default("UTC"),
});

export type ParseExpressionType = "relative" | "weekday" | "date-math" | "advanced";

export type ParseApiSuccessResponse = {
  expression: string;
  date: string;
  timestamp: number;
  formatted?: string;
  meta?: {
    type: ParseExpressionType;
    components?: string[];
    timezone?: string;
  };
  settings?: {
    format?: string;
    preserveDayOfMonth?: boolean;
    timezone?: string;
  };
  requestId?: string;
};

export type ParseApiErrorResponse = {
  error: string;
  details?: unknown;
  requestId?: string;
};

export function parseExpressionType(expression: string): ParseExpressionType {
  const normalized = expression.toLowerCase();
  if (/\b(before|after|plus|minus)\b|[+-]/.test(normalized)) return "date-math";
  if (/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(normalized))
    return "weekday";
  if (/\b(now|today|tomorrow|yesterday|in|ago|from)\b/.test(normalized)) return "relative";
  return "advanced";
}

export function extractComponents(expression: string): string[] {
  const components: string[] = [];
  const normalized = expression.toLowerCase();

  for (const unit of ["day", "week", "month", "year", "hour", "minute", "second"]) {
    if (new RegExp(`\\b${unit}s?\\b`).test(normalized)) {
      components.push(unit);
    }
  }

  for (const day of [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]) {
    if (normalized.includes(day)) {
      components.push(day);
    }
  }

  for (const operator of ["before", "after", "plus", "minus", "from now", "ago"]) {
    if (normalized.includes(operator)) {
      components.push(operator);
    }
  }

  return components;
}

export function generateRequestId() {
  return crypto.randomUUID().slice(0, 8);
}

export function buildParseResponse(
  query: Record<string, string | undefined>,
  requestId = generateRequestId(),
) {
  const parsedQuery = querySchema.safeParse(query);
  if (!parsedQuery.success) {
    return {
      ok: false as const,
      status: 400,
      body: {
        error: "Invalid input",
        details: parsedQuery.error.issues,
        requestId,
      } satisfies ParseApiErrorResponse,
    };
  }

  const parserOptions = {
    preserveDayOfMonth: parsedQuery.data.preserveDayOfMonth,
  };

  const parsedDate = parseNaturalLanguageDate(parsedQuery.data.expression, parserOptions);
  if (!parsedDate) {
    return {
      ok: false as const,
      status: 400,
      body: {
        error: "Could not parse date expression",
        requestId,
      } satisfies ParseApiErrorResponse,
    };
  }

  const response: ParseApiSuccessResponse = {
    expression: parsedQuery.data.expression,
    date: parsedDate.toISOString(),
    timestamp: parsedDate.getTime(),
    meta: {
      type: parseExpressionType(parsedQuery.data.expression),
      components: extractComponents(parsedQuery.data.expression),
      timezone: parsedQuery.data.timezone || "UTC",
    },
    requestId,
  };

  if (parsedQuery.data.format) {
    try {
      response.formatted = formatInTimeZone(
        parsedDate,
        parsedQuery.data.timezone,
        parsedQuery.data.format,
      );
    } catch {
      return {
        ok: false as const,
        status: 400,
        body: { error: "Invalid date format", requestId } satisfies ParseApiErrorResponse,
      };
    }
  }

  const settings: ParseApiSuccessResponse["settings"] = {};
  if (parsedQuery.data.format !== undefined) settings.format = parsedQuery.data.format;
  if (parsedQuery.data.preserveDayOfMonth !== undefined) {
    settings.preserveDayOfMonth = parsedQuery.data.preserveDayOfMonth;
  }
  if (parsedQuery.data.timezone !== undefined) settings.timezone = parsedQuery.data.timezone;

  if (Object.keys(settings).length > 0) {
    response.settings = settings;
  }

  return {
    ok: true as const,
    status: 200,
    body: response,
  };
}
