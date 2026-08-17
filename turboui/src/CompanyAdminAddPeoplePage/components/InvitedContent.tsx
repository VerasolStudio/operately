import React from "react";
import { InviteLinkPanel } from "../../InviteLinkPanel";
import { ResourceAccessContent, ResourceAccessContentProps } from "./ResourceAccessContent";
import { t } from "../../i18n";

interface Props extends ResourceAccessContentProps {
  fullName: string;
  inviteLink: string;
  isGuest: boolean;
}

export function InvitedContent(props: Props) {
  return (
    <div>
      <div className="text-content-accent text-xl sm:text-2xl font-extrabold">
        {props.fullName} has been invited by email
      </div>

      <InviteLinkPanel
        link={props.inviteLink}
        description={t("turboui.companyAdminAddPeoplePage.theyVeReceivedAnEmailWith")}
        footer="This link (including the one in their email) expires in 24 hours."
      />

      {props.isGuest && <ResourceAccessContent {...props} />}
    </div>
  );
}
