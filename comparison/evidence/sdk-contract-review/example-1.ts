import { parse, parseMany, createParser } from "@tempus-date/core";
import type { ParseOptions, ParseResult } from "@tempus-date/core";

const context: ParseOptions = {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
};
const result: ParseResult = parse("Call Sam tomorrow at noon", context);
const batch = parseMany(["in 3 weeks", "every Monday at noon"], context);
const parser = createParser(context);
const next = parser.parse("Friday 10pm-12am");
