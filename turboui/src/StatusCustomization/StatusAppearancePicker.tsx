import * as React from "react";
import * as Popover from "@radix-ui/react-popover";

import classNames from "../utils/classnames";
import { StatusSelector } from "../StatusSelector";
import { createTestId } from "../TestableElement";
import { t } from "../i18n";

export type StatusAppearance = "gray" | "blue" | "green" | "red";

export const STATUS_APPEARANCES: Record<
  StatusAppearance,
  {
    label: string;
    description: string;
    color: StatusSelector.StatusColorName;
    icon: StatusSelector.StatusIconName;
    swatchClassName: string;
  }
> = {
  gray: {
    label: t("turboui.statusCustomization.notStartedGray"),
    description: t("turboui.statusCustomization.useForBacklogOrPausedWork"),
    color: "gray",
    icon: "circleDashed",
    swatchClassName: "bg-gray-400 dark:bg-gray-500",
  },
  blue: {
    label: t("turboui.statusCustomization.inProgressBlue"),
    description: t("turboui.statusCustomization.activeWorkUnderway"),
    color: "blue",
    icon: "circleDot",
    swatchClassName: "bg-brand-1",
  },
  green: {
    label: t("turboui.statusCustomization.doneGreen"),
    description: t("turboui.statusCustomization.completedOrApproved"),
    color: "green",
    icon: "circleCheck",
    swatchClassName: "bg-emerald-500",
  },
  red: {
    label: t("turboui.statusCustomization.canceledRed"),
    description: t("turboui.statusCustomization.blockedOrIntentionallyStopped"),
    color: "red",
    icon: "circleX",
    swatchClassName: "bg-rose-500",
  },
};

export const APPEARANCE_ORDER = Object.keys(STATUS_APPEARANCES) as StatusAppearance[];

export type StatusAppearancePickerProps = {
  value: StatusAppearance;
  onChange: (appearance: StatusAppearance) => void;
  testId?: string;
};

export function StatusAppearancePicker({ value, onChange, testId }: StatusAppearancePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentPreset = STATUS_APPEARANCES[value];
  const CurrentIcon = StatusSelector.STATUS_ICON_COMPONENTS[currentPreset.icon];
  const iconClass = StatusSelector.STATUS_COLOR_MAP[currentPreset.color].iconClass || "text-content-base";

  const handleChange = (appearance: StatusAppearance) => {
    onChange(appearance);
    setIsOpen(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex items-center justify-center p-1 rounded-md hover:bg-surface-dimmed transition"
          aria-label={t("turboui.statusCustomization.selectStatusColorAndIcon")}
          data-test-id={testId}
        >
          <CurrentIcon size={16} className={iconClass} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="rounded-lg border border-surface-outline bg-surface-base shadow-xl p-3 w-72 z-50"
          sideOffset={8}
          align="start"
        >
          <div className="flex flex-col gap-2">
            {APPEARANCE_ORDER.map((appearance) => {
              const preset = STATUS_APPEARANCES[appearance];
              const IconComponent = StatusSelector.STATUS_ICON_COMPONENTS[preset.icon];
              const presetIconClass = StatusSelector.STATUS_COLOR_MAP[preset.color].iconClass || "text-content-base";
              const isActive = appearance === value;
              return (
                <button
                  key={appearance}
                  type="button"
                  onClick={() => handleChange(appearance)}
                  className={classNames(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-left transition",
                    isActive ? "bg-surface-dimmed text-content-base" : "hover:bg-surface-dimmed text-content-base",
                  )}
                  data-test-id={createTestId("status-appearance-option", appearance)}
                >
                  <IconComponent size={16} className={presetIconClass} />
                  <span className="text-xs">{preset.description}</span>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
