/** Convert an explicit POSIX M rule to yearly civil-time calendar rules.
 * This does not choose a DST policy or establish the timezone's historical cutover.
 */
export function calendarTransitionRule(text: string): { rules: string[]; clock: string } {
  const match =
    /^M(\d{1,2})\.([1-5])\.([0-6])(?:\/([+-]?)(\d{1,3})(?::([0-5]\d))?(?::([0-5]\d))?)?$/.exec(
      text,
    );
  if (!match) throw new Error("Unsupported calendar transition rule.");
  const month = Number(match[1]);
  const week = Number(match[2]);
  const weekday = Number(match[3]);
  const hours = Number(match[5] ?? 2);
  if (month < 1 || month > 12 || hours > 167) throw new Error("Invalid calendar transition rule.");
  const seconds =
    (match[4] === "-" ? -1 : 1) *
    (hours * 3600 + Number(match[6] ?? 0) * 60 + Number(match[7] ?? 0));
  const shift = Math.floor(seconds / 86400);
  const clock = new Date((((seconds % 86400) + 86400) % 86400) * 1000)
    .toISOString()
    .slice(11, 19)
    .replaceAll(":", "");
  const dayName = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][(((weekday + shift) % 7) + 7) % 7];
  const groups = new Map<number, number[]>();
  const length = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  if (week === 5 && shift === 0)
    return { clock, rules: [`FREQ=YEARLY;BYMONTH=${month};BYDAY=-1${dayName}`] };
  for (let index = 0; index < 7; index++) {
    let targetMonth = month;
    let day = (week === 5 ? -7 + index : 1 + (week - 1) * 7 + index) + shift;
    if (week === 5) {
      // Negative month days stay relative to the end, including leap February.
      if (day >= 0) {
        targetMonth = (month % 12) + 1;
        day += 1;
      }
    } else if (day <= 0) {
      targetMonth = ((month + 10) % 12) + 1;
      day -= 1;
    } else if (day > length) {
      if (month === 2) throw new Error("Leap-dependent calendar transition spill is unsupported.");
      targetMonth = (month % 12) + 1;
      day -= length;
    }
    if (day < 0) {
      if (targetMonth === 2)
        throw new Error("Leap-dependent calendar transition spill is unsupported.");
      day += [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][targetMonth - 1] + 1;
    }
    const days = groups.get(targetMonth) ?? [];
    days.push(day);
    groups.set(targetMonth, days);
  }
  return {
    clock,
    rules: [...groups].map(
      ([targetMonth, days]) =>
        `FREQ=YEARLY;BYMONTH=${targetMonth};BYDAY=${dayName};BYMONTHDAY=${days.join(",")}`,
    ),
  };
}
