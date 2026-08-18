import * as React from "react";

import { t } from "../i18n";
import classNames from "../utils/classnames";

/**
 * The five states a piece of work can be in, plus the two ways it can end.
 *
 * The redesign shows status as a coloured dot next to a word rather than as a
 * filled badge. Dots read as data in a dense table; filled badges read as
 * buttons, and in a status column full of them nothing stands out.
 */
export type WorkStatus = "on_track" | "caution" | "off_track" | "pending" | "paused" | "achieved" | "missed";

interface StatusStyle {
  /** Tailwind background class for the dot. */
  dot: string;
  /** Tailwind text colour class for the label. */
  content: string;
  /** Tailwind background class for soft-filled surfaces. */
  surface: string;
}

const STATUS_STYLES: Record<WorkStatus, StatusStyle> = {
  on_track: { dot: "bg-status-ontrack", content: "text-status-ontrack-content", surface: "bg-status-ontrack-bg" },
  caution: { dot: "bg-status-caution", content: "text-status-caution-content", surface: "bg-status-caution-bg" },
  off_track: { dot: "bg-status-offtrack", content: "text-status-offtrack-content", surface: "bg-status-offtrack-bg" },
  pending: { dot: "bg-status-pending", content: "text-status-pending-content", surface: "bg-status-pending-bg" },
  paused: { dot: "bg-status-paused", content: "text-status-paused-content", surface: "bg-status-paused-bg" },
  // A finished goal is green, but its label is muted: it is history, not news.
  achieved: { dot: "bg-status-ontrack", content: "text-content-dimmed", surface: "bg-status-ontrack-bg" },
  missed: { dot: "bg-status-offtrack", content: "text-content-dimmed", surface: "bg-status-offtrack-bg" },
};

const FALLBACK_STYLE: StatusStyle = STATUS_STYLES.paused;

export function statusStyle(status: string): StatusStyle {
  return STATUS_STYLES[status as WorkStatus] ?? FALLBACK_STYLE;
}

/** True for statuses whose row should be greyed out — closed or parked work. */
export function isMutedStatus(status: string): boolean {
  return status === "achieved" || status === "missed" || status === "paused";
}

/** True for work that has finished, one way or the other. */
export function isClosedStatus(status: string): boolean {
  return status === "achieved" || status === "missed" || status === "completed";
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  on_track: "turboui.statusBadge.onTrack",
  caution: "turboui.statusBadge.caution",
  off_track: "turboui.statusBadge.offTrack",
  pending: "turboui.statusBadge.pending",
  paused: "turboui.statusBadge.paused",
  achieved: "turboui.statusBadge.achieved",
  missed: "turboui.statusBadge.missed",
  completed: "turboui.statusBadge.completed",
  outdated: "turboui.statusBadge.outdated",
};

/** The human name for a status, falling back to the raw value if unmapped. */
export function statusLabel(status: string): string {
  const key = STATUS_LABEL_KEYS[status];
  return key ? t(key) : status;
}

interface StatusDotProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusDot({ status, className, size = "md" }: StatusDotProps) {
  return (
    <span
      className={classNames(
        "shrink-0 rounded-full",
        size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
        statusStyle(status).dot,
        className,
      )}
    />
  );
}

interface StatusLabelProps {
  status: string;
  label: string;
  className?: string;
  size?: "sm" | "md";
}

/** Dot plus word. The default way status appears in tables and headers. */
export function StatusLabel({ status, label, className, size = "md" }: StatusLabelProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        size === "sm" ? "text-xs" : "text-[13px] font-medium",
        statusStyle(status).content,
        className,
      )}
    >
      <StatusDot status={status} size={size} />
      {label}
    </span>
  );
}
