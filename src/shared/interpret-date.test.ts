import { describe, expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { calculateDate } from "./date-parser";

const options = { reference: "2026-09-12T16:00:00Z", timezone: "America/Chicago" };
describe("bounded sentence interpretation", () => {
  it.each([
    "Remind me to call Sam tomorrow at noon",
    "  Please remind me to email Jo tomorrow at noon!  ",
    "Can we talk tomorrow at noon?",
    "Could we meet tomorrow at noon?",
    "The meeting is on tomorrow at noon.",
    "Remind me to pick up groceries tomorrow at noon",
  ])("keeps source spans and resolves %s", (text) => {
    const result = interpretDate(text, options);
    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") throw new Error("Expected a point");
    expect(result.value.calculation.result.iso).toBe("2026-09-13T17:00:00.000Z");
    expect(text.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
    expect(result.event).toBeDefined();
    expect(text.slice(result.event!.span.start, result.event!.span.end)).toBe(result.event!.text);
  });
  it.each([
    "Remind me to call Sam tomorrow at noon and Friday at 2 pm",
    "Remind me to call Sam tomorrow at noon actually Friday",
    "Remind me to not call Sam tomorrow at noon",
    "Do not schedule anything tomorrow",
    "Remind me to call Sam tomorrow unless it rains",
    "Remind me to call Sam tomorrow and cancel Friday",
    "Remind me to call Sam tomorrow except Saturday",
    "Remind me to call Sam tomorrow or Friday",
    "Remind me to call Sam tomorrow nonsense",
    "Remind me to call Sam in three days for two hours",
    "Remind me to call Sam every Monday",
    "Remind me to call Sam Jones tomorrow at noon",
    "Remind me to call Sam for 3 days from today",
    "Remind me to call Sam between tomorrow and Friday",
    "Remind me to call Sam weekly on Monday",
    "Remind me to call May tomorrow at noon",
    "Remind me to call 5551234 tomorrow at noon",
    "Remind me to call Sam three days ago tomorrow",
    "Remind me to call Sam tomorrow at noon extra",
  ])("does not return a partial date for %s", (text) => {
    expect(interpretDate(text, options).status).not.toBe("resolved");
  });
  it("keeps strict arithmetic and API v2 behavior", () => {
    const text = "jan 30 2026 plus 1 month plus 2 days";
    const result = interpretDate(text, options);
    expect(result.status).toBe("resolved");
    if (result.status === "resolved")
      expect(result.value.calculation).toEqual(calculateDate(text, options));
    expect(calculateDate("Remind me to call Sam tomorrow at noon", options).ok).toBe(false);
  });
  it("offsets errors into the original sentence", () => {
    const text = "  Remind me to call Sam tomorrow nonsense";
    const result = interpretDate(text, options);
    expect(result.status).toBe("unsupported");
    if (result.status === "resolved") throw new Error("Unexpected point");
    expect(text.slice(result.error.span!.start, result.error.span!.end)).toBe("nonsense");
  });
  it("keeps invalid zones and repeated clock times unresolved", () => {
    const text = "Remind me to call Sam nov 1 2026 at 1:30 am";
    expect(interpretDate(text, options).status).toBe("needs-clarification");
    expect(interpretDate(text, { ...options, timezone: "Bad/Zone" }).status).toBe("unsupported");
  });
});
