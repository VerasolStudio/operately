import React from "react";

/**
 * The surface a page's content sits on.
 *
 * It used to be a shadowed, rounded card floating on a coloured background.
 * The redesign puts pages full-bleed on white, so this is now just the page
 * body — the sidebar's border is the only structural line left.
 */
export function Paper({ children, testId }: { children: React.ReactNode; testId?: string }) {
  return (
    <div className="relative" data-test-id={testId}>
      {children}
    </div>
  );
}
