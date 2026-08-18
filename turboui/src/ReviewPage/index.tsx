import * as React from "react";

import { PageBody, PageHead, Screen } from "../DesignKit/Layout";
import { IconSparkles } from "../icons";
import { FadeIn } from "../Motion";
import { UrgencyBucket, bucketAssignments } from "./buckets";
import { AssignmentBucket } from "./AssignmentsList";
import { mergeUrgentGroups } from "./utils";
import type { FormattedTimePreferences } from "../FormattedTime";
import { t } from "../i18n";

export namespace ReviewPageV2 {
  export type AssignmentRole = "owner" | "reviewer";
  export type AssignmentType =
    | "check_in"
    | "goal_update"
    | "space_task"
    | "project_task"
    | "milestone"
    | "project_retrospective"
    | "goal_retrospective";
  export type OriginType = "project" | "goal" | "space";
  export type DueStatus = "overdue" | "due_today" | "due_soon" | "upcoming" | "none";

  export interface AssignmentOrigin {
    id: string;
    name: string;
    type: OriginType;
    path: string;
    spaceName?: string | null;
    dueDate?: string | null;
  }

  export interface Assignment {
    resourceId: string;
    name: string;
    due: string | null;
    type: AssignmentType;
    role: AssignmentRole;
    actionLabel: string | null;
    path: string;
    origin: AssignmentOrigin;
    taskStatus: string | null;
    authorId?: string | null;
    authorName?: string | null;
    description?: string | null;
    dueDate: string | null;
    dueStatus: DueStatus | null;
    dueStatusLabel: string | null;
  }

  export interface AssignmentGroup {
    origin: AssignmentOrigin;
    assignments: Assignment[];
  }

  export interface Props {
    dueSoon: AssignmentGroup[];
    needsReview: AssignmentGroup[];
    upcoming: AssignmentGroup[];
    formattedTimePreferences: FormattedTimePreferences;
  }
}

/**
 * "To do" — everything waiting on this person, ordered by when it is due.
 *
 * The previous version grouped by where the work came from: all the items
 * belonging to one goal, then all the items belonging to the next. That
 * answers "what is happening in this project", which is a question the project
 * page already answers. What someone opening this screen actually wants is
 * "what do I have to do before I stop for the day", so the redesign groups by
 * urgency and puts the overdue bucket first.
 */
export function ReviewPage(props: ReviewPageV2.Props) {
  const { dueSoon, needsReview, upcoming } = props;

  const urgentGroups = React.useMemo(() => mergeUrgentGroups(dueSoon, needsReview), [dueSoon, needsReview]);

  const buckets = React.useMemo(() => bucketAssignments(urgentGroups, upcoming), [urgentGroups, upcoming]);

  const urgentCount = urgentGroups.reduce((sum, group) => sum + group.assignments.length, 0);
  const pageTitle =
    urgentCount === 0 ? t("turboui.reviewPage.title") : `${t("turboui.reviewPage.title")} (${urgentCount})`;

  return (
    <Screen title={pageTitle} testId="review-page">
      <PageHead title={t("turboui.reviewPage.headline")} subtitle={t("turboui.reviewPage.subheadline")} align="end" />

      <PageBody width="medium">
        {buckets.length > 0 ? (
          <div className="flex flex-col gap-7">
            {buckets.map((bucket) => (
              <AssignmentBucket
                key={bucket.id}
                bucket={bucket}
                formattedTimePreferences={props.formattedTimePreferences}
              />
            ))}
          </div>
        ) : (
          <CaughtUpState />
        )}
      </PageBody>
    </Screen>
  );
}

function CaughtUpState() {
  return (
    <FadeIn>
      <div className="flex flex-col items-center gap-4 rounded-xl border border-surface-outline px-8 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-ontrack-bg">
          <IconSparkles size={20} className="text-status-ontrack-content" />
        </div>
        <p className="text-lg font-semibold text-content-strong">{t("turboui.reviewPage.youReAllCaughtUp")}</p>
        <p className="text-sm text-content-dimmed">{t("turboui.reviewPage.noAssignmentsCheckInsMilestonesOr")}</p>
      </div>
    </FadeIn>
  );
}

export type { UrgencyBucket };
