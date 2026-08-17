import Api from "@/api";
import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";
import * as React from "react";

import { OperatelyLogo } from "@/components/OperatelyLogo";
import { Paths } from "@/routes/paths";
import { useNavigate } from "react-router";

import { Forms, Link } from "turboui";
import { PageModule } from "@/routes/types";
import { BillingCatalog, parseBillingIntent } from "./billingIntent";
import { t } from "@/i18n";
import { Trans } from "react-i18next";

export default { name: "NewCompanyPage", loader, Page } as PageModule;

interface LoaderResult {
  billingCatalog: BillingCatalog;
}

async function loader(): Promise<LoaderResult> {
  const result = await Api.billing.getCatalog({});

  return {
    billingCatalog: {
      plans: result.plans ?? [],
      catalogProducts: result.catalogProducts ?? [],
    },
  };
}

function Page() {
  const navigate = useNavigate();
  const [add] = Api.companies.useCreate();
  const { billingCatalog } = Pages.useLoadedData<LoaderResult>();
  const billingIntent = React.useMemo(
    () => parseBillingIntent(window.location.search, billingCatalog),
    [billingCatalog],
  );

  const form = Forms.useForm({
    fields: {
      companyName: "",
      title: "",
      isDemo: "false",
    },
    submit: async () => {
      const res = await add({
        companyName: form.values.companyName,
        title: form.values.title,
        isDemo: form.values.isDemo == "true",
        plan: billingIntent.plan,
        billingPeriod: billingIntent.billingPeriod,
      });

      navigate(Paths.companyWorkMapPath(res.company.id));
    },
  });

  return (
    <Pages.Page title={t("pages.newCompanyPage.newCompany")}>
      <Paper.Root size="small" className="mt-24">
        <Paper.NavigateBack to={Paths.lobbyPath()} title={t("pages.newCompanyPage.backToTheLobby")} />
        <Paper.Body>
          <PageTitle />

          <Forms.Form form={form}>
            <Forms.FieldGroup>
              <Forms.TextInput
                field="companyName"
                label={t("pages.newCompanyPage.nameOfTheCompany")}
                placeholder={t("pages.newCompanyPage.eGAcmeCo")}
              />
              <Forms.TextInput
                field="title"
                label={t("pages.newCompanyPage.whatSYourTitleInThe")}
                placeholder={t("pages.newCompanyPage.eGFounder")}
              />

              {window.appConfig.demoBuilder && (
                <Forms.RadioButtons
                  field="isDemo"
                  label={t("pages.newCompanyPage.isThisADemoCompany")}
                  options={[
                    { label: t("pages.newCompanyPage.yes"), value: "true" },
                    { label: t("pages.newCompanyPage.no"), value: "false" },
                  ]}
                />
              )}
            </Forms.FieldGroup>

            <Forms.Submit saveText={t("pages.newCompanyPage.createCompany")} buttonSize="sm" />
          </Forms.Form>

          <div className="mt-4 text-center text-sm text-content-dimmed">
            <Trans
              i18nKey="pages.newCompanyPage.doYouHaveAnExistingCompany"
              components={[
                <Link to={Paths.companyImportPath()} underline="hover">
                  Import it here
                </Link>,
              ]}
            />
          </div>
        </Paper.Body>
      </Paper.Root>
    </Pages.Page>
  );
}

function PageTitle() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="">
        <div className="text-content-accent text-xl font-semibold">{t("pages.newCompanyPage.newCompany")}</div>
        <div className="text-content-accent">{t("pages.newCompanyPage.letAposSSetUpYour")}</div>
      </div>
      <OperatelyLogo width="40" height="40" />
    </div>
  );
}
