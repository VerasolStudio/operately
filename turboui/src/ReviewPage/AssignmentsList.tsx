import React from "react";

import { ReviewPageV2 } from ".";
import { Panel, PanelRow } from "../DesignKit/Layout";
import { dueNote } from "../DesignKit/dueDate";
import { IconFlag, IconMessage, IconSquare } from "../icons";
import { GLIDE, motion, staggerDelay } from "../Motion";
import { createTestId } from "../TestableElement";
import type { FormattedTimePreferences } from "../FormattedTime";
import { t } from "../i18n";
import classNames from "../utils/classnames";
import type { UrgencyBucket } from "./buckets";

const TYPE_ICON: Record<ReviewPageV2.AssignmentType, typeof IconSquare> = {
  check_in: IconMessage,
  goal_update: IconMessage,
  space_task: IconSquare,
  project_task: IconSquare,
  milestone: IconFlag,
  project_retrospective: IconMessage,
  goal_retrospective: IconMessage,
};

/**
 * One urgency bucket: a coloured dot, a heading, a count, and the rows.
 *
 * Rows carry an explicit action button even though the whole row is a link.
 * The button is what makes the row feel like a piece of work you can finish
 * rather than a notification you can read — and it names the action, so
 * "write" and "review" are distinguishable before you click.
 */
export function AssignmentBucket({
  bucket,
  formattedTimePreferences,
}: {
  bucket: UrgencyBucket;
  formattedTimePreferences: FormattedTimePreferences;
}) {
  return (
    <section data-test-id={createTestId("review-bucket", bucket.id)}>
      <div className="mb-2.5 flex items-center gap-2">
        <span className={classNames("h-2 w-2 rounded-full", bucket.dotClassName)} />
        <h2 className="m-0 text-sm font-semibold text-content-strong">{bucket.title}</h2>
        <span className="text-xs text-content-subtle">
          {t("turboui.reviewPage.itemCount", { count: bucket.assignments.length })}
        </span>
      </div>

      <Panel>
        {bucket.assignments.map((assignment, index) => (
          <AssignmentRow
            key={assignment.resourceId}
            assignment={assignment}
            urgencyClassName={bucket.urgencyClassName}
            index={index}
            formattedTimePreferences={formattedTimePreferences}
          />
        ))}
      </Panel>
    </section>
  );
}

function AssignmentRow({
  assignment,
  urgencyClassName,
  index,
  formattedTimePreferences,
}: {
  assignment: ReviewPageV2.Assignment;
  urgencyClassName: string;
  index: number;
  formattedTimePreferences: FormattedTimePreferences;
}) {
  const Icon = TYPE_ICON[assignment.type] ?? IconMessage;
  const label = assignment.actionLabel ?? assignment.name;
  const urgency = urgencyLabel(assignment, formattedTimePreferences);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...GLIDE, delay: staggerDelay(index) }}
    >
      <PanelRow to={assignment.path} testId={createTestId("assignment", assignment.resourceId)}>
        <Icon size={17} className="flex-shrink-0 text-content-label" />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-content-strong">{label}</div>
          <div className="mt-0.5 truncate text-xs text-content-subtle">
            {assignment.origin.name} · {roleLabel(assignment)}
          </div>
        </div>

        {urgency && (
          <span className={classNames("whitespace-nowrap text-xs font-medium", urgencyClassName)}>{urgency}</span>
        )}

        {/* A span, not a link: the whole row is already an anchor, and nesting
            one inside another is invalid HTML that browsers silently unnest —
            which breaks the row's own click target. */}
        <span
          aria-hidden
          className="flex-shrink-0 whitespace-nowrap rounded-lg border border-primary-soft-border bg-surface-base px-3 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary-soft-bg"
        >
          {t("turboui.reviewPage.open")}
        </span>
      </PanelRow>
    </motion.div>
  );
}

function roleLabel(assignment: ReviewPageV2.Assignment): string {
  if (assignment.role === "reviewer") return t("turboui.reviewPage.roles.reviewer");
  if (assignment.type === "project_task") return t("turboui.reviewPage.roles.contributor");

  return t("turboui.reviewPage.roles.champion");
}

function urgencyLabel(
  assignment: ReviewPageV2.Assignment,
  _formattedTimePreferences: FormattedTimePreferences,
): string | null {
  // The backend's own wording wins when it has one; it knows about cases the
  // client cannot see, like a review that is waiting on someone else.
  if (assignment.dueStatusLabel) return assignment.dueStatusLabel;
  if (!assignment.dueDate) return null;

  return dueNote(assignment.dueDate)?.label ?? null;
}
