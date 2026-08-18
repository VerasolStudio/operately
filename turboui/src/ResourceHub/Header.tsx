import * as React from "react";

interface HeaderProps {
  title: string;
  /** Sub-line under the title: counts, last update. */
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * The heading of a resource hub or folder listing.
 *
 * The title used to be centred with the actions pushed to the far left, which
 * put the primary "New" button in the last place the eye looks. It now follows
 * the same shape as every other index screen: title left, actions right.
 */
export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em] text-content-strong">{title}</h1>
        {subtitle && <p className="mt-1.5 mb-0 text-[13px] text-content-dimmed">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
