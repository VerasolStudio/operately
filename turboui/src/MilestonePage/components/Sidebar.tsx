import React from "react";
import * as Types from "../../TaskBoard/types";
import { DateField } from "../../DateField";
import { AvatarWithName } from "../../Avatar";
import { GhostButton, SecondaryButton } from "../../Button";
import {
  IconCalendar,
  IconCheck,
  IconLink,
  IconTrash,
  IconFlagFilled,
  IconFlag,
  IconCircleCheckFilled,
} from "../../icons";
import FormattedTime, { type FormattedTimePreferences } from "../../FormattedTime";
import { MilestonePage } from "..";
import { SidebarSection, SidebarNotificationSection } from "../../SidebarSection";
import { showSuccessToast, showErrorToast } from "../../Toasts";
import { launchConfetti } from "../../utils/confetti";
import { t } from "../../i18n";

export function MilestoneSidebar({
  milestone,
  status,
  onDueDateChange,
  onStatusChange,
  createdBy,
  createdAt,
  subscriptions,
  openDeleteModal,
  permissions,
  formattedTimePreferences,
}: MilestonePage.State) {
  return (
    <div>
      <div className="flex flex-col gap-5" data-test-id="sidebar">
        <SidebarDueDate
          milestone={milestone}
          onDueDateChange={onDueDateChange}
          canEdit={permissions.canEdit || false}
        />
        <SidebarStatus status={status} onStatusChange={onStatusChange} canEdit={permissions.canEdit || false} />
        {milestone.completedAt && milestone.status === "done" && (
          <SidebarCompletedOn completedAt={milestone.completedAt} formattedTimePreferences={formattedTimePreferences} />
        )}
        {createdBy && (
          <SidebarCreatedBy
            createdBy={createdBy}
            createdAt={createdAt}
            formattedTimePreferences={formattedTimePreferences}
          />
        )}
        <SidebarNotificationSection {...subscriptions} />
        <SidebarActions onDelete={openDeleteModal} canEdit={permissions.canEdit || false} />
      </div>
    </div>
  );
}

function SidebarDueDate({
  milestone,
  onDueDateChange,
  canEdit,
}: {
  milestone: Types.Milestone;
  onDueDateChange?: (dueDate: DateField.ContextualDate | null) => void;
  canEdit: boolean;
}) {
  // Don't show overdue warning if milestone is completed
  const showOverdueWarning = milestone.status !== "done";

  return (
    <SidebarSection title={t("turboui.milestonePage.dueDate")}>
      <DateField
        date={milestone.dueDate || null}
        onDateSelect={(date) => {
          if (onDueDateChange) {
            onDueDateChange(date);
          }
        }}
        readonly={!canEdit}
        showOverdueWarning={showOverdueWarning}
        placeholder={t("turboui.milestonePage.setDueDate")}
        testId="milestone-due-date"
        calendarOnly
      />
    </SidebarSection>
  );
}

function SidebarStatus({
  status,
  onStatusChange,
  canEdit,
}: {
  status: MilestonePage.Status;
  onStatusChange: (status: MilestonePage.Status) => void;
  canEdit: boolean;
}) {
  const isCompleted = status === "done";

  const handleStatusToggle = () => {
    // Toggle the completion status (stored as any property for demo)
    const newStatus = isCompleted ? "pending" : "done";
    if (newStatus === "done") {
      launchConfetti();
    }
    onStatusChange(newStatus);
  };

  if (!canEdit) {
    return (
      <SidebarSection title={t("turboui.milestonePage.milestoneStatus")}>
        <div className="flex items-center gap-2 text-sm">
          {isCompleted ? (
            <>
              <IconFlagFilled size={16} className="text-accent-1" />
              <span className="text-accent-1 font-medium">{t("turboui.milestonePage.completed")}</span>
            </>
          ) : (
            <>
              <IconFlag size={16} className="text-content-dimmed" />
              <span className="text-content-base">{t("turboui.milestonePage.active")}</span>
            </>
          )}
        </div>
      </SidebarSection>
    );
  }

  return (
    <SidebarSection title={t("turboui.milestonePage.milestoneStatus")} testId="sidebar-status">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          {isCompleted ? (
            <>
              <IconFlagFilled size={16} className="text-accent-1" />
              <span className="text-accent-1 font-medium">{t("turboui.milestonePage.completed")}</span>
            </>
          ) : (
            <>
              <IconFlag size={16} className="text-content-dimmed" />
              <span className="text-content-base">{t("turboui.milestonePage.active")}</span>
            </>
          )}
        </div>
        {isCompleted ? (
          <SecondaryButton size="xs" onClick={handleStatusToggle}>
            {t("turboui.milestonePage.reopen")}
          </SecondaryButton>
        ) : (
          <GhostButton size="xs" icon={IconCheck} onClick={handleStatusToggle}>
            {t("turboui.milestonePage.markComplete")}
          </GhostButton>
        )}
      </div>
    </SidebarSection>
  );
}

function SidebarCompletedOn({
  completedAt,
  formattedTimePreferences,
}: {
  completedAt: Date;
  formattedTimePreferences: FormattedTimePreferences;
}) {
  return (
    <SidebarSection title={t("turboui.milestonePage.completedOn")}>
      <div className="flex items-center gap-1.5 text-sm">
        <IconCircleCheckFilled size={16} className="text-accent-1" />
        <FormattedTime {...formattedTimePreferences} time={completedAt} format="short-date" />
      </div>
    </SidebarSection>
  );
}

function SidebarCreatedBy({
  createdBy,
  createdAt,
  formattedTimePreferences,
}: {
  createdBy: MilestonePage.Person;
  createdAt: Date;
  formattedTimePreferences: FormattedTimePreferences;
}) {
  return (
    <SidebarSection title={t("turboui.milestonePage.created")}>
      <div className="space-y-2 text-sm">
        <AvatarWithName person={createdBy} size="tiny" nameFormat="short" link={createdBy.profileLink} />
        <div className="flex items-center gap-1.5 ml-1 text-content-dimmed text-xs">
          <IconCalendar size={14} />
          <FormattedTime {...formattedTimePreferences} time={createdAt} format="short-date" />
        </div>
      </div>
    </SidebarSection>
  );
}

function SidebarActions({ onDelete, canEdit }: { onDelete?: () => void; canEdit: boolean }) {
  const handleCopyURL = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccessToast(t("turboui.milestonePage.success"), t("turboui.milestonePage.milestoneURLCopiedToClipboard"));
    } catch {
      showErrorToast(t("turboui.milestonePage.copyFailed"), t("turboui.milestonePage.unableToCopyURLToClipboard"));
    }
  };

  const actions = [
    {
      label: t("turboui.milestonePage.copyURL"),
      onClick: handleCopyURL,
      icon: IconLink,
      show: true,
    },
    {
      label: t("turboui.milestonePage.delete"),
      onClick: onDelete,
      icon: IconTrash,
      show: canEdit && !!onDelete,
      danger: true,
    },
  ].filter((action) => action.show);

  if (actions.length === 0) return null;

  return (
    <SidebarSection title={t("turboui.milestonePage.actions")}>
      <div className="space-y-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center gap-2 text-xs hover:bg-surface-highlight rounded px-2 py-1 -mx-2 w-full text-left ${
              action.danger ? "text-content-error hover:bg-red-50" : ""
            }`}
          >
            <action.icon size={16} className={action.danger ? "text-content-error" : "text-content-dimmed"} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </SidebarSection>
  );
}
