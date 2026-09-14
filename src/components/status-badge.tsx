"use client";

import { useEffect, useRef, useState } from "react";

export type StatusBadgeState = "loading" | "done";

export function readNum(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  if (raw.endsWith("ms")) return parseFloat(raw);
  if (raw.endsWith("s") && !raw.endsWith("ms")) return parseFloat(raw) * 1000;
  const n = parseFloat(raw);
  return Number.isNaN(n) ? fallback : n;
}

function badgeLabel(state: StatusBadgeState, label: string | undefined) {
  if (label) return label;
  switch (state) {
    case "done":
      return "Done";
    case "loading":
      return "In progress";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function StatusBadge({
  state = "loading",
  label,
  decorative = false,
}: {
  state?: StatusBadgeState;
  label?: string;
  decorative?: boolean;
}) {
  const [crossing, setCrossing] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setCrossing(true);
    const t = window.setTimeout(() => setCrossing(false), readNum("--check-fill-dur", 350) * 0.45);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <span
      className={"t-check-blur-wrap" + (crossing ? " is-crossing" : "")}
      aria-hidden={decorative ? true : undefined}
    >
      <span
        className="t-check-badge"
        data-state={state}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : badgeLabel(state, label)}
      >
        <span className="t-check-ring" aria-hidden="true" />
        <span className="t-check-arc" aria-hidden="true" />
        <span className="t-check-fill" aria-hidden="true" />
        <span className="t-check-disc" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path className="t-check-mark" d="M8 12.5L10.8 15.5L16.4 9.5" />
          </svg>
        </span>
      </span>
    </span>
  );
}
