/**
 * ActionList Component
 *
 * A component for rendering a list of clickable actions with icons.
 * Typically used in sidebars to provide a set of actions for a resource.
 *
 * Features:
 * - Icon alignment with section titles
 * - Support for both links and action buttons
 * - Support for "danger" items (shown in red)
 * - Hover highlight that only covers the content area, not the full width
 * - Hidden items that aren't rendered
 */
import React from "react";
import { DivLink } from "../Link";

import classNames from "../utils/classnames";

namespace ActionList {
  export interface Item {
    type: "link" | "action";
    label: string;
    link?: string;
    onClick?: () => void;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    hidden?: boolean;
    danger?: boolean;
    testId?: string;
  }
}

export function ActionList({ actions }: { actions: ActionList.Item[] }) {
  const visibleItems = actions.filter((option) => !option.hidden);

  return (
    <div className="space-y-0.5 flex flex-col">
      {visibleItems.map((item, index) => (
        <ActionItem key={index} item={item} />
      ))}
    </div>
  );
}

function ActionItem({ item }: { item: ActionList.Item }) {
  const Icon = item.icon;

  const className = classNames(
    "flex items-center gap-2.5 py-1.5 px-2 text-[13px]",
    "cursor-pointer rounded-lg",
    "transition-colors duration-150",
    "-ml-2", // Pull the icon back into line with the labels above it
    "w-fit max-w-full",
    {
      "text-status-offtrack-content hover:bg-status-offtrack-bg": item.danger,
      "text-content-muted hover:bg-surface-accent hover:text-content-strong": !item.danger,
    },
  );

  if (item.type === "link" && item.link) {
    return (
      <DivLink to={item.link} className={className} testId={item.testId}>
        <Icon size={16} className="shrink-0" />
        <span>{item.label}</span>
      </DivLink>
    );
  }

  if (item.type === "action" && item.onClick) {
    return (
      <div onClick={item.onClick} className={className} data-test-id={item.testId}>
        <Icon size={16} className="shrink-0" />
        <span>{item.label}</span>
      </div>
    );
  }

  throw new Error("Invalid action option provided");
}
