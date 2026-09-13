/** Optional calendar file preparation. No I/O, clock reads or calendar writes.
 * Hosts must retain the current interpretation/reference, clear export decisions
 * after edits, and obtain an explicit action before downloading or writing.
 */
export {
  prepareCalendarFile,
  type CalendarFile,
  type CalendarFileFailureCode,
} from "./calendar-file.js";
export { resolveRecurringExport, prepareRecurringCalendarFile } from "./recurring-calendar-file.js";
export { retainOccurrenceDecisions } from "./clarify-numeric-date.js";
