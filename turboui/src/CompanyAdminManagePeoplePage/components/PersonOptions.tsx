import React from "react";

import { Menu, MenuActionItem, MenuLinkItem, SubMenu } from "../../Menu";
import { IconId, IconLink, IconLock, IconPencil, IconRefresh, IconRotateDot, IconSwitch, IconUserX } from "../../icons";
import { createTestId } from "../../TestableElement";
import { AccessOptions, CompanyAdminManagePerson, Permissions } from "../types";
import { t } from "../../i18n";

type PersonHandler = (person: CompanyAdminManagePerson) => void;

interface Props {
  person: CompanyAdminManagePerson;
  onOpenRemove: PersonHandler;
  onOpenConvert: PersonHandler;
  onOpenReissue: PersonHandler;
  onOpenView: PersonHandler;
  onOpenRenew: PersonHandler;
  onChangeAccessLevel: (personId: string, accessLevel: AccessOptions) => void;
  permissions?: Permissions;
  showConvertToGuest?: boolean;
  showAccessLevelOptions?: boolean;
}

export function PersonOptions({
  person,
  onOpenRemove,
  onOpenConvert,
  onOpenReissue,
  onOpenView,
  onOpenRenew,
  onChangeAccessLevel,
  permissions,
  showConvertToGuest,
  showAccessLevelOptions = false,
}: Props) {
  const testId = createTestId("person-options", person.id);
  const size = person.hasOpenInvitation ? "medium" : "small";
  const isInvited = person.hasOpenInvitation;

  return (
    <Menu testId={testId} size={size}>
      <MenuLinkItem icon={IconId} testId="view-profile" to={person.profilePath}>
        {t("turboui.companyAdminManagePeoplePage.viewProfile")}
      </MenuLinkItem>

      {permissions?.canEditMembers && (
        <MenuLinkItem icon={IconPencil} testId={createTestId("edit", person.id)} to={person.profileEditPath}>
          {t("turboui.companyAdminManagePeoplePage.editProfile")}
        </MenuLinkItem>
      )}

      {!isInvited && permissions?.canEditMembersAccessLevels && showAccessLevelOptions && (
        <SubMenu icon={IconLock} label={t("turboui.companyAdminManagePeoplePage.changeAccessLevel")} hidden={false}>
          <MenuActionItem
            testId={createTestId("edit-access", person.id)}
            onClick={() => onChangeAccessLevel(person.id, "edit_access")}
          >
            {t("turboui.companyAdminManagePeoplePage.editAccess")}
          </MenuActionItem>
          <MenuActionItem
            testId={createTestId("comment-access", person.id)}
            onClick={() => onChangeAccessLevel(person.id, "comment_access")}
          >
            {t("turboui.companyAdminManagePeoplePage.commentAccess")}
          </MenuActionItem>
          <MenuActionItem
            testId={createTestId("view-access", person.id)}
            onClick={() => onChangeAccessLevel(person.id, "view_access")}
          >
            {t("turboui.companyAdminManagePeoplePage.viewAccess")}
          </MenuActionItem>
        </SubMenu>
      )}

      {showConvertToGuest && permissions?.canInviteMembers && person.canRemove && (
        <MenuActionItem
          icon={IconSwitch}
          onClick={() => onOpenConvert(person)}
          testId={createTestId("convert-to-guest", person.id)}
        >
          {t("turboui.companyAdminManagePeoplePage.convertToOutsideCollaborator")}
        </MenuActionItem>
      )}

      {permissions?.canInviteMembers && person.invitationExpired && (
        <MenuActionItem
          icon={IconRotateDot}
          onClick={() => onOpenRenew(person)}
          testId={createTestId("renew-invitation", person.id)}
        >
          {t("turboui.companyAdminManagePeoplePage.renewInvitation")}
        </MenuActionItem>
      )}

      {person.hasValidInvite && !person.invitationExpired && (
        <MenuActionItem
          icon={IconLink}
          onClick={() => onOpenView(person)}
          testId={createTestId("view-invite-link", person.id)}
        >
          {t("turboui.companyAdminManagePeoplePage.viewInvitationLink")}
        </MenuActionItem>
      )}

      {permissions?.canInviteMembers && person.hasOpenInvitation && !person.invitationExpired && (
        <MenuActionItem
          icon={IconRefresh}
          onClick={() => onOpenReissue(person)}
          testId={createTestId("reissue-token", person.id)}
        >
          {t("turboui.companyAdminManagePeoplePage.reissueInvitation")}
        </MenuActionItem>
      )}

      {permissions?.canRemoveMembers && person.canRemove && (
        <MenuActionItem
          icon={IconUserX}
          onClick={() => onOpenRemove(person)}
          danger
          testId={createTestId("remove-person", person.id)}
        >
          {person.hasOpenInvitation ? "Revoke Invitation" : "Deactivate Account"}
        </MenuActionItem>
      )}
    </Menu>
  );
}
