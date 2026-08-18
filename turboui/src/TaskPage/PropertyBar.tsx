import React from "react";

import { TaskPage } from ".";
import { AssigneesField } from "../AssigneesField";
import { MilestoneField } from "../MilestoneField";
import { DateField } from "../DateField";
import { StatusSelector } from "../StatusSelector";
import { t } from "../i18n";

/**
 * The row of properties directly under a task's title.
 *
 * These four facts — status, who has it, when it is due, which milestone it
 * belongs to — are what someone opening a task checks first, and all four are
 * editable in place. Keeping them in a sidebar meant the answer to "is this
 * mine and when is it due" sat in the corner of the screen, in a column the
 * eye reaches last.
 *
 * The fields are the same components the sidebar used; only their labels are
 * gone, because each one is self-describing once it has a value and carries a
 * placeholder when it does not.
 */
export function PropertyBar({ statusOptions, ...props }: TaskPage.ContentState) {
  const isLargeScreen = true;

  return (
    <div className="flex flex-wrap items-center gap-2" data-test-id="task-properties">
      {statusOptions?.length > 0 && (
        <StatusSelector
          statusOptions={statusOptions}
          status={props.status ?? statusOptions[0]!}
          onChange={(nextStatus) => props.onStatusChange(nextStatus)}
          size={isLargeScreen ? "md" : "sm"}
          readonly={!props.canEdit}
          showFullBadge
          testId="task-status"
        />
      )}

      <AssigneesField
        people={props.assignees}
        setPeople={props.onAssigneesChange}
        readonly={!props.canEdit}
        searchData={props.assigneePersonSearch}
        emptyStateMessage={t("turboui.taskPage.assignTask")}
        emptyStateReadOnlyMessage={t("turboui.taskPage.noAssignees")}
        size="small"
        testId="assignee"
      />

      <DateField
        date={props.dueDate ?? null}
        onDateSelect={props.onDueDateChange}
        readonly={!props.canEdit}
        showOverdueWarning={!props.status?.closed}
        placeholder={t("turboui.taskPage.setDueDate")}
        calendarOnly
        size="small"
        testId="task-due-date"
      />

      {!props.hideMilestone && (
        <MilestoneField
          milestone={props.milestone}
          setMilestone={props.onMilestoneChange}
          readonly={!props.canEdit}
          milestones={props.milestones}
          onSearch={props.onMilestoneSearch}
          emptyStateMessage={t("turboui.taskPage.selectMilestone")}
          emptyStateReadOnlyMessage={t("turboui.taskPage.noMilestone")}
          formattedTimePreferences={props.formattedTimePreferences}
        />
      )}
    </div>
  );
}
