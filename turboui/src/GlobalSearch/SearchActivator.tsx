import * as React from "react";

import { IconSearch } from "../icons";

interface SearchActivatorProps {
  placeholder: string;
  onActivate: () => void;
  testId?: string;
  /** Overrides the default fixed width. The sidebar wants a full-width trigger. */
  className?: string;
}

export function SearchActivator({ placeholder, onActivate, testId, className }: SearchActivatorProps) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className={
        "flex items-center gap-2 rounded-lg border border-surface-outline bg-surface-base px-2.5 py-1.5 text-[13px] text-content-subtle transition hover:border-line-strong " +
        (className ?? "w-[250px]")
      }
      data-test-id={testId ? `${testId}-activator` : undefined}
    >
      <IconSearch size={15} className="text-content-subtle" />
      <span className="flex-1 text-left truncate">{placeholder}</span>
      <span className="rounded border border-surface-outline px-1 text-[11px] text-content-faint">⌘K</span>
    </button>
  );
}
