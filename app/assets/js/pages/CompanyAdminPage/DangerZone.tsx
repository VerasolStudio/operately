import React, { useState } from "react";
import * as Companies from "@/models/companies";
import { useLoadedData } from "./loader";
import { useMe } from "@/contexts/CurrentCompanyContext";
import { includesId, Paths } from "@/routes/paths";
import {
  showErrorToast,
  IconTrash,
  DangerButton,
  SecondaryButton,
  WarningCallout,
  OptionsMenuItem,
  Modal,
} from "turboui";

import { Section } from "./Section";
import { t } from "@/i18n";

export function DangerZone() {
  const { company, ownerIds } = useLoadedData();
  const me = useMe();
  // Nullable for the same reason as the owners menu, and deleting a company is
  // the last thing that should appear to someone we cannot identify.
  const amIOwner = !!me?.id && includesId(ownerIds, me.id);

  if (!amIOwner) return null;

  return (
    <Section title={t("pages.companyAdminPage.dangerZone")}>
      <div className="bg-surface-base">
        <DeleteCompanyItem companyName={company.name!} />
      </div>
    </Section>
  );
}

function DeleteCompanyItem({ companyName }: { companyName: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <OptionsMenuItem
        icon={IconTrash}
        title={t("pages.companyAdminPage.deleteThisCompany")}
        onClick={() => setShowModal(true)}
        danger
        description={t("pages.companyAdminPage.permanentlyDeleteTheCompanyAndAll")}
      />

      {showModal && (
        <DeleteCompanyModal companyName={companyName} isOpen={showModal} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

function DeleteCompanyModal({
  companyName,
  isOpen,
  onClose,
}: {
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [confirmName, setConfirmName] = useState("");
  const [deleteCompanyMutation, { loading }] = Companies.useDeleteCompany();

  const handleConfirm = async () => {
    if (confirmName !== companyName) return;

    try {
      await deleteCompanyMutation({});
      window.location.href = Paths.lobbyPath();
    } catch (e) {
      console.error("Failed to delete company", e);
      showErrorToast(t("pages.companyAdminPage.error"), t("pages.companyAdminPage.failedToDeleteCompany"));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("pages.companyAdminPage.deleteCompany")}
      size="medium"
      closeOnBackdropClick={!loading}
    >
      <div className="space-y-4">
        <WarningCallout
          message={t("pages.companyAdminPage.thisActionCannotBeUndone")}
          description={
            <>
              This will permanently delete <strong>{companyName}</strong> and its spaces, goals, projects, and other
              resources.
            </>
          }
        />

        <div>
          <label className="block text-sm font-medium text-content-accent mb-1">
            {t("pages.companyAdminPage.toConfirmType", { v1: companyName })}
          </label>
          <input
            type="text"
            data-test-id="confirm-delete-input"
            className="w-full px-3 py-2 border border-stroke-base rounded focus:outline-none bg-surface-base text-content-accent"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="pt-4 flex justify-start gap-2">
          <DangerButton
            onClick={handleConfirm}
            disabled={confirmName !== companyName || loading}
            loading={loading}
            testId="confirm-delete-button"
          >
            {loading ? "Deleting..." : "Delete Company"}
          </DangerButton>
          <SecondaryButton onClick={onClose}>{t("pages.companyAdminPage.cancel")}</SecondaryButton>
        </div>
      </div>
    </Modal>
  );
}
