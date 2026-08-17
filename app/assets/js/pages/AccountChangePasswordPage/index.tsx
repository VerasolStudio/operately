import * as Pages from "@/components/Pages";
import * as Accounts from "@/models/accounts";
import * as React from "react";

import { PageModule } from "@/routes/types";
import { useNavigate } from "react-router";
import { Forms, showSuccessToast, showErrorToast, Page as TurboUIPage } from "turboui";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";
export default { name: "AccountChangePasswordPage", loader: Pages.emptyLoader, Page } as PageModule;

function Page() {
  const paths = usePaths();
  const navigate = useNavigate();

  const form = Forms.useForm({
    fields: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: (addError) => {
      if (form.values.newPassword !== form.values.confirmPassword) {
        addError("confirmPassword", "Passwords do not match");
      }
    },
    submit: async () => {
      try {
        await Accounts.changePassword({
          currentPassword: form.values.currentPassword,
          newPassword: form.values.newPassword,
          newPasswordConfirmation: form.values.confirmPassword,
        });

        showSuccessToast(
          t("pages.accountChangePasswordPage.passwordChanged"),
          t("pages.accountChangePasswordPage.yourPasswordHasBeenUpdatedSuccessfully"),
        );
        navigate(paths.accountSecurityPath());
      } catch (error) {
        showErrorToast(
          t("pages.accountChangePasswordPage.passwordChangeFailed"),
          t("pages.accountChangePasswordPage.thereWasAnErrorUpdatingYour"),
        );
      }
    },
    cancel: () => navigate(paths.accountSecurityPath()),
  });

  return (
    <TurboUIPage
      title={t("pages.accountChangePasswordPage.changePassword")}
      size="small"
      testId="change-password-page"
      navigation={[
        { to: paths.homePath(), label: t("pages.accountChangePasswordPage.home") },
        { to: paths.accountSecurityPath(), label: t("pages.accountChangePasswordPage.passwordSecurity") },
      ]}
    >
      <div className="px-10 py-8">
        <div className="mb-6">
          <div className="text-content-accent text-lg md:text-2xl font-extrabold">
            {t("pages.accountChangePasswordPage.changePassword")}
          </div>
        </div>

        <Forms.Form form={form}>
          <Forms.FieldGroup>
            <Forms.PasswordInput
              field={"currentPassword"}
              label={t("pages.accountChangePasswordPage.currentPassword")}
              placeholder={t("pages.accountChangePasswordPage.enterYourCurrentPassword")}
            />
            <Forms.PasswordInput
              field={"newPassword"}
              label={t("pages.accountChangePasswordPage.newPassword")}
              minLength={12}
              placeholder={t("pages.accountChangePasswordPage.atLeast12Characters")}
            />
            <Forms.PasswordInput
              field={"confirmPassword"}
              label={t("pages.accountChangePasswordPage.confirmNewPassword")}
              minLength={12}
              placeholder={t("pages.accountChangePasswordPage.atLeast12Characters")}
            />
          </Forms.FieldGroup>

          <Forms.Submit
            saveText={t("pages.accountChangePasswordPage.changePassword")}
            cancelText={t("pages.accountChangePasswordPage.cancel")}
          />
        </Forms.Form>
      </div>
    </TurboUIPage>
  );
}
