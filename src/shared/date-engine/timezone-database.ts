import { timezoneData } from "./timezone-data.js";
import { readZone } from "./timezone-reader.js";
export { TimezoneDataUnavailable } from "./timezone-reader.js";
export { TIMEZONE_DATA_VERSION } from "./timezone-data.js";

const names = new Map(Object.keys(timezoneData.aliases).map((name) => [name.toLowerCase(), name]));
const cache = new Map<number, ReturnType<typeof readZone>>();
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesFromBase64(value: string): Uint8Array {
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))
    throw new Error("Invalid bundled timezone encoding.");
  const size = (value.length / 4) * 3 - (value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0);
  const bytes = new Uint8Array(size);
  let cursor = 0;
  for (let i = 0; i < value.length; i += 4) {
    const bits =
      (alphabet.indexOf(value[i]) << 18) |
      (alphabet.indexOf(value[i + 1]) << 12) |
      (Math.max(0, alphabet.indexOf(value[i + 2])) << 6) |
      Math.max(0, alphabet.indexOf(value[i + 3]));
    for (const shift of [16, 8, 0]) if (cursor < size) bytes[cursor++] = (bits >>> shift) & 255;
  }
  return bytes;
}

/** Named IANA lookup with no Intl dependency or parsing-time network access. */
export function timezoneDatabase(name: string) {
  const canonical = name.length <= 64 ? names.get(name.toLowerCase()) : undefined;
  if (!canonical) throw new RangeError("Unknown IANA timezone.");
  const index = timezoneData.aliases[canonical];
  let zone = cache.get(index);
  if (!zone) {
    zone = readZone(bytesFromBase64(timezoneData.files[index]));
    if (cache.size >= 64) cache.delete(cache.keys().next().value!);
    cache.set(index, zone);
  }
  return zone;
}
