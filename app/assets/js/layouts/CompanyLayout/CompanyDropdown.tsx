import * as Companies from "@/models/companies";
import * as React from "react";

import { IconBuildingEstate, IconUserCircle, IconBinaryTree2, IconCircleKey, IconSwitch } from "turboui";

import { Paths, usePaths } from "@/routes/paths";
import { useTranslation } from "react-i18next";
import { DropdownLinkItem, DropdownMenu, DropdownSeparator } from "./DropdownMenu";

export function CompanyDropdown({ company }: { company: Companies.Company }) {
  const paths = usePaths();
  const { t } = useTranslation();

  return (
    <DropdownMenu
      testId="company-dropdown"
      name={company.name!}
      icon={IconBuildingEstate}
      align="start"
      showDropdownIcon
    >
      <DropdownLinkItem
        path={paths.peoplePath()}
        icon={IconUserCircle}
        title={t("companyMenu.people")}
        testId="company-dropdown-people"
        hidden={!company.permissions?.canView}
      />
      <DropdownLinkItem
        path={paths.orgChartPath()}
        icon={IconBinaryTree2}
        title={t("companyMenu.orgChart")}
        testId="company-dropdown-org-chart"
        hidden={!company.permissions?.canView}
      />

      <DropdownSeparator />

      <DropdownLinkItem
        path={paths.companyAdminPath()}
        icon={IconCircleKey}
        title={t("companyMenu.companyAdmin")}
        testId="company-dropdown-company-admin"
      />
      <DropdownLinkItem
        path={Paths.lobbyPath()}
        icon={IconSwitch}
        title={t("companyMenu.switchCompany")}
        testId="company-dropdown-switch"
      />
    </DropdownMenu>
  );
}
