import React, { useCallback } from "react";

import { PrimaryButton } from "../Button";
import { IconCopy } from "../icons";
import { SwitchToggle } from "../SwitchToggle";
import { TextField } from "../TextField";
import { showErrorToast, showSuccessToast } from "../Toasts";
import classNames from "../utils/classnames";
import { t } from "../i18n";
import { Trans } from "react-i18next";

interface DomainRestrictionControls {
  enabled: boolean;
  value: string;
  onToggle?: (enabled: boolean) => void;
  onChange?: (value: string) => void;
  toggleLabel?: string;
  label?: string;
  error?: string;
  testId?: string;
}

interface InviteLinkSectionProps {
  invitationLink: string | null;
  linkEnabled: boolean;
  onToggleLink: (enabled: boolean) => void;
  onOpenResetConfirm: () => void;
  isResettingLink: boolean;
  domainRestriction?: DomainRestrictionControls;
  onDomainToggle: (enabled: boolean) => void;
  onDomainChange: (value: string) => void;
}

export function InviteLinkSection({
  invitationLink,
  linkEnabled,
  onToggleLink,
  onOpenResetConfirm,
  isResettingLink,
  domainRestriction,
  onDomainToggle,
  onDomainChange,
}: InviteLinkSectionProps) {
  const canCopy = Boolean(invitationLink) && linkEnabled;
  const domainTestId = domainRestriction?.testId ?? "invite-people-domain-toggle";
  const domainRadioName = `${domainTestId}-options`;

  const handleCopyLink = useCallback(async () => {
    if (!invitationLink || !linkEnabled) return;

    try {
      await copyToClipboard(invitationLink);
      showSuccessToast(
        t("turboui.invitePeoplePage.linkCopied"),
        t("turboui.invitePeoplePage.theInviteLinkHasBeenCopied"),
      );
    } catch {
      showErrorToast(t("turboui.invitePeoplePage.copyFailed"), t("turboui.invitePeoplePage.weCouldnTCopyTheInvite"));
      return;
    }
  }, [invitationLink, linkEnabled]);

  return (
    <section className="rounded-lg border border-surface-outline bg-surface-base p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("turboui.invitePeoplePage.inviteYourWholeTeamAtOnce")}</h2>
          <p className="mt-1 text-sm text-content-dimmed">{t("turboui.invitePeoplePage.shareItInGroupChatVia")}</p>
        </div>
        <SwitchToggle
          value={linkEnabled}
          setValue={onToggleLink}
          label={t("turboui.invitePeoplePage.enableInviteLink")}
          labelHidden
          testId="invite-people-link-toggle"
        />
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex gap-2 flex-row items-stretch">
          <input
            className={classNames(
              "flex-1 rounded-lg border border-surface-outline bg-surface-base px-3 py-2 text-sm text-content-base focus:border-brand-1 focus:outline-none",
              !linkEnabled && "opacity-60",
            )}
            value={linkEnabled ? (invitationLink ?? "") : ""}
            placeholder={linkEnabled ? "Generating invite link..." : "Invite link disabled"}
            readOnly
            disabled={!linkEnabled}
            data-test-id="invite-people-invite-link"
            onFocus={(event) => event.currentTarget.select()}
          />
          <PrimaryButton
            onClick={handleCopyLink}
            disabled={!canCopy}
            size="sm"
            icon={IconCopy}
            testId="invite-people-copy-link"
          >
            {t("turboui.invitePeoplePage.copy")}
          </PrimaryButton>
        </div>

        {linkEnabled ? (
          <p className="text-xs text-content-dimmed">
            <Trans
              i18nKey="turboui.invitePeoplePage.onlyCompanyAdminsCanSeeAndShare"
              components={[
                <button
                  type="button"
                  onClick={onOpenResetConfirm}
                  disabled={isResettingLink}
                  data-test-id="invite-people-reset-link"
                  className={classNames(
                    "font-medium text-content-link underline focus:outline-none",
                    isResettingLink && "cursor-not-allowed opacity-60",
                  )}
                >
                  generate a new link
                </button>,
              ]}
            />
          </p>
        ) : null}
      </div>

      {linkEnabled && domainRestriction ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-content-strong">{t("turboui.invitePeoplePage.whoCanJoin")}</p>

          <div className="space-y-1" data-test-id={domainTestId}>
            <label
              className={classNames(
                "inline-flex items-center gap-3 text-sm text-content-strong",
                domainRestriction.onToggle ? "cursor-pointer" : "cursor-default opacity-60",
              )}
            >
              <input
                type="radio"
                name={domainRadioName}
                value="anyone"
                checked={!domainRestriction.enabled}
                onChange={() => onDomainToggle(false)}
                disabled={!domainRestriction.onToggle}
                className="h-4 w-4 border-surface-outline text-brand-1 focus:ring-brand-1"
                data-test-id={`${domainTestId}-anyone`}
              />
              <span>{t("turboui.invitePeoplePage.anyoneWithTheLink")}</span>
            </label>

            <div className="space-y-2 text-sm text-content-strong">
              <label
                className={classNames(
                  "inline-flex items-center gap-3",
                  domainRestriction.onToggle ? "cursor-pointer" : "cursor-default opacity-60",
                )}
              >
                <input
                  type="radio"
                  name={domainRadioName}
                  value="domains"
                  checked={domainRestriction.enabled}
                  onChange={() => onDomainToggle(true)}
                  disabled={!domainRestriction.onToggle}
                  className="h-4 w-4 border-surface-outline text-brand-1 focus:ring-brand-1"
                  data-test-id={`${domainTestId}-restricted`}
                />
                <span data-test-id={`${domainTestId}-label`}>
                  {domainRestriction.label ?? "Trusted email domains only"}
                </span>
              </label>

              {domainRestriction.enabled && (
                <div className="ml-7 space-y-2">
                  <TextField
                    variant="form-field"
                    text={domainRestriction.value}
                    onChange={onDomainChange}
                    placeholder={t("turboui.invitePeoplePage.eGAcmeComExampleOrg")}
                    error={domainRestriction.error}
                    className={classNames("sm:max-w-md", !domainRestriction.onChange && "opacity-60")}
                    testId="invite-people-domain-input"
                    readonly={!domainRestriction.onChange}
                  />
                  <p className="text-xs text-content-dimmed">
                    {t("turboui.invitePeoplePage.separateMultipleDomainsWithCommas")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

async function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard API unavailable");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.setAttribute("readonly", "true");

  document.body.appendChild(textarea);
  textarea.select();

  const successful = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!successful) {
    throw new Error("Copy command failed");
  }
}
