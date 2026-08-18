import { differenceInCalendarDays } from "date-fns";

import { t } from "../i18n";
import { parseDate } from "../utils/time";

/**
 * The second line under a due date: "12 days left", "5 days overdue", "today".
 *
 * A raw date makes you do arithmetic before you know whether to care. The
 * redesign shows both — the date for the record, the distance for the
 * decision — because in a table of twenty rows the distance is what people
 * are actually scanning for.
 */
export interface DueNote {
  label: string;
  overdue: boolean;
}

export function dueNote(date: Date | string | null | undefined): DueNote | null {
  const parsed = parseDate(date);
  if (!parsed) return null;

  const days = differenceInCalendarDays(parsed, new Date());

  // Past about six weeks in either direction the exact day count stops being
  // information and starts being noise — "413 days overdue" is harder to read
  // than "14 months overdue" and no more actionable.
  if (days === 0) return { label: t("turboui.due.today"), overdue: false };

  if (days < 0) {
    const late = Math.abs(days);

    return late < 45
      ? { label: t("turboui.due.overdue", { count: late }), overdue: true }
      : { label: t("turboui.due.monthsOverdue", { count: Math.round(late / 30) }), overdue: true };
  }

  if (days === 1) return { label: t("turboui.due.tomorrow"), overdue: false };
  if (days < 45) return { label: t("turboui.due.daysLeft", { count: days }), overdue: false };

  return { label: t("turboui.due.monthsLeft", { count: Math.round(days / 30) }), overdue: false };
}

/** True when a date has passed. Closed work is never treated as overdue. */
export function isOverdueDate(date: Date | string | null | undefined): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;

  return differenceInCalendarDays(parsed, new Date()) < 0;
}

/** Days until the date, or null when there is no date. Negative when past. */
export function daysUntil(date: Date | string | null | undefined): number | null {
  const parsed = parseDate(date);
  if (!parsed) return null;

  return differenceInCalendarDays(parsed, new Date());
}
