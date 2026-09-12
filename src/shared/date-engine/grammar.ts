import {
  fail,
  type Amount,
  type Anchor,
  type Operation,
  type Plan,
  type Token,
  type Unit,
} from "./types";

const months: Record<string, number> = {
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
};
const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const units = new Set(["year", "month", "week", "day", "hour", "minute", "second", "millisecond"]);
const numbers: Record<string, number> = {
  zero: 0,
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
};

function tokenize(input: string): Token[] {
  if (!input.trim()) fail("syntax", "Enter a date phrase.", "Try “tomorrow” or “in 3 days”.");
  if (input.length > 200) fail("range", "That phrase is too long.", "Use at most 200 characters.");
  const tokens: Token[] = [];
  const pattern =
    /\d{4}-\d{2}-\d{2}|\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?|\d+\/\d+|\d+(?:\.\d+)?(?:st|nd|rd|th)?|[a-z]+|[+-]/iy;
  for (let i = 0; i < input.length; ) {
    if (/[\s,]/.test(input[i])) {
      i++;
      continue;
    }
    pattern.lastIndex = i;
    const match = pattern.exec(input);
    if (!match)
      fail(
        "syntax",
        `Unexpected character “${input[i]}”.`,
        "Use a named date, ISO date, or a date phrase.",
        { start: i, end: i + 1 },
      );
    tokens.push({
      text: match[0],
      value: match[0].toLowerCase(),
      start: i,
      end: pattern.lastIndex,
    });
    i = pattern.lastIndex;
  }
  return tokens;
}

function rational(value: string): Amount {
  if (value.includes("/")) {
    const [n, d] = value.split("/").map(BigInt);
    if (d === 0n)
      fail("precision", "A fraction cannot divide by zero.", "Use a fraction such as 1/2.");
    return { numerator: n, denominator: d };
  }
  const [whole, fraction = ""] = value.split(".");
  return { numerator: BigInt(whole + fraction), denominator: 10n ** BigInt(fraction.length) };
}

export function parseExpression(input: string): Plan {
  const tokens = tokenize(input);
  let index = 0;
  const peek = () => tokens[index]?.value;
  const take = () => tokens[index++];
  const syntax = (
    message: string,
    hint = "Try “today plus 2 days” or “2 weeks before may 1”.",
  ): never =>
    fail("syntax", message, hint, tokens[index] ?? { start: input.length, end: input.length });
  const integer = (): number => {
    const value = peek()?.replace(/(st|nd|rd|th)$/, "");
    if (!value || !/^\d+$/.test(value)) return syntax("Expected a whole date number.");
    take();
    const result = Number(value);
    if (!Number.isSafeInteger(result)) return syntax("That date number is too large.");
    return result;
  };
  const readAnchor = (): Anchor | null => {
    const value = peek();
    if (!value) return null;
    if (["now", "today", "tomorrow", "yesterday"].includes(value)) {
      take();
      return { kind: "relative", value: value as "now" | "today" | "tomorrow" | "yesterday" };
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      take();
      const [year, month, day] = value.split("-").map(Number);
      return { kind: "date", year, month, day };
    }
    if (Object.hasOwn(months, value)) {
      take();
      const day = integer();
      const year = peek() && /^\d+$/.test(peek()!) ? integer() : undefined;
      return { kind: "date", month: months[value], day, year };
    }
    const modifier = value === "next" || value === "last" ? value : null;
    const weekday = modifier ? tokens[index + 1]?.value : value;
    const day = weekdays.indexOf(weekday ?? "") + 1;
    if (day) {
      if (modifier) take();
      take();
      let direction: "next" | "last" = modifier ?? "next";
      let week = false;
      if (!modifier && (peek() === "next" || peek() === "last")) {
        direction = take().value as "next" | "last";
        if (peek() !== "week") syntax("Expected “week” after the weekday modifier.");
        take();
        week = true;
      }
      return { kind: "weekday", day, direction, week };
    }
    if (tokens.length === 1 && /^\d+(st|nd|rd|th)?$/.test(value))
      return { kind: "day-number", day: integer() };
    return null;
  };
  const readTime = (): string | undefined => {
    if (peek() !== "at") return undefined;
    take();
    const value = peek();
    if (!value || !/^\d{1,2}(:\d{2}(:\d{2}(\.\d{1,3})?)?)?$/.test(value))
      syntax(
        "Expected a clock time after “at”.",
        "Use “at 14:30” or “at 2 pm”; precision is one millisecond.",
      );
    take();
    const parts = value!.split(":");
    let hour = Number(parts[0]);
    const meridian = peek();
    if (meridian === "am" || meridian === "pm") {
      if (hour < 1 || hour > 12) syntax("Use hours 1–12 with am or pm.");
      hour = (hour % 12) + (meridian === "pm" ? 12 : 0);
      take();
    } else if (parts.length === 1)
      syntax("That clock time needs minutes or am/pm.", "Use “at 14:00” or “at 2 pm”.");
    if (hour > 23 || Number(parts[1] ?? 0) > 59 || Number(parts[2] ?? 0) >= 60)
      syntax(
        "That clock time is outside the valid range.",
        "Use hours 00–23, minutes 00–59, and seconds below 60.",
      );
    return `${String(hour).padStart(2, "0")}:${parts[1] ?? "00"}:${parts[2] ?? "00"}`;
  };
  const readAmount = (): Amount => {
    const value = peek();
    if (!value) return syntax("Expected a number and time unit.");
    if (/^\d+(\.\d+)?$/.test(value) || /^\d+\/\d+$/.test(value)) {
      take();
      return rational(value);
    }
    if (value === "half" || value === "quarter") {
      take();
      if (peek() === "a" || peek() === "an") take();
      return { numerator: 1n, denominator: value === "half" ? 2n : 4n };
    }
    if (value === "a" || value === "an") {
      take();
      return { numerator: 1n, denominator: 1n };
    }
    if (Object.hasOwn(numbers, value)) {
      take();
      let number = numbers[value];
      const next = peek();
      if (
        number >= 20 &&
        number % 10 === 0 &&
        next &&
        Object.hasOwn(numbers, next) &&
        numbers[next] > 0 &&
        numbers[next] < 10
      ) {
        number += numbers[take().value];
      }
      return { numerator: BigInt(number), denominator: 1n };
    }
    return syntax(
      `“${tokens[index].text}” is not a supported amount.`,
      "Use a number, a word such as “three”, or a fraction such as “half”.",
    );
  };
  const readOperation = (sign: 1 | -1): Operation => {
    const start = tokens[index]?.start ?? input.length;
    const amount = readAmount();
    const unit = peek()?.replace(/s$/, "");
    if (!unit || !units.has(unit))
      syntax(
        "Expected a time unit after the number.",
        "Use years, months, weeks, days, hours, minutes, seconds, or milliseconds.",
      );
    const end = take().end;
    return {
      amount,
      unit: unit as Unit,
      sign,
      source: `${sign < 0 ? "Subtract" : "Add"} ${input.slice(start, end)}`,
      span: { start, end },
    };
  };
  const operations: Operation[] = [];
  const append = (sign: 1 | -1) => {
    if (operations.length >= 20)
      syntax("Too many calculation steps.", "Use at most 20 changes in one phrase.");
    operations.push(readOperation(sign));
  };
  const tail = () => {
    while (
      peek() === "plus" ||
      peek() === "+" ||
      peek() === "minus" ||
      peek() === "-" ||
      peek() === "and"
    ) {
      const connector = take().value;
      append(connector === "minus" || connector === "-" ? -1 : 1);
    }
  };

  let anchor = readAnchor();
  let time: string | undefined;
  if (anchor) {
    time = readTime();
    tail();
  } else {
    const inPrefix = peek() === "in";
    if (inPrefix) take();
    if ((peek() === "next" || peek() === "last") && units.has(tokens[index + 1]?.value)) {
      const modifier = take();
      const unit = take();
      operations.push({
        amount: { numerator: 1n, denominator: 1n },
        unit: unit.value as Unit,
        sign: modifier.value === "next" ? 1 : -1,
        source: `${modifier.value === "next" ? "Add" : "Subtract"} 1 ${unit.value}`,
        span: { start: modifier.start, end: unit.end },
      });
    } else append(1);
    tail();
    const relation = peek();
    if (["before", "after", "from"].includes(relation ?? "")) {
      if (inPrefix) syntax("Use either “in” or a reference date.");
      take();
      anchor = readAnchor();
      if (!anchor) syntax("Expected a starting date after the relation.");
      time = readTime();
      if (relation === "before")
        operations.forEach((op) => {
          op.sign = op.sign === 1 ? -1 : 1;
          op.source = op.source.replace(/^(Add|Subtract)/, op.sign === 1 ? "Add" : "Subtract");
        });
      tail();
    } else {
      anchor = { kind: "relative", value: "now" };
      if (relation === "ago") {
        if (inPrefix)
          syntax(
            "“In” and “ago” point in different directions.",
            "Use “in 2 days” or “2 days ago”.",
          );
        take();
        operations.forEach((op) => {
          op.sign = op.sign === 1 ? -1 : 1;
          op.source = op.source.replace(/^(Add|Subtract)/, op.sign === 1 ? "Add" : "Subtract");
        });
      }
    }
  }
  if (index < tokens.length)
    syntax(
      `Couldn’t use “${input.slice(tokens[index].start)}”.`,
      "Every part of the phrase must describe the date. Use plus or minus between changes.",
    );
  return { anchor: anchor!, time, operations, tokens };
}
