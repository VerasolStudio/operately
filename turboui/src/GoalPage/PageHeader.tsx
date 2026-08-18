import React from "react";

import { GoalPage } from ".";
import { PrimaryButton, SecondaryButton } from "../Button";
import { EntityGlyph, Initials } from "../DesignKit/Entities";
import { PageHead } from "../DesignKit/Layout";
import { StatusLabel, statusLabel } from "../DesignKit/Status";
import { dueNote } from "../DesignKit/dueDate";
import { IconMessage } from "../icons";
import { PrivacyIndicator } from "../PrivacyIndicator";
import { TextField } from "../TextField";
import { t } from "../i18n";

/**
 * The goal page header.
 *
 * Everything you need to judge the goal at a glance sits on one line under the
 * title: status, how far along, when it is due, who owns it. Those four facts
 * used to be spread between a badge in the header and four separate sidebar
 * sections, which meant scrolling to answer "is this fine?".
 */
export function PageHeader(props: GoalPage.State) {
  const crumbs =
    "space" in props
      ? [
          { label: props.space.name, to: props.space.link },
          { label: t("turboui.goalPage.goals"), to: props.workmapLink },
        ]
      : [{ label: t("turboui.goalPage.workMap"), to: props.companyWorkMapLink }];

  const isInviteOnly = props.accessLevels.company === "no_access" && props.accessLevels.space === "no_access";
  const due = props.dueDate ? dueNote(props.dueDate.date) : null;
  const isClosed = props.state === "closed";

  return (
    <div data-test-id="page-header">
      <PageHead
        align="start"
        crumbs={crumbs}
        glyph={<EntityGlyph kind="goal" size="lg" className="mt-0.5" />}
        title={
          <span className="flex items-center gap-2">
            <TextField
              className="text-2xl font-semibold tracking-[-0.01em]"
              text={props.goalName}
              onChange={props.setGoalName}
              readonly={!props.permissions.canEdit}
              trimBeforeSave
              testId="goal-name-field"
            />

            {isInviteOnly && (
              <PrivacyIndicator
                privacyLevel="secret"
                resourceType="goal"
                spaceName={"space" in props ? props.space.name : ""}
                iconSize={16}
                testId="privacy-indicator"
              />
            )}
          </span>
        }
        meta={
          <>
            <StatusLabel status={props.status} label={statusLabel(props.status)} />

            {props.dueDate && (
              <span className="whitespace-nowrap">
                {t("turboui.goalPage.dueOn", { date: props.dueDate.value })}
                {due && !isClosed && (
                  <span className={due.overdue ? "ml-1.5 text-status-offtrack-content" : "ml-1.5 text-content-subtle"}>
                    ({due.label})
                  </span>
                )}
              </span>
            )}

            {props.champion && (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Initials name={props.champion.fullName} size="xs" />
                {props.champion.fullName}
              </span>
            )}
          </>
        }
        actions={
          <>
            {props.manageAccessLink && props.permissions.hasFullAccess && (
              <SecondaryButton size="sm" linkTo={props.manageAccessLink} testId="manage-goal-access-button">
                {t("turboui.goalPage.share")}
              </SecondaryButton>
            )}

            {props.permissions.canEdit && !isClosed && (
              <PrimaryButton size="sm" linkTo={props.newCheckInLink} icon={IconMessage} testId="check-in-button">
                {t("turboui.goalPage.checkIn")}
              </PrimaryButton>
            )}
          </>
        }
      />
    </div>
  );
}
