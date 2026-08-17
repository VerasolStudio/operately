import * as React from "react";
import { Forms, IconBuilding, IconTent } from "turboui";

import { PermissionLevels } from "../Permissions";
import { Option } from "../Permissions/AccessFields";
import { t } from "@/i18n";

export function AccessSelectors() {
  const [companyMembersOptions = []] = Forms.useFieldValue<Option[]>("access.companyMembersOptions");
  const [spaceMembersOptions = []] = Forms.useFieldValue<Option[]>("access.spaceMembersOptions");

  return (
    <div className="mt-6">
      <Forms.FieldGroup layout="horizontal" layoutOptions={{ dividers: true, ratio: "1:1" }}>
        <Forms.SelectBox
          field={"access.companyMembers"}
          label={t("features.projects.companyMembers")}
          labelIcon={<IconBuilding size={20} />}
          options={companyMembersOptions}
          hidden={shouldHide(companyMembersOptions)}
        />
        <Forms.SelectBox
          field={"access.spaceMembers"}
          label={t("features.projects.spaceMembers")}
          labelIcon={<IconTent size={20} />}
          options={spaceMembersOptions}
        />
      </Forms.FieldGroup>
    </div>
  );
}

function shouldHide(options: Option[]) {
  return options.length === 1 && options[0]!.value === PermissionLevels.NO_ACCESS;
}
