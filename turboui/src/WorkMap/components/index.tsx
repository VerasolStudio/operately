import React from "react";

import type { GoalCheck, Target } from "../../ApiTypes";
import { Navigation } from "../../Page/Navigation";
import { PrivacyIndicator } from "../../PrivacyIndicator";

import { DateField } from "../../DateField";
import { SegmentedControl, UnderlineTabs, type UnderlineTab } from "../../DesignKit/Controls";
import { PageBody, PageHead, Screen } from "../../DesignKit/Layout";
import { IconListTree, IconTimeline } from "../../icons";
import { SpaceField } from "../../SpaceField";
import type { StatusSelector } from "../../StatusSelector";
import { useLocation } from "react-router";
import { useWorkMapTab } from "../hooks/useWorkMapTab";
import { AddItemModal } from "./AddItemModal";
import { WorkMapSummary } from "./WorkMapSummary";
import { WorkMapTimeline } from "./WorkMapTimeline";
import { WorkMapTable } from "./WorkMapTable";
import type { FormattedTimePreferences } from "../../FormattedTime";
import { t } from "../../i18n";

export { WorkMapTable };

export function WorkMapPage(props: WorkMap.Props) {
  return (
    <Screen title={props.title} testId="work-map-page">
      <WorkMap {...props} />
    </Screen>
  );
}

/**
 * The work map: every goal and project in one tree.
 *
 * Structure follows the redesign — three summary cards, then the filter tabs,
 * then the table. The cards are there so the page opens with an answer rather
 * than a wall of rows; a company with fourteen items in flight has maybe three
 * that need a decision today, and finding those three by reading was the main
 * thing people did on this screen.
 */
export function WorkMap({
  title,
  items,
  columnOptions = {},
  tabOptions = {},
  type = "company",
  addItem,
  addingEnabled = false,
  spaceSearch,
  addItemDefaultSpace,
  navigation,
  subtitle,
  actions,
  viewer,
  profileUser,
  hideCompanyAccessInQuickAdd,
  zeroStateMessage,
  emptyStateVariant,
  onItemCreated,
  formattedTimePreferences,
}: WorkMap.Props) {
  const location = useLocation();
  const { filteredItems, tabsState, tab } = useWorkMapTab({ rawItems: items, type, opts: { tabOptions } });

  const searchParams = new URLSearchParams(location.search);
  const timelineAvailable = type !== "personal" && tab === "projects";
  const view = timelineAvailable && searchParams.get("view") === "timeline" ? "timeline" : "table";
  const firstProjectStateVisible = emptyStateVariant === "first-project" && items.length === 0 && addingEnabled;

  const tabs: UnderlineTab[] = tabsState.tabs.map((entry) => ({
    id: entry.id,
    label: entry.label,
    count: entry.count,
    to: tabPath(location.pathname, location.search, entry.id, tabsState.urlPath),
  }));

  return (
    <div>
      <PageHead
        crumbs={navigation?.map((item) => ({ label: item.label, to: item.to }))}
        title={title}
        subtitle={subtitle}
        actions={actions}
      />

      {!firstProjectStateVisible && items.length > 0 && (
        <div className="px-6 pt-5 sm:px-8">
          <WorkMapSummary items={items} />
        </div>
      )}

      <PageBody width="full" className="pt-6">
        {!firstProjectStateVisible && (
          <UnderlineTabs
            className="mb-1"
            layoutId="work-map-tabs"
            tabs={tabs}
            activeId={tabsState.active}
            trailing={
              timelineAvailable ? (
                <SegmentedControl
                  layoutId="work-map-view"
                  activeId={view}
                  options={[
                    {
                      id: "table",
                      label: t("turboui.workMap.tree"),
                      icon: <IconListTree size={14} />,
                      to: buildViewPath(location.pathname, location.search, "table"),
                    },
                    {
                      id: "timeline",
                      label: t("turboui.workMap.timeline"),
                      icon: <IconTimeline size={14} />,
                      to: buildViewPath(location.pathname, location.search, "timeline"),
                    },
                  ]}
                />
              ) : undefined
            }
          />
        )}

        <div className="pt-2">
          {view === "timeline" ? (
            <WorkMapTimeline items={filteredItems} tab={tab} />
          ) : (
            <WorkMapTable
              items={filteredItems}
              tab={tab}
              columnOptions={columnOptions}
              addItem={addItem}
              addingEnabled={addingEnabled}
              spaceSearch={spaceSearch}
              addItemDefaultSpace={addItemDefaultSpace}
              type={type}
              viewer={viewer}
              profileUser={profileUser}
              hideCompanyAccessInQuickAdd={Boolean(hideCompanyAccessInQuickAdd)}
              zeroStateMessage={zeroStateMessage}
              emptyStateVariant={emptyStateVariant}
              onItemCreated={onItemCreated}
              formattedTimePreferences={formattedTimePreferences}
            />
          )}
        </div>
      </PageBody>
    </div>
  );
}

function tabPath(pathname: string, search: string, tabId: string, urlPath?: string): string {
  const searchParams = new URLSearchParams(search);
  searchParams.set("tab", tabId);
  // Switching filters should not carry the timeline view into a tab that has
  // no timeline; the toggle only exists on projects.
  if (tabId !== "projects") searchParams.delete("view");

  return `${urlPath || pathname}?${searchParams.toString()}`;
}

function buildViewPath(pathname: string, search: string, view: WorkMap.View): string {
  const searchParams = new URLSearchParams(search);

  if (view === "timeline") {
    searchParams.set("view", "timeline");
  } else {
    searchParams.delete("view");
  }

  const nextSearch = searchParams.toString();
  return nextSearch ? `${pathname}?${nextSearch}` : pathname;
}

export default WorkMap;

export namespace WorkMap {
  export const ALLOWED_STATUSES = [
    "on_track",
    "achieved",
    "missed",
    "paused",
    "caution",
    "off_track",
    "pending",
    "outdated",
  ] as const;
  const ALLOWED_TYPES = ["goal", "project", "task"] as const;

  type ItemStatus = (typeof ALLOWED_STATUSES)[number] | string;
  type ItemType = (typeof ALLOWED_TYPES)[number];

  export interface Person {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  }

  interface Space {
    id: string;
    name: string;
    link: string;
  }

  interface Timeframe {
    startDate: DateField.ContextualDate | null;
    endDate: DateField.ContextualDate | null;
  }

  export interface Milestone {
    id: string;
    name: string;
    status: "pending" | "done" | string;
    dueDate: DateField.ContextualDate | null;
    link: string;
  }

  export interface Item {
    id: string;
    parentId: string | null;
    name: string;
    status: ItemStatus;
    taskStatus: StatusSelector.StatusOption | null;
    progress: number | null;
    project: { id: string; name: string } | null;
    projectPath: string | null;
    space: Space | null;
    spacePath: string | null;
    owner: Person | null;
    ownerPath: string | null;
    reviewer: Person | null;
    reviewerPath: string | null;
    nextStep: string;
    isNew: boolean;
    children: Item[];
    completedOn: string | null;
    assignedAt: string | null;
    timeframe: Timeframe | null;
    milestones: Milestone[];
    targets: Target[];
    checklist: GoalCheck[];
    type: ItemType;
    itemPath: string;
    privacy: PrivacyIndicator.PrivacyLevels;
  }

  export type WorkMapType = "company" | "personal";
  export type Filter = "all" | "goals" | "projects" | "completed" | "paused";
  export type View = "table" | "timeline";
  export type EmptyStateVariant = "standard" | "first-project";
  export type ItemCreatedFn = (type: AddItemModal.ItemType, id: string) => void | Promise<void>;

  export interface TabOptions {
    hideAll?: boolean;
    hideGoals?: boolean;
    hideProjects?: boolean;
    hideCompleted?: boolean;
    hidePaused?: boolean;
  }

  export interface ColumnOptions {
    hideSpace?: boolean;
    hideProject?: boolean;
    hideStatus?: boolean;
    hideProgress?: boolean;
    hideDueDate?: boolean;
    hideAssignedDate?: boolean;
    hideOwner?: boolean;
    hideRole?: boolean;
    hideNextStep?: boolean;
  }

  export type AddNewItemFn = (props: AddItemModal.SaveProps) => Promise<{ id: string }>;

  export interface Props {
    title: string;

    items: Item[];
    addItem?: AddNewItemFn;
    addingEnabled?: boolean;
    spaceSearch?: SpaceField.SearchSpaceFn;
    addItemDefaultSpace?: SpaceField.Space;

    viewer?: Person; // The person viewing the work map (determines role display: Role | My role)
    profileUser?: Person; // The person whose work map is being displayed

    columnOptions?: ColumnOptions;
    tabOptions?: TabOptions;
    type?: WorkMapType;
    navigation?: Navigation.Item[];

    /** One line of context under the title, e.g. "8 goals / 6 projects". */
    subtitle?: React.ReactNode;
    /** Page-level buttons rendered on the right of the header. */
    actions?: React.ReactNode;

    hideCompanyAccessInQuickAdd?: boolean;

    zeroStateMessage?: string;
    emptyStateVariant?: EmptyStateVariant;
    onItemCreated?: ItemCreatedFn;
    formattedTimePreferences: FormattedTimePreferences;
  }
}
