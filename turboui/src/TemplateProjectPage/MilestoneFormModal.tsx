import React, { useEffect } from "react";
import { PrimaryButton, SecondaryButton } from "../Button";
import Modal from "../Modal";
import { RelativeDayField } from "../RelativeDayField";
import { SwitchToggle } from "../SwitchToggle";
import { TextField } from "../TextField";
import type { TemplateProjectPage } from ".";
import { t } from "../i18n";

export function MilestoneFormModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: TemplateProjectPage.Props["onMilestoneCreate"];
}) {
  const [title, setTitle] = React.useState("");
  const [dueOffsetDays, setDueOffsetDays] = React.useState<number | null>(null);
  const [createMore, setCreateMore] = React.useState(false);

  const resetForm = () => {
    setTitle("");
    setDueOffsetDays(null);
    setCreateMore(false);
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const create = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    onCreate?.({ title: title.trim(), description: null, dueOffsetDays });

    if (createMore) {
      setTitle("");
      setDueOffsetDays(null);
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("turboui.templateProjectPage.createMilestone")} size="medium">
      <form onSubmit={create} className="space-y-6" data-test-id="add-template-milestone-form">
        <TextField
          variant="form-field"
          label={t("turboui.templateProjectPage.milestoneName")}
          text={title}
          onChange={setTitle}
          placeholder={t("turboui.templateProjectPage.enterMilestoneName")}
          autofocus
          onChangeOnType
          testId="template-milestone-name"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-content-base">
            {t("turboui.templateProjectPage.relativeDueDate")}
          </label>
          <RelativeDayField
            variant="form-field"
            value={dueOffsetDays}
            onChange={setDueOffsetDays}
            placeholder={t("turboui.templateProjectPage.setRelativeDate")}
          />
        </div>

        <div className="mt-8 flex items-center">
          <SwitchToggle
            value={createMore}
            setValue={setCreateMore}
            label={t("turboui.templateProjectPage.createMore")}
            testId="add-template-milestone-more-switch"
          />
          <div className="flex-1" />
          <div className="flex space-x-3">
            <SecondaryButton onClick={onClose} type="button">
              {t("turboui.templateProjectPage.cancel")}
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={!title.trim()}>
              {t("turboui.templateProjectPage.createMilestone2")}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}
