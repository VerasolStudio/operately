import React from "react";
import { match } from "ts-pattern";

import { SETTLE, motion } from "../Motion";
import type { ProgressBarProps } from "./types";

export type { ProgressBarStatus, ProgressBarSize } from "./types";

/**
 * The progress bar used in every table and card.
 *
 * The fill is coloured by status rather than always green, so a row that is
 * 60% done but off track does not read as 60% healthy — the bar and the status
 * label say the same thing.
 *
 * It springs to its new value instead of snapping. Progress is the one number
 * on these screens that people watch change, and a bar that slides makes the
 * change legible in a way an instant redraw does not.
 */
export function ProgressBar({ progress, status, size = "md", showLabel = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress || 0));

  const progressColor = match(status)
    .with("on_track", "achieved", () => "bg-status-ontrack")
    .with("paused", () => "bg-status-paused")
    .with("caution", () => "bg-status-caution")
    .with("off_track", "missed", () => "bg-status-offtrack")
    .with("pending", () => "bg-status-pending")
    .otherwise(() => "bg-status-paused");

  const heightClass = match(size)
    .with("sm", () => "h-1")
    .with("lg", () => "h-2.5")
    .with("md", () => "h-1.5")
    .exhaustive();

  return (
    <div role="progress-bar" className="flex w-full items-center gap-2">
      <div className={`w-full overflow-hidden rounded-full bg-track ${heightClass}`}>
        <motion.div
          className={`h-full rounded-full ${progressColor}`}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={SETTLE}
          data-testid="progress-percentage-bar"
        />
      </div>

      {showLabel && (
        <span className="min-w-[36px] text-right text-xs tabular-nums text-content-dimmed">{Math.round(clamped)}%</span>
      )}
    </div>
  );
}
