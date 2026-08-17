import type { ActivityContentProjectDueDateUpdating } from "@/api";
import type { Activity } from "@/models/activities";
import React from "react";
import { FormattedTime } from "turboui";
import { useFormattedTimePreferences } from "@/hooks/useFormattedTimePreferences";
import { feedTitle, projectLink } from "../feedItemLinks";
import type { ActivityHandler } from "../interfaces";
import { t } from "@/i18n";
import { Trans } from "react-i18next";

const ProjectDueDateUpdating: ActivityHandler = {
  pageHtmlTitle(_activity: Activity) {
    throw new Error("Not implemented");
  },

  pagePath(paths, activity: Activity) {
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

  FeedItemTitle(props: { activity: Activity; page: string }) {
    const formattedTimePreferences = useFormattedTimePreferences();
    const { project, newDueDate } = content(props.activity);

    const message = newDueDate ? (
      <>
        changed the due date to <FormattedTime {...formattedTimePreferences} time={newDueDate} format="short-date" />
      </>
    ) : (
      "cleared the due date"
    );

    if (props.page === "project") {
      return feedTitle(props.activity, message);
    } else {
      return feedTitle(props.activity, message, " on the", projectLink(project!));
    }
  },

  FeedItemContent(props: { activity: Activity; page: any }) {
    const formattedTimePreferences = useFormattedTimePreferences();
    const { oldDueDate } = content(props.activity);

    if (oldDueDate) {
      const time = <FormattedTime {...formattedTimePreferences} time={oldDueDate} format="short-date" />;

      return <>{t("features.activities.previouslyTheDueDateWas", { v1: time })}</>;
    } else {
      return <>{t("features.activities.previouslyHadNoDueDate")}</>;
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
    const formattedTimePreferences = useFormattedTimePreferences();
    const { project, newDueDate } = content(activity);
    const projectName = project?.name ?? "the project";

    if (newDueDate) {
      return (
        <>
          <Trans
            i18nKey="features.activities.updatedDueDateForTo"
            values={{ v1: projectName }}
            components={[<FormattedTime {...formattedTimePreferences} time={newDueDate} format="short-date" />]}
          />
        </>
      );
    } else {
      return <>{t("features.activities.clearedDueDateFor", { v1: projectName })}</>;
    }
  },

  NotificationLocation({ activity }: { activity: Activity }) {
    const { space } = content(activity);
    return space?.name || null;
  },
};

function content(activity: Activity): ActivityContentProjectDueDateUpdating {
  return activity.content as ActivityContentProjectDueDateUpdating;
}

export default ProjectDueDateUpdating;
