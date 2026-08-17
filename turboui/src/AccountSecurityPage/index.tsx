import React from "react";

import { Page } from "../Page";
import { OptionsMenuItem } from "../OptionsMenuItem";
import { IconCode, IconLockPassword, IconRobotFace } from "../icons";
import { t } from "../i18n";

export namespace AccountSecurityPage {
  export interface Props {
    homePath: string;
    changePasswordPath: string;
    apiTokensPath: string;
    mcpConnectionsPath: string;
  }
}

export function AccountSecurityPage(props: AccountSecurityPage.Props) {
  const navigation = React.useMemo(
    () => [{ to: props.homePath, label: t("turboui.accountSecurityPage.home") }],
    [props.homePath],
  );

  return (
    <Page
      title={t("turboui.accountSecurityPage.passwordSecurity")}
      size="small"
      testId="account-security-page"
      navigation={navigation}
    >
      <div className="px-4 sm:px-10 py-8">
        <div className="mb-2 text-content-accent text-3xl font-extrabold">
          {t("turboui.accountSecurityPage.passwordSecurity")}
        </div>
        <p className="mb-8">{t("turboui.accountSecurityPage.manageHowYouSignInAnd")}</p>

        <OptionsMenuItem
          linkTo={props.changePasswordPath}
          icon={IconLockPassword}
          title={t("turboui.accountSecurityPage.changePassword")}
          description={t("turboui.accountSecurityPage.updateThePasswordYouUseTo")}
        />
        <OptionsMenuItem
          linkTo={props.apiTokensPath}
          icon={IconCode}
          title={t("turboui.accountSecurityPage.aPITokens")}
          description={t("turboui.accountSecurityPage.createAndManageTokensForProgrammatic")}
        />
        <OptionsMenuItem
          linkTo={props.mcpConnectionsPath}
          icon={IconRobotFace}
          title={t("turboui.accountSecurityPage.mCPConnections")}
          description={t("turboui.accountSecurityPage.reviewAndRevokeAIClientConnections")}
        />
      </div>
    </Page>
  );
}
