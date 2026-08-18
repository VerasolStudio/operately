import React from "react";

import {
  IconCircleCheck,
  IconClipboardCheck,
  IconEye,
  IconChecklist,
  IconLogs,
  IconPlayerPause,
  IconUserCircle,
} from "../icons";

import { UnderlineTabs } from "../DesignKit/Controls";
import { Screen } from "../DesignKit/Layout";
import { useTabLinks } from "../DesignKit/useTabLinks";
import { useTabs } from "../Tabs";
import { AboutMe, Colleagues, Contact, PageHeader } from "./components";

import type { FormattedTimePreferences } from "../FormattedTime";
import { WorkMap, WorkMapTable } from "../WorkMap";
import { processPersonalItems } from "../WorkMap/utils/itemProcessor";
import { sortItemsByClosedDate, sortItemsByDueDate, sortTasksByDueDateAndAssignmentDate } from "../WorkMap/utils/sort";
import { PersonCard } from "../PersonCard";
import { isContentEmpty } from "../RichContent";
import { MentionedPersonLookupFn } from "../RichEditor/useEditor";
import { match } from "ts-pattern";
import { t } from "../i18n";

export namespace ProfilePage {
  export type Person = PersonCard.Person;

  export interface Props {
    title: string | string[];

    person: Person;
    manager: Person | null;
    peers: Person[];
    reports: Person[];

    workMap: WorkMap.Item[];
    reviewerWorkMap: WorkMap.Item[];

    activityFeed: React.ReactNode;

    editProfilePath: string;
    canEditProfile: boolean;

    viewer: Person | null;

    /** Breadcrumb target for the company's people directory. */
    peoplePath?: string;

    aboutMe?: string | null;
    mentionedPersonLookup: MentionedPersonLookupFn;
    formattedTimePreferences: FormattedTimePreferences;
  }

  export type TabOptions = "tasks" | "assigned" | "reviewing" | "paused" | "completed" | "activity" | "about";
}

export function ProfilePage(props: ProfilePage.Props) {
  const { tabs, items } = useTabsWithItems(props.workMap, props.reviewerWorkMap);

  const workMapColumnOptions = React.useMemo(() => {
    return match(tabs.active)
      .with("tasks", () => ({
        hideOwner: true,
        hideProgress: true,
        hideNextStep: true,
        hideRole: true,
        hideAssignedDate: false,
      }))
      .otherwise(() => ({ hideOwner: true, hideProject: true, hideAssignedDate: true }));
  }, [tabs.active]);

  const zeroStateMessage = React.useMemo(() => {
    return match(tabs.active)
      .with("tasks", () => "Assigned tasks will appear here.")
      .otherwise(() => undefined);
  }, [tabs.active]);

  const tabLinks = useTabLinks(tabs);

  return (
    <Screen title={props.title} testId="profile-page">
      <PageHeader {...props} />

      <div className="px-6 pt-5 sm:px-8">
        <UnderlineTabs layoutId="profile-tabs" tabs={tabLinks} activeId={tabs.active} />
      </div>

      <div className="px-6 pt-4 pb-12 sm:px-8">
        {["tasks", "assigned", "reviewing", "paused", "completed"].includes(tabs.active) && (
          <WorkMapTable
            items={items[tabs.active]}
            tab={["completed", "paused"].includes(tabs.active) ? (tabs.active as WorkMap.Filter) : "all"}
            profileUser={props.person}
            viewer={props.viewer || undefined}
            columnOptions={workMapColumnOptions}
            zeroStateMessage={zeroStateMessage}
            formattedTimePreferences={props.formattedTimePreferences}
          />
        )}
        {tabs.active === "activity" && <ActivityFeed {...props} />}
        {tabs.active === "about" && <About {...props} />}
      </div>
    </Screen>
  );
}

function useTabsWithItems(workMap: WorkMap.Item[], reviewerWorkMap: WorkMap.Item[]) {
  const { tasks, assigned, reviewing, paused, completed } = React.useMemo(() => {
    const tasks = workMap.filter((i) => i.type === "task");

    const workMapWithoutTasks = workMap.filter((i) => i.type !== "task");
    const reviewerWorkMapWithoutTasks = reviewerWorkMap.filter((i) => i.type !== "task");

    const assignedData = processPersonalItems(workMapWithoutTasks);
    const reviewerData = processPersonalItems(reviewerWorkMapWithoutTasks);

    return {
      tasks: sortTasksByDueDateAndAssignmentDate(tasks.map((t) => ({ ...t, children: [] }))),
      assigned: sortItemsByDueDate(assignedData.ongoingItems),
      reviewing: sortItemsByDueDate(reviewerData.ongoingItems),
      paused: sortItemsByDueDate([...assignedData.pausedItems, ...reviewerData.pausedItems]),
      completed: sortItemsByClosedDate([...assignedData.completedItems, ...reviewerData.completedItems]),
    };
  }, [workMap, reviewerWorkMap]);

  const tabs = useTabs("tasks", [
    { id: "tasks", label: t("turboui.profilePage.tasks"), icon: <IconChecklist size={14} />, count: tasks.length },
    {
      id: "assigned",
      label: t("turboui.profilePage.assigned"),
      icon: <IconClipboardCheck size={14} />,
      count: assigned.length,
    },
    {
      id: "reviewing",
      label: t("turboui.profilePage.reviewing"),
      icon: <IconEye size={14} />,
      count: reviewing.length,
    },
    { id: "paused", label: t("turboui.profilePage.paused"), icon: <IconPlayerPause size={14} />, count: paused.length },
    {
      id: "completed",
      label: t("turboui.profilePage.completed"),
      icon: <IconCircleCheck size={14} />,
      count: completed.length,
    },
    { id: "activity", label: t("turboui.profilePage.activity"), icon: <IconLogs size={14} /> },
    { id: "about", label: t("turboui.profilePage.about"), icon: <IconUserCircle size={14} /> },
  ]);

  return {
    tabs,
    items: { tasks, assigned, reviewing, paused, completed },
  };
}

function ActivityFeed(props: ProfilePage.Props) {
  return (
    <div className="p-4 max-w-5xl mx-auto my-6">
      <div className="font-bold text-lg mb-4">{t("turboui.profilePage.recentActivity")}</div>
      {props.activityFeed}
    </div>
  );
}

function About(props: ProfilePage.Props) {
  const showAboutMe = !isContentEmpty(props.aboutMe);

  return (
    <div className="p-4 max-w-5xl mx-auto my-6">
      <div className="flex flex-col gap-y-6">
        {showAboutMe && <AboutMe content={props.aboutMe} mentionedPersonLookup={props.mentionedPersonLookup} />}
        <Contact person={props.person} />
        <Colleagues {...props} />
      </div>
    </div>
  );
}
