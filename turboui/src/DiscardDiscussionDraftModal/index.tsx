import * as React from "react";

import { Form, Submit, useForm } from "../Forms";
import { Modal } from "../Modal";
import { showSuccessToast } from "../Toasts";
import { t } from "../i18n";

export interface DiscardDiscussionDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => Promise<void>;
  onSuccess: () => void;
}

export function DiscardDiscussionDraftModal({
  isOpen,
  onClose,
  onDiscard,
  onSuccess,
}: DiscardDiscussionDraftModalProps) {
  const form = useForm({
    fields: {},
    cancel: onClose,
    submit: async () => {
      await onDiscard();
      showSuccessToast(
        t("turboui.discardDiscussionDraftModal.draftDiscarded"),
        t("turboui.discardDiscussionDraftModal.theDraftHasBeenDiscarded"),
      );
      onSuccess();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Form form={form}>
        <p>{t("turboui.discardDiscussionDraftModal.areYouSureYouWantTo")}</p>
        <Submit
          saveText={t("turboui.discardDiscussionDraftModal.discardDraft")}
          cancelText={t("turboui.discardDiscussionDraftModal.cancel")}
        />
      </Form>
    </Modal>
  );
}
