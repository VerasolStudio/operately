import * as React from "react";

import { DivLink } from "../Link";
import { AnimatedBar, AnimatedNumber, FadeIn, SETTLE, motion, staggerDelay } from "../Motion";
import classNames from "../utils/classnames";

/**
 * The summary cards that sit above the tables on index screens.
 *
 * Each one answers a single question — how much needs attention, how much is
 * on track, how many check-ins are outstanding — and the number is the largest
 * thing in the card. Anything that needs a sentence to explain belongs in the
 * table below, not here.
 */

export type CardTone = "neutral" | "info" | "warning" | "danger" | "success";

const TONE_CONTENT: Record<CardTone, string> = {
  neutral: "text-content-label",
  info: "text-primary-soft-content",
  warning: "text-status-caution-content",
  danger: "text-status-offtrack-content",
  success: "text-status-ontrack-content",
};

interface SummaryCardProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  tone?: CardTone;
  /** The headline number. Counts up on mount and when it changes. */
  value: number;
  /** Suffix rendered next to the number at normal size, e.g. "件 / 全14件". */
  unit?: React.ReactNode;
  /** One extra line under the number: names, a breakdown, a progress bar. */
  footer?: React.ReactNode;
  /** 0–100. Renders a progress bar under the number when set. */
  percentage?: number;
  barClassName?: string;
  to?: string;
  onClick?: () => void;
  index?: number;
  testId?: string;
}

export function SummaryCard({
  label,
  icon,
  tone = "neutral",
  value,
  unit,
  footer,
  percentage,
  barClassName,
  to,
  onClick,
  index = 0,
  testId,
}: SummaryCardProps) {
  const interactive = Boolean(to || onClick);

  const body = (
    <div
      // `h-full` so a card without a footer still matches the height of its
      // neighbours; a row of summary cards with ragged bottoms reads as a
      // rendering accident rather than a deliberate difference.
      className={classNames(
        "h-full rounded-xl border border-surface-outline bg-surface-base px-4 py-3.5 transition-colors",
        { "cursor-pointer hover:bg-surface-highlight": interactive },
      )}
      data-test-id={testId}
    >
      <div className={classNames("flex items-center gap-2 text-xs font-semibold", TONE_CONTENT[tone])}>
        {icon}
        {label}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <AnimatedNumber value={value} className="text-[26px] font-semibold leading-none text-content-strong" />
        {unit && <span className="text-[13px] text-content-dimmed">{unit}</span>}
      </div>

      {typeof percentage === "number" && (
        <AnimatedBar percentage={percentage} className="mt-2.5" barClassName={barClassName} />
      )}

      {footer && <div className="mt-2.5 text-[13px] text-content-muted">{footer}</div>}
    </div>
  );

  const wrapped = to ? (
    <DivLink to={to} className="block h-full">
      {body}
    </DivLink>
  ) : onClick ? (
    <div className="h-full" onClick={onClick}>
      {body}
    </div>
  ) : (
    body
  );

  return (
    <FadeIn className="h-full" delay={staggerDelay(index, 0.06)}>
      {wrapped}
    </FadeIn>
  );
}

/**
 * A plain bordered card. The default container for anything in a page sidebar
 * that is not a list of rows.
 */
export function Card({
  children,
  className,
  onClick,
  to,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  to?: string;
  tone?: "neutral" | "info";
}) {
  const classes = classNames(
    // `block` matters when this renders as a link: an anchor is inline by
    // default, so its border would break across lines around block children
    // instead of boxing them.
    "block rounded-xl border p-3.5 transition-colors",
    tone === "info" ? "border-primary-soft-border bg-primary-soft-bg" : "border-surface-outline bg-surface-base",
    { "cursor-pointer hover:bg-surface-highlight": Boolean(onClick || to) },
    className,
  );

  if (to) {
    return (
      <DivLink to={to} className={classes}>
        {children}
      </DivLink>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}

/**
 * The stacked-bar breakdown of statuses used on the company dashboard.
 *
 * Each segment animates its own share of the width, so when the underlying
 * counts change the bar visibly redistributes instead of silently redrawing —
 * which is the whole point of showing a breakdown rather than four numbers.
 */
export function StatusBreakdownBar({
  segments,
  className,
}: {
  segments: { key: string; value: number; barClassName: string }[];
  className?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className={classNames("flex h-2.5 overflow-hidden rounded-full bg-track", className)}>
      {segments.map((segment) => (
        <motion.div
          key={segment.key}
          className={`h-full ${segment.barClassName}`}
          initial={false}
          animate={{ width: total > 0 ? `${(segment.value / total) * 100}%` : "0%" }}
          transition={SETTLE}
        />
      ))}
    </div>
  );
}
