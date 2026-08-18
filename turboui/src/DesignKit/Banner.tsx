import * as React from "react";

import { IconAlertTriangle, IconInfoCircle } from "../icons";
import { DivLink } from "../Link";
import { AnimatePresence, POP, motion } from "../Motion";
import classNames from "../utils/classnames";

/**
 * The "次にやること" banner that opens goal, project and task detail pages.
 *
 * This is the single most opinionated piece of the redesign: instead of making
 * someone read a whole page to work out what is wrong, the page states it in
 * one sentence and offers the one action that fixes it. If a page has nothing
 * urgent to say it renders no banner at all — a permanently present banner
 * stops being read within a week.
 */

export type BannerTone = "info" | "warning" | "danger";

const TONE: Record<BannerTone, { container: string; icon: string; lead: string; action: string }> = {
  info: {
    container: "border-banner-info-border bg-banner-info-bg",
    icon: "text-banner-info-content",
    lead: "text-banner-info-content",
    action: "border-banner-info-border text-banner-info-content hover:bg-primary-soft-bg",
  },
  warning: {
    container: "border-banner-warning-border bg-banner-warning-bg",
    icon: "text-banner-warning-content",
    lead: "text-banner-warning-content",
    action: "border-banner-warning-border text-banner-warning-content hover:bg-status-caution-bg",
  },
  danger: {
    container: "border-banner-danger-border bg-banner-danger-bg",
    icon: "text-banner-danger-content",
    lead: "text-banner-danger-content",
    action: "border-banner-danger-border text-banner-danger-content hover:bg-status-offtrack-bg",
  },
};

interface NextActionBannerProps {
  tone?: BannerTone;
  /** Bolded prefix, e.g. "次にやること：". */
  lead?: React.ReactNode;
  children: React.ReactNode;
  action?: { label: string; to?: string; onClick?: () => void };
  /** Makes the whole banner clickable. Use only when there is one obvious target. */
  onClick?: () => void;
  className?: string;
  testId?: string;
}

export function NextActionBanner({
  tone = "warning",
  lead,
  children,
  action,
  onClick,
  className,
  testId,
}: NextActionBannerProps) {
  const styles = TONE[tone];
  const Icon = tone === "info" ? IconInfoCircle : IconAlertTriangle;

  return (
    <motion.div
      className={classNames(
        "flex items-start gap-3 rounded-xl border px-3.5 py-3",
        styles.container,
        { "cursor-pointer": Boolean(onClick) },
        className,
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={POP}
      data-test-id={testId}
    >
      <Icon size={17} className={classNames("mt-px flex-shrink-0", styles.icon)} />

      <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-content-muted">
        {lead && <span className={classNames("font-semibold", styles.lead)}>{lead}</span>}
        {children}
      </div>

      {action && <BannerAction action={action} className={styles.action} />}
    </motion.div>
  );
}

function BannerAction({
  action,
  className,
}: {
  action: { label: string; to?: string; onClick?: () => void };
  className: string;
}) {
  const classes = classNames(
    "flex-shrink-0 whitespace-nowrap rounded-lg border bg-surface-base px-2.5 py-1.5 text-xs font-semibold transition-colors",
    className,
  );

  if (action.to) {
    return (
      <DivLink to={action.to} className={classes}>
        {action.label}
      </DivLink>
    );
  }

  return (
    <button type="button" className={classes} onClick={action.onClick}>
      {action.label}
    </button>
  );
}

/**
 * Wrap a conditionally rendered banner in this so it animates out when the
 * underlying problem is resolved, rather than vanishing mid-frame.
 */
export function BannerSlot({ children }: { children: React.ReactNode }) {
  return <AnimatePresence initial={false}>{children}</AnimatePresence>;
}
