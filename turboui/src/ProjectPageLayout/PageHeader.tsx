import React from "react";

import { ProjectPageLayout } from ".";
import { EntityGlyph } from "../DesignKit/Entities";
import { PageHead } from "../DesignKit/Layout";
import { StatusLabel, statusLabel } from "../DesignKit/Status";
import { dueNote } from "../DesignKit/dueDate";
import { DivLink } from "../Link";
import { PrivacyIndicator } from "../PrivacyIndicator";
import { TextField } from "../TextField";
import { t } from "../i18n";

/**
 * Header for the project, milestone and task pages.
 *
 * Task completion moved from a pill into the metadata line as plain text.
 * The pie chart looked like a control and read like decoration: at 14px it
 * cannot show the difference between 60% and 70%, which is exactly the
 * distinction the number next to it makes for free.
 */
export function PageHeader(props: ProjectPageLayout.Props) {
  const isTemplate = props.mode === "template";

  const crumbs =
    "space" in props
      ? [
          { label: props.space.name, to: props.space.link },
          {
            label: isTemplate
              ? t("turboui.projectPageLayout.projectTemplates")
              : t("turboui.projectPageLayout.projects"),
            to: isTemplate ? props.projectTemplatesLink || props.workmapLink : props.workmapLink,
          },
        ]
      : [{ label: t("turboui.projectPageLayout.home"), to: props.homeLink }];

  const isInviteOnly = props.accessLevels?.company === "no_access" && props.accessLevels?.space === "no_access";
  const due = props.dueDate ? dueNote(props.dueDate.date) : null;
  const isClosed = props.state === "closed";

  return (
    <PageHead
      align="start"
      crumbs={crumbs}
      glyph={<EntityGlyph kind="project" size="lg" className="mt-0.5" />}
      title={
        <span className="flex items-center gap-2">
          <TextField
            className="text-2xl font-semibold tracking-[-0.01em]"
            text={props.projectName}
            onChange={props.updateProjectName}
            readonly={!props.permissions.canEdit}
            trimBeforeSave
            testId="project-name-field"
          />

          {!isTemplate && isInviteOnly && (
            <PrivacyIndicator
              privacyLevel="secret"
              resourceType="project"
              spaceName={"space" in props ? props.space.name : ""}
              iconSize={16}
              testId="privacy-indicator"
            />
          )}

          {isTemplate && (
            <span className="inline-flex rounded-full border border-primary-soft-border bg-primary-soft-bg px-2 py-0.5 text-xs font-medium text-primary-soft-content">
              {t("turboui.projectPageLayout.template")}
            </span>
          )}
        </span>
      }
      meta={
        <>
          {/* "active" is a lifecycle state, not a health status, and has no
              label of its own — printing the raw enum is worse than omitting
              it. Paused and closed get their own banner above the tabs. */}
          {!isTemplate && props.status && props.status !== "active" && (
            <StatusLabel status={props.status} label={statusLabel(props.status)} />
          )}

          {props.taskCompletion && props.taskCompletion.totalCount > 0 && (
            <span className="whitespace-nowrap">
              {t("turboui.projectPageLayout.tasksProgress", {
                completed: props.taskCompletion.completedCount,
                total: props.taskCompletion.totalCount,
              })}
            </span>
          )}

          {props.dueDate && (
            <span className="whitespace-nowrap">
              {t("turboui.projectPageLayout.dueOn", { date: props.dueDate.value })}
              {due && !isClosed && (
                <span className={due.overdue ? "ml-1.5 text-status-offtrack-content" : "ml-1.5 text-content-subtle"}>
                  ({due.label})
                </span>
              )}
            </span>
          )}

          {props.parentGoal && (
            <span className="whitespace-nowrap">
              {t("turboui.projectPageLayout.goalLabel")}{" "}
              <DivLink to={props.parentGoal.link} className="inline text-primary hover:underline">
                {props.parentGoal.name}
              </DivLink>
            </span>
          )}
        </>
      }
      actions={props.actions}
    />
  );
}
