import React from "react";

import { WorkMap } from ".";
import { SummaryCard } from "../../DesignKit/Cards";
import { daysUntil } from "../../DesignKit/dueDate";
import { isClosedStatus } from "../../DesignKit/Status";
import { IconAlertTriangle, IconClock, IconTrendingUp } from "../../icons";
import { t } from "../../i18n";

/** Work due inside this window counts as "coming up" rather than "someday". */
const DUE_SOON_DAYS = 14;

interface Stats {
  total: number;
  onTrack: number;
  needsAttention: number;
  overdue: number;
  dueSoon: number;
  attentionNames: string[];
  dueSoonGoals: number;
  dueSoonProjects: number;
}

/**
 * The three cards above the table.
 *
 * They exist to answer "is there anything I have to deal with right now?"
 * without reading a single row. Everything in them is derived from the same
 * items the table shows — no extra request, and no chance of the summary and
 * the list disagreeing.
 */
export function WorkMapSummary({ items }: { items: WorkMap.Item[] }) {
  const stats = React.useMemo(() => collectStats(items), [items]);

  if (stats.total === 0) return null;

  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-3">
      <SummaryCard
        index={0}
        tone="danger"
        icon={<IconAlertTriangle size={15} />}
        label={t("turboui.workMap.needsAttention")}
        value={stats.needsAttention}
        unit={
          stats.overdue > 0
            ? t("turboui.workMap.itemsWithOverdue", { count: stats.overdue })
            : t("turboui.workMap.items")
        }
        footer={stats.attentionNames.join(" · ") || undefined}
        testId="work-map-summary-attention"
      />

      <SummaryCard
        index={1}
        tone="warning"
        icon={<IconClock size={15} />}
        label={t("turboui.workMap.dueSoon", { count: DUE_SOON_DAYS })}
        value={stats.dueSoon}
        unit={t("turboui.workMap.items")}
        footer={t("turboui.workMap.dueSoonBreakdown", {
          goals: stats.dueSoonGoals,
          projects: stats.dueSoonProjects,
        })}
        testId="work-map-summary-due-soon"
      />

      <SummaryCard
        index={2}
        tone="success"
        icon={<IconTrendingUp size={15} />}
        label={t("turboui.statusBadge.onTrack")}
        value={stats.onTrack}
        unit={t("turboui.workMap.ofTotal", { count: stats.total })}
        percentage={stats.total > 0 ? (stats.onTrack / stats.total) * 100 : 0}
        barClassName="bg-status-ontrack"
        testId="work-map-summary-on-track"
      />
    </div>
  );
}

function collectStats(items: WorkMap.Item[]): Stats {
  const stats: Stats = {
    total: 0,
    onTrack: 0,
    needsAttention: 0,
    overdue: 0,
    dueSoon: 0,
    attentionNames: [],
    dueSoonGoals: 0,
    dueSoonProjects: 0,
  };

  const walk = (list: WorkMap.Item[]) => {
    list.forEach((item) => {
      if (!isClosedStatus(item.status)) {
        stats.total += 1;

        const days = daysUntil(item.timeframe?.endDate?.date);
        const isOverdue = days !== null && days < 0;

        if (item.status === "on_track") stats.onTrack += 1;
        if (isOverdue) stats.overdue += 1;

        if (item.status === "off_track" || item.status === "caution" || isOverdue) {
          stats.needsAttention += 1;
          // Two names is enough to recognise the problem; more turns the card
          // into a list, which is what the table underneath is for.
          if (stats.attentionNames.length < 2) stats.attentionNames.push(item.name);
        }

        if (days !== null && days >= 0 && days <= DUE_SOON_DAYS) {
          stats.dueSoon += 1;
          if (item.type === "goal") stats.dueSoonGoals += 1;
          if (item.type === "project") stats.dueSoonProjects += 1;
        }
      }

      walk(item.children);
    });
  };

  walk(items);
  return stats;
}
