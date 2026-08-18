import * as React from "react";

import { IconChevronRight } from "../icons";
import { DivLink } from "../Link";
import { FadeIn } from "../Motion";
import { useHtmlTitle } from "../Page/useHtmlTitle";
import classNames from "../utils/classnames";

/**
 * Page chrome for the redesign.
 *
 * Every screen opens the same way: a breadcrumb trail, a 24px title, one line
 * of context, and the actions for this page on the right. Repeating that
 * exactly is what lets someone glance at any screen and immediately know where
 * they are and what they can do.
 */

/**
 * The outermost wrapper of a redesigned screen.
 *
 * The old `Page`/`PageNew` components floated a white card on a coloured
 * background. With the palette now white on white that card is just a shadow,
 * so screens run full-bleed instead and rely on the sidebar's border for the
 * only structural line on the page.
 */
export function Screen({
  title,
  children,
  testId,
  className,
}: {
  title: string | string[];
  children: React.ReactNode;
  testId?: string;
  className?: string;
}) {
  useHtmlTitle(title);

  return (
    <div className={classNames("min-h-full bg-surface-base", className)} data-test-id={testId}>
      {children}
    </div>
  );
}

export interface Crumb {
  label: string;
  to?: string;
  onClick?: () => void;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-content-label" aria-label="Breadcrumb">
      {items.map((crumb, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${crumb.label}-${index}`}>
            {isLast ? (
              <span className="font-medium text-content-strong">{crumb.label}</span>
            ) : crumb.to ? (
              <DivLink to={crumb.to} className="cursor-pointer hover:text-content-strong">
                {crumb.label}
              </DivLink>
            ) : (
              <span onClick={crumb.onClick} className={crumb.onClick ? "cursor-pointer hover:text-content-strong" : ""}>
                {crumb.label}
              </span>
            )}
            {!isLast && <IconChevronRight size={11} className="text-content-faint" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

interface PageHeadProps {
  crumbs?: Crumb[];
  title: React.ReactNode;
  /** One line of context under the title. Keep it factual, not decorative. */
  subtitle?: React.ReactNode;
  /** Square entity icon shown left of the title, e.g. a goal or project glyph. */
  glyph?: React.ReactNode;
  /** Status pills, owner, dates — the metadata strip under a detail-page title. */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  /** Detail pages align the title block to the top; index pages to the baseline. */
  align?: "start" | "end";
  className?: string;
}

export function PageHead({ crumbs, title, subtitle, glyph, meta, actions, align = "end", className }: PageHeadProps) {
  return (
    <header className={classNames("px-6 pt-6 sm:px-8", className)}>
      {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}

      <div
        className={classNames("mt-2 flex flex-wrap justify-between gap-x-6 gap-y-3", {
          "items-start": align === "start",
          "items-end": align === "end",
        })}
      >
        <div className="flex min-w-0 items-start gap-3">
          {glyph}
          <div className="min-w-0">
            <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em] text-content-strong">{title}</h1>
            {subtitle && <p className="mt-1.5 mb-0 text-[13px] text-content-dimmed">{subtitle}</p>}
            {meta && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[13px] text-content-dimmed">
                {meta}
              </div>
            )}
          </div>
        </div>

        {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/**
 * The body of a page. `width` mirrors the widths used in the design: reading
 * screens are narrow, tables are wide, dashboards sit in between.
 */
export function PageBody({
  children,
  width = "wide",
  className,
}: {
  children: React.ReactNode;
  width?: "narrow" | "reading" | "medium" | "wide" | "full";
  className?: string;
}) {
  const maxWidth = {
    narrow: "max-w-[640px]",
    reading: "max-w-[780px]",
    medium: "max-w-[880px]",
    wide: "max-w-[1080px]",
    full: "",
  }[width];

  return <div className={classNames("px-6 pt-5 pb-12 sm:px-8", maxWidth, className)}>{children}</div>;
}

/**
 * The two-column body used by the detail screens: content on the left, a
 * sidebar of facts and actions on the right. Collapses to one column below
 * `lg`, where the sidebar becomes a footer.
 */
export function PageColumns({ children, aside }: { children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-8 px-6 pt-6 pb-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
      <div className="flex min-w-0 flex-col gap-8">{children}</div>
      <aside className="flex flex-col gap-6">{aside}</aside>
    </div>
  );
}

/** The 11px uppercase label that titles a block of metadata. */
export function MicroLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={classNames("text-[11px] font-semibold uppercase tracking-[0.06em] text-content-label", className)}>
      {children}
    </div>
  );
}

interface SectionProps {
  title: React.ReactNode;
  /** Small grey text next to the title — counts, ratios, "期限が近い4件". */
  note?: React.ReactNode;
  /** Right-aligned control, usually a link or an "＋ 追加" button. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, note, action, children, className }: SectionProps) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="m-0 text-[15px] font-semibold text-content-strong">{title}</h2>
          {note && <span className="text-xs text-content-subtle">{note}</span>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * The bordered, rounded container that holds most lists in the redesign.
 *
 * Rows go inside as `PanelRow`; the panel clips them so the first and last row
 * pick up the rounded corners without every row needing to know its position.
 */
export function Panel({
  children,
  className,
  animate = false,
}: {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}) {
  const content = (
    <div className={classNames("overflow-hidden rounded-xl border border-surface-outline", className)}>{children}</div>
  );

  return animate ? <FadeIn>{content}</FadeIn> : content;
}

interface PanelRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  /**
   * `start` when the row can grow — a row whose content expands would otherwise
   * drag its leading icon down to the vertical middle of the expanded block.
   * Passing `items-start` through `className` does not work: Tailwind emits
   * `items-center` after `items-start`, so the base class wins regardless of
   * the order they appear in the class string.
   */
  align?: "center" | "start";
  className?: string;
  testId?: string;
}

export function PanelRow({ children, onClick, to, align = "center", className, testId }: PanelRowProps) {
  const classes = classNames(
    "group flex gap-3 border-b border-line-soft px-4 py-3 last:border-b-0 transition-colors",
    align === "start" ? "items-start" : "items-center",
    { "cursor-pointer hover:bg-surface-highlight": Boolean(onClick || to) },
    className,
  );

  if (to) {
    return (
      <DivLink to={to} className={classes} testId={testId}>
        {children}
      </DivLink>
    );
  }

  return (
    <div className={classes} onClick={onClick} data-test-id={testId}>
      {children}
    </div>
  );
}
