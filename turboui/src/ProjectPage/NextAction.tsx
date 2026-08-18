import React from "react";

import type { ProjectPage } from ".";
import { BannerSlot, NextActionBanner } from "../DesignKit/Banner";
import { dueNote, isOverdueDate } from "../DesignKit/dueDate";
import { isCheckInOverdue } from "./checkInOverdue";
import { viewerCanPostCheckIn } from "./checkInPermissions";
import { t } from "../i18n";

/**
 * The one thing standing between this project and being on track.
 *
 * Order matters: an overdue milestone is a commitment that has already been
 * missed, an overdue project deadline is the same thing at a larger scale, and
 * a missing check-in is only a reporting gap. The most concrete problem wins,
 * because that is the one with an obvious next move.
 */
export function NextAction(props: ProjectPage.State) {
  if (props.state === "closed" || props.state === "paused") return null;

  const overdueMilestone = (props.milestones || [])
    .filter((milestone) => milestone.status !== "done" && isOverdueDate(milestone.dueDate?.date))
    .sort((a, b) => dueSortKey(a.dueDate?.date) - dueSortKey(b.dueDate?.date))[0];

  if (overdueMilestone) {
    const note = dueNote(overdueMilestone.dueDate?.date);

    return (
      <BannerSlot>
        <NextActionBanner tone="danger" lead={t("turboui.projectPage.nextActionLead")} testId="project-next-action">
          {t("turboui.projectPage.nextActionMilestoneOverdue", {
            name: overdueMilestone.name,
            note: note?.label ?? "",
          })}
        </NextActionBanner>
      </BannerSlot>
    );
  }

  if (props.dueAt && isOverdueDate(props.dueAt.date)) {
    const note = dueNote(props.dueAt.date);

    return (
      <BannerSlot>
        <NextActionBanner tone="danger" lead={t("turboui.projectPage.nextActionLead")} testId="project-next-action">
          {t("turboui.projectPage.nextActionProjectOverdue", { note: note?.label ?? "" })}
        </NextActionBanner>
      </BannerSlot>
    );
  }

  if (isCheckInOverdue(props.nextCheckInScheduledAt, props.state)) {
    const canPost = viewerCanPostCheckIn(props);

    return (
      <BannerSlot>
        <NextActionBanner
          tone="warning"
          lead={t("turboui.projectPage.nextActionLead")}
          action={canPost ? { label: t("turboui.projectPage.checkIn"), to: props.newCheckInLink } : undefined}
          testId="overdue-check-in-callout"
        >
          {canPost
            ? t("turboui.projectPage.nextActionCheckInYours")
            : t("turboui.projectPage.needsToPostACheckIn", {
                v1: props.champion?.fullName || t("turboui.projectPage.theChampion"),
              })}
        </NextActionBanner>
      </BannerSlot>
    );
  }

  return null;
}

function dueSortKey(date: Date | string | null | undefined): number {
  if (!date) return Number.MAX_SAFE_INTEGER;

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime();
}
