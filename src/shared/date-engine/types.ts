export type Unit = "year" | "month" | "week" | "day" | "hour" | "minute" | "second" | "millisecond";
export type Span = { start: number; end: number };
export type Token = Span & { text: string; value: string };
export type Amount = { numerator: bigint; denominator: bigint };
export type Operation = { amount: Amount; unit: Unit; sign: 1 | -1; source: string; span: Span };
export type Anchor =
  | {
      kind: "relative";
      value:
        | "now"
        | "today"
        | "tomorrow"
        | "yesterday"
        | "day-after-tomorrow"
        | "day-before-yesterday";
    }
  | { kind: "date"; month: number; day: number; year?: number }
  | { kind: "weekday"; day: number; direction: "next" | "last" | "this"; week: boolean }
  | { kind: "day-number"; day: number };
export type Plan = { anchor: Anchor; time?: string; operations: Operation[]; tokens: Token[] };
export type CalculationIssue = {
  code: "syntax" | "date" | "timezone" | "reference" | "precision" | "range" | "ambiguous-time";
  message: string;
  hint: string;
  span?: Span;
};
export type DateSnapshot = { iso: string; local: string; offset: string; timestamp: number };
export type CalculationStep = {
  source: string;
  before: DateSnapshot;
  after: DateSnapshot;
  details: string[];
};
export type CalculationSuccess = {
  ok: true;
  engineVersion: 2;
  expression: string;
  timezone: string;
  reference: string;
  normalized: string;
  anchor: DateSnapshot;
  anchorDescription: string;
  steps: CalculationStep[];
  warnings: string[];
  result: DateSnapshot;
};
export type Calculation =
  | CalculationSuccess
  | { ok: false; engineVersion: 2; error: CalculationIssue };

export class CalculationFailure extends Error {
  issue: CalculationIssue;
  constructor(issue: CalculationIssue) {
    super(issue.message);
    this.issue = issue;
  }
}

export function fail(
  code: CalculationIssue["code"],
  message: string,
  hint: string,
  span?: Span,
): never {
  throw new CalculationFailure({ code, message, hint, ...(span ? { span } : {}) });
}
