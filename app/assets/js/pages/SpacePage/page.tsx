import React from "react";

import * as Pages from "@/components/Pages";
import * as PageOptions from "@/components/PaperContainer/PageOptions";
import * as Companies from "@/models/companies";
import * as Spaces from "@/models/spaces";

import { Feed, useItemsQuery } from "@/features/Feed";
import {
  AvatarList,
  DangerButton,
  DesignKit,
  IconChartColumn,
  IconChevronRight,
  IconFiles,
  IconListCheck,
  IconMessages,
  IconPencil,
  IconSettings,
  IconStack2,
  IconTrash,
  Modal,
  PrimaryButton,
  SecondaryButton,
  showErrorToast,
  showSuccessToast,
  SpacePrivacyIndicator,
  WarningCallout,
} from "turboui";

import { useClearNotificationsOnLoad } from "@/features/notifications";
import { spaceColor } from "@/features/spaces/spaceColor";
import { useJoinSpace } from "@/models/spaces";
import { assertPresent } from "@/utils/assertions";

import { usePaths } from "@/routes/paths";
import { useCompanyLoaderData } from "@/routes/useCompanyLoaderData";
import { useNavigate } from "react-router";
import { useLoadedData, useRefresh } from "./loader";
import { SpaceWorkTable, statusCounts, useSpaceWorkRows } from "./WorkTable";
import { t } from "@/i18n";

/**
 * A space's home.
 *
 * The old page was a directory: a centred title, an avatar row, and a wall of
 * tool cards. The redesign leads with the space's work — the goals and
 * projects it owns, worst first — and demotes the tools to a sidebar, because
 * "what is happening here" is the question people open a space to answer, and
 * "where are the documents" is the one they can answer from the rail.
 */
export function Page() {
  const paths = usePaths();
  const { space, tools } = useLoadedData();

  useClearNotificationsOnLoad(space.notifications || []);

  const goals = tools.goals ?? [];
  const projects = tools.projects ?? [];
  const rows = useSpaceWorkRows(goals, projects);
  const counts = statusCounts(rows);

  return (
    <Pages.Page title={space.name!} testId="space-page">
      <div className="min-h-full bg-surface-base">
        <SpaceOptions />

        <DesignKit.PageHead
          align="start"
          crumbs={[{ label: t("sidebar.spaces"), to: paths.homePath() }, { label: space.name! }]}
          glyph={
            <span className="mt-0.5 flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-entity-neutral-bg">
              <DesignKit.SpaceDot color={spaceColor(space)} className="h-3 w-3 rounded" />
            </span>
          }
          title={space.name!}
          subtitle={
            <span className="inline-flex flex-wrap items-center gap-2">
              {space.mission}
              <SpacePrivacyIndicator accessLevels={space.accessLevels} iconSize={14} />
            </span>
          }
          actions={
            <>
              <AvatarList people={space.members ?? []} stacked size="small" maxElements={4} />
              <ManageAccessButton space={space} />
              <JoinButton space={space} />
            </>
          }
        />

        <DesignKit.PageColumns aside={<SpaceSidebar counts={counts} />}>
          <DesignKit.Section
            title={t("pages.spacePage.workInThisSpace")}
            note={t("pages.spacePage.workCounts", { goals: goals.length, projects: projects.length })}
            action={
              <a href={paths.spaceWorkMapPath(space.id!)} className="text-xs text-primary hover:underline">
                {t("pages.spacePage.openWorkMap")}
              </a>
            }
          >
            {rows.length > 0 ? (
              <SpaceWorkTable rows={rows} />
            ) : (
              <div className="rounded-xl border border-surface-outline px-4 py-6 text-center text-[13px] text-content-dimmed">
                {t("pages.spacePage.noWorkYet")}
              </div>
            )}
          </DesignKit.Section>

          <DesignKit.Section title={t("pages.spacePage.recentActivity")}>
            <SpaceActivity space={space} />
          </DesignKit.Section>
        </DesignKit.PageColumns>
      </div>
    </Pages.Page>
  );
}

function SpaceSidebar({ counts }: { counts: { status: string; count: number }[] }) {
  const paths = usePaths();
  const { company } = useCompanyLoaderData();
  const { space, tools } = useLoadedData();

  const showKpis = Companies.hasFeature(company, "space_kpis") && tools.kpisEnabled;
  const showTemplates = Companies.hasFeature(company, "project_templates") && tools.templatesEnabled;

  const documentCount = (tools.resourceHubs ?? []).length;
  const discussionCount = (tools.messagesBoards ?? []).reduce((sum, board) => sum + (board.messages?.length ?? 0), 0);
  const taskCount = (tools.tasks ?? []).length;

  const firstHub = (tools.resourceHubs ?? [])[0];

  return (
    <>
      {counts.length > 0 && (
        <DesignKit.Card>
          <DesignKit.MicroLabel className="mb-2.5">{t("pages.spacePage.stateOfThisSpace")}</DesignKit.MicroLabel>
          <div className="flex flex-col gap-2.5 text-[13px]">
            {counts.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between">
                <DesignKit.StatusLabel status={status} label={DesignKit.statusLabel(status)} size="sm" />
                <span className="font-semibold text-content-strong">{count}</span>
              </div>
            ))}
          </div>
        </DesignKit.Card>
      )}

      {tools.resourceHubEnabled && firstHub && (
        <ToolCard
          icon={<IconFiles size={20} className="text-content-label" />}
          title={t("sidebar.documents")}
          subtitle={t("pages.spacePage.hubCount", { count: documentCount })}
          to={paths.resourceHubPath(firstHub.id)}
        />
      )}

      {tools.discussionsEnabled && (
        <ToolCard
          icon={<IconMessages size={20} className="text-content-label" />}
          title={t("sidebar.discussions")}
          subtitle={t("pages.spacePage.discussionCount", { count: discussionCount })}
          to={paths.spaceDiscussionsPath(space.id!)}
        />
      )}

      {tools.tasksEnabled && (
        <ToolCard
          icon={<IconListCheck size={20} className="text-content-label" />}
          title={t("sidebar.tasks")}
          subtitle={t("pages.spacePage.taskCount", { count: taskCount })}
          to={paths.spaceKanbanPath(space.id!)}
        />
      )}

      {showKpis && (
        <ToolCard
          icon={<IconChartColumn size={20} className="text-content-label" />}
          title={t("features.spaceTools.kpis")}
          subtitle={t("pages.spacePage.kpiCount", { count: (tools.kpis ?? []).length })}
          to={paths.spaceKpisPath(space.id!)}
        />
      )}

      {showTemplates && (
        <ToolCard
          icon={<IconStack2 size={20} className="text-content-label" />}
          title={t("features.spaceTools.templates")}
          subtitle={t("pages.spacePage.templateCount", { count: (tools.templates ?? []).length })}
          to={paths.spaceProjectTemplatesPath(space.id!)}
        />
      )}
    </>
  );
}

function ToolCard({
  icon,
  title,
  subtitle,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  to: string;
}) {
  return (
    <DesignKit.Card to={to}>
      <div className="flex items-center gap-3">
        {icon}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-content-strong">{title}</div>
          <div className="text-xs text-content-subtle">{subtitle}</div>
        </div>
        <IconChevronRight size={16} className="text-content-faint" />
      </div>
    </DesignKit.Card>
  );
}

function SpaceActivity({ space }: { space: Spaces.Space }) {
  const { data, loading, error } = useItemsQuery("space", space.id!);

  if (loading) return <div className="text-[13px] text-content-dimmed">{t("pages.spacePage.loading")}</div>;
  if (error) return <div className="text-[13px] text-content-dimmed">{t("pages.spacePage.error")}</div>;

  return <Feed items={data?.activities || []} testId="space-feed" page="space" hideTopBorder />;
}

function JoinButton({ space }: { space: Spaces.Space }) {
  const refresh = useRefresh();
  const [join] = useJoinSpace();

  if (space.isMember) return null;

  const handleClick = async () => {
    await join({ spaceId: space.id });
    refresh();
  };

  return (
    <PrimaryButton size="sm" onClick={handleClick} testId="join-space-button">
      {t("pages.spacePage.joinThisSpace")}
    </PrimaryButton>
  );
}

function ManageAccessButton({ space }: { space: Spaces.Space }) {
  const paths = usePaths();
  const path = paths.spaceAccessManagementPath(space.id!);

  assertPresent(space.permissions, "permissions must be present in space");
  if (!space.permissions.hasFullAccess) return null;

  return (
    <SecondaryButton linkTo={path} size="sm" testId="access-management">
      {t("pages.spacePage.manageAccess")}
    </SecondaryButton>
  );
}

function SpaceOptions() {
  const { space, tools } = useLoadedData();
  const navigate = useNavigate();
  const [deleteSpace, { loading: isDeleting }] = Spaces.useDeleteSpace();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const resourceCounts = React.useMemo(() => {
    const projectCount = tools.projects?.length ?? 0;
    const goalCount = tools.goals?.length ?? 0;
    const messageCount = (tools.messagesBoards ?? []).reduce((sum, board) => sum + (board.messages?.length ?? 0), 0);

    return { projectCount, goalCount, messageCount };
  }, [tools]);

  const hasSubresources = React.useMemo(() => {
    return Object.values(resourceCounts).some((count) => count > 0);
  }, [resourceCounts]);

  const paths = usePaths();

  const performDelete = React.useCallback(async () => {
    try {
      await deleteSpace({ spaceId: space.id });
      showSuccessToast(t("pages.spacePage.spaceDeleted"), t("pages.spacePage.theSpaceAndItsContentWere"));
      navigate(paths.homePath());
    } catch (error) {
      console.error("Failed to delete space", error);
      showErrorToast(t("pages.spacePage.failedToDeleteSpace"), t("pages.spacePage.pleaseTryAgain"));
      throw error;
    }
  }, [deleteSpace, navigate, paths, space.id]);

  const handleDelete = React.useCallback(() => {
    if (isDeleting) return;

    if (hasSubresources) {
      setIsModalOpen(true);
      return;
    }

    performDelete();
  }, [hasSubresources, isDeleting, performDelete]);

  const handleConfirmDelete = React.useCallback(async () => {
    try {
      await performDelete();
      setIsModalOpen(false);
    } catch {
      // Error toast already shown in performDelete; keep modal open for another attempt.
    }
  }, [performDelete]);

  const handleCloseModal = React.useCallback(() => {
    if (!isDeleting) {
      setIsModalOpen(false);
    }
  }, [isDeleting]);

  const editLink = paths.spaceEditPath(space.id!);
  const toolsConfigLink = paths.spaceToolsConfigPath(space.id!);

  return (
    <>
      <PageOptions.Root testId="options-button">
        {space.permissions?.canEdit && (
          <PageOptions.Link
            keepOutsideOnBigScreen
            icon={IconPencil}
            to={editLink}
            title={t("pages.spacePage.edit")}
            testId="edit-space"
          />
        )}
        {space.permissions?.canEdit && (
          <PageOptions.Link
            icon={IconSettings}
            to={toolsConfigLink}
            title={t("pages.spacePage.configureTools")}
            testId="configure-tools"
          />
        )}
        {space.permissions?.hasFullAccess && !space.isCompanySpace && (
          <PageOptions.Action
            icon={IconTrash}
            title={t("pages.spacePage.delete")}
            onClick={handleDelete}
            testId="delete-space"
          />
        )}
      </PageOptions.Root>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={t("pages.spacePage.deleteSpace")}
        size="large"
        contentPadding="p-6"
        closeOnBackdropClick={!isDeleting}
      >
        <div className="space-y-4">
          <WarningCallout
            message={t("pages.spacePage.thisActionCannotBeUndone")}
            description={t("pages.spacePage.deletingThisSpaceWillPermanentlyRemove")}
          />

          <div className="flex justify-end gap-3">
            <SecondaryButton size="sm" onClick={handleCloseModal} disabled={isDeleting}>
              {t("pages.spacePage.cancel")}
            </SecondaryButton>
            <DangerButton size="sm" onClick={handleConfirmDelete} loading={isDeleting} testId="confirm-delete-space">
              {t("pages.spacePage.deleteEverything")}
            </DangerButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
