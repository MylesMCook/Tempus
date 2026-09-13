import { expect, it } from "vite-plus/test";
import { appendSelection, createParser, limits, parse, parseMany } from "./sdk.js";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it("keeps batch order and item-level unresolved results identical to single parsing", () => {
  const inputs = ["tomorrow at noon", "invalid words", "every Monday at noon", "Sat Sun 1pm-8pm"];
  expect(parseMany(inputs, context)).toEqual(inputs.map((input) => parse(input, context)));
  expect(parseMany(inputs, context).map((result) => result.input)).toEqual(inputs);
});
it("snapshots reusable parser options", () => {
  const options = { ...context };
  const parser = createParser(options);
  options.timezone = "UTC";
  expect(parser.parse("today")).toEqual(parse("today", context));
});
it("preserves full input and context through clarification", () => {
  const input = "03/04/2027";
  const first = parse(input, context);
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing clarification");
  const selection = appendSelection(undefined, {
    contextKey: first.clarification.contextKey,
    id: "2027-03-04",
  });
  const chosen = parse(input, { ...context, selection });
  expect(chosen).toMatchObject({ sdkVersion: "0.1.0", status: "resolved", input, context });
});
it("enforces declared argument and batch limits", () => {
  expect(() => parseMany(Array(limits.batchSize + 1).fill("today"), context)).toThrow(RangeError);
  expect(() => parse(123 as unknown as string, context)).toThrow(TypeError);
  expect(() => parseMany(Array<string>(2), context)).toThrow(TypeError);
  expect(() => parse("today", { ...context, selection: null! })).toThrow(TypeError);
  expect(parse("x".repeat(201), context).status).toBe("unsupported");
  expect(parseMany([], context)).toEqual([]);
});

it("rejects sparse clarification history consistently at every SDK entry point", () => {
  const malformed = {
    ...context,
    selection: { contextKey: "unused", id: "unused", previous: Array<string>(1) },
  };
  expect(() => parse("today", malformed)).toThrow(TypeError);
  expect(() => parseMany(["today"], malformed)).toThrow(TypeError);
  expect(() => parseMany([], malformed)).toThrow(TypeError);
  expect(() => createParser(malformed)).toThrow(TypeError);
});
