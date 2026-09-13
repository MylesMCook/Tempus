import { Temporal } from "@js-temporal/polyfill";
import { timezoneDatabase } from "./timezone-database.js";

export class AmbiguousLocalTime extends RangeError {}
export type Disambiguation = "reject" | "earlier" | "later" | "compatible";

function civilMilliseconds(local: Temporal.PlainDateTime): number {
  return Temporal.Instant.from(`${local.toString()}Z`).epochMilliseconds;
}

function offsetText(seconds: number): string {
  const absolute = Math.abs(seconds);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${seconds < 0 ? "-" : "+"}${pad(Math.floor(absolute / 3600))}:${pad(Math.floor((absolute % 3600) / 60))}${absolute % 60 ? `:${pad(absolute % 60)}` : ""}`;
}

/** An instant and its pinned IANA zone. Calendar operations remain explicit at call sites. */
export class ZonedDate {
  #plainDateTime: Temporal.PlainDateTime | undefined;
  readonly timeZoneId: string;
  readonly instant: Temporal.Instant;
  readonly offsetSeconds: number;
  constructor(instant: Temporal.Instant, timezone: string) {
    if (instant.epochNanoseconds % 1_000_000n !== 0n)
      throw new RangeError("Zoned dates require millisecond precision.");
    this.instant = instant;
    this.timeZoneId = timezone;
    this.offsetSeconds = timezoneDatabase(timezone).offsetAt(instant.epochMilliseconds / 1000);
  }
  get epochMilliseconds() {
    return this.instant.epochMilliseconds;
  }
  get epochNanoseconds() {
    return this.instant.epochNanoseconds;
  }
  get offset() {
    return offsetText(this.offsetSeconds);
  }
  get year() {
    return this.toPlainDateTime().year;
  }
  get day() {
    return this.toPlainDateTime().day;
  }
  get dayOfWeek() {
    return this.toPlainDateTime().dayOfWeek;
  }
  toInstant() {
    return this.instant;
  }
  toPlainDateTime(): Temporal.PlainDateTime {
    if (!this.#plainDateTime) {
      const civil = new Date(this.epochMilliseconds + this.offsetSeconds * 1000).toISOString();
      this.#plainDateTime = Temporal.PlainDateTime.from(civil.slice(0, -1));
    }
    return this.#plainDateTime;
  }
  toPlainDate() {
    return this.toPlainDateTime().toPlainDate();
  }
  addElapsed(change: {
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  }) {
    return new ZonedDate(this.instant.add(change), this.timeZoneId);
  }
}

export function zonedInstant(instant: Temporal.Instant | string, timezone: string): ZonedDate {
  return new ZonedDate(
    typeof instant === "string" ? Temporal.Instant.from(instant) : instant,
    timezone,
  );
}

function gapTransition(local: Temporal.PlainDateTime, timezone: string) {
  const milliseconds = civilMilliseconds(local);
  const database = timezoneDatabase(timezone);
  // IANA offsets and forward jumps fit inside this two-day search on either side.
  // The actual transition interval, not an offset sample, must contain the requested clock.
  for (const instant of database.transitionInstants(
    milliseconds / 1000 - 172800,
    milliseconds / 1000 + 172800,
  )) {
    const before = database.offsetAt(instant - 1);
    const after = database.offsetAt(instant);
    if (
      after > before &&
      milliseconds >= (instant + before) * 1000 &&
      milliseconds < (instant + after) * 1000
    )
      return { instant, before, after };
  }
  throw new RangeError("No recorded transition explains this unavailable clock.");
}

export function zonedLocal(
  local: Temporal.PlainDateTime,
  timezone: string,
  disambiguation: Disambiguation = "reject",
): ZonedDate {
  const milliseconds = civilMilliseconds(local);
  const candidates = timezoneDatabase(timezone).possibleInstants(milliseconds);
  if (candidates.length === 1) return zonedInstant(candidates[0], timezone);
  if (disambiguation === "reject")
    throw new AmbiguousLocalTime("That local time is skipped or occurs twice in this timezone.");
  if (candidates.length)
    return zonedInstant(disambiguation === "later" ? candidates.at(-1)! : candidates[0], timezone);
  const transition = gapTransition(local, timezone);
  const offset = disambiguation === "earlier" ? transition.after : transition.before;
  return zonedInstant(
    Temporal.Instant.fromEpochMilliseconds(milliseconds - offset * 1000),
    timezone,
  );
}

/** First real instant belonging to the requested day; callers reject an entirely skipped date. */
export function startOfZonedDay(date: Temporal.PlainDate, timezone: string): ZonedDate {
  const midnight = date.toPlainDateTime();
  const candidates = timezoneDatabase(timezone).possibleInstants(civilMilliseconds(midnight));
  if (candidates.length) return zonedInstant(candidates[0], timezone);
  const transition = gapTransition(midnight, timezone);
  return zonedInstant(Temporal.Instant.fromEpochMilliseconds(transition.instant * 1000), timezone);
}
