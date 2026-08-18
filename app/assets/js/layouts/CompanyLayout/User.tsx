import React from "react";

import { useMe } from "@/contexts/CurrentCompanyContext";
import {
  IconDots,
  Menu,
  MenuLinkItem,
  MenuActionItem,
  IconUserCircle,
  IconSettings,
  IconLockPassword,
  IconCode,
  IconRobotFace,
  IconDoorExit,
} from "turboui";
import { logOut } from "@/routes/auth";
import { usePaths } from "@/routes/paths";
import { useTranslation } from "react-i18next";

export function User() {
  const paths = usePaths();
  const me = useMe();
  const { t } = useTranslation();

  if (!me) return null;

  const handleLogOut = async () => {
    const res = await logOut();

    if (res === "success") {
      window.location.href = "/";
    }
  };

  return (
    <Menu
      customTrigger={
        // The sidebar already shows who is signed in, so the trigger only has
        // to be a discoverable handle for the account actions — not a second
        // copy of the avatar sitting next to the first one.
        <div
          className="flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-sidebar-hover hover:text-content-muted"
          aria-label={t("userMenu.settings")}
        >
          <IconDots size={18} />
        </div>
      }
      testId="account-menu"
      showArrow
      headerContent={
        <div className="flex flex-col -mt-1.5">
          <div className="text-sm font-medium text-content-base">{me.fullName}</div>
          <div className="text-xs text-content-dimmed">{me.email}</div>
        </div>
      }
    >
      <MenuLinkItem icon={IconUserCircle} to={paths.profileEditPath(me.id!)} testId="profile-link">
        {t("userMenu.profile")}
      </MenuLinkItem>
      <MenuLinkItem icon={IconSettings} to={paths.accountSettingsPath()} testId="settings-link">
        {t("userMenu.settings")}
      </MenuLinkItem>
      <MenuLinkItem icon={IconLockPassword} to={paths.accountSecurityPath()} testId="password-link">
        {t("userMenu.passwordAndSecurity")}
      </MenuLinkItem>
      <MenuLinkItem icon={IconCode} to={paths.accountApiTokensPath()} testId="api-tokens-link">
        {t("userMenu.apiTokens")}
      </MenuLinkItem>
      <MenuLinkItem icon={IconRobotFace} to={paths.accountMcpConnectionsPath()} testId="mcp-connections-link">
        {t("userMenu.mcpConnections")}
      </MenuLinkItem>
      <MenuActionItem icon={IconDoorExit} onClick={handleLogOut} testId="log-out-button">
        {t("userMenu.signOut")}
      </MenuActionItem>
    </Menu>
  );
}
