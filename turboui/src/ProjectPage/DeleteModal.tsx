import React from "react";
import { ProjectPage } from ".";
import { DangerButton, SecondaryButton } from "../Button";
import { WarningCallout } from "../Callouts";
import Modal from "../Modal";
import { t } from "../i18n";

export function DeleteModal(props: ProjectPage.State) {
  const title = "Delete " + props.project.name;

  return (
    <Modal isOpen={props.isDeleteModalOpen} onClose={props.closeDeleteModal} size="large" title={title}>
      <DeleteForm {...props} />
    </Modal>
  );
}

function DeleteForm(props: ProjectPage.State) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);

    try {
      await props.onProjectDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <WarningCallout
          message={t("turboui.projectPage.thisActionCannotBeUndone")}
          description={t("turboui.projectPage.deletingAProjectIsPermanentAnd", { v1: props.project.name })}
        />

        <div className="flex items-center gap-2">
          <DangerButton size="sm" type="submit" loading={isDeleting} disabled={isDeleting} testId="delete">
            {t("turboui.projectPage.deleteForever")}
          </DangerButton>
          <SecondaryButton size="sm" onClick={props.closeDeleteModal} testId="cancel">
            {t("turboui.projectPage.cancel")}
          </SecondaryButton>
        </div>
      </form>
    </div>
  );
}
