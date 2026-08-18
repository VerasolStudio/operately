import * as React from "react";

import { Card, StatusBreakdownBar } from "../DesignKit/Cards";
import { EntityGlyph, SpaceDot } from "../DesignKit/Entities";
import { PageHead, Screen, Section } from "../DesignKit/Layout";
import { StatusLabel, statusLabel } from "../DesignKit/Status";
import { Cell, Row, Table, TitleCellContent } from "../DesignKit/Table";
import { IconInbox } from "../icons";
import { DivLink } from "../Link";
import { AnimatedBar, AnimatedNumber, FadeIn } from "../Motion";
import { t } from "../i18n";

const STATUS_BAR_CLASS: Record<CompanyDashboardPage.BreakdownStatus, string> = {
  on_track: "bg-status-ontrack",
  caution: "bg-status-caution",
  off_track: "bg-status-offtrack",
  pending: "bg-status-pending",
  paused: "bg-status-paused",
};

/**
 * The company home screen.
 *
 * It used to open with a greeting, a grid of space cards and a firehose feed —
 * pleasant, but it answered "where can I go" rather than "how are we doing".
 * The redesign turns it into a status board: one bar showing how the whole
 * company's work is distributed, then the specific items that need a decision,
 * then the spaces, and only then the feed. Navigation moved to the sidebar,
 * which is what freed the page up to say something.
 */
export function CompanyDashboardPage(props: CompanyDashboardPage.Props) {
  const total = CompanyDashboardPage.BREAKDOWN_STATUSES.reduce(
    (sum, status) => sum + (props.statusCounts[status] || 0),
    0,
  );

  if (total === 0 && props.emptyState) {
    return (
      <Screen title={props.title} testId="company-home">
        <PageHead title={props.title} subtitle={props.subtitle} actions={props.actions} />
        <div className="px-6 pt-6 pb-12 sm:px-8">{props.emptyState}</div>
      </Screen>
    );
  }

  return (
    <Screen title={props.title} testId="company-home">
      <PageHead title={props.title} subtitle={props.subtitle} actions={props.actions} />

      <div className="px-6 pt-5 sm:px-8">
        <ProgressOverview statusCounts={props.statusCounts} total={total} />
      </div>

      <div className="grid grid-cols-1 gap-8 px-6 pt-6 pb-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div className="flex min-w-0 flex-col gap-7">
          <AttentionSection items={props.attention} workMapLink={props.workMapLink} />
          <SpacesSection spaces={props.spaces} />

          {/* The activity feed groups by date in a two-column layout of its
              own, so it needs the main column's width. In a 300px rail every
              entry wrapped to four lines. */}
          {props.feed && <Section title={t("turboui.companyDashboard.recentActivity")}>{props.feed}</Section>}
        </div>

        <aside className="flex flex-col gap-4">
          <TodoCard todo={props.todo} />
        </aside>
      </div>
    </Screen>
  );
}

function ProgressOverview({
  statusCounts,
  total,
}: {
  statusCounts: CompanyDashboardPage.Props["statusCounts"];
  total: number;
}) {
  const segments = CompanyDashboardPage.BREAKDOWN_STATUSES.filter((status) => (statusCounts[status] || 0) > 0).map(
    (status) => ({ key: status, value: statusCounts[status] || 0, barClassName: STATUS_BAR_CLASS[status] }),
  );

  return (
    <FadeIn>
      <div className="rounded-xl border border-surface-outline px-4 py-4">
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-[13px] font-semibold text-content-strong">
            {t("turboui.companyDashboard.companyProgress")}
          </div>
          <div className="text-xs text-content-dimmed">{t("turboui.companyDashboard.inFlight", { count: total })}</div>
        </div>

        <StatusBreakdownBar className="mt-3" segments={segments} />

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          {CompanyDashboardPage.BREAKDOWN_STATUSES.map((status) => {
            const count = statusCounts[status] || 0;
            if (count === 0) return null;

            return (
              <span key={status} className="inline-flex items-center gap-1.5 text-[13px] text-content-muted">
                <span className={`h-2 w-2 rounded-full ${STATUS_BAR_CLASS[status]}`} />
                {statusLabel(status)}
                <AnimatedNumber value={count} className="font-semibold text-content-strong" />
              </span>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}

function AttentionSection({
  items,
  workMapLink,
}: {
  items: CompanyDashboardPage.AttentionItem[];
  workMapLink: string;
}) {
  return (
    <Section
      title={t("turboui.companyDashboard.needsAttention")}
      note={t("turboui.companyDashboard.itemCount", { count: items.length })}
      action={
        <DivLink to={workMapLink} className="text-xs text-primary hover:underline">
          {t("turboui.companyDashboard.seeAll")}
        </DivLink>
      }
    >
      {items.length === 0 ? (
        <div className="rounded-xl border border-surface-outline px-4 py-6 text-center text-[13px] text-content-dimmed">
          {t("turboui.companyDashboard.nothingNeedsAttention")}
        </div>
      ) : (
        <Table
          bordered
          columns={[
            { width: "44%" },
            { width: "16%" },
            { width: "28%", hideOnMobile: true },
            { width: "12%", align: "right" },
          ]}
        >
          {items.map((item, index) => (
            <Row key={item.id} index={index} to={item.link}>
              <Cell first>
                <TitleCellContent
                  glyph={<EntityGlyph kind={item.type} />}
                  title={item.name}
                  subtitle={[item.spaceName, item.ownerName].filter(Boolean).join(" · ")}
                />
              </Cell>
              <Cell>
                <StatusLabel status={item.status} label={statusLabel(item.status)} size="sm" />
              </Cell>
              <Cell hideOnMobile className="truncate">
                {item.reason}
              </Cell>
              <Cell align="right" numeric last className="text-content-subtle">
                {item.dueLabel}
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </Section>
  );
}

function SpacesSection({ spaces }: { spaces: CompanyDashboardPage.SpaceStat[] }) {
  if (spaces.length === 0) return null;

  return (
    <Section
      title={t("turboui.companyDashboard.spaceStatus")}
      note={t("turboui.companyDashboard.spaceCount", { count: spaces.length })}
    >
      <Table
        columns={[
          { label: t("turboui.companyDashboard.space"), width: "34%" },
          { label: t("turboui.companyDashboard.work"), width: "16%" },
          { label: t("turboui.companyDashboard.onTrackShare"), width: "32%", hideOnMobile: true },
          { label: t("turboui.companyDashboard.late"), width: "18%", align: "right" },
        ]}
      >
        {spaces.map((space, index) => (
          <Row key={space.id} index={index} to={space.link}>
            <Cell first>
              <span className="flex items-center gap-2.5">
                <SpaceDot color={space.color} />
                <span className="truncate text-sm text-content-strong">{space.name}</span>
              </span>
            </Cell>
            <Cell className="text-content-dimmed">
              {t("turboui.companyDashboard.itemCount", { count: space.itemCount })}
            </Cell>
            <Cell hideOnMobile>
              <div className="flex items-center gap-2">
                <AnimatedBar
                  percentage={space.onTrackPercentage}
                  heightClassName="h-1"
                  barClassName="bg-status-ontrack"
                />
                <span className="w-9 flex-shrink-0 text-right text-xs tabular-nums text-content-dimmed">
                  {Math.round(space.onTrackPercentage)}%
                </span>
              </div>
            </Cell>
            <Cell align="right" numeric last className={space.lateCount > 0 ? "text-status-offtrack-content" : ""}>
              {space.lateCount}
            </Cell>
          </Row>
        ))}
      </Table>
    </Section>
  );
}

function TodoCard({ todo }: { todo: CompanyDashboardPage.Props["todo"] }) {
  return (
    <FadeIn>
      <Card tone="info" to={todo.link}>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary-soft-content">
          <IconInbox size={15} />
          {t("turboui.companyDashboard.yourTodo")}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <AnimatedNumber value={todo.count} className="text-[26px] font-semibold leading-none text-content-strong" />
          <span className="text-[13px] text-content-muted">
            {todo.overdueCount > 0
              ? t("turboui.companyDashboard.itemsWithOverdue", { count: todo.overdueCount })
              : t("turboui.companyDashboard.items")}
          </span>
        </div>
      </Card>
    </FadeIn>
  );
}

export namespace CompanyDashboardPage {
  /** The five states the breakdown bar splits work into, in display order. */
  export const BREAKDOWN_STATUSES = ["on_track", "caution", "off_track", "pending", "paused"] as const;

  export type BreakdownStatus = (typeof BREAKDOWN_STATUSES)[number];

  export interface AttentionItem {
    id: string;
    name: string;
    type: "goal" | "project";
    spaceName: string | null;
    ownerName: string | null;
    /** Why this row is here, in a few words: "check-in 7 days late". */
    reason: string;
    status: string;
    dueLabel: string | null;
    link: string;
  }

  export interface SpaceStat {
    id: string;
    name: string;
    color: string;
    itemCount: number;
    onTrackPercentage: number;
    lateCount: number;
    link: string;
  }

  export interface Props {
    title: string;
    /** "17 August 2026 · 14 items in flight". */
    subtitle: React.ReactNode;
    companyName: string;
    actions?: React.ReactNode;

    statusCounts: Record<BreakdownStatus, number>;
    attention: AttentionItem[];
    spaces: SpaceStat[];

    todo: { count: number; overdueCount: number; link: string };

    workMapLink: string;
    /** The company activity feed, supplied by the app. */
    feed?: React.ReactNode;
    /** Rendered when there is no work at all yet. */
    emptyState?: React.ReactNode;
  }
}
