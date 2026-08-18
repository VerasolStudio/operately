import React from "react";

/**
 * The heading above a block inside a detail page.
 *
 * 15px semibold, matching every other section title in the redesign, with the
 * block's own controls sitting on the right rather than inline after the text —
 * an "Add" button that moves as the title's length changes is hard to aim at.
 */
export function SectionHeader({
  title,
  buttons,
  showButtons,
}: {
  title: string;
  buttons?: React.ReactNode;
  showButtons?: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="m-0 text-[15px] font-semibold text-content-strong">{title}</h2>
      {showButtons && buttons}
    </div>
  );
}
