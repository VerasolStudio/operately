import React from "react";

import { Forms, Modal } from "turboui";
import * as AdminApi from "@/ee/admin_api";
import { useLoadedData } from "./loader";
import { t } from "@/i18n";

interface EnableFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function EnableFeatureModal({ isOpen, onClose, onSaved }: EnableFeatureModalProps) {
  const { company } = useLoadedData();
  const [enableFeature] = AdminApi.useEnableFeature();

  const form = Forms.useForm({
    fields: {
      feature: "",
    },
    cancel: onClose,
    submit: async () => {
      await enableFeature({
        companyId: company.id!,
        feature: form.values.feature,
      });

      onSaved?.();
      onClose();
      form.actions.reset();
    },
  });

  return (
    <Modal title={t("pages.saasAdminCompanyPage.enableFeatureFlag")} isOpen={isOpen} onClose={onClose}>
      <Forms.Form form={form}>
        <div className="mb-4 text-sm text-content-accent">
          {t("pages.saasAdminCompanyPage.enableAnExperimentalFeatureForThis")}
        </div>

        <Forms.FieldGroup>
          <Forms.TextInput field="feature" testId="feature-name" autoFocus placeholder="e.g. new_dashboard" />
        </Forms.FieldGroup>

        <Forms.Submit cancelText={t("pages.saasAdminCompanyPage.cancel")} />
      </Forms.Form>
    </Modal>
  );
}
