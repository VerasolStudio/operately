import React from "react";
import classNames from "../utils/classnames";

import { match } from "ts-pattern";
import { GoalPage } from ".";
import { ActionList } from "../ActionList";
import { Avatar } from "../Avatar";
import { SecondaryButton } from "../Button";
import { WarningCallout } from "../Callouts";
import { DateField } from "../DateField";
import { GoalField } from "../GoalField";
import { LastCheckIn } from "../LastCheckIn";
import { DivLink } from "../Link";
import { PersonField } from "../PersonField";
import { PrivacyField } from "../PrivacyField";
import { Summary } from "../RichContent";
import { SidebarSection } from "../SidebarSection";
import { StatusBadge } from "../StatusBadge";
import { Tooltip } from "../Tooltip";
import { durationHumanized, isOverdue } from "../utils/time";

import {
  IconCircleArrowRight,
  IconCircleCheck,
  IconFileExport,
  IconInfoCircle,
  IconRotateDot,
  IconTrash,
  IconUserCheck,
  IconUserStar,
} from "../icons";
import { t } from "../i18n";
import { uiLocale } from "../utils/formatting";

export function Sidebar(props: GoalPage.State) {
  return (
    <div className="sm:col-span-4 space-y-6 hidden sm:block sm:pl-8" data-test-id="sidebar">
      <Retrospective {...props} />
      <CompletedOn {...props} />
      <CheckInsSection {...props} />
      <ParentGoal {...props} />
      <StartDate {...props} />
      <DueDate {...props} />
      <Champion {...props} />
      <Reviewer {...props} />
      <Privacy {...props} />
      <Actions {...props} />
    </div>
  );
}

function StartDate(props: GoalPage.State) {
  const isReadonly = !props.permissions.canEdit || !!props.closedAt;
  const testId = isReadonly ? "start-date-field-readonly" : "start-date-field";

  return (
    <SidebarSection title={t("turboui.goalPage.startDate")}>
      <DateField
        date={props.startDate}
        onDateSelect={props.setStartDate}
        placeholder={t("turboui.goalPage.setDate")}
        readonly={isReadonly}
        testId={testId}
        useStartOfPeriod
      />
    </SidebarSection>
  );
}

function DueDate(props: GoalPage.State) {
  const isReadonly = !props.permissions.canEdit || !!props.closedAt;
  const testId = isReadonly ? "due-date-field-readonly" : "due-date-field";

  return (
    <SidebarSection title={t("turboui.goalPage.dueDate")}>
      <DateField
        date={props.dueDate}
        onDateSelect={props.setDueDate}
        placeholder={t("turboui.goalPage.setDate")}
        readonly={isReadonly}
        showOverdueWarning={!props.closedAt}
        testId={testId}
      />

      <OverdueWarning {...props} />
    </SidebarSection>
  );
}

function CompletedOn(props: GoalPage.State) {
  if (!props.closedAt) return null;

  return (
    <SidebarSection title={t("turboui.goalPage.completedOn")}>
      <DateField
        date={{
          date: props.closedAt,
          dateType: "day",
          value: new Intl.DateTimeFormat(uiLocale(), { year: "numeric", month: "short", day: "numeric" }).format(
            props.closedAt,
          ),
        }}
        readonly
        showOverdueWarning={false}
      />
    </SidebarSection>
  );
}

function ParentGoal(props: GoalPage.State) {
  if (!props.parentGoal && !props.permissions.canEdit) {
    return null;
  }

  return (
    <SidebarSection title={t("turboui.goalPage.parentGoal")}>
      <GoalField
        testId="parent-goal-field"
        goal={props.parentGoal}
        setGoal={props.setParentGoal}
        searchGoals={props.parentGoalSearch}
        readonly={!props.permissions.canEdit}
        emptyStateMessage={t("turboui.goalPage.setParentGoal")}
        emptyStateReadOnlyMessage="No parent goal"
      />
    </SidebarSection>
  );
}

function Champion(props: GoalPage.State) {
  const readonly = !props.permissions.hasFullAccess;
  const testId = readonly ? "champion-field-readonly" : "champion-field";

  return (
    <SidebarSection
      title={
        <div className="flex items-center gap-2">
          <span>{t("turboui.goalPage.champion")}</span>
          <Tooltip
            content={
              <div className="max-w-xs">
                <div className="font-semibold mb-2">{t("turboui.goalPage.goalChampion")}</div>
                <div className="text-sm">{t("turboui.goalPage.theGoalOwnerAccountableForCompletion")}</div>
              </div>
            }
          >
            <IconInfoCircle className="w-4 h-4 text-content-dimmed cursor-help" />
          </Tooltip>
        </div>
      }
    >
      <PersonField
        testId={testId}
        person={props.champion}
        setPerson={props.setChampion}
        readonly={readonly}
        searchData={props.championSearch}
        emptyStateMessage={t("turboui.goalPage.setChampion")}
        emptyStateReadOnlyMessage="No champion"
        extraDialogMenuOptions={[
          {
            label: t("turboui.goalPage.assignAsReviewer"),
            onClick: () => {
              props.setReviewer(props.champion!);
              props.setChampion(null);
            },
            icon: IconUserCheck,
          },
        ]}
      />
    </SidebarSection>
  );
}

function Reviewer(props: GoalPage.State) {
  const readonly = !props.permissions.hasFullAccess;
  const testId = readonly ? "reviewer-field-readonly" : "reviewer-field";

  return (
    <SidebarSection
      title={
        <div className="flex items-center gap-2">
          <span>{t("turboui.goalPage.reviewer")}</span>
          <Tooltip
            content={
              <div className="max-w-xs">
                <div className="font-semibold mb-2">{t("turboui.goalPage.goalReviewer")}</div>
                <div className="text-sm">{t("turboui.goalPage.providesFeedbackThroughoutTheGoalAnd")}</div>
              </div>
            }
          >
            <IconInfoCircle className="w-4 h-4 text-content-dimmed cursor-help" />
          </Tooltip>
        </div>
      }
    >
      <PersonField
        testId={testId}
        person={props.reviewer}
        setPerson={props.setReviewer}
        readonly={readonly}
        searchData={props.reviewerSearch}
        emptyStateMessage={t("turboui.goalPage.setReviewer")}
        emptyStateReadOnlyMessage="No reviewer"
        extraDialogMenuOptions={[
          {
            label: t("turboui.goalPage.assignAsChampion"),
            onClick: () => {
              props.setReviewer(null);
              props.setChampion(props.reviewer!);
            },
            icon: IconUserStar,
          },
        ]}
      />
    </SidebarSection>
  );
}

function CheckInsSection(props: GoalPage.State) {
  const checkIns = props.checkIns || [];
  const isClosed = props.state === "closed";
  const lastCheckInState: "active" | "closed" | undefined = isClosed ? "closed" : "active";
  const viewerCanCheckIn = props.permissions.canEdit && !isClosed;
  const isChampion = !!props.currentUser?.id && !!props.champion?.id && props.currentUser.id === props.champion.id;
  const championFirstName = props.champion?.fullName?.split(" ")[0];

  let zeroStateCopy = "Monthly check-ins keep everyone in the loop. Updates will appear here.";

  if (isClosed) {
    zeroStateCopy = "This goal is closed. Earlier check-ins stay available for reference.";
  } else if (viewerCanCheckIn && isChampion) {
    zeroStateCopy = "Share the first update to set the goal status and start the monthly cadence.";
  } else if (championFirstName) {
    zeroStateCopy = t("turboui.goalPage.hasnTSharedACheckIn", { v1: championFirstName });
  }

  const header = (
    <div className="flex items-center gap-2">
      <span>{t("turboui.goalPage.lastUpdate")}</span>
      {viewerCanCheckIn && (
        <span className="shrink-0">
          <SecondaryButton size="xxs" linkTo={props.newCheckInLink} testId="sidebar-check-in-button">
            {t("turboui.goalPage.checkIn")}
          </SecondaryButton>
        </span>
      )}
    </div>
  );

  return (
    <SidebarSection title={header}>
      <div className="space-y-3">
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

function Retrospective(props: GoalPage.State) {
  if (props.state !== "closed") return null;
  if (!props.retrospective) return null;

  const retro = props.retrospective;

  const borderColor = match(props.status)
    .with("achieved", () => "border-green-500")
    .with("missed", () => "border-red-500")
    .with("dropped", () => "border-gray-500")
    .with("partial", () => "border-yellow-500")
    .run();

  const className = classNames(
    "flex gap-1 flex-col",
    "cursor-pointer text-sm py-3 pl-3 pr-4",
    "border-l-4",
    "bg-zinc-50 dark:bg-zinc-800",
    "hover:bg-zinc-100 dark:hover:bg-zinc-700",
    borderColor,
  );

  return (
    <div className="text-sm">
      <DivLink to={retro.link} className={className}>
        <div className="flex items-center font-semibold">{t("turboui.goalPage.goalRetrospective")}</div>

        <Summary
          content={retro.content}
          characterCount={130}
          mentionedPersonLookup={props.richTextHandlers.mentionedPersonLookup}
        />

        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar person={retro.author} size={20} />
            {retro.author.fullName.split(" ")[0]}
          </div>
          <StatusBadge status={props.status} hideIcon className="scale-95 inline-block shrink-0 align-[5px]" />
        </div>
      </DivLink>
    </div>
  );
}

function OverdueWarning(props: GoalPage.State) {
  if (props.state === "closed") return null;
  if (!props.dueDate) return null;
  if (!isOverdue(props.dueDate.date)) return null;

  const duration = durationHumanized(props.dueDate.date, new Date());

  return (
    <div className="mt-2">
      <WarningCallout message={`Overdue by ${duration}.`} />
    </div>
  );
}

function Privacy(props: GoalPage.State) {
  return (
    <SidebarSection title={t("turboui.goalPage.privacy")}>
      <PrivacyField
        testId="goal-privacy-field"
        accessLevels={props.accessLevels}
        setAccessLevels={props.setAccessLevels}
        resourceType={"goal"}
        readonly={!props.permissions.canEdit}
      />
      {props.permissions.hasFullAccess && props.manageAccessLink && (
        <div className="mt-3">
          <SecondaryButton linkTo={props.manageAccessLink} size="xs" testId="manage-goal-access-button">
            {t("turboui.goalPage.manageAccess")}
          </SecondaryButton>
        </div>
      )}
    </SidebarSection>
  );
}

function Actions(props: GoalPage.State) {
  const hasSpace = "space" in props;

  const actions = [
    {
      type: "link" as const,
      label: t("turboui.goalPage.closeGoal"),
      link: props.closeLink,
      icon: IconCircleCheck,
      hidden: !props.permissions.canEdit || props.state === "closed",
      testId: "close-goal-button",
    },
    {
      type: "link" as const,
      label: t("turboui.goalPage.reOpenGoal"),
      link: props.reopenLink,
      icon: IconRotateDot,
      hidden: !props.permissions.canEdit || props.state !== "closed",
      testId: "reopen-goal-button",
    },
    {
      type: "action" as const,
      label: t("turboui.goalPage.moveToAnotherSpace"),
      onClick: props.openMoveModal,
      icon: IconCircleArrowRight,
      hidden: !props.permissions.hasFullAccess || !hasSpace,
      testId: "move-to-another-space",
    },
    {
      type: "action" as const,
      label: t("turboui.goalPage.exportAsMarkdown"),
      onClick: props.exportMarkdown,
      icon: IconFileExport,
      testId: "export-as-markdown",
      hidden: !props.exportMarkdown,
    },
    {
      type: "action" as const,
      label: t("turboui.goalPage.delete"),
      onClick: props.openDeleteModal,
      icon: IconTrash,
      hidden: !props.permissions.hasFullAccess,
      danger: true,
      testId: "delete-goal-button",
    },
  ];

  const visibleCount = actions.filter((action) => !action.hidden).length;
  if (visibleCount === 0) {
    return null;
  }

  return (
    <div className="border-t pt-4 border-stroke-base">
      <ActionList actions={actions} />
    </div>
  );
}
