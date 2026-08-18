import * as React from "react";

import { IconChevronRight, IconPlus, IconSelector, type IconProps } from "../icons";
import { DivLink } from "../Link";
import { ActiveIndicator, Expandable, SNAP, Swap, motion } from "../Motion";
import classNames from "../utils/classnames";
import { Initials, SpaceDot } from "../DesignKit/Entities";

/**
 * The application's left sidebar.
 *
 * The redesign moves navigation from a top bar into a persistent left rail.
 * The reason is capacity, not fashion: a top bar has room for four or five
 * destinations, so spaces — the thing people actually navigate between all
 * day — were buried behind a dropdown. A rail lists them all, keeps the
 * current one visible, and leaves the top of every page free for that page's
 * own title and actions.
 */
export namespace Sidebar {
  export interface Badge {
    count: number;
    /** `alert` is the red pill for overdue work; `neutral` for unread counts. */
    tone: "alert" | "neutral";
    testId?: string;
  }

  export interface NavItem {
    id: string;
    label: string;
    icon?: React.ComponentType<IconProps>;
    /** Tailwind colour class for the icon, when it should carry meaning. */
    iconClassName?: string;
    to: string;
    badge?: Badge;
    /** Renders smaller and indented, as a child of the item above it. */
    nested?: boolean;
    testId?: string;
  }

  export interface SpaceItem {
    id: string;
    name: string;
    to: string;
    /** Overrides the default `sidebar-space-<id>` hook. */
    testId?: string;
    /** Any CSS colour. Derived from the space id when the backend has none. */
    color: string;
    /** Tools inside the space — goals, projects, tasks, documents. */
    children?: NavItem[];
  }

  export interface Props {
    /** Usually `<SidebarCompanyHeader />` wrapped in the app's company menu. */
    header: React.ReactNode;
    /** The global-search trigger. Supplied by the app so the rail stays dumb. */
    search?: React.ReactNode;
    /**
     * The create action, sitting above the navigation.
     *
     * Making something is a different kind of act from going somewhere, so it
     * gets its own slot rather than a row in the list — and it goes at the top,
     * where the two things people arrive wanting to do (find work, add work)
     * are next to each other.
     */
    primaryAction?: React.ReactNode;
    primaryNav: NavItem[];
    spacesLabel: string;
    spaces: SpaceItem[];
    addSpace?: { label: string; to: string };
    footerNav: NavItem[];
    /** Extra footer entries the app owns — help and "new" menus. */
    footerExtra?: React.ReactNode;
    user: { name: string; title?: string | null; to: string };
    /** Current pathname, used to decide which item is active. */
    activePath: string;
    /** Rendered at the very bottom of the sidebar, e.g. a notifications bell. */
    userAction?: React.ReactNode;
  }
}

/** Every highlight in the rail shares this id so it slides between items. */
const NAV_HIGHLIGHT = "sidebar-active-item";

export function Sidebar(props: Sidebar.Props) {
  return (
    <div className="flex h-full flex-col bg-sidebar-bg">
      {props.header}

      {props.search && <div className="px-3 pb-2">{props.search}</div>}
      {props.primaryAction && <div className="px-3 pb-2.5">{props.primaryAction}</div>}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-0.5 px-3 py-1.5">
          {props.primaryNav.map((item) => (
            <NavRow key={item.id} item={item} activePath={props.activePath} />
          ))}
        </nav>

        <div className="px-[22px] pt-3.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-content-subtle">
          {props.spacesLabel}
        </div>

        <nav className="flex flex-col gap-0.5 px-3 pb-2">
          {props.spaces.map((space) => (
            <SpaceRow key={space.id} space={space} activePath={props.activePath} />
          ))}

          {props.addSpace && (
            <DivLink
              to={props.addSpace.to}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-content-subtle transition-colors hover:bg-sidebar-hover"
              testId="sidebar-add-space"
            >
              <IconPlus size={15} />
              {props.addSpace.label}
            </DivLink>
          )}
        </nav>
      </div>

      <div className="flex-shrink-0 border-t border-surface-outline px-3 py-2">
        {props.footerNav.map((item) => (
          <NavRow key={item.id} item={item} activePath={props.activePath} small />
        ))}
        {props.footerExtra}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2.5 border-t border-surface-outline p-3">
        <Initials name={props.user.name} size="md" />
        <DivLink to={props.user.to} className="min-w-0 flex-1" testId="sidebar-profile">
          <div className="truncate text-[13px] font-medium leading-tight text-content-strong">{props.user.name}</div>
          {props.user.title && <div className="truncate text-[11px] text-content-subtle">{props.user.title}</div>}
        </DivLink>
        {props.userAction}
      </div>
    </div>
  );
}

/**
 * The identity block at the top of the rail: logo, company name, member count.
 *
 * Exported separately so the app can wrap it in whatever menu it wants without
 * turboui needing to know what a company switcher contains.
 */
export function SidebarCompanyHeader({
  logo,
  name,
  membersLabel,
}: {
  logo: React.ReactNode;
  name: string;
  membersLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-[18px] pt-4 pb-3.5 transition-colors hover:bg-sidebar-hover">
      <span className="flex-shrink-0">{logo}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-tight text-content-strong">{name}</span>
        {membersLabel && <span className="block text-[11px] leading-snug text-content-subtle">{membersLabel}</span>}
      </span>
      <IconSelector size={15} className="flex-shrink-0 text-content-faint" />
    </div>
  );
}

function isActive(activePath: string, to: string): boolean {
  if (!to) return false;

  const [path] = to.split("?");
  if (!path) return false;

  return activePath === path;
}

function NavRow({ item, activePath, small = false }: { item: Sidebar.NavItem; activePath: string; small?: boolean }) {
  const active = isActive(activePath, item.to);

  return (
    <DivLink
      to={item.to}
      testId={item.testId}
      className={classNames(
        "relative flex items-center gap-2.5 rounded-lg transition-colors",
        item.nested ? "py-1.5 pr-2.5 pl-7 text-[13px]" : "px-2.5 py-2 text-sm",
        small && !item.nested && "text-[13px]",
        active ? "font-semibold text-content-strong" : "font-medium text-content-muted hover:bg-sidebar-hover",
      )}
    >
      {active && (
        <ActiveIndicator
          layoutId={NAV_HIGHLIGHT}
          className="absolute inset-0 rounded-lg bg-sidebar-active shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
        />
      )}

      <span className="relative flex min-w-0 flex-1 items-center gap-2.5">
        {item.icon && (
          <item.icon
            size={item.nested ? 14 : 18}
            className={classNames("flex-shrink-0", item.iconClassName ?? "text-content-dimmed")}
          />
        )}
        <span className="truncate">{item.label}</span>
      </span>

      {item.badge && item.badge.count > 0 && <NavBadge badge={item.badge} />}
    </DivLink>
  );
}

function NavBadge({ badge }: { badge: Sidebar.Badge }) {
  return (
    <span
      className={classNames(
        "relative min-w-[20px] rounded-full px-1.5 py-px text-center text-[11px] font-semibold leading-[1.4]",
        badge.tone === "alert" ? "bg-badge-alert text-white-1" : "bg-sidebar-hover text-content-muted",
      )}
      data-test-id={badge.testId}
    >
      {/* Swapping on the count means a number that changes while you are
          looking at it visibly ticks over instead of silently replacing
          itself — the difference between noticing new work and not. */}
      <Swap swapKey={badge.count}>{badge.count}</Swap>
    </span>
  );
}

function SpaceRow({ space, activePath }: { space: Sidebar.SpaceItem; activePath: string }) {
  const hasChildren = Boolean(space.children && space.children.length > 0);

  const containsActive =
    isActive(activePath, space.to) || (space.children ?? []).some((child) => isActive(activePath, child.to));

  const [expanded, setExpanded] = React.useState(containsActive);

  // Opening the space you just navigated into is the expected behaviour;
  // collapsing the others is not, so this only ever expands.
  React.useEffect(() => {
    if (containsActive) setExpanded(true);
  }, [containsActive]);

  const active = isActive(activePath, space.to);

  return (
    <div>
      <div className="relative flex items-center">
        <DivLink
          to={space.to}
          className={classNames(
            "relative flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors",
            active ? "font-semibold text-content-strong" : "text-content-muted hover:bg-sidebar-hover",
          )}
          testId={space.testId ?? `sidebar-space-${space.id}`}
        >
          {active && (
            <ActiveIndicator layoutId={NAV_HIGHLIGHT} className="absolute inset-0 rounded-lg bg-sidebar-active" />
          )}
          <span className="relative flex min-w-0 items-center gap-2.5">
            <SpaceDot color={space.color} />
            <span className="truncate text-sm">{space.name}</span>
          </span>
        </DivLink>

        {hasChildren && (
          <button
            type="button"
            aria-label={expanded ? `Collapse ${space.name}` : `Expand ${space.name}`}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className="relative rounded p-1 text-content-faint transition-colors hover:bg-sidebar-hover hover:text-content-muted"
          >
            <motion.span className="block" animate={{ rotate: expanded ? 90 : 0 }} transition={SNAP}>
              <IconChevronRight size={14} />
            </motion.span>
          </button>
        )}
      </div>

      {hasChildren && (
        <Expandable open={expanded}>
          <div className="flex flex-col gap-0.5 pt-0.5">
            {space.children!.map((child) => (
              <NavRow key={child.id} item={{ ...child, nested: true }} activePath={activePath} />
            ))}
          </div>
        </Expandable>
      )}
    </div>
  );
}
