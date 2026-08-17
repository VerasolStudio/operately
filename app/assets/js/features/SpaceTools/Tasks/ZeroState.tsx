import * as React from "react";

import { GhostButton, IconSquareCheckFilled, IconCircleDashed } from "turboui";
import classNames from "classnames";
import { t } from "@/i18n";

export function ZeroState() {
  return (
    <div>
      <Examples />
      <ExplanationAndButton />
    </div>
  );
}

function ExplanationAndButton() {
  return (
    <div className="flex flex-col justify-center items-center group">
      <div className="text-base font-bold">{t("features.spaceTools.tasks")}</div>

      <div className="flex gap-2 mt-1 mb-4 text-center px-6 text-sm">
        {t("features.spaceTools.organizeTasksOnAKanbanBoard")}
      </div>

      <GhostButton size="sm">{t("features.spaceTools.addANewTask")}</GhostButton>
    </div>
  );
}

function Examples() {
  return (
    <div className="relative w-full h-[170px] mt-10 opacity-75 px-[65px] flex flex-col gap-3">
      <Example
        icon={IconCircleDashed}
        title={t("features.spaceTools.draftThePlan")}
        body="Write down the next steps..."
      />
      <Example icon={IconCircleDashed} title={t("features.spaceTools.assignAnOwner")} body="Pick who will do it..." />
      <Example icon={IconSquareCheckFilled} title={t("features.spaceTools.markItDone")} body="Celebrate the win..." />
    </div>
  );
}

function Example({ icon, title, body }: { icon: any; title: string; body: string }) {
  const iconClass = classNames(
    "bg-stone-300",
    "group-hover:bg-green-300",
    "group-hover:text-stone-900",
    "dark:bg-stone-600",
    "dark:group-hover:bg-green-500",
    "rounded-full p-1.5 transition-all",
  );

  return (
    <div className="flex items-center gap-2 group-hover:gap-3 transition-all shadow-sm pb-2">
      <div className={iconClass}>{React.createElement(icon, { size: 22, stroke: 1.5 })}</div>
      <div>
        <div className="font-bold text-[10px] leading-none">{title}</div>
        <div className="text-[10px]">{body}</div>
      </div>
    </div>
  );
}
