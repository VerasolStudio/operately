import React from "react";
import { DateField } from "../index";
import { OptionButton } from "./OptionButton";
import { t } from "../../i18n";

interface DateTypeSelectorProps {
  dateType: DateField.DateType;
  dateTypes: DateField.DateTypeOption[];
  setDateType: (type: DateField.DateType) => void;
}

export const DateTypeSelector: React.FC<DateTypeSelectorProps> = ({ dateType, dateTypes, setDateType }) => {
  const handleDateTypeChange = (type: DateField.DateType) => {
    setDateType(type);
  };

  return (
    <div className="mb-3 border-b border-stroke-dimmed pb-2">
      <label className="block text-xs font-medium text-content-base mb-1.5">{t("turboui.dateField.dateType")}</label>
      <div className="flex overflow-hidden rounded-md bg-surface-base">
        {dateTypes.map((type) => (
          <OptionButton
            key={type.value}
            onClick={() => handleDateTypeChange(type.value)}
            isSelected={dateType === type.value}
            className="flex-1 py-1 text-sm"
          >
            {type.label}
          </OptionButton>
        ))}
      </div>
    </div>
  );
};

export default DateTypeSelector;
