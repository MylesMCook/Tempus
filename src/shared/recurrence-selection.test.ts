import { expect, it } from "vite-plus/test";
import { appendSelection } from "./clarify-numeric-date";
import { parse as interpretDate } from "./sdk";

it("recovers a conflicting reminder answer and rejects it after an edit", () => {
  const context = { timezone: "America/Chicago", reference: "2026-10-31T12:00:00Z" };
  const input = "Remind me to call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08";
  const question = interpretDate(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw new Error("Missing clock choice");
  const [first, second] = question.clarification.choices;
  const conflict = {
    contextKey: question.clarification.contextKey,
    id: second.id,
    previous: [first.id],
  };
  expect(interpretDate(input, { ...context, selection: conflict }).status).toBe(
    "needs-clarification",
  );
  const selection = appendSelection(conflict, { contextKey: conflict.contextKey, id: second.id });
  const answer = interpretDate(input, { ...context, selection });
  if (answer.status !== "resolved" || answer.value.kind !== "recurrence")
    throw new Error("Recovery failed");
  expect(answer.event?.text).toBe("call Sam");
  expect(answer.input).toBe(input);
  expect(
    answer.value.occurrences.map((row) => [row.start.result.iso, row.end?.result.iso]),
  ).toEqual([
    ["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"],
    ["2026-11-08T07:30:00.000Z", "2026-11-08T08:00:00.000Z"],
  ]);
  expect(
    interpretDate(input.replace("30 minutes", "45 minutes"), { ...context, selection }).status,
  ).toBe("needs-clarification");
});

it("changing an occurrence start clears its dependent end, preserving other occurrences", () => {
  const first = "recurrence:2026-11-01:start:2026-11-01T06:30:00Z";
  const end = "recurrence:2026-11-01:end:2026-11-01T07:45:00Z";
  const other = "recurrence:2027-11-07:start:2027-11-07T07:30:00Z";
  const replacement = "recurrence:2026-11-01:start:2026-11-01T07:30:00Z";
  expect(
    appendSelection(
      { contextKey: "context", id: end, previous: [first, other] },
      { contextKey: "context", id: replacement },
    ),
  ).toEqual({ contextKey: "context", id: replacement, previous: [other] });
  expect(
    appendSelection(
      { contextKey: "context", id: end, previous: [first, other] },
      { contextKey: "context", id: end },
    ),
  ).toEqual({ contextKey: "context", id: end, previous: [first, other] });
});

it("asks again for a repeated end after changing a repeated start", () => {
  const context = { timezone: "America/Chicago", reference: "2026-10-31T12:00:00Z" };
  const input = "every Sunday from 1:15am to 1:45am until 2026-11-01";
  let answer = interpretDate(input, context);
  if (answer.status !== "needs-clarification" || !answer.clarification)
    throw new Error("Missing start choice");
  const startPrompt = answer.clarification;
  let selection = appendSelection(undefined, {
    contextKey: startPrompt.contextKey,
    id: startPrompt.choices[0].id,
  });
  answer = interpretDate(input, { ...context, selection });
  if (answer.status !== "needs-clarification" || !answer.clarification)
    throw new Error("Missing end choice");
  selection = appendSelection(selection, {
    contextKey: answer.clarification.contextKey,
    id: answer.clarification.choices[1].id,
  });
  expect(interpretDate(input, { ...context, selection }).status).toBe("resolved");
  selection = appendSelection(selection, {
    contextKey: startPrompt.contextKey,
    id: startPrompt.choices[1].id,
  });
  answer = interpretDate(input, { ...context, selection });
  expect(answer.status).toBe("needs-clarification");
  if (answer.status !== "needs-clarification") throw new Error("Missing renewed end question");
  expect(answer.clarification?.question).toContain("end");
});

it.each(["starting", "until"])(
  "replaces the %s boundary and clears dependent schedule decisions, preserving the other boundary",
  (endpoint) => {
    const otherEndpoint = endpoint === "starting" ? "until" : "starting";
    const old = `boundary:${endpoint}:date:2026-09-10`;
    const replacement = `boundary:${endpoint}:date:2026-10-09`;
    const other = `boundary:${otherEndpoint}:date:2026-12-11`;
    const unrelated = "interval:start:date:2026-09-10";
    const selection = appendSelection(
      {
        contextKey: "context",
        id: old,
        previous: [
          other,
          "monthly:last-day",
          "count:past:consume",
          "count:exclusions:replace",
          "recurrence:2026-11-01:start:2026-11-01T06:30:00Z",
          "recurrence:2026-11-01:end:2026-11-01T07:30:00Z",
          unrelated,
        ],
      },
      { contextKey: "context", id: replacement },
    );
    expect(selection).toEqual({
      contextKey: "context",
      id: replacement,
      previous: [other, unrelated],
    });
  },
);

it("replays a replacement boundary while retaining the independent end date", () => {
  const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
  const input = "Mondays at noon starting 09/10/2026 until 11/12/2026";
  const question = interpretDate(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw new Error("Missing boundary question");
  const contextKey = question.clarification.contextKey;
  const selection = appendSelection(
    {
      contextKey,
      id: "boundary:until:date:2026-11-12",
      previous: ["boundary:starting:date:2026-09-10"],
    },
    { contextKey, id: "boundary:starting:date:2026-10-09" },
  );
  const answer = interpretDate(input, { ...context, selection });
  expect(answer).toMatchObject({
    status: "resolved",
    value: {
      kind: "recurrence",
      rule: { starting: "2026-10-09", until: "2026-11-12" },
    },
  });
  if (answer.status !== "resolved" || answer.value.kind !== "recurrence")
    throw new Error("Missing resolved replacement");
  expect(answer.value.occurrences[0].start.result.local.slice(0, 10)).toBe("2026-10-12");
});
