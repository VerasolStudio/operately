import React from "react";
import { SecondaryButton } from "../Button";
import { createTestId } from "../TestableElement";
import { State, TargetState } from "./useGoalTargetListState";
import { t } from "../i18n";

export function UpdateButton({ state, target }: { state: State; target: TargetState }) {
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    state.startUpdating(target.id!);
  };

  return (
    <div className="mt-px">
      <SecondaryButton size="xxs" onClick={onClick} testId={createTestId("update-target", target.name)}>
        {t("turboui.goalTargetList.update")}
      </SecondaryButton>
    </div>
  );
}
