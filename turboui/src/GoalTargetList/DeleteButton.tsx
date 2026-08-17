import { IconTrash } from "../icons";
import React from "react";
import { SecondaryButton } from "../Button";
import { State, TargetState } from "./useGoalTargetListState";
import { t } from "../i18n";

export function DeleteButton({ state, target }: { state: State; target: TargetState }) {
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    state.startDeleting(target.id);
  };

  return (
    <div className="mt-px">
      <SecondaryButton size="xxs" onClick={onClick} icon={IconTrash} testId="delete-target">
        {t("turboui.goalTargetList.delete")}
      </SecondaryButton>
    </div>
  );
}
