import React from "react";
import { GoalPage } from ".";
import { SecondaryButton } from "../Button";
import { MiniWorkMap } from "../MiniWorkMap";
import { SectionHeader } from "./SectionHeader";
import { t } from "../i18n";

export function RelatedWork(props: GoalPage.State) {
  const spaceProps = "space" in props ? props : null;
  const canAddRelatedWork = props.permissions.canEdit && Boolean(spaceProps);

  if (props.relatedWorkItems.length === 0 && !canAddRelatedWork) return null;

  const buttons =
    canAddRelatedWork && spaceProps ? (
      <div className="flex items-center gap-2">
        <SecondaryButton size="xxs" linkTo={spaceProps.addSubgoalLink} testId="add-subgoal">
          {t("turboui.goalPage.addGoal")}
        </SecondaryButton>
        <SecondaryButton size="xxs" linkTo={spaceProps.addSubprojectLink}>
          {t("turboui.goalPage.addProject")}
        </SecondaryButton>
      </div>
    ) : null;

  return (
    <div data-test-id="related-work-section">
      <SectionHeader title={t("turboui.goalPage.subgoalsProjects")} buttons={buttons} showButtons={canAddRelatedWork} />

      {props.relatedWorkItems.length > 0 ? <RelatedWorkContent {...props} /> : <RelatedWorkZeroState />}
    </div>
  );
}

function RelatedWorkContent(props: GoalPage.State) {
  return (
    <div className="mt-4">
      <MiniWorkMap items={props.relatedWorkItems} />
    </div>
  );
}

function RelatedWorkZeroState() {
  return (
    <div className="mt-1">
      <div className="text-content-dimmed text-sm">{t("turboui.goalPage.breakDownTheWorkOnThis")}</div>
    </div>
  );
}
