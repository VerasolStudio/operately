import React from "react";
import { ActionList } from "../ActionList";
import { SecondaryButton } from "../Button";
import { DateField } from "../DateField";
import { GoalField } from "../GoalField";
import {
  IconCircleArrowRight,
  IconCircleCheck,
  IconCopy,
  IconFileExport,
  IconInfoCircle,
  IconPlayerPause,
  IconRotateDot,
  IconStack2,
  IconTrash,
} from "../icons";
import { LastCheckIn } from "../LastCheckIn";
import { PersonField } from "../PersonField";
import { PrivacyField } from "../PrivacyField";
import { Tooltip } from "../Tooltip";
import { SidebarNotificationSection, SidebarSection } from "../SidebarSection";
import { showSuccessToast, showErrorToast } from "../Toasts";
import { ProjectPage } from ".";
import { CheckInOverdueCallout } from "./CheckInOverdueCallout";
import { viewerCanPostCheckIn } from "./checkInPermissions";
import { t } from "../i18n";

export function OverviewSidebar(props: ProjectPage.State) {
  return (
    <div className="sm:col-span-4 sm:pl-8" data-test-id="overview-sidebar">
      <div className="space-y-6">
        <CheckInsSection {...props} />
        <ParentGoal {...props} />
        <ProjectDates {...props} />
      </div>

      <div className="space-y-6 pt-6 mt-6 border-t border-surface-outline">
        <Champion {...props} />
        <Reviewer {...props} />
        <Contributors {...props} />
        <Privacy {...props} />
      </div>

      <SidebarNotificationSection {...props.subscriptions} className="pt-6 mt-6 border-t border-surface-outline" />

      <div className="pt-6 mt-6 border-t border-surface-outline">
        <Actions {...props} />
      </div>
    </div>
  );
}

function CheckInsSection(props: ProjectPage.State) {
  const checkIns = props.checkIns || [];
  const isClosed = props.state === "closed";
  const lastCheckInState: "active" | "closed" | undefined = isClosed ? "closed" : "active";
  const viewerCanCheckIn = viewerCanPostCheckIn(props);
  const championFirstName = props.champion?.fullName?.split(" ")[0];

  let zeroStateCopy = "Weekly check-ins keep everyone in the loop. Updates will appear here.";

  if (isClosed) {
    zeroStateCopy = "This project is closed. Earlier check-ins stay available for reference.";
  } else if (viewerCanCheckIn) {
    zeroStateCopy = "Share the first update to set the project status and start the weekly cadence.";
  } else if (championFirstName) {
    zeroStateCopy = t("turboui.projectPage.hasnTSharedACheckIn", { v1: championFirstName });
  }

  const header = (
    <div className="flex items-center gap-2">
      <span>{t("turboui.projectPage.lastUpdate")}</span>
      {viewerCanCheckIn && (
        <span className="shrink-0">
          <SecondaryButton size="xxs" linkTo={props.newCheckInLink} testId="sidebar-check-in-button">
            {t("turboui.projectPage.checkIn")}
          </SecondaryButton>
        </span>
      )}
    </div>
  );

  return (
    <SidebarSection title={header} className="pt-4 sm:pt-0">
      <div className="space-y-3">
        <CheckInOverdueCallout {...props} variant="compact" />
        {checkIns.length > 0 ? (
          <LastCheckIn
            checkIns={checkIns}
            state={lastCheckInState}
            mentionedPersonLookup={props.richTextHandlers.mentionedPersonLookup}
            formattedTimePreferences={props.formattedTimePreferences}
          />
        ) : (
          <p className="text-sm text-content-dimmed">{zeroStateCopy}</p>
        )}
      </div>
    </SidebarSection>
  );
}

function ParentGoal(props: ProjectPage.State) {
  if (!props.parentGoal && !props.permissions.canEdit) {
    return null;
  }

  return (
    <SidebarSection title={t("turboui.projectPage.parentGoal")}>
      <GoalField
        testId="parent-goal-field"
        goal={props.parentGoal}
        setGoal={props.setParentGoal}
        searchGoals={props.parentGoalSearch}
        readonly={!props.permissions.canEdit}
        emptyStateMessage={t("turboui.projectPage.setParentGoal")}
        emptyStateReadOnlyMessage="No parent goal"
      />
    </SidebarSection>
  );
}

function ProjectDates(props: ProjectPage.State) {
  return (
    <div className="space-y-4">
      <SidebarSection title={t("turboui.projectPage.startDate")}>
        <DateField
          date={props.startedAt || null}
          onDateSelect={props.setStartedAt || (() => {})}
          readonly={!props.permissions.canEdit}
          placeholder={t("turboui.projectPage.setStartDate")}
          showOverdueWarning={false}
          useStartOfPeriod={true}
          testId="project-start-date"
        />
      </SidebarSection>
      <SidebarSection title={t("turboui.projectPage.dueDate")}>
        <DateField
          date={props.dueAt || null}
          onDateSelect={props.setDueAt || (() => {})}
          readonly={!props.permissions.canEdit}
          placeholder={t("turboui.projectPage.setDueDate")}
          testId="project-due-date"
          showOverdueWarning={props.state === "active"}
          showOverdueMessage={props.state === "active"}
        />
      </SidebarSection>
    </div>
  );
}

function Champion(props: ProjectPage.State) {
  const readonly = !props.permissions.hasFullAccess || !("setChampion" in props) || !("championSearch" in props);
  return (
    <SidebarSection
      title={
        <div className="flex items-center gap-2">
          <span>{t("turboui.projectPage.champion")}</span>
          <Tooltip
            content={
              <div className="max-w-xs">
                <div className="font-semibold mb-2">{t("turboui.projectPage.projectChampion")}</div>
                <div className="text-sm">{t("turboui.projectPage.theProjectOwnerAccountableForCompletion")}</div>
              </div>
            }
          >
            <IconInfoCircle className="w-4 h-4 text-content-dimmed cursor-help" />
          </Tooltip>
        </div>
      }
    >
      {readonly ? (
        <PersonField
          testId="champion-field"
          person={props.champion}
          readonly={true}
          emptyStateMessage={t("turboui.projectPage.setChampion")}
          emptyStateReadOnlyMessage="No champion"
        />
      ) : (
        <PersonField
          testId="champion-field"
          person={props.champion}
          setPerson={props.setChampion}
          searchData={props.championSearch}
          emptyStateMessage={t("turboui.projectPage.setChampion")}
          emptyStateReadOnlyMessage="No champion"
        />
      )}
    </SidebarSection>
  );
}

function Reviewer(props: ProjectPage.State) {
  const readonly = !props.permissions.hasFullAccess || !("setReviewer" in props) || !("reviewerSearch" in props);
  return (
    <SidebarSection
      title={
        <div className="flex items-center gap-2">
          <span>{t("turboui.projectPage.reviewer")}</span>
          <Tooltip
            content={
              <div className="max-w-xs">
                <div className="font-semibold mb-2">{t("turboui.projectPage.projectReviewer")}</div>
                <div className="text-sm">{t("turboui.projectPage.providesFeedbackThroughoutTheProjectAnd")}</div>
              </div>
            }
          >
            <IconInfoCircle className="w-4 h-4 text-content-dimmed cursor-help" />
          </Tooltip>
        </div>
      }
    >
      {readonly ? (
        <PersonField
          testId="reviewer-field"
          person={props.reviewer || null}
          readonly={true}
          emptyStateMessage={t("turboui.projectPage.setReviewer")}
          emptyStateReadOnlyMessage="No reviewer"
        />
      ) : (
        <PersonField
          testId="reviewer-field"
          person={props.reviewer || null}
          setPerson={props.setReviewer || (() => {})}
          searchData={props.reviewerSearch}
          emptyStateMessage={t("turboui.projectPage.setReviewer")}
          emptyStateReadOnlyMessage="No reviewer"
        />
      )}
    </SidebarSection>
  );
}

function Privacy(props: ProjectPage.State) {
  return (
    <SidebarSection title={t("turboui.projectPage.privacy")}>
      <PrivacyField
        testId="project-privacy-field"
        accessLevels={props.accessLevels}
        setAccessLevels={props.setAccessLevels}
        resourceType={"project"}
        readonly={!props.permissions.hasFullAccess}
      />
      {props.permissions.canEdit && props.manageAccessLink && (
        <div className="mt-3">
          <SecondaryButton linkTo={props.manageAccessLink} size="xs" testId="manage-project-access-button">
            {t("turboui.projectPage.manageTeamAccess")}
          </SecondaryButton>
        </div>
      )}
    </SidebarSection>
  );
}

function Contributors(props: ProjectPage.State) {
  const contributors = props.contributors.filter((c) => ![props.champion?.id, props.reviewer?.id].includes(c.id));

  return (
    <SidebarSection title={t("turboui.projectPage.contributors")}>
      <div className="space-y-3">
        {contributors.length > 0 ? (
          contributors.map((person: any) => (
            <PersonField key={person.id} person={person} readonly={true} showTitle={true} />
          ))
        ) : (
          <div className="text-sm text-content-dimmed">{t("turboui.projectPage.noContributors")}</div>
        )}
      </div>
    </SidebarSection>
  );
}

function Actions(props: ProjectPage.State) {
  const handleCopyURL = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.href);
      showSuccessToast(t("turboui.projectPage.success"), t("turboui.projectPage.projectURLCopiedToClipboard"));
    } catch {
      showErrorToast(t("turboui.projectPage.copyFailed"), t("turboui.projectPage.unableToCopyURLToClipboard"));
    }
  };

  const actions = [
    {
      type: "action" as const,
      label: t("turboui.projectPage.copyURL"),
      onClick: handleCopyURL,
      icon: IconCopy,
    },
    {
      type: "action" as const,
      label: t("turboui.projectPage.moveToAnotherSpace"),
      onClick: props.openMoveModal,
      icon: IconCircleArrowRight,
      hidden: !props.permissions.hasFullAccess || !("space" in props),
    },
    {
      type: "link" as const,
      label: t("turboui.projectPage.pauseProject"),
      link: props.pauseLink,
      icon: IconPlayerPause,
      testId: "pause-project",
      hidden: !props.permissions.canEdit || props.state === "closed" || props.state === "paused",
    },
    {
      type: "link" as const,
      label: t("turboui.projectPage.closeProject"),
      link: props.closeLink,
      icon: IconCircleCheck,
      testId: "close-project",
      hidden: !props.permissions.canEdit || props.state === "closed",
    },
    {
      type: "link" as const,
      label: t("turboui.projectPage.resumeProject"),
      link: props.reopenLink,
      icon: IconRotateDot,
      testId: "resume-project",
      hidden: !props.permissions.canEdit || props.state !== "paused",
    },
    {
      type: "action" as const,
      label: t("turboui.projectPage.exportAsMarkdown"),
      onClick: props.exportMarkdown,
      icon: IconFileExport,
      testId: "export-as-markdown",
      hidden: !props.exportMarkdown,
    },
    {
      type: "action" as const,
      label: t("turboui.projectPage.saveAsTemplate"),
      onClick: props.openSaveAsTemplateModal ?? (() => undefined),
      icon: IconStack2,
      testId: "save-project-as-template-action",
      hidden: !props.saveAsTemplate?.canSave,
    },
    {
      type: "action" as const,
      label: t("turboui.projectPage.delete"),
      onClick: props.openDeleteModal,
      icon: IconTrash,
      hidden: !props.permissions.hasFullAccess,
      danger: true,
    },
  ];

  const visibleActions = actions.filter((action) => !action.hidden);
  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <SidebarSection title={t("turboui.projectPage.actions")} testId="actions-section">
      <ActionList actions={visibleActions} />
    </SidebarSection>
  );
}

// Uses shared SidebarSection; callers can pass className/testId as needed
