"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function OrganicShimmer({
  width = 142,
  height = 142,
  radius = 12,
  playing = true,
  className,
}: {
  width?: number | string;
  height?: number;
  radius?: number;
  playing?: boolean;
  className?: string;
}) {
  const scale = Math.min(typeof width === "number" ? width : Math.max(height, 142), height) / 142;
  const showEdge = height >= 50;
  return (
    <div
      className={cn("t-shimmer-tile", className)}
      aria-hidden={true}
      data-playing={playing ? undefined : "false"}
      style={
        {
          width,
          height,
          borderRadius: radius,
          "--shimmer-scale": scale,
        } as CSSProperties
      }
    >
      <span className="t-shimmer">
        <span className="t-shimmer-band" />
      </span>
      {showEdge ? (
        <span className="t-shimmer-edge">
          <span className="t-shimmer-edge-bloom" />
          <span className="t-shimmer-edge-glow" />
          <span className="t-shimmer-edge-ring" />
        </span>
      ) : null}
    </div>
  );
}
