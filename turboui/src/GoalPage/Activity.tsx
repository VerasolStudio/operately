import React from "react";
import { GoalPage } from ".";
import { t } from "../i18n";

export function Activity(props: GoalPage.State) {
  return (
    <div className="p-4 max-w-5xl mx-auto my-6">
      <div className="font-bold text-lg mb-4">{t("turboui.goalPage.activity")}</div>
      {props.activityFeed}
    </div>
  );
}
