import React from "react";

import { PrimaryButton, SecondaryButton } from "../../Button";
import type { CompanyAdminManagePerson } from "../types";
import { LegacyModal } from "./LegacyModal";
import { t } from "../../i18n";

export function RemovePersonModal({
  isOpen,
  person,
  onClose,
  onConfirm,
  loading,
}: {
  isOpen: boolean;
  person: CompanyAdminManagePerson | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!person) return null;

  const firstName = firstNameFromFullName(person.fullName);
  const isInvitation = person.hasOpenInvitation;

  const title = isInvitation
    ? t("turboui.companyAdminManagePeoplePage.revokeInvitationFor", { v1: firstName })
    : t("turboui.companyAdminManagePeoplePage.removeFromTheCompany", { v1: firstName });
  const message = isInvitation
    ? t("turboui.companyAdminManagePeoplePage.thisWillRevokeSInvitationYou", { v1: firstName })
    : t("turboui.companyAdminManagePeoplePage.thisWillDeactivateSAccountRestricting", { v1: firstName });
  const buttonText = isInvitation ? "Revoke" : "Deactivate";

  return (
    <LegacyModal title={title} isOpen={isOpen} onClose={onClose} size="base">
      <div>{message}</div>
      <div className="mt-8 flex gap-2">
        <PrimaryButton onClick={onConfirm} loading={loading} testId="confirm-remove-member" size="sm">
          {buttonText}
        </PrimaryButton>
        <SecondaryButton onClick={onClose} testId="cancel-remove-member" size="sm">
          {t("turboui.companyAdminManagePeoplePage.cancel")}
        </SecondaryButton>
      </div>
    </LegacyModal>
  );
}

function firstNameFromFullName(fullName: string) {
  return fullName.split(" ")[0] || fullName;
}
