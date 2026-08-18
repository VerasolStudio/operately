import * as React from "react";

import { IconPlus, IconTargetArrow, IconTable, IconTent, IconUser } from "turboui";
import { DropdownLinkItem, DropdownMenu, DropdownSeparator } from "./DropdownMenu";

import { usePaths } from "@/routes/paths";
import { useTranslation } from "react-i18next";

interface Props {
  canAddGoal: boolean;
  canAddProject: boolean;
  canAddSpace: boolean;
  canInvitePeople: boolean;
  triggerClassName?: string;
  /**
   * Defaults to the global hook the navigation feature tests use. A second
   * copy of this menu on the same page (the one index pages put in their
   * header) must pass its own, or selectors match two elements.
   */
  testId?: string;
}

export function NewDropdown({
  canAddGoal,
  canAddProject,
  canAddSpace,
  canInvitePeople,
  triggerClassName,
  testId = "new-dropdown",
}: Props) {
  const paths = usePaths();
  const { t } = useTranslation();

  return (
    <DropdownMenu
      testId={testId}
      name={t("newMenu.title")}
      icon={IconPlus}
      align="end"
      triggerClassName={triggerClassName}
    >
      <DropdownLinkItem
        path={paths.newGoalPath()}
        icon={IconTargetArrow}
        title={t("newMenu.newGoal")}
        testId="new-dropdown-new-goal"
        hidden={!canAddGoal}
      />

      <DropdownLinkItem
        path={paths.newProjectPath()}
        icon={IconTable}
        title={t("newMenu.newProject")}
        testId="new-dropdown-new-project"
        hidden={!canAddProject}
      />

      <DropdownSeparator hidden={!canAddSpace} />

      <DropdownLinkItem
        path={paths.newSpacePath()}
        icon={IconTent}
        title={t("newMenu.newSpace")}
        testId="new-dropdown-new-space"
        hidden={!canAddSpace}
      />

      <DropdownSeparator hidden={!canInvitePeople} />

      <DropdownLinkItem
        path={paths.invitePeoplePath()}
        icon={IconUser}
        title={t("newMenu.invitePeople")}
        testId="new-dropdown-new-team-member"
        hidden={!canInvitePeople}
      />
    </DropdownMenu>
  );
}
