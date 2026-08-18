import React from "react";

import type { Goal, Project } from "@/api";
import { usePaths } from "@/routes/paths";
import { DesignKit, ProgressBar } from "turboui";
import { t } from "@/i18n";

export interface WorkRow {
  id: string;
  name: string;
  type: "goal" | "project";
  status: string;
  progress: number;
  ownerName: string | null;
  dueLabel: string | null;
  link: string;
}

/**
 * The space's goals and projects in one table.
 *
 * They used to live in two separate cards, which made "how is this space
 * doing?" a question you answered by reading both and merging them in your
 * head. One list, sorted worst-first, answers it directly.
 */
export function SpaceWorkTable({ rows }: { rows: WorkRow[] }) {
  if (rows.length === 0) return null;

  return (
    <DesignKit.Table
      bordered
      columns={[
        { width: "44%" },
        { width: "16%" },
        { width: "14%", hideOnMobile: true },
        { width: "14%", align: "right", hideOnMobile: true },
        { width: "12%", align: "right" },
      ]}
    >
      {rows.map((row, index) => (
        <DesignKit.Row key={row.id} index={index} to={row.link}>
          <DesignKit.Cell first>
            <DesignKit.TitleCellContent glyph={<DesignKit.EntityGlyph kind={row.type} />} title={row.name} />
          </DesignKit.Cell>
          <DesignKit.Cell>
            <DesignKit.StatusLabel status={row.status} label={DesignKit.statusLabel(row.status)} size="sm" />
          </DesignKit.Cell>
          <DesignKit.Cell hideOnMobile>
            <ProgressBar progress={row.progress} status={row.status as never} size="sm" />
          </DesignKit.Cell>
          <DesignKit.Cell align="right" hideOnMobile className="truncate text-content-subtle">
            {row.ownerName}
          </DesignKit.Cell>
          <DesignKit.Cell align="right" numeric last className="text-content-subtle">
            {row.dueLabel}
          </DesignKit.Cell>
        </DesignKit.Row>
      ))}
    </DesignKit.Table>
  );
}

/** Builds the table's rows from the space tools payload. */
export function useSpaceWorkRows(goals: Goal[], projects: Project[]): WorkRow[] {
  const paths = usePaths();

  return React.useMemo(() => {
    const goalRows: WorkRow[] = goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      type: "goal",
      status: goal.status,
      progress: goal.progressPercentage ?? 0,
      ownerName: goal.champion?.fullName ?? null,
      dueLabel: shortDate(goal.timeframe?.contextualEndDate?.date),
      link: paths.goalPath(goal.id),
    }));

    const projectRows: WorkRow[] = projects.map((project) => ({
      id: project.id,
      name: project.name,
      type: "project",
      status: project.status,
      // Projects have no progress field; the share of finished milestones is
      // the closest honest equivalent, and it is what the project page shows.
      progress: milestoneProgress(project),
      ownerName: project.champion?.fullName ?? null,
      dueLabel: shortDate(project.timeframe?.contextualEndDate?.date),
      link: paths.projectPath(project.id),
    }));

    return [...goalRows, ...projectRows].sort((a, b) => severity(a.status) - severity(b.status));
  }, [goals, projects, paths]);
}

function milestoneProgress(project: Project): number {
  const milestones = project.milestones ?? [];
  if (milestones.length === 0) return 0;

  const done = milestones.filter((milestone) => milestone.status === "done").length;
  return (done / milestones.length) * 100;
}

const SEVERITY_ORDER = ["off_track", "caution", "pending", "on_track", "paused", "achieved", "missed"];

function severity(status: string): number {
  const index = SEVERITY_ORDER.indexOf(status);
  return index === -1 ? SEVERITY_ORDER.length : index;
}

function shortDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
}

/** Counts of each status, for the "state of this space" card. */
export function statusCounts(rows: WorkRow[]): { status: string; count: number }[] {
  const counts = new Map<string, number>();

  rows.forEach((row) => counts.set(row.status, (counts.get(row.status) ?? 0) + 1));

  return SEVERITY_ORDER.filter((status) => counts.has(status)).map((status) => ({
    status,
    count: counts.get(status)!,
  }));
}

export const workTableLabels = {
  sectionTitle: () => t("pages.spacePage.workInThisSpace"),
  counts: (goals: number, projects: number) => t("pages.spacePage.workCounts", { goals, projects }),
};
