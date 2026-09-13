import { parse, appendSelection } from "@tempus-date/core";
import type { ClarificationSelection } from "@tempus-date/core";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const input = "03/04/2027";
let selection: ClarificationSelection | undefined;
let result = parse(input, context);

function answer(userSelectedId: string) {
  if (result.status !== "needs-clarification" || !result.clarification) return;
  const question = result.clarification;
  if (!question.choices.some((choice) => choice.id === userSelectedId)) return;
  selection = appendSelection(selection, {
    contextKey: question.contextKey,
    id: userSelectedId,
  });
  result = parse(input, { ...context, selection });
}
// Render question/choices and call answer only for the user's selected option.
