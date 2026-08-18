import React from "react";

import { PrimaryButton, SecondaryButton } from "../../Button";
import { DateField } from "../../DateField";
import { EntityGlyph } from "../../DesignKit/Entities";
import { MicroLabel } from "../../DesignKit/Layout";
import { dueNote } from "../../DesignKit/dueDate";
import { IconCheck } from "../../icons";
import { AnimatedBar } from "../../Motion";
import { TextField } from "../../TextField";
import { launchConfetti } from "../../utils/confetti";
import { t } from "../../i18n";
import classNames from "../../utils/classnames";

interface Props {
  title: string;
  canEdit: boolean;
  status: string;
  dueDate: DateField.ContextualDate | null;
  completedTasks: number;
  totalTasks: number;
  onMilestoneTitleChange: (title: string) => void;
  onStatusChange: (status: "done" | "pending") => void;
}

/**
 * The milestone's own header.
 *
 * A milestone is a date with tasks hanging off it, so the header leads with
 * the two things that decide whether it is in trouble: how the date is going,
 * and how many of its tasks are finished. The progress bar underneath makes
 * the ratio readable without counting.
 */
export function Header({
  title,
  canEdit,
  status,
  dueDate,
  completedTasks,
  totalTasks,
  onMilestoneTitleChange,
  onStatusChange,
}: Props) {
  const isCompleted = status === "done";
  const note = isCompleted ? null : dueNote(dueDate?.date);
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const toggleStatus = () => {
    if (!canEdit) return;

    if (!isCompleted) launchConfetti();
    onStatusChange(isCompleted ? "pending" : "done");
  };

  return (
    <div data-test-id="milestone-header">
      <div className="flex items-start gap-3">
        <EntityGlyph kind="milestone" size="lg" className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <TextField
            className="break-words text-2xl font-semibold leading-tight tracking-[-0.01em]"
            text={title}
            onChange={onMilestoneTitleChange}
            readonly={!canEdit}
            trimBeforeSave
            testId="milestone-name-input"
          />

          <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[13px] text-content-dimmed">
            {note && (
              <span
                className={classNames(
                  "inline-flex items-center gap-1.5 whitespace-nowrap font-medium",
                  note.overdue ? "text-status-offtrack-content" : "text-content-dimmed",
                )}
              >
                <span
                  className={classNames(
                    "h-2 w-2 rounded-full",
                    note.overdue ? "bg-status-offtrack" : "bg-status-pending",
                  )}
                />
                {note.label}
              </span>
            )}

            {dueDate && (
              <span className="whitespace-nowrap">{t("turboui.milestonePage.dueOn", { date: dueDate.value })}</span>
            )}

            {totalTasks > 0 && (
              <span className="whitespace-nowrap">
                {t("turboui.milestonePage.tasksProgress", { completed: completedTasks, total: totalTasks })}
              </span>
            )}
          </div>
        </div>

        {canEdit &&
          (isCompleted ? (
            <SecondaryButton size="sm" onClick={toggleStatus}>
              {t("turboui.milestonePage.reopen")}
            </SecondaryButton>
          ) : (
            <PrimaryButton size="sm" icon={IconCheck} onClick={toggleStatus} testId="complete-milestone">
              {t("turboui.milestonePage.markComplete")}
            </PrimaryButton>
          ))}
      </div>

      {totalTasks > 0 && (
        <div className="mt-4">
          <MicroLabel className="sr-only">{t("turboui.milestonePage.progress")}</MicroLabel>
          <AnimatedBar percentage={percentage} heightClassName="h-1.5" barClassName="bg-status-ontrack" />
        </div>
      )}
    </div>
  );
}
