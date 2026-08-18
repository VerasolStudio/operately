import React from "react";

import Api, { Activity, WorkMapItem } from "@/api";
import { PageModule } from "@/routes/types";

import * as Pages from "@/components/Pages";
import * as Companies from "@/models/companies";
import * as Spaces from "@/models/spaces";
import { getWorkMap } from "@/models/workMap";
import { t } from "@/i18n";

export default { name: "HomePage", loader, Page } as PageModule;

import { useMe } from "@/contexts/CurrentCompanyContext";
import { AddWorkButton } from "@/features/workMap/AddWorkButton";
import { Feed, useItemsQuery } from "@/features/Feed";
import { spaceColor } from "@/features/spaces/spaceColor";
import { listAssignments, type ReviewAssignmentGroup } from "@/models/assignments";
import { includesId, usePaths } from "@/routes/paths";
import { CompanyDashboardPage, SecondaryButton, showErrorToast } from "turboui";
import { Navigate } from "react-router";
import { aggregateBySpace, collectAttentionItems, collectStatusCounts } from "./dashboardData";
import { canDeleteFeedItems } from "./feedPermissions";
import { shouldOpenCompanyWorkMap } from "./firstRun";
import { SpacesZeroState } from "./SpacesZeroState";

interface LoaderData {
  company: Companies.Company;
  spaces: Spaces.Space[];
  adminIds: string[];
  ownerIds: string[];
  workMap: WorkMapItem[];
  assignments: { dueSoon: ReviewAssignmentGroup[]; needsReview: ReviewAssignmentGroup[] };
}

async function loader(): Promise<LoaderData> {
  const company = await Companies.getCompany({
    includeOwners: true,
    includeAdmins: true,
    includePermissions: true,
  }).then((d) => d.company);

  // The dashboard is built entirely from the work map plus the viewer's own
  // assignments, so both are loaded up front rather than trickling in.
  const [spaces, workMap, assignments] = await Promise.all([
    Spaces.getSpaces({ includeAccessLevels: true }),
    getWorkMap({}).then((data) => data.workMap),
    listAssignments({}).catch(() => ({ dueSoon: [], needsReview: [], upcoming: [] })),
  ]);

  return {
    company,
    spaces,
    workMap,
    assignments: { dueSoon: assignments.dueSoon ?? [], needsReview: assignments.needsReview ?? [] },
    adminIds: company.admins?.map((a) => a.id) || [],
    ownerIds: company.owners?.map((o) => o.id) || [],
  };
}

function useLoadedData(): LoaderData {
  return Pages.useLoadedData() as LoaderData;
}

function Page() {
  const paths = usePaths();
  const { company, spaces, workMap, assignments } = useLoadedData();
  const isOwner = useIsOwner();

  if (
    shouldOpenCompanyWorkMap({
      isOwner,
      setupCompleted: company.setupCompleted,
      hasWorkItems: workMap.length > 0,
    })
  ) {
    return <Navigate to={paths.workMapPath()} replace />;
  }

  const { statusCounts, total } = collectStatusCounts(workMap);
  const spaceAggregates = aggregateBySpace(workMap);

  const attention: CompanyDashboardPage.AttentionItem[] = collectAttentionItems(workMap).map(
    ({ item, daysUntilDue }) => ({
      id: item.id,
      name: item.name,
      type: item.type === "project" ? "project" : "goal",
      spaceName: item.space?.name ?? null,
      ownerName: item.owner?.fullName ?? null,
      reason: attentionReason(item, daysUntilDue),
      status: item.status,
      dueLabel: formatShortDate(item.timeframe?.contextualEndDate?.date),
      link: item.itemPath,
    }),
  );

  const spaceStats: CompanyDashboardPage.SpaceStat[] = spaces
    .map((space) => {
      const aggregate = spaceAggregates.get(space.id!) ?? { itemCount: 0, onTrackCount: 0, lateCount: 0 };

      return {
        id: space.id!,
        name: space.name!,
        color: spaceColor(space),
        itemCount: aggregate.itemCount,
        onTrackPercentage: aggregate.itemCount > 0 ? (aggregate.onTrackCount / aggregate.itemCount) * 100 : 0,
        lateCount: aggregate.lateCount,
        link: paths.spacePath(space.id!),
      };
    })
    // A space with nothing in flight has nothing to report; listing it would
    // pad the table with rows that are all zeroes.
    .filter((space) => space.itemCount > 0)
    .sort((a, b) => b.lateCount - a.lateCount || b.itemCount - a.itemCount);

  const todoAssignments = [...assignments.dueSoon, ...assignments.needsReview].flatMap((group) => group.assignments);

  return (
    <CompanyDashboardPage
      title={t("turboui.companyDashboard.title")}
      companyName={company.name!}
      subtitle={t("pages.homePage.dashboardSubtitle", {
        date: formatToday(),
        count: total,
      })}
      actions={
        <>
          <SecondaryButton linkTo={paths.workMapPath()} size="sm">
            {t("pages.homePage.openWorkMap")}
          </SecondaryButton>
          <AddWorkButton />
        </>
      }
      statusCounts={statusCounts}
      attention={attention}
      spaces={spaceStats}
      todo={{
        count: todoAssignments.length,
        overdueCount: todoAssignments.filter((assignment) => assignment.dueStatus === "overdue").length,
        link: paths.reviewPath(),
      }}
      workMapLink={paths.workMapPath()}
      feed={<ActivityFeed />}
      emptyState={spaces.length === 0 ? <SpacesZeroState /> : undefined}
    />
  );
}

function attentionReason(item: WorkMapItem, daysUntilDue: number | null): string {
  if (daysUntilDue !== null && daysUntilDue < 0) {
    return t("pages.homePage.reasonOverdue", { count: Math.abs(daysUntilDue) });
  }

  if (item.status === "paused") return t("pages.homePage.reasonPaused");
  if (item.nextStep) return item.nextStep;

  return t("pages.homePage.reasonNeedsReview");
}

function formatShortDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
}

function formatToday(): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date());
}

function ActivityFeed() {
  const { company } = useLoadedData();
  const { data, loading, error } = useItemsQuery("company", company.id!);
  const canDelete = useCanDeleteFeedItems();
  const [deleteActivity] = Api.companies.useDeleteActivity();
  const [activities, setActivities] = React.useState(data?.activities || []);

  React.useEffect(() => {
    setActivities(data?.activities || []);
  }, [data?.activities]);

  const handleDeleteActivity = async (activity: Activity) => {
    if (!activity.id) return;

    try {
      await deleteActivity({ activityId: activity.id });
      setActivities((activities) => activities.filter((item) => item.id !== activity.id));
    } catch {
      showErrorToast(t("pages.homePage.couldNotDeleteFeedItem"), t("pages.homePage.pleaseTryAgain"));
    }
  };

  if (loading) return <ActivityFeedSkeleton />;
  if (error) return <div className="text-[13px] text-content-dimmed">{t("pages.homePage.error")}</div>;

  return (
    <Feed
      items={activities}
      testId="company-feed"
      page="company"
      hideTopBorder
      canDeleteItems={canDelete}
      onDeleteItem={handleDeleteActivity}
    />
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="flex animate-pulse gap-2.5">
          <div className="h-6 w-6 flex-shrink-0 rounded-full bg-surface-dimmed" />
          <div className="w-full">
            <div className="mb-1 h-3 w-3/4 rounded bg-surface-dimmed" />
            <div className="h-2 w-1/2 rounded bg-surface-dimmed" />
          </div>
        </div>
      ))}
    </div>
  );
}

function useIsOwner() {
  const { ownerIds } = useLoadedData();
  const me = useMe();

  // `useMe` is typed as nullable and genuinely returns null when this renders
  // outside the company provider — which a hot reload can cause in dev. The
  // old non-null assertion turned that into a crashed page; not being able to
  // prove you are the owner is the right answer when we do not know who you
  // are, and it only costs the first-run redirect.
  if (!me?.id) return false;

  return includesId(ownerIds, me.id);
}

function useCanDeleteFeedItems() {
  const { adminIds, ownerIds } = useLoadedData();

  const me = useMe();
  return canDeleteFeedItems({ personId: me?.id, adminIds, ownerIds });
}
