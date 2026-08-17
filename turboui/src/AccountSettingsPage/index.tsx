import React from "react";
import { useTranslation } from "react-i18next";

import { Page } from "../Page";
import { OptionsMenuItem } from "../OptionsMenuItem";
import { IconBell, IconPalette } from "../icons";
import "../i18n";

export namespace AccountSettingsPage {
  export interface Props {
    homePath: string;
    appearancePath: string;
    notificationSettingsPath: string;
  }
}

export function AccountSettingsPage(props: AccountSettingsPage.Props) {
  const { t } = useTranslation();

  const navigation = React.useMemo(
    () => [{ to: props.homePath, label: t("nav.home", "Home") }],
    [props.homePath, t],
  );

  return (
    <Page title={t("account.settings.title", "Settings")} size="small" testId="account-settings-page" navigation={navigation}>
      <div className="px-4 sm:px-10 py-8">
        <div className="mb-2 text-content-accent text-3xl font-extrabold">{t("account.settings.title", "Settings")}</div>
        <p className="mb-8">{t("account.settings.description", "Manage the account settings available to you.")}</p>

        <OptionsMenuItem
          linkTo={props.appearancePath}
          icon={IconPalette}
          title={t("account.settings.appearance", "Appearance")}
          description={t("account.settings.appearanceDescription", "Adjust how Operately looks for you")}
        />
        <OptionsMenuItem
          linkTo={props.notificationSettingsPath}
          icon={IconBell}
          title={t("account.settings.notificationSettings", "Notification settings")}
          description={t(
            "account.settings.notificationSettingsDescription",
            "Configure how activity and summary emails are delivered",
          )}
        />
      </div>
    </Page>
  );
}
