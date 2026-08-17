import React from "react";

import { useNavigate } from "react-router";

import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";
import * as Spaces from "@/models/spaces";

import { applyAccessLevelConstraints, initialAccessLevels } from "@/features/spaces";
import { usePaths } from "@/routes/paths";
import { PageModule } from "@/routes/types";
import { AccessLevelSummary, Forms, SecondaryButton, useFormContext } from "turboui";
import { t } from "@/i18n";

export default { name: "SpaceAddPage", loader: Pages.emptyLoader, Page } as PageModule;

function Page() {
  const navigate = useNavigate();
  const [create] = Spaces.useCreateSpace();
  const paths = usePaths();

  const form = Forms.useForm({
    fields: {
      name: "",
      mission: "",
      access: initialAccessLevels(),
      showAdvancedAccess: false,
    },
    onChange: ({ newValues }) => {
      newValues.access = applyAccessLevelConstraints(newValues.access);
    },
    submit: async () => {
      const res = await create({
        name: form.values.name,
        mission: form.values.mission,
        publicPermissions: form.values.access.anonymous,
        companyPermissions: form.values.access.companyMembers,
      });

      navigate(paths.spacePath(res.space?.id));
    },
    onError: (error) => {
      const data = error.response?.data as { error?: string; message?: string } | undefined;
      const message = data?.message || "There was an unexpected error. Please try again later.";

      form.actions.addErrors({ _submit: message });
    },
  });

  return (
    <Pages.Page title={t("pages.spaceAddPage.createANewSpace")}>
      <Paper.Root size="small">
        <Paper.NavigateBack to={paths.homePath()} title={t("pages.spaceAddPage.backToHome")} />
        <Title />

        <Forms.Form form={form}>
          <Paper.Body minHeight="none">
            <Forms.FieldGroup>
              <NameInput field="name" />
              <PurposeInput field="mission" />
            </Forms.FieldGroup>

            <Forms.FormError message={form.errors._submit} when={!!form.errors._submit} className="mt-4" />

            <PrivacyLevel />
          </Paper.Body>

          <Forms.Submit saveText={t("pages.spaceAddPage.createSpace")} layout="centered" buttonSize="base" />
        </Forms.Form>
      </Paper.Root>
    </Pages.Page>
  );
}

function Title() {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold">{t("pages.spaceAddPage.createANewSpace")}</h1>
      <span className="text-content-dimmed">{t("pages.spaceAddPage.spacesHelpOrganizeProjectsGoalsAnd")}</span>
    </div>
  );
}

function NameInput({ field }: { field: string }) {
  const form = useFormContext();

  return (
    <Forms.TextInput
      label={t("pages.spaceAddPage.spaceName")}
      field={field}
      placeholder={t("pages.spaceAddPage.eGMarketing")}
      required
      autoFocus
      onEnter={(event) => {
        event.preventDefault();
        void form.actions.submit();
      }}
    />
  );
}

function PurposeInput({ field }: { field: string }) {
  return (
    <Forms.TextInput
      label={t("pages.spaceAddPage.purpose")}
      field={field}
      placeholder={t("pages.spaceAddPage.eGCreateProductAwarenessAnd")}
      required
    />
  );
}

function PrivacyLevel() {
  const [isAdvanced] = Forms.useFieldValue<boolean>("showAdvancedAccess");

  return (
    <Paper.DimmedSection>
      <div className="flex items-center justify-between">
        <PrivacyLevelTitle field={"access"} />
        <PrivacyEdit />
      </div>

      {isAdvanced && <Forms.AccessSelectors showSpaceAccess={false} />}
    </Paper.DimmedSection>
  );
}

function PrivacyLevelTitle({ field }: { field: string }) {
  const [anonymous] = Forms.useFieldValue<number>(`${field}.anonymous`);
  const [company] = Forms.useFieldValue<number>(`${field}.companyMembers`);

  if (anonymous === undefined || company === undefined) {
    return null;
  }

  return <AccessLevelSummary resourceType="space" tense="future" anonymous={anonymous} company={company} hideIcon />;
}

function PrivacyEdit() {
  const [isAdvanced, setIsAdvanced] = Forms.useFieldValue<boolean>("showAdvancedAccess");
  if (isAdvanced) return null;

  return (
    <SecondaryButton size="xs" onClick={() => setIsAdvanced(true)} testId="edit-access-levels">
      {t("pages.spaceAddPage.edit")}
    </SecondaryButton>
  );
}
