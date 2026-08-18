import * as React from "react";

import { IconChecklist, IconFlag, IconListCheck, IconTarget } from "../icons";
import classNames from "../utils/classnames";

/**
 * The small square glyph that marks what kind of thing a row refers to.
 *
 * Goals are red targets, projects are blue checklists, milestones are flags,
 * tasks are neutral lists. Once that mapping is consistent everywhere, a
 * mixed list of work becomes scannable without reading a single word.
 */

export type EntityKind = "goal" | "project" | "milestone" | "task" | "neutral";

const ENTITY_STYLES: Record<EntityKind, { surface: string; content: string; Icon: typeof IconTarget }> = {
  goal: { surface: "bg-entity-goal-bg", content: "text-entity-goal", Icon: IconTarget },
  project: { surface: "bg-entity-project-bg", content: "text-entity-project", Icon: IconChecklist },
  milestone: { surface: "bg-status-offtrack-bg", content: "text-status-offtrack", Icon: IconFlag },
  task: { surface: "bg-entity-neutral-bg", content: "text-entity-neutral", Icon: IconListCheck },
  neutral: { surface: "bg-entity-neutral-bg", content: "text-entity-neutral", Icon: IconListCheck },
};

const GLYPH_SIZES = {
  sm: { box: "h-[22px] w-[22px] rounded-md", icon: 13 },
  md: { box: "h-[26px] w-[26px] rounded-lg", icon: 14 },
  lg: { box: "h-[34px] w-[34px] rounded-[9px]", icon: 19 },
};

export function EntityGlyph({
  kind,
  size = "sm",
  className,
}: {
  kind: EntityKind;
  size?: keyof typeof GLYPH_SIZES;
  className?: string;
}) {
  const style = ENTITY_STYLES[kind];
  const dimensions = GLYPH_SIZES[size];

  return (
    <span
      className={classNames(
        "inline-flex flex-shrink-0 items-center justify-center",
        dimensions.box,
        style.surface,
        style.content,
        className,
      )}
    >
      <style.Icon size={dimensions.icon} />
    </span>
  );
}

/** The coloured square that identifies a space in the sidebar and in tables. */
export function SpaceDot({ color, className }: { color?: string; className?: string }) {
  return (
    <span
      className={classNames("h-2 w-2 flex-shrink-0 rounded-[3px]", !color && "bg-primary", className)}
      style={color ? { background: color } : undefined}
    />
  );
}

const INITIALS_SIZES = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-[22px] w-[22px] text-[9px]",
  md: "h-7 w-7 text-[10px]",
  lg: "h-8 w-8 text-[11px]",
  xl: "h-12 w-12 text-base",
};

/**
 * A person, reduced to their initials.
 *
 * The redesign uses initials rather than photos in dense lists: at 22px a
 * photo is unrecognisable anyway, and a grid of grey circles is noisier than a
 * grid of letters.
 */
export function Initials({
  name,
  size = "sm",
  className,
  title,
}: {
  name: string | null | undefined;
  size?: keyof typeof INITIALS_SIZES;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title ?? name ?? undefined}
      className={classNames(
        "inline-flex flex-shrink-0 items-center justify-center rounded-full bg-avatar-bg font-semibold text-avatar-content",
        INITIALS_SIZES[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();

  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Overlapping initials, with a "+N" chip once the list runs past `max`. */
export function InitialsStack({
  names,
  max = 3,
  size = "sm",
  className,
}: {
  names: (string | null | undefined)[];
  max?: number;
  size?: keyof typeof INITIALS_SIZES;
  className?: string;
}) {
  const shown = names.slice(0, max);
  const overflow = names.length - shown.length;

  return (
    <div className={classNames("flex items-center", className)}>
      {shown.map((name, index) => (
        <Initials
          key={`${name}-${index}`}
          name={name}
          size={size}
          className={classNames("border-2 border-surface-base", index > 0 && "-ml-1.5")}
        />
      ))}
      {overflow > 0 && (
        <span
          className={classNames(
            "-ml-1.5 inline-flex flex-shrink-0 items-center justify-center rounded-full border-2 border-surface-base bg-surface-accent font-semibold text-content-muted",
            INITIALS_SIZES[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

/**
 * The label/value pairs in a detail page's sidebar. Labels stay small and
 * grey; values align right so the column of answers reads as a column.
 */
export function MetaList({ children }: { children: React.ReactNode }) {
  return <dl className="m-0 flex flex-col gap-3.5">{children}</dl>;
}

export function MetaItem({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs text-content-label">{label}</dt>
      <dd className="m-0 text-right text-[13px] text-content-strong">{children}</dd>
    </div>
  );
}
