import * as Pages from "@/components/Pages";
import { PageModule } from "@/routes/types";
import { DesignKit } from "turboui";
import * as React from "react";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";

export default { name: "CompanyPermissionsPage", loader: Pages.emptyLoader, Page } as PageModule;

/** Who a capability is available to. Ordered from most open to most restricted. */
type Audience = "everyone" | "adminsAndOwners" | "ownersOnly";

interface PermissionGroup {
  id: string;
  permissions: { id: string; audience: Audience }[];
}

/**
 * Company-wide permissions, grouped by what they let you do.
 *
 * The old page was a three-column yes/no matrix. Reading it meant scanning
 * across to find the first tick, which is a lot of work to answer "who can do
 * this?" — a question with exactly one answer per row. Naming the audience
 * directly turns three columns into one, and grouping the rows by purpose
 * makes the escalation from "everyone" to "owners only" visible as structure.
 */
const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "createWork",
    permissions: [
      { id: "addSpaces", audience: "everyone" },
      { id: "addGoals", audience: "everyone" },
      { id: "addProjects", audience: "everyone" },
    ],
  },
  {
    id: "managePeople",
    permissions: [
      { id: "invitePeople", audience: "adminsAndOwners" },
      { id: "removePeople", audience: "adminsAndOwners" },
      { id: "updateProfiles", audience: "adminsAndOwners" },
    ],
  },
  {
    id: "manageCompany",
    permissions: [
      { id: "manageAdmins", audience: "ownersOnly" },
      { id: "manageOwners", audience: "ownersOnly" },
      { id: "manageTrustedDomains", audience: "ownersOnly" },
      { id: "accessAnyResource", audience: "ownersOnly" },
    ],
  },
];

function Page() {
  const paths = usePaths();

  return (
    <Pages.Page title={t("pages.companyPermissionsPage.permissions")} testId="company-permissions-page">
      <div className="min-h-full bg-surface-base">
        <DesignKit.PageHead
          crumbs={[
            { label: t("pages.companyPermissionsPage.companyAdministration"), to: paths.companyAdminPath() },
            { label: t("pages.companyPermissionsPage.permissions") },
          ]}
          title={t("pages.companyPermissionsPage.headline")}
          subtitle={t("pages.companyPermissionsPage.subheadline")}
        />

        <DesignKit.PageBody width="reading">
          <div className="flex flex-col gap-6">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.id}>
                <DesignKit.MicroLabel className="mb-2">
                  {t(`pages.companyPermissionsPage.groups.${group.id}`)}
                </DesignKit.MicroLabel>

                <DesignKit.Panel>
                  {group.permissions.map((permission) => (
                    <DesignKit.PanelRow key={permission.id}>
                      <span className="min-w-0 flex-1 text-sm text-content-muted">
                        {t(`pages.companyPermissionsPage.permissionNames.${permission.id}`)}
                      </span>
                      <span className="flex-shrink-0 whitespace-nowrap text-[13px] text-content-strong">
                        {t(`pages.companyPermissionsPage.audiences.${permission.audience}`)}
                      </span>
                    </DesignKit.PanelRow>
                  ))}
                </DesignKit.Panel>
              </div>
            ))}
          </div>
        </DesignKit.PageBody>
      </div>
    </Pages.Page>
  );
}
