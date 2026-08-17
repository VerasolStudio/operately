import type { ActivityContentGoalDueDateUpdating } from "@/api";
import type { Activity } from "@/models/activities";
import { Paths } from "@/routes/paths";
import React from "react";
import { FormattedTime } from "turboui";
import { useFormattedTimePreferences } from "@/hooks/useFormattedTimePreferences";
import { feedTitle, goalLink } from "../feedItemLinks";
import type { ActivityHandler } from "../interfaces";
import { t } from "@/i18n";

const GoalDueDateUpdating: ActivityHandler = {
  pageHtmlTitle(_activity: Activity) {
    throw new Error("Not implemented");
  },

  pagePath(_paths: Paths, _activity: Activity) {
    throw new Error("Not implemented");
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
    const { goal, newDueDate } = content(props.activity);

    const message = newDueDate ? (
      <>
        changed the due date to <FormattedTime {...formattedTimePreferences} time={newDueDate} format="short-date" />
      </>
    ) : (
      "cleared the due date"
    );

    if (props.page === "goal") {
      return feedTitle(props.activity, message);
    } else {
      return feedTitle(props.activity, message, " on the", goalLink(goal!));
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

  NotificationTitle(_props: { activity: Activity }) {
    return <></>;
  },

  NotificationLocation(_props: { activity: Activity }) {
    return null;
  },
};

function content(activity: Activity): ActivityContentGoalDueDateUpdating {
  return activity.content as ActivityContentGoalDueDateUpdating;
}

export default GoalDueDateUpdating;
