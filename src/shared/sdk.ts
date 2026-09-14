import { interpretDate, type Interpretation } from "./interpret-date.js";
import {
  MAX_SELECTION_HISTORY,
  appendSelection,
  isClarificationSelection,
  type ClarificationSelection,
} from "./clarify-numeric-date.js";
export { calculateDate } from "./date-parser.js";
export { appendSelection };
export type { ClarificationSelection };
export type { Interpretation };

export const SDK_VERSION = "0.1.0";
export const limits = Object.freeze({
  inputCharacters: 200,
  clarificationHistory: MAX_SELECTION_HISTORY,
  batchSize: 100,
  weeklyPreview: 3,
  weeklyInterval: 52,
  groupedIntervals: 14,
  excludedDates: 10,
});
export type ParseOptions = {
  timezone: string;
  reference: string;
  selection?: ClarificationSelection;
};
export type ParseResult = Interpretation & {
  sdkVersion: typeof SDK_VERSION;
  input: string;
  context: { timezone: string; reference: string };
};

function optionsSnapshot(options: ParseOptions): ParseOptions {
  if (!options || typeof options.timezone !== "string" || typeof options.reference !== "string")
    throw new TypeError("Provide a timezone and reference as strings.");
  const selection = options.selection;
  if (selection !== undefined && !isClarificationSelection(selection))
    throw new TypeError("Invalid clarification selection.");
  return {
    timezone: options.timezone,
    reference: options.reference,
    ...(selection
      ? {
          selection: {
            contextKey: selection.contextKey,
            id: selection.id,
            ...(selection.previous ? { previous: [...selection.previous] } : {}),
          },
        }
      : {}),
  };
}

/** Internal callers have already validated the input and captured their context. */
function parseWithContext(input: string, context: ParseOptions): ParseResult {
  return {
    ...interpretDate(input, context),
    sdkVersion: SDK_VERSION,
    input,
    context: { timezone: context.timezone, reference: context.reference },
  };
}

/** Local and deterministic. Invalid phrases return unresolved results; invalid argument types throw. */
export function parse(input: string, options: ParseOptions): ParseResult {
  if (typeof input !== "string") throw new TypeError("Input must be a string.");
  return parseWithContext(input, optionsSnapshot(options));
}

function validateBatch(inputs: readonly string[]): void {
  if (!Array.isArray(inputs)) throw new TypeError("Batch input must be an array of strings.");
  if (inputs.length > limits.batchSize) throw new RangeError("Use at most 100 inputs per batch.");
  if (Array.from(inputs).some((input) => typeof input !== "string"))
    throw new TypeError("Batch input must be an array of strings.");
}

/** Same context for every item; input order and unresolved item results are preserved. */
export function parseMany(inputs: readonly string[], options: ParseOptions): ParseResult[] {
  validateBatch(inputs);
  const context = optionsSnapshot(options);
  return inputs.map((input) => parseWithContext(input, context));
}

/** Capture a reproducible context. No model initialization, disposal, clock reads or network. */
export function createParser(options: ParseOptions) {
  const context = optionsSnapshot(options);
  return {
    parse: (input: string) => {
      if (typeof input !== "string") throw new TypeError("Input must be a string.");
      return parseWithContext(input, context);
    },
    parseMany: (inputs: readonly string[]) => {
      validateBatch(inputs);
      return inputs.map((input) => parseWithContext(input, context));
    },
  };
}
