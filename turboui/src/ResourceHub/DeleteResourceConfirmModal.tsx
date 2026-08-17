import React from "react";

import { DangerButton, SecondaryButton } from "../Button";
import { Modal } from "../Modal";
import { t } from "../i18n";
import { Trans } from "react-i18next";

export function DeleteResourceConfirmModal({
  isOpen,
  onClose,
  resourceType,
  resourceName,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  resourceType: string;
  resourceName: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <p>
        <Trans
          i18nKey="turboui.resourceHub.areYouSureYouWantToDelete"
          values={{ v1: resourceType, v2: resourceName }}
          components={[<b>{resourceName}</b>]}
        />
      </p>
      <div className="flex items-center gap-2 mt-6">
        <DangerButton size="sm" onClick={handleDelete} loading={isDeleting} disabled={isDeleting} testId="submit">
          {t("turboui.resourceHub.delete")}
        </DangerButton>
        <SecondaryButton size="sm" onClick={onClose}>
          {t("turboui.resourceHub.cancel")}
        </SecondaryButton>
      </div>
    </Modal>
  );
}
