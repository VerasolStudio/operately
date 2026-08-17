import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";
import * as React from "react";

import * as AdminApi from "@/ee/admin_api";
import { EmailSettingsSection } from "./EmailSettingsSection";
import { t } from "@/i18n";

export const loader = async () => {
  const data = await AdminApi.getEmailSettings({});
  return { emailSettings: data.emailSettings ?? null };
};

export function Page() {
  const { emailSettings } = Pages.useLoadedData() as { emailSettings: AdminApi.EmailSettings | null };

  return (
    <Pages.Page
      title={t("pages.saasAdminEmailSettingsPage.emailConfiguration")}
      testId="saas-admin-email-settings-page"
    >
      <Paper.Root size="large">
        <Paper.Navigation items={[{ to: "/admin", label: t("pages.saasAdminEmailSettingsPage.administration") }]} />
        <Paper.Body>
          <Paper.Header title={t("pages.saasAdminEmailSettingsPage.emailConfiguration")} />
          <EmailSettingsSection initialSettings={emailSettings} />
        </Paper.Body>
      </Paper.Root>
    </Pages.Page>
  );
}
