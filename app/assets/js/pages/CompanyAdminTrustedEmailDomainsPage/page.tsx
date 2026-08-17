import * as React from "react";

import { Forms, GhostButton, IconTrash, Page as TurboUIPage } from "turboui";

import { createTestId } from "@/utils/testid";
import { useLoadedData } from "./loader";
import { FormState, useForm } from "./useForm";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";
export function Page() {
  const paths = usePaths();
  const { company } = useLoadedData();
  const form = useForm({ company });

  return (
    <TurboUIPage
      title={["Trusted Email Domains", company.name!]}
      size="small"
      navigation={[
        { to: paths.companyAdminPath(), label: t("pages.companyAdminTrustedEmailDomainsPage.companyAdministration") },
      ]}
    >
      <div className="px-10 py-8">
        <div className="text-content-accent text-3xl font-extrabold">
          {t("pages.companyAdminTrustedEmailDomainsPage.trustedEmailDomains")}
        </div>

        <div className="text-content-accent font-bold mt-8 text-lg">
          {t("pages.companyAdminTrustedEmailDomainsPage.whatSThis")}
        </div>
        <p>{t("pages.companyAdminTrustedEmailDomainsPage.trustedEmailDomainsAreEmailDomains")}</p>

        <div className="text-content-accent font-bold mt-8 text-lg mb-2">
          {t("pages.companyAdminTrustedEmailDomainsPage.trustedEmailDomains")}
        </div>
        <TrustedEmailDomainsList form={form} />
      </div>
    </TurboUIPage>
  );
}

function TrustedEmailDomainsList({ form }: { form: FormState }) {
  return (
    <div className="flex flex-col gap-2">
      {form.domains.length === 0 && (
        <div className="text-content-dimmed">
          {t("pages.companyAdminTrustedEmailDomainsPage.noTrustedEmailDomainsOnlyManually")}
        </div>
      )}

      {form.domains.map((domain, index) => (
        <TrustedEmailDomainItem key={index} domain={domain} form={form} />
      ))}
      <AddTrustedEmailDomain form={form} />
    </div>
  );
}

function TrustedEmailDomainItem({ domain, form }: { domain: string; form: FormState }) {
  const removeTestId = createTestId("remove-trusted-email-domain", domain);

  return (
    <div className="flex items-center gap-2 bg-surface-dimmed border border-stroke-base px-3 py-2 rounded">
      <div className="flex-1 font-medium">{domain}</div>
      <IconTrash
        className="text-content-dimmed cursor-pointer hover:text-content-error shrink-0"
        size={16}
        onClick={() => form.removeDomain(domain)}
        data-test-id={removeTestId}
      />
    </div>
  );
}

function AddTrustedEmailDomain({ form }: { form: FormState }) {
  const [domain, setDomain] = React.useState("");

  const submit = async () => {
    let value = domain.trim();

    if (value.length === 0) return;
    if (value[0] !== "@") value = "@" + value;

    await form.addDomain(value);
    setDomain("");
  };

  return (
    <div className="mt-8">
      <div className="text-content-accent font-bold text-lg mb-2">
        {t("pages.companyAdminTrustedEmailDomainsPage.addTrustedEmailDomain")}
      </div>

      <div className="flex items-center gap-4">
        <Forms.Input
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          onEnter={submit}
          testId="add-trusted-email-domain-input"
        />

        <GhostButton onClick={submit} size="sm" testId="add-trusted-email-domain-button">
          {t("pages.companyAdminTrustedEmailDomainsPage.add")}
        </GhostButton>
      </div>
    </div>
  );
}
