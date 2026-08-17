import React from "react";

import { PrimaryButton } from "../../Button";
import type { CompanyAdminManagePerson } from "../types";
import { InvitationUrl } from "./InvitationUrl";
import { LegacyModal } from "./LegacyModal";
import { t } from "../../i18n";

export function ReissueInvitationModal({
  isOpen,
  person,
  onClose,
  onGenerate,
  inviteUrl,
  isGenerated,
  loading,
}: {
  isOpen: boolean;
  person: CompanyAdminManagePerson | null;
  onClose: () => void;
  onGenerate: () => void;
  inviteUrl: string;
  isGenerated: boolean;
  loading: boolean;
}) {
  if (!person) return null;

  return (
    <LegacyModal
      title={t("turboui.companyAdminManagePeoplePage.regenerateTheInvitationURL")}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <div>
        By clicking the button below:
        <ul className="list-disc list-inside mt-2 block">
          <li>
            {t("turboui.companyAdminManagePeoplePage.aNewInvitationURLWillBeGeneratedFor", { v1: person.fullName })}
          </li>
          <li>{t("turboui.companyAdminManagePeoplePage.thePreviousURLWillNoLonger")}</li>
        </ul>
      </div>

      {!isGenerated && <NewInvitationButton onClick={onGenerate} loading={loading} />}
      {isGenerated && <InvitationUrl url={inviteUrl} personName={person.fullName} />}
    </LegacyModal>
  );
}

function NewInvitationButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex items-center mt-4">
      <PrimaryButton onClick={onClick} loading={loading} testId="confirm-reissue">
        {t("turboui.companyAdminManagePeoplePage.iUnderstandCreateNewInvitation")}
      </PrimaryButton>
    </div>
  );
}
