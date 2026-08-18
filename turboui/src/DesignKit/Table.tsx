import * as React from "react";

import { DivLink } from "../Link";
import { GLIDE, motion, staggerDelay } from "../Motion";
import classNames from "../utils/classnames";

/**
 * The table used across the redesign's index screens.
 *
 * Deliberately not a generic data grid. It fixes the things that were
 * inconsistent before — header casing, column alignment, numeric alignment,
 * row height, divider colour — and leaves cell contents entirely to the caller.
 */

export interface Column {
  /** Rendered in the header. Leave empty for action columns. */
  label?: React.ReactNode;
  /** CSS width, e.g. "42%" or "120px". */
  width?: string;
  align?: "left" | "right";
  /** Hide below the `sm` breakpoint. Use for columns that are nice-to-have. */
  hideOnMobile?: boolean;
}

const alignClass = (align?: "left" | "right") => (align === "right" ? "text-right" : "text-left");

export function Table({
  columns,
  children,
  className,
  /** Bordered tables sit in a card; borderless ones sit directly on the page. */
  bordered = false,
}: {
  columns: Column[];
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  const table = (
    <table className={classNames("w-full table-fixed border-collapse", className)}>
      {columns.some((column) => column.label) && (
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                style={column.width ? { width: column.width } : undefined}
                className={classNames(
                  "border-b border-surface-outline py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-label",
                  alignClass(column.align),
                  index === 0 ? "pr-3 pl-0" : "px-3",
                  index === columns.length - 1 && column.align === "right" ? "pr-0" : "",
                  { "hidden sm:table-cell": column.hideOnMobile },
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>{children}</tbody>
    </table>
  );

  if (!bordered) return table;

  return <div className="overflow-hidden rounded-xl border border-surface-outline">{table}</div>;
}

interface RowProps {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  /** Tints the whole row — used to flag work that needs attention. */
  tone?: "default" | "warning";
  /** Position in the list, used to stagger the entrance. */
  index?: number;
  testId?: string;
}

export function Row({ children, to, onClick, tone = "default", index = 0, testId }: RowProps) {
  const interactive = Boolean(to || onClick);

  const handleClick = React.useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  return (
    <motion.tr
      className={classNames("border-b border-line-soft transition-colors", {
        "bg-status-caution-bg": tone === "warning",
        "cursor-pointer hover:bg-surface-highlight": interactive,
      })}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...GLIDE, delay: staggerDelay(index) }}
      onClick={to ? undefined : handleClick}
      data-test-id={testId}
    >
      {to ? <LinkedRowContent to={to}>{children}</LinkedRowContent> : children}
    </motion.tr>
  );
}

/**
 * A `<tr>` cannot contain an anchor that wraps its cells, so linked rows put
 * the link inside the first cell and let the rest of the row inherit the
 * pointer. Callers that need every cell clickable should use `onClick` with a
 * navigate call instead.
 */
function LinkedRowContent({ to, children }: { to: string; children: React.ReactNode }) {
  const cells = React.Children.toArray(children);
  const [first, ...rest] = cells;

  return (
    <>
      {React.isValidElement(first) ? (
        <Cell key="first" {...(first.props as CellProps)}>
          <DivLink to={to} className="block">
            {(first.props as CellProps).children}
          </DivLink>
        </Cell>
      ) : (
        first
      )}
      {rest}
    </>
  );
}

export interface CellProps {
  children?: React.ReactNode;
  align?: "left" | "right";
  /** Monospaced digit alignment for dates, percentages and counts. */
  numeric?: boolean;
  first?: boolean;
  last?: boolean;
  hideOnMobile?: boolean;
  className?: string;
}

export function Cell({ children, align, numeric, first, last, hideOnMobile, className }: CellProps) {
  return (
    <td
      className={classNames(
        "py-3 align-middle text-[13px] text-content-muted",
        alignClass(align),
        first ? "pr-3 pl-0" : "px-3",
        last && align === "right" ? "pr-0" : "",
        { "tabular-nums": numeric, "hidden sm:table-cell": hideOnMobile },
        className,
      )}
    >
      {children}
    </td>
  );
}

/**
 * The two-line cell used in the name column: a bold primary line and a muted
 * secondary line of context (space, owner, path).
 */
export function TitleCellContent({
  glyph,
  title,
  adornments,
  subtitle,
  indent = 0,
  leading,
  muted = false,
  strikethrough = false,
  emphasis = "medium",
}: {
  glyph?: React.ReactNode;
  /** The name itself. Kept separate from `adornments` so it can be truncated. */
  title: React.ReactNode;
  /** Badges and hover actions that sit after the name at their natural width. */
  adornments?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Nesting depth in a tree. Each level adds 26px, matching the design. */
  indent?: number;
  /** Rendered before the glyph — a chevron in tree views, a checkbox in lists. */
  leading?: React.ReactNode;
  muted?: boolean;
  strikethrough?: boolean;
  emphasis?: "medium" | "semibold";
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5" style={indent ? { paddingLeft: indent * 26 } : undefined}>
      {leading}
      {glyph}

      {/* `min-w-0` is repeated down the chain on purpose: a flex item defaults
          to `min-width: auto`, so a single missing one anywhere above the text
          stops the whole column from shrinking and the name overruns instead
          of ellipsing. */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={classNames("min-w-0 truncate text-sm", {
              "font-medium": emphasis === "medium",
              "font-semibold": emphasis === "semibold",
              "text-content-subtle": muted,
              "text-content-strong": !muted,
              "line-through": strikethrough,
            })}
          >
            {title}
          </span>
          {adornments}
        </div>

        {subtitle && <div className="mt-0.5 truncate text-xs text-content-subtle">{subtitle}</div>}
      </div>
    </div>
  );
}
