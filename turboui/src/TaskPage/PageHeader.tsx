import React from "react";

import { TaskPage } from ".";
import { PrimaryButton } from "../Button";
import { IconCheck } from "../icons";
import { TextField } from "../TextField";
import { findCompletedStatus } from "../TaskBoard/utils/status";
import { TaskCheckbox } from "./TaskCheckbox";
import { PropertyBar } from "./PropertyBar";
import { t } from "../i18n";

/**
 * A task's own header, rendered inside the project page frame.
 *
 * The completion checkbox and the "Mark complete" button do the same thing on
 * purpose: the checkbox is the fast path for someone scanning, the button is
 * the obvious one for someone who has just finished reading the task.
 */
export function PageHeader(props: TaskPage.ContentState) {
  const completedStatus = findCompletedStatus(props.statusOptions || []);
  const isComplete = Boolean(props.status?.closed);

  return (
    <div>
      <div className="flex items-start gap-3" data-test-id="task-header">
        {completedStatus && (
          <div className="mt-1.5">
            <TaskCheckbox
              status={props.status}
              canEdit={props.canEdit}
              onComplete={() => props.onStatusChange(completedStatus)}
            />
          </div>
        )}

        <TextField
          className="flex-1 break-words text-2xl font-semibold leading-tight tracking-[-0.01em]"
          text={props.name}
          onChange={props.onNameChange}
          readonly={!props.canEdit}
          trimBeforeSave
          testId="task-name"
          multiline
        />

        {completedStatus && props.canEdit && !isComplete && (
          <PrimaryButton
            size="sm"
            icon={IconCheck}
            onClick={() => props.onStatusChange(completedStatus)}
            testId="complete-task"
          >
            {t("turboui.taskPage.markComplete")}
          </PrimaryButton>
        )}
      </div>

      <div className="mt-3">
        <PropertyBar {...props} />
      </div>
    </div>
  );
}
