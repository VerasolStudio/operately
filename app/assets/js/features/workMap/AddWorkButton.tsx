import * as React from "react";

import { useCompanyLoaderData } from "@/routes/useCompanyLoaderData";
import { NewDropdown } from "@/layouts/CompanyLayout/NewDropdown";

/**
 * The "＋ Add" button in a page header.
 *
 * It is the same menu the sidebar footer offers, styled as the page's primary
 * action. Index pages are where people actually decide to create something, so
 * the redesign puts the entry point there rather than only in global chrome.
 */
export function AddWorkButton() {
  const { company, canAddGoal, canAddProject } = useCompanyLoaderData();

  return (
    <NewDropdown
      canAddGoal={canAddGoal}
      canAddProject={canAddProject}
      canAddSpace={company.permissions?.canCreateSpace || false}
      canInvitePeople={company.permissions?.canInviteMembers || false}
      testId="page-new-dropdown"
      triggerClassName="flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-content transition-colors hover:bg-primary-hover"
    />
  );
}
