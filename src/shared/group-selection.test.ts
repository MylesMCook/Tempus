import { expect, it } from "vite-plus/test";
import { parse, appendSelection } from "./sdk";

const context = { timezone: "America/Chicago", reference: "2026-10-31T12:00:00Z" };
const input = "Remind me to call Sam Sun 1:15am-1:45am Mon 9am-10am";
it("requires recovery from conflicting group clock answers", () => {
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw new Error("Missing start question");
  const [first, second] = question.clarification.choices;
  const conflict = {
    contextKey: question.clarification.contextKey,
    id: second.id,
    previous: [first.id],
  };
  const blocked = parse(input, { ...context, selection: conflict });
  expect(blocked.status).toBe("needs-clarification");
  if (blocked.status !== "needs-clarification") throw new Error("Accepted contradictory clocks");
  expect(blocked.clarification?.question).toContain("start");
  let selection = appendSelection(conflict, { contextKey: conflict.contextKey, id: second.id });
  const endQuestion = parse(input, { ...context, selection });
  if (endQuestion.status !== "needs-clarification" || !endQuestion.clarification)
    throw new Error("Missing end question");
  selection = appendSelection(selection, {
    contextKey: endQuestion.clarification.contextKey,
    id: endQuestion.clarification.choices[1].id,
  });
  const answer = parse(input, { ...context, selection });
  if (answer.status !== "resolved" || answer.value.kind !== "collection")
    throw new Error("Recovery failed");
  expect(answer.input).toBe(input);
  expect(answer.event?.text).toBe("call Sam");
  expect(
    answer.value.occurrences.map((row) => [row.start.result.iso, row.end!.result.iso]),
  ).toEqual([
    ["2026-11-01T07:15:00.000Z", "2026-11-01T07:45:00.000Z"],
    ["2026-11-02T15:00:00.000Z", "2026-11-02T16:00:00.000Z"],
  ]);
  for (const row of answer.value.occurrences)
    expect(input.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
  const changed = appendSelection(selection, { contextKey: conflict.contextKey, id: first.id });
  const reasked = parse(input, { ...context, selection: changed });
  expect(reasked.status).toBe("needs-clarification");
  if (reasked.status !== "needs-clarification") throw new Error("Retained dependent end choice");
  expect(reasked.clarification?.question).toContain("end");
  expect(parse(input.replace("1:15am", "1:20am"), { ...context, selection }).status).toBe(
    "needs-clarification",
  );
});
