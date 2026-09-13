import type { ScheduleCopyFormat } from "../schedule-copy";

/** React renders each token as text; input never becomes HTML. */
export function OutputPreview({ text, format }: { text: string; format: ScheduleCopyFormat }) {
  // Keep very large datasets inspectable without constructing thousands of syntax spans.
  const highlight = format === "json" && text.length <= 100_000;
  const tokens = highlight
    ? text.split(
        /("(?:\\.|[^"\\])*"\s*:|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/g,
      )
    : [text];
  return (
    <div className="grid min-w-0 gap-2">
      {format === "json" && !highlight ? (
        <p className="text-sm text-muted-foreground">
          Large output: indentation is preserved; syntax colors are off to keep scrolling light.
        </p>
      ) : null}
      <pre
        tabIndex={0}
        role="region"
        aria-label="Complete copy output"
        aria-describedby="copy-preview-description"
        className={`max-h-80 min-w-0 overflow-auto whitespace-pre rounded-md border bg-slate-50 p-3 text-sm leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 ${format === "text" ? "whitespace-pre-wrap break-words font-sans" : "font-mono"}`}
      >
        <code className="[font:inherit]">
          {tokens.map((token, index) => {
            if (!highlight || index % 2 === 0) return token;
            const color = token.startsWith('"')
              ? token.endsWith(":")
                ? "text-violet-800"
                : "text-emerald-800"
              : /^(true|false|null)$/.test(token)
                ? "text-rose-800"
                : "text-blue-800";
            return (
              <span key={index} className={color}>
                {token}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
