import { appendSelection, parse, type ClarificationSelection } from "@tempus-date/core";

const input = document.querySelector<HTMLInputElement>("#phrase")!;
const output = document.querySelector<HTMLElement>("#result")!;
const choices = document.querySelector<HTMLElement>("#choices")!;
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
let selection: ClarificationSelection | undefined;
function render() {
  const result = parse(input.value, { ...context, selection });
  output.textContent = JSON.stringify(result, null, 2);
  choices.replaceChildren();
  if (result.status === "needs-clarification" && result.clarification) {
    const prompt = result.clarification;
    for (const choice of prompt.choices) {
      const button = document.createElement("button");
      button.textContent = choice.label;
      button.onclick = () => {
        selection = appendSelection(selection, { contextKey: prompt.contextKey, id: choice.id });
        render();
        output.focus();
      };
      choices.append(button);
    }
  }
}
input.addEventListener("input", () => {
  selection = undefined;
  render();
});
render();
