import React from "react";

import { PrimaryButton, SecondaryButton } from "../Button";
import { Chip } from "../DesignKit/Controls";
import { PageBody, PageHead, Panel, PanelRow, Screen } from "../DesignKit/Layout";
import { Dropdown } from "../FormElements/Dropdown";
import { SwitchToggle } from "../SwitchToggle";
import { Expandable } from "../Motion";
import { IconChecklist, IconClockPlay, IconMail, IconMailFast } from "../icons";
import classNames from "../utils/classnames";
import { t } from "../i18n";

export namespace AccountNotificationSettingsPage {
  export type EmailWindowMinutes = 5 | 10 | 15 | 30 | 60;
  export type DailySummaryDeliveryTime = string;

  export interface Props {
    notifyOnMention: boolean;
    emailWindowMinutes: EmailWindowMinutes;
    sendDailySummary: boolean;
    dailySummaryDeliveryTime: DailySummaryDeliveryTime;
    onNotifyOnMentionChange: (value: boolean) => void;
    onEmailWindowMinutesChange: (value: EmailWindowMinutes) => void;
    onSendDailySummaryChange: (value: boolean) => void;
    onDailySummaryDeliveryTimeChange: (value: DailySummaryDeliveryTime) => void;
    notifyAboutAssignments: boolean;
    onNotifyAboutAssignmentsChange: (value: boolean) => void;
    onSubmit: () => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
    homePath: string;
    settingsPath: string;
  }
}

interface DailySummaryTimeOption extends Dropdown.Item {
  value: AccountNotificationSettingsPage.DailySummaryDeliveryTime;
}

const WINDOW_MINUTES: AccountNotificationSettingsPage.EmailWindowMinutes[] = [5, 10, 15, 30, 60];

const DAILY_SUMMARY_TIME_OPTIONS: DailySummaryTimeOption[] = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, "0")}:00`;

  return {
    id: value,
    value,
    name: formatDailySummaryHourLabel(hour),
    testId: `daily-summary-delivery-time-option-${value}`,
  };
});

/**
 * Notification preferences.
 *
 * The page now opens by stating what the current settings actually do — "every
 * 15 minutes plus a daily summary at 08:00" — because the individual controls
 * below only make sense once you know what they add up to.
 *
 * The batch interval moved inside the "batched" card. It only applies when
 * that mode is selected, and a standalone dropdown gave no hint of that
 * dependency; nesting it makes the relationship structural.
 */
export function AccountNotificationSettingsPage(props: AccountNotificationSettingsPage.Props) {
  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await props.onSubmit();
    },
    [props],
  );

  return (
    <Screen
      title={t("turboui.accountNotificationSettingsPage.notificationSettings")}
      testId="account-notification-settings-page"
    >
      <PageHead
        crumbs={[
          { label: t("turboui.accountNotificationSettingsPage.settings"), to: props.settingsPath },
          { label: t("turboui.accountNotificationSettingsPage.notifications") },
        ]}
        title={t("turboui.accountNotificationSettingsPage.notifications")}
        subtitle={currentSettingsSummary(props)}
      />

      <PageBody width="reading">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3">
            <PreferenceCard
              title={t("turboui.accountNotificationSettingsPage.batchedNotifications")}
              description={t("turboui.accountNotificationSettingsPage.allActivityEmailsWaitForThe")}
              selected={!props.notifyOnMention}
              onClick={() => props.onNotifyOnMentionChange(false)}
              testId="email-preference-buffered"
              icon={<IconMail size={19} />}
            >
              <Expandable open={!props.notifyOnMention}>
                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <span className="text-xs text-content-dimmed">
                    {t("turboui.accountNotificationSettingsPage.interval")}
                  </span>
                  {WINDOW_MINUTES.map((minutes) => (
                    <Chip
                      key={minutes}
                      bordered
                      active={props.emailWindowMinutes === minutes}
                      onClick={() => props.onEmailWindowMinutesChange(minutes)}
                    >
                      {t("turboui.accountNotificationSettingsPage.minutes", { count: minutes })}
                    </Chip>
                  ))}
                </div>
              </Expandable>
            </PreferenceCard>

            <PreferenceCard
              title={t("turboui.accountNotificationSettingsPage.directMentionsAreInstant")}
              description={t("turboui.accountNotificationSettingsPage.emailsForDirectMentionsAreSent")}
              selected={props.notifyOnMention}
              onClick={() => props.onNotifyOnMentionChange(true)}
              testId="email-preference-mentions-only"
              icon={<IconMailFast size={19} />}
            />
          </div>

          <Panel>
            <PanelRow align="start">
              <IconClockPlay size={18} className="mt-0.5 flex-shrink-0 text-content-label" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-content-strong">
                  {t("turboui.accountNotificationSettingsPage.dailySummary")}
                </div>
                <div className="mt-0.5 text-xs text-content-subtle">
                  {t("turboui.accountNotificationSettingsPage.sendOneSummaryEmailAtThe")}
                </div>

                <Expandable open={props.sendDailySummary}>
                  <div className="max-w-[200px] pt-3">
                    <Dropdown
                      items={DAILY_SUMMARY_TIME_OPTIONS}
                      value={props.dailySummaryDeliveryTime}
                      onSelect={(item) => props.onDailySummaryDeliveryTimeChange(item.value)}
                      testId="daily-summary-delivery-time-dropdown"
                    />
                  </div>
                </Expandable>
              </div>

              <SwitchToggle
                label={t("turboui.accountNotificationSettingsPage.sendDailySummary")}
                value={props.sendDailySummary}
                setValue={props.onSendDailySummaryChange}
                testId={props.sendDailySummary ? "disable-daily-summary-toggle" : "enable-daily-summary-toggle"}
                labelHidden
              />
            </PanelRow>

            <PanelRow align="start">
              <IconChecklist size={18} className="mt-0.5 flex-shrink-0 text-content-label" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-content-strong">
                  {t("turboui.accountNotificationSettingsPage.assignmentsEmail")}
                </div>
                <div className="mt-0.5 text-xs text-content-subtle">
                  {t("turboui.accountNotificationSettingsPage.receiveADailyEmailWithYour")}
                </div>
              </div>

              <SwitchToggle
                label={t("turboui.accountNotificationSettingsPage.sendAssignmentsEmail")}
                value={props.notifyAboutAssignments}
                setValue={props.onNotifyAboutAssignmentsChange}
                testId={
                  props.notifyAboutAssignments ? "disable-assignments-email-toggle" : "enable-assignments-email-toggle"
                }
                labelHidden
              />
            </PanelRow>
          </Panel>

          <div className="flex items-center gap-2.5">
            <PrimaryButton size="sm" type="submit" loading={props.isSubmitting} testId="save-notification-settings">
              {t("turboui.accountNotificationSettingsPage.saveChanges")}
            </PrimaryButton>

            <SecondaryButton size="sm" type="button" onClick={props.onCancel} disabled={props.isSubmitting}>
              {t("turboui.accountNotificationSettingsPage.cancel")}
            </SecondaryButton>
          </div>
        </form>
      </PageBody>
    </Screen>
  );
}

function currentSettingsSummary(props: AccountNotificationSettingsPage.Props): string {
  const delivery = props.notifyOnMention
    ? t("turboui.accountNotificationSettingsPage.summaryMentionsInstant", { count: props.emailWindowMinutes })
    : t("turboui.accountNotificationSettingsPage.summaryBatched", { count: props.emailWindowMinutes });

  if (!props.sendDailySummary) return delivery;

  return t("turboui.accountNotificationSettingsPage.summaryWithDaily", {
    delivery,
    time: props.dailySummaryDeliveryTime,
  });
}

function formatDailySummaryHourLabel(hour: number) {
  if (hour === 0) return "12:00 AM";
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return "12:00 PM";

  return `${hour - 12}:00 PM`;
}

function PreferenceCard({
  title,
  description,
  selected,
  onClick,
  testId,
  icon,
  children,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  testId: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={classNames("w-full rounded-xl border p-3.5 text-left transition-colors", {
        "border-[1.5px] border-primary bg-primary-soft-bg": selected,
        "border-surface-outline hover:bg-surface-accent": !selected,
      })}
      data-test-id={testId}
    >
      <button type="button" className="flex w-full items-start gap-3 text-left" onClick={onClick}>
        <span className={classNames("mt-0.5", selected ? "text-primary" : "text-content-label")}>{icon}</span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-content-strong">{title}</span>
            <SelectionIndicator selected={selected} />
          </span>

          <span className="mt-1 block text-[13px] text-content-dimmed">{description}</span>
        </span>
      </button>

      {children && <div className="pl-[31px]">{children}</div>}
    </div>
  );
}

function SelectionIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      className={classNames("flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border", {
        "border-primary": selected,
        "border-line-strong": !selected,
      })}
      aria-hidden
    >
      {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
    </span>
  );
}
