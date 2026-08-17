import * as Paper from "@/components/PaperContainer";
import * as React from "react";

import { useLoadedData } from "./loader";
import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";

export function Navigation() {
  const paths = usePaths();
  const { goal } = useLoadedData();
  const items: Paper.NavigationItem[] = [];

  if (goal.space) {
    items.push({ to: paths.spacePath(goal.space.id), label: goal.space.name });
    items.push({ to: paths.spaceWorkMapPath(goal.space.id), label: t("pages.goalCheckInPage.workMap") });
  } else {
    items.push({ to: paths.workMapPath("goals"), label: t("pages.goalCheckInPage.workMap") });
  }

  items.push({ to: paths.goalPath(goal.id), label: goal.name });
  items.push({ to: paths.goalPath(goal.id, { tab: "check-ins" }), label: t("pages.goalCheckInPage.checkIns") });

  return <Paper.Navigation items={items} />;
}
