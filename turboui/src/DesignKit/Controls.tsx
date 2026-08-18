import * as React from "react";

import { DivLink } from "../Link";
import { ActiveIndicator, SNAP, motion } from "../Motion";
import classNames from "../utils/classnames";

/**
 * Tabs, segmented controls and filter chips.
 *
 * The active-state highlight in each of these is a shared-element morph rather
 * than a class swap: one indicator element unmounts and another mounts with the
 * same `layoutId`, and Motion slides between the two positions. That slide is
 * what tells you the two tabs belong to the same group — a highlight that
 * simply appears somewhere else does not.
 */

export interface UnderlineTab {
  id: string;
  label: React.ReactNode;
  count?: number;
  to?: string;
}

interface UnderlineTabsProps {
  tabs: UnderlineTab[];
  activeId: string;
  onSelect?: (id: string) => void;
  /** Must be unique per group of tabs on screen. */
  layoutId?: string;
  /** Rendered flush right on the same baseline as the tabs. */
  trailing?: React.ReactNode;
  className?: string;
}

export function UnderlineTabs({
  tabs,
  activeId,
  onSelect,
  layoutId = "underline-tabs",
  trailing,
  className,
}: UnderlineTabsProps) {
  return (
    <div className={classNames("flex items-center gap-1.5 border-b border-surface-outline", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <TabItem key={tab.id} tab={tab} isActive={tab.id === activeId} layoutId={layoutId} onSelect={onSelect} />
        ))}
      </div>
      {trailing && <div className="flex flex-shrink-0 items-center pb-2">{trailing}</div>}
    </div>
  );
}

function TabItem({
  tab,
  isActive,
  layoutId,
  onSelect,
}: {
  tab: UnderlineTab;
  isActive: boolean;
  layoutId: string;
  onSelect?: (id: string) => void;
}) {
  const classes = classNames(
    "relative -mb-px flex cursor-pointer items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm transition-colors",
    isActive ? "font-semibold text-content-strong" : "text-content-dimmed hover:text-content-strong",
  );

  const inner = (
    <>
      {tab.label}
      {/* A zero count is noise: the tab already tells you the section exists,
          and "0" next to every empty tab makes the row read as a scoreboard. */}
      {typeof tab.count === "number" && tab.count > 0 && (
        <span className={isActive ? "font-medium text-content-subtle" : "text-content-faint"}>{tab.count}</span>
      )}
      {isActive && <ActiveIndicator layoutId={layoutId} className="absolute inset-x-2 bottom-0 h-0.5 bg-primary" />}
    </>
  );

  if (tab.to) {
    return (
      <DivLink to={tab.to} className={classes} testId={`tab-${tab.id}`}>
        {inner}
      </DivLink>
    );
  }

  return (
    <div className={classes} onClick={() => onSelect?.(tab.id)} data-test-id={`tab-${tab.id}`}>
      {inner}
    </div>
  );
}

export interface SegmentOption {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  to?: string;
}

/**
 * The list / board style switch. Two or three mutually exclusive views of the
 * same data, always visible so the alternative is discoverable.
 */
export function SegmentedControl({
  options,
  activeId,
  onSelect,
  layoutId = "segmented-control",
  className,
}: {
  options: SegmentOption[];
  activeId: string;
  onSelect?: (id: string) => void;
  layoutId?: string;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "relative flex items-center overflow-hidden rounded-lg border border-line-strong",
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = option.id === activeId;

        const classes = classNames(
          "relative flex cursor-pointer items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 text-xs transition-colors",
          isActive ? "font-semibold text-content-strong" : "text-content-dimmed hover:text-content-strong",
        );

        const inner = (
          <>
            {isActive && <ActiveIndicator layoutId={layoutId} className="absolute inset-0 bg-surface-accent" />}
            <span className="relative flex items-center gap-1.5">
              {option.icon}
              {option.label}
            </span>
          </>
        );

        return option.to ? (
          <DivLink key={option.id} to={option.to} className={classes} testId={`segment-${option.id}`}>
            {inner}
          </DivLink>
        ) : (
          <div
            key={option.id}
            className={classes}
            onClick={() => onSelect?.(option.id)}
            role="tab"
            aria-selected={isActive}
            data-test-id={`segment-${option.id}`}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

/**
 * A rounded filter chip. Used for search facets, notification-interval choices
 * and any other small set of mutually exclusive options.
 */
export function Chip({
  children,
  active = false,
  onClick,
  bordered = false,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={onClick ? { scale: 0.96 } : undefined}
      transition={SNAP}
      className={classNames(
        "whitespace-nowrap rounded-full px-2.5 py-1 text-xs transition-colors",
        bordered && "border",
        active
          ? bordered
            ? "border-primary-soft-border bg-surface-base font-semibold text-content-strong"
            : "bg-surface-accent font-semibold text-content-strong"
          : bordered
            ? "border-surface-outline text-content-dimmed hover:bg-surface-accent"
            : "text-content-dimmed hover:bg-surface-accent",
        !onClick && "cursor-default",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
