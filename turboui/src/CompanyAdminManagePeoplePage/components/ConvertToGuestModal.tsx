import React from "react";

import { PrimaryButton, SecondaryButton } from "../../Button";
import type { CompanyAdminManagePerson } from "../types";
import { LegacyModal } from "./LegacyModal";
import { t } from "../../i18n";

interface Props {
  isOpen: boolean;
  person: CompanyAdminManagePerson | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function ConvertToGuestModal({ isOpen, person, onClose, onConfirm, loading }: Props) {
  if (!person) return null;

  const firstName = firstNameFromFullName(person.fullName);

  return (
    <LegacyModal
      title={t("turboui.companyAdminManagePeoplePage.convertToOutsideCollaborator", { v1: firstName })}
      isOpen={isOpen}
      onClose={onClose}
      size="base"
    >
      <div>
        {t("turboui.companyAdminManagePeoplePage.thisWillRemoveTeamMemberPermissions", { v1: firstName })} They will
        have access only to work where they are explicitly invited.
      </div>

      <div className="mt-8 flex gap-2">
        <PrimaryButton onClick={onConfirm} loading={loading} testId="confirm-convert-member-to-guest" size="sm">
          {t("turboui.companyAdminManagePeoplePage.convert")}
        </PrimaryButton>
        <SecondaryButton onClick={onClose} testId="cancel-convert-member-to-guest" size="sm">
          {t("turboui.companyAdminManagePeoplePage.cancel")}
        </SecondaryButton>
      </div>
    </LegacyModal>
  );
}

function firstNameFromFullName(fullName: string) {
  return fullName.split(" ")[0] || fullName;
}
