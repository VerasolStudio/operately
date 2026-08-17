import * as Api from "@/api";
import * as React from "react";
import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";

import classNames from "classnames";
import { OperatelyLogo } from "@/components/OperatelyLogo";
import { Forms, ActionLink, type FormState } from "turboui";

import { PageModule } from "@/routes/types";
import { t } from "@/i18n";

export default { name: "ForgotPasswordPage", loader: Pages.emptyLoader, Page } as PageModule;

function Page() {
  const [req] = Api.useRequestPasswordReset();
  const [showEmailSent, setShowEmailSent] = React.useState(false);

  const form = Forms.useForm({
    fields: {
      email: "",
    },
    submit: async () => {
      await req({ email: form.values.email.trim() });
      setShowEmailSent(true);
    },
  });

  const retry = () => setShowEmailSent(false);

  return (
    <Pages.Page title={["Forgot Password"]} testId="forgot-password-page">
      <Paper.Root size="tiny">
        <Paper.NavigateBack to="/log_in" title={t("pages.forgotPasswordPage.backToSignIn")} />
        <Paper.Body className="h-dvh sm:h-auto">
          <div className="py-8 sm:px-4 sm:py-4">
            <OperatelyLogo width="30px" height="30px" />
            <h1 className="text-2xl font-bold mt-4">{t("pages.forgotPasswordPage.forgotPassword")}</h1>
            <p className="text-content-dimmed mb-4">{t("pages.forgotPasswordPage.getResetInstructionsViaEmail")}</p>

            {showEmailSent ? <EmailSentMessage retry={retry} /> : <Form form={form} />}
          </div>
        </Paper.Body>
      </Paper.Root>
    </Pages.Page>
  );
}

function Form({ form }: { form: FormState<{ email: string }> }) {
  return (
    <Forms.Form form={form}>
      <Forms.FieldGroup>
        <Forms.TextInput
          field="email"
          label={t("pages.forgotPasswordPage.email")}
          placeholder={t("pages.forgotPasswordPage.eGYourEmailCom")}
          required
        />
      </Forms.FieldGroup>

      <SubmitButton onClick={form.actions.submit} />
    </Forms.Form>
  );
}

function EmailSentMessage({ retry }) {
  return (
    <div>
      <p className="text-content-dimmed mt-4">{t("pages.forgotPasswordPage.passwordResetInstructionsHaveBeenSent")}</p>
      <ActionLink onClick={retry}>{t("pages.forgotPasswordPage.resendInstructions")}</ActionLink>
    </div>
  );
}

function SubmitButton({ onClick }: { onClick: () => void }) {
  const className = classNames(
    "w-full flex justify-center py-2 px-4",
    "border border-transparent",
    "rounded-md shadow-sm font-medium text-white-1",
    "bg-blue-600 hover:bg-blue-700",
    "mt-6",
  );

  return (
    <button type="submit" className={className} onClick={onClick} data-test-id="submit">
      {t("pages.forgotPasswordPage.sendResetInstructions")}
    </button>
  );
}
