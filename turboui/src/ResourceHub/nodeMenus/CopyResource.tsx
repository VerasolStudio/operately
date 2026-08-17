import * as React from "react";

import * as Forms from "../../Forms";
import type { FormState } from "../../Forms";
import { MenuActionItem } from "../../Menu";
import Modal from "../../Modal";
import { createTestId } from "../../TestableElement";
import { ResourceHubFolderSelectField } from "../FolderSelectField";
import { getResourceName } from "../selectors";
import type { ResourceHubResource } from "../types";
import { t } from "../../i18n";

interface CopyResourceMenuItemProps {
  resource: { id: string; name?: string | null };
  showModal: () => void;
}

export function CopyResourceMenuItem({ resource, showModal }: CopyResourceMenuItemProps) {
  const testId = createTestId("copy-resource", resource.id);

  return (
    <MenuActionItem onClick={showModal} testId={testId}>
      {t("turboui.resourceHub.copy")}
    </MenuActionItem>
  );
}

interface CopyResourceModalProps {
  form: FormState<Record<string, unknown>>;
  resource: ResourceHubResource;
  isOpen: boolean;
  hideModal: () => void;
}

export function CopyResourceModal({ form, resource, isOpen, hideModal }: CopyResourceModalProps) {
  return (
    <Modal
      title={t("turboui.resourceHub.createACopyOf", { v1: getResourceName(resource) })}
      isOpen={isOpen}
      onClose={hideModal}
    >
      <Forms.Form form={form} testId="copy-resource-modal">
        <Forms.FieldGroup>
          <Forms.TextInput field="name" label={t("turboui.resourceHub.newDocumentName")} required />
          <ResourceHubFolderSelectField field="location" label={t("turboui.resourceHub.selectDestination")} />
        </Forms.FieldGroup>

        <Forms.Submit saveText={t("turboui.resourceHub.createCopy")} cancelText={t("turboui.resourceHub.cancel")} />
      </Forms.Form>
    </Modal>
  );
}
