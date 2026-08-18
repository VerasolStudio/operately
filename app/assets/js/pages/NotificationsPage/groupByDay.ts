import type { Notification } from "@/api";
import { t } from "@/i18n";

export interface NotificationDayGroup {
  key: string;
  label: string;
  /** Today and yesterday show a time; older days show the date on each row. */
  isRecent: boolean;
  notifications: Notification[];
}

/**
 * Groups notifications into "today", "yesterday" and one group per older day.
 *
 * The list arrives newest-first from the API and this preserves that order, so
 * grouping never reshuffles anything — it only inserts headings.
 */
export function groupNotificationsByDay(notifications: Notification[]): NotificationDayGroup[] {
  const groups: NotificationDayGroup[] = [];
  const byKey = new Map<string, NotificationDayGroup>();

  notifications.forEach((notification) => {
    const insertedAt = notification.activity?.insertedAt;
    const date = insertedAt ? new Date(insertedAt) : null;
    const valid = date && !Number.isNaN(date.getTime());

    const key = valid ? dayKey(date) : "unknown";

    let group = byKey.get(key);

    if (!group) {
      group = {
        key,
        label: valid ? dayLabel(date) : t("pages.notificationsPage.earlier"),
        isRecent: valid ? daysAgo(date) <= 1 : false,
        notifications: [],
      };

      byKey.set(key, group);
      groups.push(group);
    }

    group.notifications.push(notification);
  });

  return groups;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function daysAgo(date: Date): number {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);

  return Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));
}

function dayLabel(date: Date): string {
  const distance = daysAgo(date);

  if (distance <= 0) return t("pages.notificationsPage.today");
  if (distance === 1) return t("pages.notificationsPage.yesterday");

  return new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric" }).format(date);
}
