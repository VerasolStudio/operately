import React from "react";

import type { ActivityContentTaskAssigneeUpdating } from "@/api";
import type { Activity } from "@/models/activities";
import { Paths } from "@/routes/paths";
import { feedTitle, projectLink, spaceLink, taskLink } from "../feedItemLinks";
import type { ActivityHandler } from "../interfaces";
import { hasAggregatedTasks, UpdatedTaskList } from "../taskUpdatedResources";
import { AvatarWithName } from "turboui";
import { t } from "@/i18n";

const TaskAssigneeUpdating: ActivityHandler = {
  pageHtmlTitle(_activity: Activity) {
    throw new Error("Not implemented");
  },

  pagePath(paths: Paths, activity: Activity) {
    const { project, space, task } = content(activity);

    if (project && task) {
      return paths.taskPath(task.id);
    }

    if (project) {
      return paths.projectPath(project.id, { tab: "tasks" });
    }

    if (task) {
      return paths.spaceKanbanPath(space.id, { taskId: task.id });
    }

    return paths.spaceKanbanPath(space.id);
  },

  PageTitle(_props: { activity: any }) {
    throw new Error("Not implemented");
  },

  PageContent(_props: { activity: Activity }) {
    throw new Error("Not implemented");
  },

  PageOptions(_props: { activity: Activity }) {
    return null;
  },

  FeedItemTitle({ activity, page }: { activity: Activity; page: string }) {
    const { project, space, task } = content(activity);
    const location = project ? projectLink(project) : spaceLink(space);

    if (hasAggregatedTasks(activity)) {
      const tasks = <UpdatedTaskList activity={activity} />;

      if (page === "project") {
        return feedTitle(activity, "updated assignees on", tasks);
      } else if (page === "space" && !project) {
        return feedTitle(activity, "updated assignees on", tasks);
      } else {
        return feedTitle(activity, "updated assignees on", tasks, "in", location);
      }
    }

    const message = feedMessage(content(activity));
    const taskName = task ? taskLink(task, { spaceId: !project ? space.id : undefined }) : "a task";

    if (page === "project") {
      return feedTitle(activity, message, taskName);
    } else if (page === "space" && !project) {
      return feedTitle(activity, message, taskName);
    } else {
      return feedTitle(activity, message, taskName, "in", location);
    }
  },

  FeedItemContent({ activity }: { activity: Activity; page: any }) {
    if (hasAggregatedTasks(activity)) return null;

    const { oldAssignee, newAssignee, addedAssignees, removedAssignees } = content(activity);
    const added = addedAssignees || [];
    const removed = removedAssignees || [];

    if (!newAssignee && added.length !== 1) return null;

    return (
      <div className="flex items-center gap-2">
        {removed.length > 1 ? (
          <span>{t("features.activities.previouslyAssignedToPeople", { v1: removed.length })}</span>
        ) : oldAssignee ? (
          <>
            <span>{t("features.activities.previouslyAssignedTo")}</span>
            <div className="flex items-center gap-1">
              <AvatarWithName person={oldAssignee} size="tiny" />
            </div>
          </>
        ) : (
          <span>{t("features.activities.previouslyItWasUnassigned")}</span>
        )}
      </div>
    );
  },

  feedItemAlignment(_activity: Activity): "items-start" | "items-center" {
    return "items-center";
  },

  commentCount(_activity: Activity): number {
    throw new Error("Not implemented");
  },

  hasComments(_activity: Activity): boolean {
    throw new Error("Not implemented");
  },

  NotificationTitle(props: { activity: Activity }) {
    const { task } = content(props.activity);
    const taskName = task ? `Task "${task.name}"` : "A task";

    return `${taskName} was ${notificationMessage(content(props.activity))}`;
  },

  NotificationLocation(props: { activity: Activity }) {
    const { project, space } = content(props.activity);

    if (project) {
      return project.name;
    }

    return space.name;
  },
};

function content(activity: Activity): ActivityContentTaskAssigneeUpdating {
  return activity.content as ActivityContentTaskAssigneeUpdating;
}

function feedMessage(content: ActivityContentTaskAssigneeUpdating): string {
  const added = content.addedAssignees || [];
  const removed = content.removedAssignees || [];
  const [addedAssignee] = added;
  const [removedAssignee] = removed;

  if (addedAssignee && added.length === 1 && removed.length === 0)
    return t("features.activities.assignedToTheTask", { v1: addedAssignee.fullName });
  if (removedAssignee && removed.length === 1 && added.length === 0)
    return t("features.activities.unassignedFromTheTask", { v1: removedAssignee.fullName });
  if (added.length > 0 && removed.length > 0) return "changed assignees on the task";
  if (added.length > 1) return t("features.activities.assignedPeopleToTheTask", { v1: added.length });
  if (removed.length > 1) return t("features.activities.unassignedPeopleFromTheTask", { v1: removed.length });

  if (content.newAssignee) return t("features.activities.assignedToTheTask", { v1: content.newAssignee.fullName });
  if (content.oldAssignee) return t("features.activities.unassignedFromTheTask", { v1: content.oldAssignee.fullName });

  return "updated assignees on the task";
}

function notificationMessage(content: ActivityContentTaskAssigneeUpdating): string {
  const added = content.addedAssignees || [];
  const removed = content.removedAssignees || [];
  const [addedAssignee] = added;
  const [removedAssignee] = removed;

  if (addedAssignee && added.length === 1 && removed.length === 0)
    return t("features.activities.assignedTo", { v1: addedAssignee.fullName });
  if (removedAssignee && removed.length === 1 && added.length === 0)
    return t("features.activities.noLongerAssignedTo", { v1: removedAssignee.fullName });
  if (added.length > 0 || removed.length > 0) return "updated with new assignees";

  if (content.newAssignee) return t("features.activities.assignedTo", { v1: content.newAssignee.fullName });

  return "unassigned";
}

export default TaskAssigneeUpdating;
