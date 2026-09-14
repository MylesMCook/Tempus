import { calculateDate, parse } from "@tempus-date/core";

const phrase = process.argv
  .slice(2)
  .filter((arg) => arg !== "--")
  .join(" ")
  .trim();
if (!phrase) {
  console.error("Usage: node examples/sdk/parse-phrase.mjs <phrase>");
  console.error("Set TEMPUS_TIMEZONE (IANA) and TEMPUS_REFERENCE (ISO instant) to override defaults.");
  process.exit(2);
}

const timezone =
  process.env.TEMPUS_TIMEZONE?.trim() ||
  process.env.TZ?.trim() ||
  Intl.DateTimeFormat().resolvedOptions().timeZone ||
  "UTC";
const reference = process.env.TEMPUS_REFERENCE?.trim() || new Date().toISOString();

const calculation = calculateDate(phrase, { timezone, reference });
if (calculation.ok) {
  console.log(JSON.stringify({ mode: "calculate", timezone, reference, ...calculation }, null, 2));
  process.exit(0);
}

const interpreted = parse(phrase, { timezone, reference });
console.log(JSON.stringify({ mode: "parse", timezone, reference, ...interpreted }, null, 2));
process.exit(interpreted.status === "resolved" ? 0 : 1);
