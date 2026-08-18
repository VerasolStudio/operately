import React from "react";

import { DivLink } from "../Link";
import type { Navigation } from "../Page/Navigation";
import { Navigation as PageNavigation } from "../Page/Navigation";
import { useHtmlTitle } from "../Page/useHtmlTitle";
import { t } from "../i18n";

export namespace MemberTypeSelectionPage {
  export interface Props {
    companyName?: string;
    navigationItems?: Navigation.Item[];
    teamMemberPath: string;
    outsideCollaboratorPath: string;
    testId?: string;
  }
}

export function MemberTypeSelectionPage(props: MemberTypeSelectionPage.Props) {
  const pageTitle = props.companyName ? ["Invite people", props.companyName] : "Invite people";
  useHtmlTitle(pageTitle);

  return (
    // The rest of the redesign dropped the floating card in favour of a page
    // that starts at the top-left, under its own breadcrumb. This screen kept
    // the old shell, so arriving here felt like leaving the product.
    <div className="relative w-full pt-6 pb-12" data-test-id={props.testId}>
      {props.navigationItems && <PageNavigation items={props.navigationItems} />}

      <div className="max-w-2xl px-6 pt-2 sm:px-8">
        <h1 className="m-0 mb-6 text-2xl font-semibold tracking-[-0.01em] text-content-strong">
          {t("turboui.memberTypeSelectionPage.whoAreYouInviting")}
        </h1>

        <div className="flex flex-col gap-3">
          <MemberTypeCard
            title={t("turboui.memberTypeSelectionPage.teamMember")}
            description={t("turboui.memberTypeSelectionPage.thisPersonIsPartOfThe")}
            to={props.teamMemberPath}
            testId="select-team-member"
          />
          <MemberTypeCard
            title={t("turboui.memberTypeSelectionPage.outsideCollaborator")}
            description={t("turboui.memberTypeSelectionPage.thisPersonIsNotACompany")}
            to={props.outsideCollaboratorPath}
            testId="select-outside-collaborator"
          />
        </div>
      </div>
    </div>
  );
}

function MemberTypeCard({
  title,
  description,
  to,
  testId,
}: {
  title: string;
  description: string;
  to: string;
  testId: string;
}) {
  return (
    <DivLink
      to={to}
      className="block rounded-xl border border-line-soft bg-surface-base px-5 py-4 text-left transition-colors hover:border-primary-soft-border hover:bg-surface-accent"
      testId={testId}
    >
      <div className="text-[15px] font-semibold text-content-strong">{title}</div>
      <div className="mt-1 text-[13px] text-content-muted">{description}</div>
    </DivLink>
  );
}
