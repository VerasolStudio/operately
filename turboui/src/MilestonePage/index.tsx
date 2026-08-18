import React, { useState } from "react";
import { DateField } from "../DateField";
import TaskCreationModal from "../TaskBoard/components/TaskCreationModal";
import * as Types from "../TaskBoard/types";
import { Timeline } from "../Timeline";
import { ProjectPageLayout } from "../ProjectPageLayout";
import { useProjectPageTabs } from "../ProjectPageLayout/useProjectPageTabs";
import { PageColumns } from "../DesignKit/Layout";
import { MilestoneSidebar } from "./components/Sidebar";
import { DeleteModal } from "./components/DeleteModal";
import { PersonField } from "../PersonField";
import { TimelineItem } from "../Timeline/types";
import { Header } from "./components/Header";
import { TasksSection } from "./components/TasksSection";
import { RichEditorHandlers } from "../RichEditor/useEditor";
import { PageDescription } from "../PageDescription";
import { SidebarNotificationSection } from "../SidebarSection";
import { ProjectPermissions } from "../ProjectPage/types";
import type { FormattedTimePreferences } from "../FormattedTime";
import { t } from "../i18n";

export namespace MilestonePage {
  export type Milestone = Types.Milestone;

  export type TimelineItemType = TimelineItem;

  interface Space {
    id: string;
    name: string;
    link: string;
  }

  export type SpaceProps =
    | {
        workmapLink: string;
        space: Space;
      }
    | {
        homeLink: string;
      };

  export type Person = {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    profileLink: string;
  };

  export type Status = "pending" | "done";

  export type Props = SpaceProps & {
    childrenCount: ProjectPageLayout.ChildrenCount;
    permissions: ProjectPermissions;

    // Project
    projectName: string;
    projectLink: string;
    projectStatus?: string;
    updateProjectName: (name: string) => Promise<boolean>;

    // Milestone
    milestone: Milestone;
    title: string;
    onMilestoneTitleChange: (name: string) => Promise<boolean>;
    dueDate: DateField.ContextualDate | null;
    onDueDateChange: (newDate: DateField.ContextualDate | null) => void;
    status: Status;
    onStatusChange: (status: Status) => void;
    description: any;
    onDescriptionChange: (newDescription: any) => Promise<boolean>;

    onDelete?: () => void;

    // Tasks for this milestone
    tasks: Types.Task[];
    statusOptions: Types.Status[];

    // Optional callbacks
    onTaskCreate?: (task: Types.NewTaskPayload) => void;
    onTaskReorder?: (taskId: string, milestoneId: string | null, index: number) => void;
    onTaskMilestoneChange?: (taskId: string, milestone: Types.Milestone | null) => void;
    onTaskAssigneeChange: (taskId: string, assignees: Person[]) => void;
    onTaskDueDateChange: (taskId: string, dueDate: DateField.ContextualDate | null) => void;
    onTaskRemindersChange?: Types.TaskBoardProps["onTaskRemindersChange"];
    onTaskStatusChange: (taskId: string, status: Types.Status | null) => void;
    onTaskNameChange?: (taskId: string, name: string) => void;
    onTaskDescriptionChange?: (taskId: string, description: any) => Promise<boolean>;
    onTaskDelete?: (taskId: string) => void | Promise<unknown>;
    milestones?: Types.Milestone[];
    onMilestoneSearch?: (query: string) => Promise<void>;
    getTaskPageProps?: Types.TaskBoardProps["getTaskPageProps"];

    assigneePersonSearch: PersonField.SearchData;

    // Filtering
    filters?: Types.FilterCondition[];
    onFiltersChange?: (filters: Types.FilterCondition[]) => void;

    // Timeline data
    timelineItems: TimelineItemType[];
    currentUser: Person;
    onAddComment: (comment: string) => void;
    onEditComment: (commentId: string, content: string) => void;
    onDeleteComment: (commentId: string) => void;
    onAddReaction?: (commentId: string, emoji: string) => void | Promise<void>;
    onRemoveReaction?: (commentId: string, reactionId: string) => void | Promise<void>;

    // Milestone metadata
    createdBy: Person | null;
    createdAt: Date;

    // Subscriptions
    subscriptions: SidebarNotificationSection.Props;

    // Rich editor support for description and comments
    richTextHandlers: RichEditorHandlers;
    localDraftKeyBase?: string;
    formattedTimePreferences: FormattedTimePreferences;
  };

  export type State = Props & {
    isTaskModalOpen: boolean;
    setIsTaskModalOpen: (open: boolean) => void;
    isDeleteModalOpen: boolean;
    openDeleteModal: () => void;
    closeDeleteModal: () => void;
  };
}

function useMilestonePageState(props: MilestonePage.Props): MilestonePage.State {
  // State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return {
    ...props,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isDeleteModalOpen,
    openDeleteModal: () => setIsDeleteModalOpen(true),
    closeDeleteModal: () => setIsDeleteModalOpen(false),
  };
}

export function MilestonePage(props: MilestonePage.Props) {
  const state = useMilestonePageState(props);
  const {
    milestone,
    childrenCount,
    onTaskCreate,
    title,
    onMilestoneTitleChange,
    status,
    assigneePersonSearch,
    projectName,
    projectLink,
    projectStatus = "active",
    isTaskModalOpen,
    setIsTaskModalOpen,
    permissions,
  } = state;
  const handleCreateTask = (newTask: Types.NewTaskPayload) => {
    if (onTaskCreate) {
      // Add the milestone to the task
      onTaskCreate({
        ...newTask,
        milestone: milestone,
      });
    }
  };

  const completedTaskCount = state.tasks.filter((task) => task.status?.closed).length;

  const tabs = useProjectPageTabs({
    defaultTab: "tasks",
    childrenCount,
    showDocsAndFiles: true,
    urlPath: projectLink,
  });

  const spaceProps =
    "space" in state ? { space: state.space, workmapLink: state.workmapLink } : { homeLink: state.homeLink };

  // Prepare props for ProjectPageLayout
  const layoutProps = {
    projectName: projectName,
    projectLink: projectLink,
    projectStatus: projectStatus,
    title: [projectName],
    testId: "milestone-page",
    tabs: tabs,
    status: projectStatus,
    updateProjectName: props.updateProjectName,
    closedAt: null,
    permissions,
    ...spaceProps,
  };

  return (
    <ProjectPageLayout {...layoutProps}>
      <PageColumns aside={<MilestoneSidebar {...state} />}>
        <Header
          title={title}
          canEdit={permissions.canEdit || false}
          status={status}
          dueDate={state.dueDate ?? state.milestone.dueDate ?? null}
          completedTasks={completedTaskCount}
          totalTasks={state.tasks.length}
          onMilestoneTitleChange={onMilestoneTitleChange}
          onStatusChange={state.onStatusChange}
        />

        <div className="space-y-10">
          <PageDescription
            {...state}
            canEdit={permissions.canEdit}
            label={t("turboui.milestonePage.notes")}
            placeholder={t("turboui.milestonePage.describeTheMilestone")}
            zeroStatePlaceholder="Add details about this milestone..."
            emptyTestId="description-section-empty"
            localDraftKey={state.localDraftKeyBase ? `${state.localDraftKeyBase}:description` : undefined}
          />

          <TasksSection {...state} />

          <TimelineSection {...state} />
        </div>
      </PageColumns>

      <TaskCreationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        assigneePersonSearch={assigneePersonSearch}
        currentMilestoneId={milestone.id}
        milestones={[milestone]}
        onMilestoneSearch={async () => {}} // No-op: milestone is read-only
        milestoneReadOnly={true}
        richTextHandlers={state.richTextHandlers}
        formattedTimePreferences={state.formattedTimePreferences}
      />
      <DeleteModal {...state} />
    </ProjectPageLayout>
  );
}

function TimelineSection(props: MilestonePage.State) {
  return (
    <div data-test-id="timeline-section">
      <h2 className="m-0 mb-4 text-[15px] font-semibold text-content-strong">
        {t("turboui.milestonePage.commentsActivity")}
      </h2>
      <Timeline
        items={props.timelineItems}
        currentUser={props.currentUser}
        canComment={props.permissions.canComment || false}
        commentParentType="milestone"
        onAddComment={props.onAddComment}
        onEditComment={props.onEditComment}
        onDeleteComment={props.onDeleteComment}
        onAddReaction={props.onAddReaction}
        onRemoveReaction={props.onRemoveReaction}
        richTextHandlers={props.richTextHandlers}
        commentDraftKey={props.localDraftKeyBase ? `${props.localDraftKeyBase}:new-comment` : undefined}
        commentNotificationInfo={{
          entityLabel: "milestone",
          subscribedPeople: props.subscriptions.subscribedPeople ?? [],
          isCurrentUserSubscribed: props.subscriptions.isSubscribed,
          currentUserId: props.currentUser.id,
        }}
        formattedTimePreferences={props.formattedTimePreferences}
      />
    </div>
  );
}
