import React from "react";

import { GoalPage } from ".";
import { NextActionBanner, BannerSlot } from "../DesignKit/Banner";
import { dueNote, isOverdueDate } from "../DesignKit/dueDate";
import { t } from "../i18n";

/**
 * The one-sentence "here is what is wrong and here is the fix" banner.
 *
 * It is deliberately singular. A page that lists three problems makes you
 * choose; a page that names the most urgent one and offers its action gets the
 * next thing done. Priority order: an overdue goal beats a stale check-in,
 * because the deadline is the harder commitment.
 *
 * When nothing is wrong the banner is absent entirely — a permanently visible
 * "everything is fine" strip stops being read within a week, and then the real
 * warnings stop being read with it.
 */
export function NextAction(props: GoalPage.State) {
  if (props.state === "closed") return null;

  const overdue = props.dueDate ? isOverdueDate(props.dueDate.date) : false;
  const note = props.dueDate ? dueNote(props.dueDate.date) : null;

  if (overdue && note) {
    return (
      <BannerSlot>
        <NextActionBanner
          tone="danger"
          lead={t("turboui.goalPage.nextActionLead")}
          action={
            props.permissions.canEdit ? { label: t("turboui.goalPage.checkIn"), to: props.newCheckInLink } : undefined
          }
          testId="goal-next-action"
        >
          {t("turboui.goalPage.nextActionOverdue", { note: note.label })}
        </NextActionBanner>
      </BannerSlot>
    );
  }

  if (props.neglectedGoal) {
    return (
      <BannerSlot>
        <NextActionBanner
          tone="warning"
          lead={t("turboui.goalPage.nextActionLead")}
          action={
            props.permissions.canEdit ? { label: t("turboui.goalPage.checkIn"), to: props.newCheckInLink } : undefined
          }
          testId="goal-next-action"
        >
          {props.permissions.canEdit
            ? t("turboui.goalPage.theLastCheckInWasMore")
            : t("turboui.goalPage.theLastCheckInWasMore2")}
        </NextActionBanner>
      </BannerSlot>
    );
  }

  return null;
}
