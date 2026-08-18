import * as React from "react";
import {
  IconFileExport,
  IconFileText,
  IconLetterCase,
  IconLock,
  IconShieldLock,
  IconUser,
  IconUsers,
  OptionsMenuItem,
  Link,
  Page as TurboUIPage,
} from "turboui";

import { useMe } from "@/contexts/CurrentCompanyContext";
import { includesId } from "@/routes/paths";
import { CompanyAdmins, CompanyOwners } from "./CompanyAdmins";
import { useLoadedData } from "./loader";
import { DangerZone } from "./DangerZone";
import { Section } from "./Section";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";

export function Page() {
  const paths = usePaths();
  const { company } = useLoadedData();

  return (
    <TurboUIPage
      title={[company.name!, "Administration"]}
      size="small"
      testId="company-admin-page"
      navigation={[{ to: paths.homePath(), label: t("pages.companyAdminPage.home") }]}
    >
      <div className="px-10 py-8">
        <div className="uppercase text-sm tracking-wide">{t("pages.companyAdminPage.companyAdministration")}</div>
        <div className="text-content-accent text-3xl font-extrabold">{company.name}</div>

        <Section title={t("pages.companyAdminPage.whatSThis")}>
          <p>{t("pages.companyAdminPage.thisIsTheCompanyAdministrationPage")}</p>

          <p className="mt-2">
            <Link to={paths.companyPermissionsPath()}>{t("pages.companyAdminPage.viewPermissionBreakdown")}</Link>
          </p>
        </Section>

        <CompanyAdmins />
        <CompanyOwners />

        <AdminsMenu />
        <OwnersMenu />
        <DangerZone />
      </div>
    </TurboUIPage>
  );
}

function AdminsMenu() {
  const paths = usePaths();
  const { adminIds, ownerIds, company } = useLoadedData();

  const me = useMe();
  const amIAdmin = includesId(adminIds, me?.id);
  const amIOwner = includesId(ownerIds, me?.id);

  // Don't show the menu at all if user is not an admin or owner
  if (!(amIAdmin || amIOwner)) {
    return null;
  }

  const managePeople = paths.companyManagePeoplePath();
  const manageBilling = paths.companyBillingPath();
  const renameCompanyPath = paths.companyRenamePath();
  const restorePath = paths.companyAdminRestoreSuspendedPeoplePath();

  return (
    <Section title={t("pages.companyAdminPage.asAnAdminOrOwnerYou")}>
      <div>
        <OptionsMenuItem linkTo={managePeople} icon={IconUsers} title={t("pages.companyAdminPage.manageTeamMembers")} />

        <OptionsMenuItem
          linkTo={restorePath}
          icon={IconUser}
          title={t("pages.companyAdminPage.restoreAccessForDeactivatedTeamMembers")}
        />
        <OptionsMenuItem
          hidden={!window.appConfig.billingEnabled || !company.permissions?.canManageBilling}
          linkTo={manageBilling}
          icon={IconFileText}
          title={t("pages.companyAdminPage.managePlan")}
        />
        <OptionsMenuItem
          hidden={!company.permissions?.canEditDetails}
          linkTo={renameCompanyPath}
          icon={IconLetterCase}
          title={t("pages.companyAdminPage.renameTheCompany")}
        />
      </div>
    </Section>
  );
}

function OwnersMenu() {
  const paths = usePaths();
  const { company, ownerIds } = useLoadedData();

  const me = useMe();
  // `useMe` is genuinely nullable — a hot reload can re-evaluate the company
  // context and leave this rendering without one. Asserting non-null turned
  // that into a crashed page; not knowing who you are is the same as not
  // being able to prove you are the owner, so the menu simply stays hidden.
  const amIOwner = !!me?.id && includesId(ownerIds, me.id);

  // Don't show the menu at all if user is not an owner
  if (!amIOwner) {
    return null;
  }

  const manageTrustedDomains = paths.companyAdminManageTrustedDomainsPath();
  const manageAdmins = paths.companyManageAdminsPath();
  const exportCompany = paths.companyExportPath();

  return (
    <Section title={t("pages.companyAdminPage.asAnOwnerYouCan")}>
      <div>
        <OptionsMenuItem
          linkTo={manageAdmins}
          icon={IconShieldLock}
          title={t("pages.companyAdminPage.manageAdministratorsAndOwners")}
        />
        <OptionsMenuItem
          hidden={!company.permissions?.canEditTrustedEmailDomains}
          linkTo={manageTrustedDomains}
          icon={IconLock}
          title={t("pages.companyAdminPage.manageTrustedEmailDomains")}
        />
        <OptionsMenuItem
          linkTo={exportCompany}
          icon={IconFileExport}
          title={t("pages.companyAdminPage.exportCompanyData")}
        />
      </div>
    </Section>
  );
}
