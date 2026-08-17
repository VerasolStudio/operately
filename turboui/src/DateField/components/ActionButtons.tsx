import React from "react";
import { DateField } from "../index";
import { SecondaryButton, PrimaryButton } from "../../Button";
import { t } from "../../i18n";

interface ActionButtonsProps {
  selectedDate: DateField.ContextualDate | null;
  onCancel?: () => void;
  onSetDeadline?: (selectedDate: DateField.ContextualDate | null) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ selectedDate, onCancel, onSetDeadline }) => {
  const handleConfirm = () => {
    if (selectedDate) {
      onSetDeadline?.(selectedDate);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 mt-6">
      <SecondaryButton onClick={() => onCancel?.()} size="sm" testId="date-field-cancel">
        {t("turboui.dateField.cancel")}
      </SecondaryButton>
      <PrimaryButton onClick={handleConfirm} disabled={!selectedDate} size="sm" testId="date-field-confirm">
        <span className="whitespace-nowrap">{t("turboui.dateField.confirm")}</span>
      </PrimaryButton>
    </div>
  );
};

export default ActionButtons;
