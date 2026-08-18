import { ReviewPageV2 } from ".";
import { t } from "../i18n";

/**
 * Groups every assignment by how soon it is due.
 *
 * The backend already classifies each assignment (`dueStatus`), so this is a
 * regrouping rather than a re-derivation — the page and the badge in the
 * sidebar can never disagree about what counts as overdue.
 */
export interface UrgencyBucket {
  id: ReviewPageV2.DueStatus;
  title: string;
  /** Tailwind background class for the bucket's dot. */
  dotClassName: string;
  /** Tailwind text class for the urgency label on each row. */
  urgencyClassName: string;
  assignments: ReviewPageV2.Assignment[];
}

const BUCKET_ORDER: ReviewPageV2.DueStatus[] = ["overdue", "due_today", "due_soon", "upcoming", "none"];

const BUCKET_STYLES: Record<
  ReviewPageV2.DueStatus,
  { titleKey: string; dotClassName: string; urgencyClassName: string }
> = {
  overdue: {
    titleKey: "turboui.reviewPage.buckets.overdue",
    dotClassName: "bg-status-offtrack",
    urgencyClassName: "text-status-offtrack-content",
  },
  due_today: {
    titleKey: "turboui.reviewPage.buckets.today",
    dotClassName: "bg-status-caution",
    urgencyClassName: "text-status-caution-content",
  },
  due_soon: {
    titleKey: "turboui.reviewPage.buckets.thisWeek",
    dotClassName: "bg-status-pending",
    urgencyClassName: "text-content-dimmed",
  },
  upcoming: {
    titleKey: "turboui.reviewPage.buckets.later",
    dotClassName: "bg-status-paused",
    urgencyClassName: "text-content-dimmed",
  },
  none: {
    titleKey: "turboui.reviewPage.buckets.noDueDate",
    dotClassName: "bg-status-paused",
    urgencyClassName: "text-content-dimmed",
  },
};

export function bucketAssignments(
  urgentGroups: ReviewPageV2.AssignmentGroup[],
  upcomingGroups: ReviewPageV2.AssignmentGroup[],
): UrgencyBucket[] {
  const byStatus = new Map<ReviewPageV2.DueStatus, ReviewPageV2.Assignment[]>();

  const add = (assignment: ReviewPageV2.Assignment, fallback: ReviewPageV2.DueStatus) => {
    const status = assignment.dueStatus ?? fallback;
    const existing = byStatus.get(status);

    if (existing) {
      existing.push(assignment);
    } else {
      byStatus.set(status, [assignment]);
    }
  };

  // An urgent item with no classification is still urgent — the backend put it
  // in the urgent list for a reason — so it falls into "today" rather than
  // dropping to the bottom of the page with the someday work.
  urgentGroups.forEach((group) => group.assignments.forEach((assignment) => add(assignment, "due_today")));
  upcomingGroups.forEach((group) => group.assignments.forEach((assignment) => add(assignment, "upcoming")));

  return BUCKET_ORDER.filter((status) => (byStatus.get(status) ?? []).length > 0).map((status) => ({
    id: status,
    title: t(BUCKET_STYLES[status].titleKey),
    dotClassName: BUCKET_STYLES[status].dotClassName,
    urgencyClassName: BUCKET_STYLES[status].urgencyClassName,
    assignments: byStatus.get(status)!,
  }));
}
