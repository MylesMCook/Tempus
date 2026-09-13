// Reads pinned non-leap-second TZif v2+ data. No host timezone or network access.
export class TimezoneDataUnavailable extends Error {}
const decode = (bytes: Uint8Array): string => {
  if (bytes.some((byte) => byte > 127)) throw new Error("Non-ASCII TZif text");
  return String.fromCharCode(...bytes);
};
function civil(year: number, month = 1, day = 1) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getTime() / 1000;
}
function clock(text: string) {
  const match = /^([+-]?)(\d{1,3})(?::([0-5]\d))?(?::([0-5]\d))?$/.exec(text);
  if (!match || Number(match[2]) > 167) throw new Error("Unsupported TZ clock: " + text);
  return (
    (match[1] === "-" ? -1 : 1) * (+match[2] * 3600 + +(match[3] || 0) * 60 + +(match[4] || 0))
  );
}
function rule(text: string) {
  const [date, time = "2", extra] = text.split("/");
  if (extra !== undefined) throw new Error("Invalid transition rule");
  const seconds = clock(time);
  const month = /^M(\d{1,2})\.([1-5])\.([0-6])$/.exec(date);
  if (month) {
    const m = +month[1],
      week = +month[2],
      weekday = +month[3];
    if (m < 1 || m > 12) throw new Error("Invalid rule month");
    return (year: number) => {
      const first = new Date(civil(year, m) * 1000).getUTCDay();
      let day = 1 + ((weekday - first + 7) % 7) + (week - 1) * 7;
      if (day > new Date(civil(year, m + 1, 0) * 1000).getUTCDate()) day -= 7;
      return civil(year, m, day) + seconds;
    };
  }
  const julian = /^(J?)(\d{1,3})$/.exec(date);
  if (!julian) throw new Error("Unsupported transition rule: " + text);
  const n = +julian[2],
    ignoresLeap = julian[1] === "J";
  if (n < (ignoresLeap ? 1 : 0) || n > 365) throw new Error("Invalid Julian rule");
  return (year: number) => {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return (
      civil(year) +
      (n - (ignoresLeap ? 1 : 0) + (ignoresLeap && leap && n >= 60 ? 1 : 0)) * 86400 +
      seconds
    );
  };
}
function footer(text: string) {
  if (!text) return null;
  const name = "(?:<[A-Za-z0-9+-]{3,}>|[A-Za-z]{3,})";
  const offset = "([+-]?\\d{1,3}(?::[0-5]\\d){0,2})";
  const match = new RegExp(
    "^" + name + offset + "(?:" + name + offset + "?,([^,]+),([^,]+))?$",
  ).exec(text);
  if (!match) throw new Error("Unsupported TZ footer: " + text);
  const standard = -clock(match[1]);
  if (!match[3])
    return {
      offsets: [standard],
      at: () => standard,
      events: (_year: number): [number, number][] => [],
      observances: [],
      isDaylight: (_seconds: number) => false,
    };
  const daylight = match[2] === undefined ? standard + 3600 : -clock(match[2]);
  const start = rule(match[3]),
    end = rule(match[4]);
  const eventsForYear = (year: number): [number, number][] => [
    [start(year) - standard, daylight],
    [end(year) - daylight, standard],
  ];
  // Offset lookups commonly share a UTC year. Retain only that year's
  // sorted neighboring transitions; never grow a cache with the query range.
  let cachedYear: number | undefined;
  let cachedEvents: [number, number][] = [];
  return {
    offsets: [standard, daylight],
    observances: [
      {
        rule: match[3],
        daylight: true,
        offsetFrom: standard,
        offsetTo: daylight,
        onset: (year: number) => start(year) - standard,
      },
      {
        rule: match[4],
        daylight: false,
        offsetFrom: daylight,
        offsetTo: standard,
        onset: (year: number) => end(year) - daylight,
      },
    ],
    events: eventsForYear,
    isDaylight(seconds: number) {
      return this.at(seconds) === daylight;
    },
    at(seconds: number) {
      const year = new Date(seconds * 1000).getUTCFullYear();
      if (cachedYear !== year) {
        const events: [number, number][] = [];
        for (let y = year - 1; y <= year + 1; y++) events.push(...eventsForYear(y));
        events.sort((a, b) => a[0] - b[0]);
        cachedEvents = events;
        cachedYear = year;
      }
      let result;
      for (const [instant, offset] of cachedEvents) if (instant <= seconds) result = offset;
      if (result === undefined) throw new Error("Missing future-rule state");
      return result;
    },
  };
}
export function readZone(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const header = (at: number, width: number) => {
    if (at + 44 > bytes.length || decode(bytes.subarray(at, at + 4)) !== "TZif")
      throw new Error("Invalid TZif header");
    if (![50, 51, 52].includes(bytes[at + 4])) throw new Error("TZif v2+ required");
    const counts = Array.from({ length: 6 }, (_, i) => view.getUint32(at + 20 + i * 4));
    const [ut, standard, leaps, times, types, chars] = counts;
    const end =
      at + 44 + times * (width + 1) + types * 6 + chars + leaps * (width + 4) + ut + standard;
    if (end > bytes.length || types < 1 || types > 256 || leaps)
      throw new Error("Unsupported TZif block");
    return { at: at + 44, end, times, types, chars };
  };
  const block = header(header(0, 4).end, 8);
  const transitions: number[] = [];
  for (let i = 0; i < block.times; i++) {
    const value = Number(view.getBigInt64(block.at + i * 8));
    if (!Number.isSafeInteger(value) || (i && value <= transitions[i - 1]))
      throw new Error("Invalid transition ordering");
    transitions.push(value);
  }
  const indices = bytes.subarray(block.at + block.times * 8, block.at + block.times * 9);
  const typeAt = block.at + block.times * 9;
  const abbreviations = bytes.subarray(
    typeAt + block.types * 6,
    typeAt + block.types * 6 + block.chars,
  );
  const types = Array.from({ length: block.types }, (_, i) => {
    const designation = bytes[typeAt + i * 6 + 5];
    const end = abbreviations.indexOf(0, designation);
    if (designation >= abbreviations.length || end < 0) throw new Error("Invalid designation");
    return {
      offset: view.getInt32(typeAt + i * 6),
      daylight: bytes[typeAt + i * 6 + 4] === 1,
      unspecified: decode(abbreviations.subarray(designation, end)) === "-00",
    };
  });
  if ([...indices].some((index) => index >= types.length))
    throw new Error("Invalid transition type");
  const tail = decode(bytes.subarray(block.end));
  if (!/^\n[^\n\0]*\n$/.test(tail)) throw new Error("Invalid TZif footer");
  const future = footer(tail.slice(1, -1));
  const offsetAt = (seconds: number) => {
    if (!Number.isFinite(seconds)) throw new Error("Invalid instant");
    if (!transitions.length || seconds >= transitions.at(-1)!) {
      if (future) return future.at(seconds);
      if (transitions.length)
        throw new TimezoneDataUnavailable(
          "Timezone data is unavailable after the final recorded transition.",
        );
    }
    let lo = 0,
      hi = transitions.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (transitions[mid] <= seconds) lo = mid + 1;
      else hi = mid;
    }
    const type = types[lo ? indices[lo - 1] : 0];
    if (type.unspecified)
      throw new TimezoneDataUnavailable("Timezone data is unavailable for this historical period.");
    return type.offset;
  };
  const offsets = [...new Set([...types.map((type) => type.offset), ...(future?.offsets || [])])];
  return {
    footer: tail.slice(1, -1),
    futureFrom: transitions.at(-1) ?? null,
    futureObservances: future?.observances ?? [],
    isDaylightAt(seconds: number): boolean {
      offsetAt(seconds); // Validate unavailable history and invalid input first.
      if (future && (!transitions.length || seconds >= transitions.at(-1)!))
        return future.isDaylight(seconds);
      let lo = 0,
        hi = transitions.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (transitions[mid] <= seconds) lo = mid + 1;
        else hi = mid;
      }
      return types[lo ? indices[lo - 1] : 0].daylight;
    },
    offsetAt,
    transitionInstants(from: number, through: number): number[] {
      if (
        !Number.isFinite(from) ||
        !Number.isFinite(through) ||
        through < from ||
        through - from > 12 * 366 * 86400
      )
        throw new RangeError("Transition coverage must be finite and at most twelve years.");
      const found = transitions.filter((instant) => instant >= from && instant <= through);
      if (future) {
        const firstYear = new Date(from * 1000).getUTCFullYear() - 1;
        const lastYear = new Date(through * 1000).getUTCFullYear() + 1;
        for (let year = firstYear; year <= lastYear; year++) {
          for (const [instant] of future.events(year))
            if (
              instant >= from &&
              instant <= through &&
              (!transitions.length || instant >= transitions.at(-1)!)
            )
              found.push(instant);
        }
      }
      return [...new Set(found)]
        .sort((a, b) => a - b)
        .filter((instant) => offsetAt(instant - 1) !== offsetAt(instant));
    },
    possibleInstants(civilMilliseconds: number) {
      return offsets
        .map((offset) => civilMilliseconds - offset * 1000)
        .filter((instant) => offsetAt(instant / 1000) === (civilMilliseconds - instant) / 1000)
        .sort((a, b) => a - b)
        .map((instant) => new Date(instant).toISOString());
    },
  };
}
