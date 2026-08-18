import React from "react";

import { Avatar } from "../../Avatar";
import { BlackLink } from "../../Link";
import { AccessLevelBadge } from "../../AccessLevelBadge";
import { IconAlertTriangle } from "../../icons";
import { AccessOptions, CompanyAdminManagePerson, Permissions } from "../types";
import { PersonOptions } from "./PersonOptions";
import { createTestId } from "../../TestableElement";
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

export function PersonRow({
  person,
  onOpenRemove,
  onOpenConvert,
  onOpenReissue,
  onOpenView,
  onOpenRenew,
  onChangeAccessLevel,
  permissions,
  showConvertToGuest,
  showAccessLevelOptions,
}: Props) {
  return (
    <div
      className="flex items-start justify-between gap-3 border-b border-line-soft px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-highlight sm:items-center"
      data-test-id={createTestId("person-row", person.id)}
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <Avatar className="mt-0.5 sm:mt-0" person={person} size={32} />
        <PersonInfo person={person} showAccessLevelOptions={showAccessLevelOptions} />
      </div>

      <div className="flex gap-2 items-start sm:items-center">
        <div className="hidden sm:block">
          <InvitationStatus person={person} />
        </div>

        {!person.hasOpenInvitation && person.accessLevel !== undefined && showAccessLevelOptions && (
          <AccessLevelBadge accessLevel={person.accessLevel} className="hidden sm:block" />
        )}

        <PersonOptions
          person={person}
          onOpenRemove={onOpenRemove}
          onOpenConvert={onOpenConvert}
          onOpenReissue={onOpenReissue}
          onOpenView={onOpenView}
          onOpenRenew={onOpenRenew}
          onChangeAccessLevel={onChangeAccessLevel}
          permissions={permissions}
          showConvertToGuest={showConvertToGuest}
          showAccessLevelOptions={showAccessLevelOptions}
        />
      </div>
    </div>
  );
}

function PersonInfo({
  person,
  showAccessLevelOptions,
}: {
  person: CompanyAdminManagePerson;
  showAccessLevelOptions?: boolean;
}) {
  return (
    <div>
      <BlackLink to={person.profilePath} className="text-sm font-medium" underline="hover">
        {person.fullName}
      </BlackLink>

      <div className="flex flex-col text-xs text-content-subtle sm:block">
        <span>{person.title}</span>
        <span className="hidden sm:inline"> &middot; </span>
        <span className="mt-0.5 break-all">{person.email}</span>
        {!person.hasOpenInvitation && person.accessLevel !== undefined && showAccessLevelOptions && (
          <div>
            <AccessLevelBadge accessLevel={person.accessLevel} size="xs" className="block mt-2 sm:hidden" />
          </div>
        )}
      </div>
    </div>
  );
}

function InvitationStatus({ person }: { person: CompanyAdminManagePerson }) {
  if (person.invitationExpired) {
    return (
      <div className="text-content-error font-semibold flex items-center gap-2">
        <IconAlertTriangle size={20} />
        {t("turboui.companyAdminManagePeoplePage.invitationExpired")}
      </div>
    );
  }

  if (person.hasValidInvite && person.expiresIn) {
    return <div>{t("turboui.companyAdminManagePeoplePage.expiresIn", { v1: person.expiresIn })}</div>;
  }

  return null;
}
