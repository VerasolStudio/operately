import React from "react";

import { match } from "ts-pattern";
import { BillingLimitGuidanceNotice } from "../BillingLimitGuidanceNotice";
import { PrimaryButton, SecondaryButton } from "../Button";
import { InviteMemberForm } from "../InviteMemberForm";
import { Navigation } from "../Page/Navigation";
import { useHtmlTitle } from "../Page/useHtmlTitle";
import { AddedContent } from "./components/AddedContent";
import { InvitedContent } from "./components/InvitedContent";
import { t } from "../i18n";

export namespace CompanyAdminAddPeoplePage {
  export type PageState = PageStateForm | PageStateInvited | PageStateAdded;
  export type PageStateForm = { state: "form" };
  export type PageStateInvited = { state: "invited"; inviteLink: string; fullName: string; personId: string };
  export type PageStateAdded = { state: "added"; fullName: string; personId: string };
  export type MemberType = "team_member" | "outside_collaborator";

  export type ResourceType = "space" | "goal" | "project";

  export interface ResourceOption {
    id: string;
    name: string;
  }

  type AccessOptions = "full_access" | "edit_access" | "comment_access" | "view_access" | "no_access";

  export interface ResourceAccessEntry {
    key: number;
    resourceType: ResourceType;
    resourceId: string;
    resourceName: string;
    accessLevel: AccessOptions;
  }

  export interface PermissionOption {
    value: AccessOptions;
    label: string;
  }

  export interface BillingLimitGuidanceCta {
    label: string;
    to: string;
  }

  export interface BillingLimitGuidance {
    title: string;
    description: string;
    usageSummary: string;
    recommendedPlanLabel: string | null;
    cta?: BillingLimitGuidanceCta | null;
  }

  interface BaseProps {
    companyName: string;
    navigationItems: Navigation.Item[];
    state: PageState;
    formValues: InviteMemberForm.Values;
    formErrors?: InviteMemberForm.Errors;
    onFormChange: (field: InviteMemberForm.Field, value: string) => void;
    onSubmit: () => void | Promise<void>;
    onCancel?: () => void;
    onInviteAnother?: () => void;
    inviteAnotherLabel?: string;
    onGoBack?: () => void;
    goBackLabel?: string;
    isSubmitting?: boolean;
    memberType?: MemberType;
    spaces?: ResourceOption[];
    goals?: ResourceOption[];
    projects?: ResourceOption[];
    onGrantAccess?: (input: {
      personId: string;
      resources: Array<{ resourceType: ResourceType; resourceId: string; accessLevel: AccessOptions }>;
    }) => Promise<any>;
    isGrantingAccess?: boolean;
    permissionOptions?: PermissionOption[];
  }

  type PropsWithoutLimitGuidance = {
    limitGuidance?: null | undefined;
    onCloseLimitGuidance?: never;
  };

  type PropsWithLimitGuidance = {
    limitGuidance: BillingLimitGuidance;
    onCloseLimitGuidance: () => void;
  };

  export type Props = BaseProps & (PropsWithoutLimitGuidance | PropsWithLimitGuidance);
}

type MemberCopy = {
  pageTitlePrefix: string;
  formTitle: string;
  helperText: React.ReactNode;
  submitLabel: string;
  inviteAnotherLabel: string;
};

const helperTextWrapper = (content: React.ReactNode) => (
  <div className="mt-8 max-w-xl text-[13px] leading-relaxed text-content-muted">
    <span className="font-semibold text-content-strong">{t("turboui.companyAdminAddPeoplePage.whatHappensNext")}</span>{" "}
    {content}
  </div>
);

const memberCopy: Record<CompanyAdminAddPeoplePage.MemberType, MemberCopy> = {
  team_member: {
    pageTitlePrefix: "Invite new team member",
    formTitle: "Invite a new team member",
    helperText: helperTextWrapper(<>{t("turboui.companyAdminAddPeoplePage.ifTheNewMemberAlreadyHas")}</>),
    submitLabel: "Invite Member",
    inviteAnotherLabel: "Invite Another Member",
  },
  outside_collaborator: {
    pageTitlePrefix: "Invite new outside collaborator",
    formTitle: "Invite a new outside collaborator",
    helperText: helperTextWrapper(<>{t("turboui.companyAdminAddPeoplePage.ifTheOutsideCollaboratorAlreadyHas")}</>),
    submitLabel: "Invite Collaborator",
    inviteAnotherLabel: "Invite Another Outside Collaborator",
  },
};

const DEFAULT_PERMISSION_OPTIONS: CompanyAdminAddPeoplePage.PermissionOption[] = [
  { value: "full_access", label: t("turboui.companyAdminAddPeoplePage.fullAccess") },
  { value: "edit_access", label: t("turboui.companyAdminAddPeoplePage.editAccess") },
  { value: "comment_access", label: t("turboui.companyAdminAddPeoplePage.commentAccess") },
  { value: "view_access", label: t("turboui.companyAdminAddPeoplePage.viewAccess") },
];

export function CompanyAdminAddPeoplePage(props: CompanyAdminAddPeoplePage.Props) {
  const memberType = props.memberType ?? "team_member";
  const copy = memberCopy[memberType];
  const isGuest = memberType === "outside_collaborator";

  const resourceAccess = useResourceAccess();

  const handleGrantAccessButtonClick = React.useCallback(async () => {
    const personId = props.state.state === "invited" || props.state.state === "added" ? props.state.personId : "";
    await resourceAccess.submitEntries(personId, props.onGrantAccess || (() => Promise.resolve()));
  }, [resourceAccess, props.state, props.onGrantAccess]);

  const pageTitle = [copy.pageTitlePrefix, props.companyName];
  useHtmlTitle(pageTitle);

  const sizeClassName = props.state.state === "form" ? "max-w-2xl" : "max-w-4xl";
  // Horizontal padding now belongs to the page shell, so this only sets the
  // extra breathing room the success state wants above and below its content.
  const bodyClassName = props.state.state === "form" ? "pb-8" : "py-2 sm:py-4";

  const helperText = copy.helperText;
  const inviteAnotherLabel = props.inviteAnotherLabel ?? copy.inviteAnotherLabel;

  const showSuccessActions = props.state.state !== "form" && (!isGuest || resourceAccess.accessGranted);
  const showGrantAccessButton = props.state.state !== "form" && isGuest && !resourceAccess.accessGranted;
  const permissionOptions = props.permissionOptions ?? DEFAULT_PERMISSION_OPTIONS;

  return (
    <div className="relative w-full pt-6 pb-12">
      <Navigation items={props.navigationItems} />
      <div className={`${sizeClassName} px-6 pt-2 sm:px-8`}>
        <div className={bodyClassName}>
          {match(props.state)
            .with({ state: "form" }, () => (
              <InviteMemberForm
                title={copy.formTitle}
                values={props.formValues}
                errors={props.formErrors}
                onChange={props.onFormChange}
                onSubmit={props.onSubmit}
                onCancel={props.onCancel}
                isSubmitting={props.isSubmitting}
                submitLabel={copy.submitLabel}
              />
            ))
            .with({ state: "invited" }, (state) => (
              <InvitedContent
                fullName={state.fullName}
                inviteLink={state.inviteLink}
                isGuest={isGuest}
                spaces={props.spaces}
                goals={props.goals}
                projects={props.projects}
                entries={resourceAccess.entries}
                errors={resourceAccess.errors}
                onAddEntry={resourceAccess.addEntry}
                onUpdateEntry={resourceAccess.updateEntry}
                onRemoveEntry={resourceAccess.removeEntry}
                permissionOptions={permissionOptions}
                accessGranted={resourceAccess.accessGranted}
              />
            ))
            .with({ state: "added" }, (state) => (
              <AddedContent
                fullName={state.fullName}
                isGuest={isGuest}
                spaces={props.spaces}
                goals={props.goals}
                projects={props.projects}
                entries={resourceAccess.entries}
                errors={resourceAccess.errors}
                onAddEntry={resourceAccess.addEntry}
                onUpdateEntry={resourceAccess.updateEntry}
                onRemoveEntry={resourceAccess.removeEntry}
                permissionOptions={permissionOptions}
                accessGranted={resourceAccess.accessGranted}
              />
            ))
            .exhaustive()}
        </div>

        {match(props.state)
          .with({ state: "form" }, () => helperText)
          .otherwise(() =>
            showSuccessActions ? (
              <SuccessActions
                onInviteAnother={() => {
                  resourceAccess.reset();
                  props.onInviteAnother?.();
                }}
                inviteAnotherLabel={inviteAnotherLabel}
                onGoBack={props.onGoBack}
                goBackLabel={props.goBackLabel}
              />
            ) : showGrantAccessButton ? (
              <GrantAccessButton onClick={handleGrantAccessButtonClick} isLoading={props.isGrantingAccess} />
            ) : null,
          )}
      </div>

      {props.limitGuidance && (
        <BillingLimitGuidanceNotice isOpen={true} onClose={props.onCloseLimitGuidance} guidance={props.limitGuidance} />
      )}
    </div>
  );
}

function GrantAccessButton({ onClick, isLoading }: { onClick: () => void; isLoading?: boolean }) {
  return (
    <div className="mt-4 mb-16 flex">
      <PrimaryButton onClick={onClick} testId="grant-access-button" loading={isLoading}>
        {t("turboui.companyAdminAddPeoplePage.grantAccess")}
      </PrimaryButton>
    </div>
  );
}

function SuccessActions({
  onInviteAnother,
  inviteAnotherLabel,
  onGoBack,
  goBackLabel,
}: {
  onInviteAnother?: () => void;
  inviteAnotherLabel?: string;
  onGoBack?: () => void;
  goBackLabel?: string;
}) {
  const hasInviteAnother = Boolean(onInviteAnother);
  const hasGoBack = Boolean(onGoBack);
  if (!hasInviteAnother && !hasGoBack) return null;

  return (
    <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      {hasInviteAnother && (
        <PrimaryButton onClick={onInviteAnother} testId="invite-another-button">
          {inviteAnotherLabel ?? "Invite Another Member"}
        </PrimaryButton>
      )}
      {hasGoBack && (
        <SecondaryButton onClick={onGoBack} testId="invite-success-go-back">
          {goBackLabel ?? "Back to Manage Team Members"}
        </SecondaryButton>
      )}
    </div>
  );
}

function newResourceEntry(): CompanyAdminAddPeoplePage.ResourceAccessEntry {
  return {
    key: Math.random(),
    resourceType: "space",
    resourceId: "",
    resourceName: "",
    accessLevel: "edit_access",
  };
}

function useResourceAccess() {
  const [accessGranted, setAccessGranted] = React.useState(false);
  const [entries, setEntries] = React.useState<CompanyAdminAddPeoplePage.ResourceAccessEntry[]>([newResourceEntry()]);
  const [errors, setErrors] = React.useState<Record<number, string>>({});

  const addEntry = React.useCallback(() => {
    setEntries((prev) => [...prev, newResourceEntry()]);
  }, []);

  const updateEntry = React.useCallback(
    (key: number, updates: Partial<CompanyAdminAddPeoplePage.ResourceAccessEntry>) => {
      setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, ...updates } : e)));
      if (updates.resourceId) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    },
    [],
  );

  const removeEntry = React.useCallback((key: number) => {
    setEntries((prev) => prev.filter((e) => e.key !== key));
  }, []);

  const submitEntries = React.useCallback(
    async (
      personId: string,
      onGrantAccess: (input: {
        personId: string;
        resources: Array<{
          resourceType: CompanyAdminAddPeoplePage.ResourceType;
          resourceId: string;
          accessLevel: CompanyAdminAddPeoplePage.ResourceAccessEntry["accessLevel"];
        }>;
      }) => Promise<any>,
    ) => {
      const newErrors: Record<number, string> = {};
      entries.forEach((entry) => {
        if (!entry.resourceId) {
          newErrors[entry.key] = "Please select a resource";
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await onGrantAccess({
        personId,
        resources: entries.map((r) => ({
          resourceType: r.resourceType,
          resourceId: r.resourceId,
          accessLevel: r.accessLevel,
        })),
      });
      setAccessGranted(true);
    },
    [entries],
  );

  const reset = React.useCallback(() => {
    setEntries([newResourceEntry()]);
    setErrors({});
    setAccessGranted(false);
  }, []);

  return {
    entries,
    errors,
    accessGranted,
    addEntry,
    updateEntry,
    removeEntry,
    reset,
    submitEntries,
  };
}
