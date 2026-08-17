import * as People from "@/models/people";
import React from "react";

import type { ActivityContentProjectChampionUpdating } from "@/api";
import type { Activity } from "@/models/activities";
import { Paths } from "@/routes/paths";
import { feedTitle, projectLink } from "../feedItemLinks";
import type { ActivityHandler } from "../interfaces";
import { t } from "@/i18n";

const ProjectChampionUpdating: ActivityHandler = {
  pageHtmlTitle(_activity: Activity) {
    throw new Error("Not implemented");
  },

  pagePath(paths: Paths, activity: Activity) {
    return paths.projectPath(content(activity).project!.id!);
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
    const project = content(activity).project!;
    const newChampion = content(activity).newChampion;
    const message = newChampion
      ? t("features.activities.assignedAsTheChampion", { v1: People.shortName(newChampion) })
      : "removed the champion";

    if (page === "project") {
      return feedTitle(activity, message);
    } else {
      return feedTitle(activity, message, "on", projectLink(project));
    }
  },

  FeedItemContent({ activity }: { activity: Activity; page: any }) {
    const oldChampion = content(activity).oldChampion;

    if (oldChampion) {
      return <>Previously, {People.shortName(oldChampion)} was the champion.</>;
    } else {
      return <>{t("features.activities.thereWasNoPreviousChampion")}</>;
    }
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

  NotificationTitle({ activity }: { activity: Activity }) {
    const { newChampion, project } = content(activity);

    if (!project) {
      return "";
    }

    if (newChampion) {
      return t("features.activities.changedTheChampionFor", { v1: project.name });
    } else {
      return t("features.activities.removedTheChampionFor", { v1: project.name });
    }
  },

  NotificationLocation(props: { activity: Activity }) {
    const { project } = content(props.activity);

    if (!project) {
      return "";
    }

    return project.name;
  },
};

function content(activity: Activity): ActivityContentProjectChampionUpdating {
  return activity.content as ActivityContentProjectChampionUpdating;
}

export default ProjectChampionUpdating;
