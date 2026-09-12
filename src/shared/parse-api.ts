import { formatInTimeZone } from "date-fns-tz";
import { z } from "zod";
import { calculateDate } from "./date-parser";

const querySchema = z
  .object({
    expression: z.string().min(1).max(200),
    timezone: z.string().min(1).max(64).default("UTC"),
    reference: z.string().min(1).max(64).optional(),
    format: z
      .string()
      .min(1)
      .max(50)
      .refine((value) => Boolean(value.trim()), "Format cannot be blank")
      .optional(),
    preserveDayOfMonth: z
      .never({
        invalid_type_error:
          "preserveDayOfMonth was retired in engine v2. Month changes clamp at each step; remove this parameter.",
      })
      .optional(),
  })
  .strict();

export function buildParseResponse(
  query: Record<string, string | undefined>,
  requestId = crypto.randomUUID().slice(0, 8),
) {
  const parsed = querySchema.safeParse(query);
  if (!parsed.success)
    return {
      status: 400,
      body: { engineVersion: 2, error: "Invalid request", details: parsed.error.issues, requestId },
    };
  const { expression, timezone, reference = new Date().toISOString(), format } = parsed.data;
  const calculation = calculateDate(expression, { timezone, reference });
  if (!calculation.ok)
    return {
      status: 400,
      body: { engineVersion: 2, error: calculation.error.message, ...calculation.error, requestId },
    };
  let formatted: string | undefined;
  if (format) {
    try {
      formatted = formatInTimeZone(new Date(calculation.result.timestamp), timezone, format);
    } catch {
      return {
        status: 400,
        body: {
          engineVersion: 2,
          error: "Invalid date format",
          hint: "Use yyyy-MM-dd or another supported date-fns format.",
          requestId,
        },
      };
    }
  }
  return {
    status: 200,
    body: {
      ...calculation,
      date: calculation.result.iso,
      timestamp: calculation.result.timestamp,
      ...(formatted === undefined ? {} : { formatted }),
      requestId,
    },
  };
}
