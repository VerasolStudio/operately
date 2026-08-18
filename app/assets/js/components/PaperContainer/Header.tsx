import * as React from "react";

import classNames from "classnames";
import { usePaperSizeHelpers } from "./";

type LayoutType = "title-left-actions-right" | "title-center-actions-left";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  underline?: boolean;
  /**
   * Retained so existing callers keep compiling. Both values now render the
   * same way: a centred title with its primary action pushed to the far left
   * put the most important button in the last place the eye looks.
   */
  layout?: LayoutType;
}

/**
 * The heading of a page rendered inside `Paper.Root`.
 *
 * Matches the redesign's page header — 24px semibold title on the left, one
 * line of context under it, actions on the right — so screens that still use
 * the paper chrome open the same way as the rewritten ones.
 */
export function Header(props: Props) {
  const { negHor, horPadding } = usePaperSizeHelpers();

  const className = classNames("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", {
    "mb-5": !props.underline,
    "mb-6 pb-4 border-b border-surface-outline": props.underline,
    [negHor]: props.underline,
    [horPadding]: props.underline,
  });

  return (
    <div className={className}>
      <div className="min-w-0">
        <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em] text-content-strong">{props.title}</h1>
        {props.subtitle && <p className="mt-1.5 mb-0 text-[13px] text-content-dimmed">{props.subtitle}</p>}
      </div>

      {props.actions && <div className="flex flex-shrink-0 items-center gap-2">{props.actions}</div>}
    </div>
  );
}
