import React from "react";

import classnames from "classnames";

import { usePaperSizeHelpers } from "./";

/**
 * A quieter band at the foot of a page — activity feeds, older items.
 *
 * It bleeds out to the page's horizontal padding so the tint reads as a
 * section of the page rather than a box floating inside it.
 */
export function DimmedSection(props: { children: React.ReactNode }) {
  const { negHor, horPadding } = usePaperSizeHelpers();

  const className = classnames("mt-8 border-t border-surface-outline bg-surface-accent py-8", negHor, horPadding);

  return <div className={className}>{props.children}</div>;
}
