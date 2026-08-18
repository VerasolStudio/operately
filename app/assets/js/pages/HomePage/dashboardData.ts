import type { WorkMapItem } from "@/api";
import type { CompanyDashboardPage } from "turboui";

/**
 * Turns the raw work map into everything the company dashboard shows.
 *
 * All of it is derived from data the page already loads. Nothing here calls
 * the API, and nothing here invents a metric the backend cannot back up —
 * where the design asked for a number Operately does not track (weekly
 * check-in submission rates, for instance), the card was dropped rather than
 * filled with a guess.
 */

const CLOSED_STATUSES = new Set(["achieved", "missed", "completed"]);

export type BreakdownStatus = CompanyDashboardPage.BreakdownStatus;

export interface DashboardStats {
  statusCounts: Record<BreakdownStatus, number>;
  total: number;
}

interface FlatItem {
  item: WorkMapItem;
  daysUntilDue: number | null;
}

export function flattenWorkMap(items: WorkMapItem[]): WorkMapItem[] {
  const output: WorkMapItem[] = [];

  const walk = (list: WorkMapItem[]) => {
    list.forEach((item) => {
      output.push(item);
      walk(item.children || []);
    });
  };

  walk(items);
  return output;
}

export function collectStatusCounts(items: WorkMapItem[]): DashboardStats {
  const statusCounts: Record<BreakdownStatus, number> = {
    on_track: 0,
    caution: 0,
    off_track: 0,
    pending: 0,
    paused: 0,
  };

  let total = 0;

  flattenWorkMap(items).forEach((item) => {
    if (CLOSED_STATUSES.has(item.status)) return;

    total += 1;

    if (item.status in statusCounts) {
      statusCounts[item.status as BreakdownStatus] += 1;
    } else {
      // Anything the backend adds later lands in "pending" rather than
      // silently vanishing from a bar that is supposed to add up to the total.
      statusCounts.pending += 1;
    }
  });

  return { statusCounts, total };
}

/** Rows for "needs attention", worst first, capped so the card stays a summary. */
export function collectAttentionItems(items: WorkMapItem[], limit = 5): FlatItem[] {
  const candidates = flattenWorkMap(items)
    .filter((item) => !CLOSED_STATUSES.has(item.status))
    .map((item) => ({ item, daysUntilDue: daysUntil(item.timeframe?.contextualEndDate?.date) }))
    .filter(({ item, daysUntilDue }) => {
      const overdue = daysUntilDue !== null && daysUntilDue < 0;
      return overdue || item.status === "off_track" || item.status === "caution" || item.status === "paused";
    });

  const severity = ({ item, daysUntilDue }: FlatItem): number => {
    if (daysUntilDue !== null && daysUntilDue < 0) return 0;
    if (item.status === "off_track") return 1;
    if (item.status === "caution") return 2;
    return 3;
  };

  return candidates
    .sort((a, b) => severity(a) - severity(b) || (a.daysUntilDue ?? Infinity) - (b.daysUntilDue ?? Infinity))
    .slice(0, limit);
}

export interface SpaceAggregate {
  itemCount: number;
  onTrackCount: number;
  lateCount: number;
}

export function aggregateBySpace(items: WorkMapItem[]): Map<string, SpaceAggregate> {
  const bySpace = new Map<string, SpaceAggregate>();

  flattenWorkMap(items).forEach((item) => {
    if (CLOSED_STATUSES.has(item.status)) return;

    const spaceId = item.space?.id;
    if (!spaceId) return;

    const entry = bySpace.get(spaceId) ?? { itemCount: 0, onTrackCount: 0, lateCount: 0 };
    entry.itemCount += 1;
    if (item.status === "on_track") entry.onTrackCount += 1;

    const days = daysUntil(item.timeframe?.contextualEndDate?.date);
    if (days !== null && days < 0) entry.lateCount += 1;

    bySpace.set(spaceId, entry);
  });

  return bySpace;
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  return Math.round((parsed.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
}
