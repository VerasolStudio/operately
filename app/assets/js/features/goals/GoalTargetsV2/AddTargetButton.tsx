import React from "react";

import { IconPlus } from "turboui";
import { useTargetsContext } from "./TargetsContext";
import { t } from "@/i18n";

export function AddTargetButton({ display }: { display: boolean }) {
  const { addTarget } = useTargetsContext();

  if (!display) return null;

  return (
    <div
      className="py-2 px-px border-t border-stroke-base cursor-pointer"
      onClick={addTarget}
      data-test-id="add-target"
    >
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-1 text-content-dimmed font-medium">
          <IconPlus size={16} className="text-content-dimmed shrink-0" />
          {t("features.goals.addTarget")}
        </div>
      </div>
    </div>
  );
}
