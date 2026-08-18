import * as React from "react";

import {
  GlobalSearch,
  IconBell,
  IconBellCog,
  IconChecklist,
  IconHome2,
  IconInbox,
  IconListCheck,
  IconMap2,
  IconMessages,
  IconTarget,
  Sidebar as SidebarUI,
  SidebarCompanyHeader,
} from "turboui";

import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { OperatelyLogo } from "@/components/OperatelyLogo";
import { useMe } from "@/contexts/CurrentCompanyContext";
import { spaceColor } from "@/features/spaces/spaceColor";
import { useAssignmentsCount, useReviewRefreshSignal } from "@/models/assignments";
import * as Notifications from "@/models/notifications";
import { usePaths } from "@/routes/paths";
import { useCompanyLoaderData } from "@/routes/useCompanyLoaderData";
import { CompanyDropdown } from "./CompanyDropdown";
import { HelpDropdown } from "./HelpDropdown";
import { NewDropdown } from "./NewDropdown";
import { User } from "./User";
import { companySearchPathBuilder, useGlobalSearchHandler } from "./useGlobalSearch";

/**
 * Builds the sidebar's props from the company loader plus the two live counts
 * that drive its badges.
 *
 * The rail is deliberately the same on every page: people learn where things
 * are by them not moving. Anything page-specific belongs in the page header,
 * not here.
 */
export function CompanySidebar({ onOpenKeyboardShortcuts }: { onOpenKeyboardShortcuts: () => void }) {
  const paths = usePaths();
  const location = useLocation();
  const { t } = useTranslation();
  const me = useMe();
  const { company, spaces, canAddGoal, canAddProject } = useCompanyLoaderData();

  const unreadNotifications = Notifications.useUnreadCount();
  const [assignmentsCount, refetchAssignments] = useAssignmentsCount();
  useReviewRefreshSignal(refetchAssignments);

  // Home first: it is the page people return to between tasks, and the one
  // they reach for when they are not sure where to go. The two inboxes follow,
  // then the work itself.
  const primaryNav: SidebarUI.NavItem[] = [
    { id: "home", label: t("sidebar.home"), icon: IconHome2, to: paths.homePath(), testId: "home-link" },
    {
      id: "review",
      label: t("sidebar.todo"),
      icon: IconInbox,
      to: paths.reviewPath(),
      badge: { count: assignmentsCount, tone: "alert", testId: "review-link-count" },
      testId: "review-link",
    },
    {
      id: "notifications",
      label: t("sidebar.notifications"),
      icon: IconBell,
      to: paths.notificationsPath(),
      badge: { count: unreadNotifications, tone: "neutral", testId: "unread-notifications-count" },
      testId: "notifications-bell",
    },
    {
      id: "work-map",
      label: t("sidebar.workMap"),
      icon: IconMap2,
      iconClassName: "text-primary",
      to: paths.workMapPath(),
      testId: "company-work-map-link",
    },
  ];

  if (me) {
    primaryNav.push({
      id: "my-work",
      label: t("sidebar.myWork"),
      to: paths.profilePath(me.id!),
      nested: true,
    });
  }

  const spaceItems: SidebarUI.SpaceItem[] = [...spaces]
    .sort((a, b) => {
      // The company-wide space is everyone's default, so it stays pinned first.
      if (a.isCompanySpace) return -1;
      if (b.isCompanySpace) return 1;
      return (a.name ?? "").localeCompare(b.name ?? "");
    })
    .map((space) => ({
      id: space.id!,
      name: space.name!,
      to: paths.spacePath(space.id!),
      color: spaceColor(space),
      // Matches the hook the access-control feature tests use to assert that a
      // space an outside collaborator cannot see never appears in the rail.
      testId: `space-link-${slugify(space.name ?? "")}`,
      children: [
        {
          id: `${space.id}-goals`,
          label: t("sidebar.goals"),
          icon: IconTarget,
          iconClassName: "text-entity-goal",
          to: paths.spaceWorkMapPath(space.id!, "goals"),
        },
        {
          id: `${space.id}-projects`,
          label: t("sidebar.projects"),
          icon: IconChecklist,
          iconClassName: "text-entity-project",
          to: paths.spaceWorkMapPath(space.id!, "projects"),
        },
        {
          id: `${space.id}-tasks`,
          label: t("sidebar.tasks"),
          icon: IconListCheck,
          to: paths.spaceKanbanPath(space.id!),
        },
        // Documents live inside a resource hub whose id is not known until the
        // space itself is loaded, so the rail links to discussions instead and
        // leaves documents to the space page's own tools section.
        {
          id: `${space.id}-discussions`,
          label: t("sidebar.discussions"),
          icon: IconMessages,
          to: paths.spaceDiscussionsPath(space.id!),
        },
      ],
    }));

  // Company admin is reached from the company menu at the top of the rail,
  // alongside the other company-scoped destinations. Repeating it here gave
  // the same page two entry points a few hundred pixels apart, which makes
  // both of them look like they might lead somewhere different.
  const footerNav: SidebarUI.NavItem[] = [
    {
      id: "notification-settings",
      label: t("sidebar.notificationSettings"),
      icon: IconBellCog,
      to: paths.accountNotificationSettingsPath(),
    },
  ];

  return (
    <SidebarUI
      activePath={location.pathname}
      header={
        <CompanyDropdown
          company={company}
          customTrigger={
            <SidebarCompanyHeader
              logo={<OperatelyLogo />}
              name={company.name!}
              membersLabel={
                typeof company.memberCount === "number"
                  ? t("sidebar.memberCount", { count: company.memberCount })
                  : undefined
              }
            />
          }
        />
      }
      search={<SidebarSearch />}
      primaryAction={
        <NewDropdown
          canAddGoal={canAddGoal}
          canAddProject={canAddProject}
          canAddSpace={company.permissions?.canCreateSpace || false}
          canInvitePeople={company.permissions?.canInviteMembers || false}
          triggerClassName={CREATE_TRIGGER}
        />
      }
      primaryNav={primaryNav}
      spacesLabel={t("sidebar.spaces")}
      spaces={spaceItems}
      addSpace={
        company.permissions?.canCreateSpace ? { label: t("sidebar.addSpace"), to: paths.newSpacePath() } : undefined
      }
      footerNav={footerNav}
      footerExtra={
        // Help used to live in the top bar. It stays reachable here so nothing
        // became unavailable when that bar went away.
        <HelpDropdown
          company={company}
          onOpenKeyboardShortcuts={onOpenKeyboardShortcuts}
          triggerClassName={FOOTER_MENU_TRIGGER}
        />
      }
      user={{ name: me?.fullName ?? "", title: me?.title, to: me ? paths.profilePath(me.id!) : paths.accountPath() }}
      userAction={<User />}
    />
  );
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

/**
 * The create action reads as a button, not a nav row — bordered and in the
 * primary colour, but not filled. A solid blue block here would compete with
 * the filled "New" button that index pages already put in their header.
 */
const CREATE_TRIGGER =
  "flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary-soft-border bg-surface-base px-2.5 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-soft-bg";

/** Makes the help menu in the footer read as an ordinary sidebar row. */
const FOOTER_MENU_TRIGGER =
  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-content-muted hover:bg-sidebar-hover";

function SidebarSearch() {
  const navigate = useNavigate();
  const paths = usePaths();
  const { t } = useTranslation();
  const handleGlobalSearch = useGlobalSearchHandler();

  return (
    <GlobalSearch
      search={handleGlobalSearch}
      onNavigate={navigate}
      fullTextSearchPath={companySearchPathBuilder(paths)}
      placeholder={t("sidebar.search")}
      activatorClassName="w-full"
      testId="header-global-search"
    />
  );
}
