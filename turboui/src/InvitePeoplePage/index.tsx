import React, { useCallback, useState } from "react";

import { SecondaryButton } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog";
import { IconRotate } from "../icons";
import type { Navigation } from "../Page/Navigation";
import { Navigation as PageNavigation } from "../Page/Navigation";
import { useHtmlTitle } from "../Page/useHtmlTitle";
import { InviteLinkSection } from "./InviteLinkSection";
import { t } from "../i18n";

export namespace InvitePeoplePage {
  export interface Props {
    companyName?: string;
    navigationItems?: Navigation.Item[];
    invitationLink: string | null;

    inviteIndividuallyHref?: string;
    onInviteIndividually?: () => void;

    onResetLink: () => void | Promise<void>;
    isResettingLink?: boolean;
    linkEnabled?: boolean;
    onToggleLink?: (enabled: boolean) => void;
    domainRestriction?: DomainRestrictionControls;
    errorMessage?: string;
    testId?: string;
  }

  export type CopyState = "idle" | "copied" | "error";

  export interface DomainRestrictionControls {
    enabled: boolean;
    value: string;
    onToggle?: (enabled: boolean) => void;
    onChange?: (value: string) => void;
    toggleLabel?: string;
    label?: string;
    error?: string;
    testId?: string;
  }
}

export function InvitePeoplePage(props: InvitePeoplePage.Props) {
  const [resettingLink, setResettingLink] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [internalLinkEnabled, setInternalLinkEnabled] = useState(props.linkEnabled ?? true);
  const linkEnabled = props.linkEnabled ?? internalLinkEnabled;
  const canInviteIndividually = Boolean(props.inviteIndividuallyHref || props.onInviteIndividually);
  const isResettingLink = props.isResettingLink ?? resettingLink;

  const handleResetLink = useCallback(async () => {
    if (isResettingLink || !linkEnabled) return;

    setResettingLink(true);
    try {
      await props.onResetLink();
    } finally {
      setResettingLink(false);
    }
  }, [isResettingLink, linkEnabled]);

  const handleLinkToggle = useCallback(
    (enabled: boolean) => {
      props.onToggleLink?.(enabled);
      if (props.linkEnabled === undefined) {
        setInternalLinkEnabled(enabled);
      }
    },
    [props.onToggleLink, props.linkEnabled],
  );

  const handleDomainToggle = useCallback(
    (enabled: boolean) => {
      props.domainRestriction?.onToggle?.(enabled);
    },
    [props.domainRestriction],
  );

  const handleDomainChange = useCallback(
    (value: string) => {
      // Only update local typed value; actual submit happens on blur via onBlur.
      props.domainRestriction?.onChange?.(value);
    },
    [props.domainRestriction],
  );

  const handleOpenResetConfirm = useCallback(() => {
    if (isResettingLink || !linkEnabled) return;
    setShowResetConfirm(true);
  }, [isResettingLink, linkEnabled]);

  const handleCancelResetConfirm = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  const handleConfirmResetLink = useCallback(async () => {
    setShowResetConfirm(false);
    await handleResetLink();
  }, [handleResetLink]);

  const pageTitle = props.companyName ? ["Invite people", props.companyName] : "Invite people";
  useHtmlTitle(pageTitle);

  return (
    // Same shell as every other page in the redesign: no floating card, the
    // title left-aligned under the breadcrumb rather than centred in a panel.
    <div className="relative w-full pt-6 pb-12" data-test-id={props.testId}>
      {props.navigationItems && <PageNavigation items={props.navigationItems} />}

      <div className="max-w-2xl px-6 pt-2 sm:px-8">
        <h1 className="m-0 mb-8 text-2xl font-semibold tracking-[-0.01em] text-content-strong">
          {t("turboui.invitePeoplePage.bringYourTeamOnBoard")}
        </h1>

        {props.errorMessage ? (
          <div
            className="mb-6 rounded-lg border border-banner-danger-border bg-banner-danger-bg px-4 py-3 text-sm text-banner-danger-content"
            data-test-id="invite-people-error"
          >
            {props.errorMessage}
          </div>
        ) : null}

        <div className="space-y-8">
          <InviteLinkSection
            invitationLink={props.invitationLink}
            linkEnabled={linkEnabled}
            onToggleLink={handleLinkToggle}
            onOpenResetConfirm={handleOpenResetConfirm}
            isResettingLink={isResettingLink}
            domainRestriction={props.domainRestriction}
            onDomainToggle={handleDomainToggle}
            onDomainChange={handleDomainChange}
          />

          <section className="rounded-xl border border-line-soft bg-surface-base p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-content-strong">
                  {t("turboui.invitePeoplePage.inviteOnePerson")}
                </h2>
                <p className="mt-1 text-[13px] text-content-muted">
                  {t("turboui.invitePeoplePage.createAPersonalLinkToShare")}
                </p>
              </div>
              <SecondaryButton
                linkTo={props.inviteIndividuallyHref}
                onClick={props.inviteIndividuallyHref ? undefined : props.onInviteIndividually}
                testId="invite-people-individual"
                disabled={!canInviteIndividually}
                size="sm"
              >
                {t("turboui.invitePeoplePage.createInvite")}
              </SecondaryButton>
            </div>
          </section>
        </div>

        <ConfirmDialog
          isOpen={showResetConfirm}
          onConfirm={handleConfirmResetLink}
          onCancel={handleCancelResetConfirm}
          title={t("turboui.invitePeoplePage.generateANewLink")}
          message={t("turboui.invitePeoplePage.weLlDisableTheCurrentInvite")}
          confirmText={t("turboui.invitePeoplePage.generateNewLink")}
          cancelText={t("turboui.invitePeoplePage.cancel")}
          variant="danger"
          icon={IconRotate}
          testId="invite-people-reset-confirm"
        />
      </div>
    </div>
  );
}
