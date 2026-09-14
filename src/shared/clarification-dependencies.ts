/** Classify legacy wire IDs once. The public selection shape and IDs stay unchanged. */
type Endpoint = "start" | "end";
type Decision =
  | { kind: "boundary"; endpoint: "starting" | "until" }
  | { kind: "monthly"; recognized: boolean }
  | { kind: "count"; field: string }
  | { kind: "interval"; endpoint: Endpoint; field: string }
  | { kind: "list-year" }
  | { kind: "list"; owner: string; field: string }
  | { kind: "occurrence"; family: "recurrence" | "group"; owner: string; field: string }
  | { kind: "arithmetic"; position: number }
  | { kind: "unknown" };

function decision(id: string): Decision {
  let match = /^boundary:(starting|until):date:/.exec(id);
  if (match) return { kind: "boundary", endpoint: match[1] as "starting" | "until" };
  if (id.startsWith("monthly:"))
    return { kind: "monthly", recognized: id === "monthly:skip" || id === "monthly:last-day" };
  match = /^count:([^:]+):/.exec(id);
  if (match) return { kind: "count", field: match[1] };
  match = /^interval:(start|end):(.+)$/.exec(id);
  if (match)
    return {
      kind: "interval",
      endpoint: match[1] as Endpoint,
      field: /^\d{4}-/.test(match[2]) ? "instant" : match[2].split(":")[0],
    };
  if (/^list:year:\d{4}$/.test(id)) return { kind: "list-year" };
  match = /^(list:\d+):([^:]+)(?::|$)/.exec(id);
  if (match) return { kind: "list", owner: match[1], field: match[2] };
  match = /^(recurrence:\d{4}-\d{2}-\d{2}|group:\d+):([^:]+)(?::|$)/.exec(id);
  if (match)
    return {
      kind: "occurrence",
      family: match[1].startsWith("recurrence:") ? "recurrence" : "group",
      owner: match[1],
      field: match[2],
    };
  match = /^arithmetic:(\d+):/.exec(id);
  if (match) return { kind: "arithmetic", position: Number(match[1]) };
  return { kind: "unknown" };
}

const recurrence = (value: Decision) =>
  value.kind === "occurrence" && value.family === "recurrence";

/** True when an earlier answer depends on the meaning replaced by the next answer. */
function invalidated(previous: Decision, next: Decision, arithmetic: boolean): boolean {
  switch (next.kind) {
    case "boundary":
      return (
        (previous.kind === "boundary" && previous.endpoint === next.endpoint) ||
        previous.kind === "monthly" ||
        previous.kind === "count" ||
        recurrence(previous)
      );
    case "monthly":
      return (
        next.recognized &&
        (previous.kind === "monthly" || previous.kind === "count" || recurrence(previous))
      );
    case "count":
      return (
        (next.field === "past" || next.field === "exclusions") &&
        ((previous.kind === "count" &&
          (next.field === "past" || previous.field === "exclusions")) ||
          recurrence(previous))
      );
    case "list-year":
      return (
        previous.kind === "list-year" || (previous.kind === "list" && previous.field !== "month")
      );
    case "interval":
      if (previous.kind !== "interval") return false;
      if (next.field === "date")
        return next.endpoint === "start" || previous.endpoint === next.endpoint;
      if (previous.endpoint !== next.endpoint) return false;
      if (next.field === "time") return previous.field !== "date";
      if (next.field === "instant") return previous.field !== "date" && previous.field !== "time";
      return next.endpoint === "end" && next.field === "boundary" && previous.field === "boundary";
    case "list":
      if (previous.kind !== "list" || previous.owner !== next.owner) return false;
      if (next.field === "month" || next.field === "date") return true;
      if (next.field === "year") return previous.field !== "month";
      if (next.field === "time") return !["month", "year", "date"].includes(previous.field);
      return endpointInvalidated(previous.field, next.field);
    case "occurrence":
      return (
        previous.kind === "occurrence" &&
        previous.owner === next.owner &&
        endpointInvalidated(previous.field, next.field)
      );
    case "arithmetic":
      return arithmetic && previous.kind === "arithmetic" && previous.position >= next.position;
    case "unknown":
      return false;
  }
}

function endpointInvalidated(previous: string, next: string): boolean {
  return (
    (next === "start" || next === "end") &&
    (previous === next || (next === "start" && (previous === "end" || previous === "end-next-day")))
  );
}

export function retainDecisions(history: string[], next: string, arithmetic = false): string[] {
  const changed = decision(next);
  if (changed.kind === "unknown" || (changed.kind === "arithmetic" && !arithmetic)) return history;
  return history.filter((id) => !invalidated(decision(id), changed, arithmetic));
}
