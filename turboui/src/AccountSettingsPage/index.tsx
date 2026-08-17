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
    () => [{ to: props.homePath, label: t("turboui.accountPage.home") }],
    [props.homePath, t],
  );

  return (
    <Page
      title={t("turboui.accountSettingsPage.title")}
      size="small"
      testId="account-settings-page"
      navigation={navigation}
    >
      <div className="px-4 sm:px-10 py-8">
        <div className="mb-2 text-content-accent text-3xl font-extrabold">{t("turboui.accountSettingsPage.title")}</div>
        <p className="mb-8">{t("turboui.accountSettingsPage.description")}</p>

        <OptionsMenuItem
          linkTo={props.appearancePath}
          icon={IconPalette}
          title={t("turboui.accountSettingsPage.appearance")}
          description={t("turboui.accountSettingsPage.appearanceDescription")}
        />
        <OptionsMenuItem
          linkTo={props.notificationSettingsPath}
          icon={IconBell}
          title={t("turboui.accountSettingsPage.notificationSettings")}
          description={t("turboui.accountSettingsPage.notificationSettingsDescription")}
        />
      </div>
    </Page>
  );
}
