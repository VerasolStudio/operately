import * as React from "react";

import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";
import * as Projects from "@/models/projects";
import * as Permissions from "@/models/permissions";
import { Forms, IconPlus, IconX, Link, SecondaryButton } from "turboui";

import { useAddProjectContributors } from "@/models/projectContributors";
import { PERMISSIONS_LIST, PERMISSIONS_LIST_COMPLETE } from "@/models/permissions";

import { useNavigateTo } from "@/routes/useNavigateTo";
import { createTestId } from "@/utils/testid";
import { useLoadedData } from "./loader";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";
import { Trans } from "react-i18next";

interface ContributorFields {
  key: number;
  personId: string;
  responsibility: string;
  accessLevel: Permissions.AccessOptions;
}

function newContributor(): ContributorFields {
  //
  // used for unique key in React component list
  // index is not unique when removing items and causes rendering issues
  // so we add a random key to each item
  //
  const key = Math.random();

  return {
    key: key,
    personId: "",
    responsibility: "",
    accessLevel: "edit_access",
  };
}

export function AddContributors() {
  const paths = usePaths();
  const { project } = useLoadedData();
  const gotoContribPage = useNavigateTo(paths.projectContributorsPath(project.id!));
  const [add] = useAddProjectContributors();

  const form = Forms.useForm<{ contributors: ContributorFields[] }>({
    fields: {
      contributors: [newContributor()],
    },
    validate: async (addError) => {
      validatePeopleUniqueness(form.values.contributors, addError);
    },
    submit: async () => {
      await add({
        projectId: project.id,
        contributors: form.values.contributors.map((c) => ({
          personId: c.personId,
          responsibility: c.responsibility,
          accessLevel: c.accessLevel,
        })),
      });

      gotoContribPage();
    },
  });

  return (
    <Pages.Page title={["Add contributors", project.name!]}>
      <Paper.Root size="small">
        <Paper.NavigateBack
          to={paths.projectContributorsPath(project.id!)}
          title={t("pages.projectContributorsAddPage.backToTeamAccess")}
        />
        <div className="text-2xl font-extrabold mb-4 text-center">
          {t("pages.projectContributorsAddPage.addContributorsTo", { v1: project.name })}
        </div>
        <p className="text-sm text-center text-content-dimmed mb-4">
          <Trans
            i18nKey="pages.projectContributorsAddPage.onlyExistingMembersCanBeAdded"
            components={[
              <Link to={paths.invitePeoplePath()} className="text-sm" underline="hover">
                Invite someone new to the organization
              </Link>,
            ]}
          />
        </p>

        <Forms.Form form={form}>
          <Contributors project={project} />

          <Forms.Submit
            saveText={t("pages.projectContributorsAddPage.addContributors")}
            layout="centered"
            buttonSize="base"
            submitOnEnter={false}
          />
        </Forms.Form>
      </Paper.Root>
    </Pages.Page>
  );
}

function Contributors({ project }) {
  const [contribs = []] = Forms.useFieldValue<ContributorFields[]>("contributors");
  const search = Projects.useContributorSearchFn(project);

  const [value = [], setValue] = Forms.useFieldValue<ContributorFields[]>("contributors");

  const addMore = React.useCallback(() => {
    setValue([...value, newContributor()]);
  }, [value, setValue]);

  return (
    <div>
      <div className="flex flex-col gap-6">
        {contribs.map((c, i) => (
          <Contributor
            key={c.key}
            field={`contributors[${i}]`}
            search={search}
            index={i}
            last={i === contribs.length - 1}
            addMore={addMore}
          />
        ))}
      </div>

      <AddMoreContributorsButton onClick={addMore} />
    </div>
  );
}

function Contributor({ field, search, index, last, addMore }) {
  const { project } = useLoadedData();

  const permissionsList = React.useMemo(() => {
    if (project.permissions?.hasFullAccess) {
      return PERMISSIONS_LIST_COMPLETE;
    }
    if (project.permissions?.canEdit) {
      return PERMISSIONS_LIST;
    }
    return [];
  }, [project.permissions?.hasFullAccess, project.permissions?.canEdit]);

  return (
    <div data-test-id={`contributor-${index}`}>
      <Paper.Body>
        <Forms.FieldGroup layout="horizontal">
          <Forms.SelectPerson
            field={field + ".personId"}
            label={t("pages.projectContributorsAddPage.contributor")}
            searchFn={search}
            autoFocus
          />
          <Forms.SelectBox
            field={field + ".accessLevel"}
            label={t("pages.projectContributorsAddPage.accessLevel")}
            options={permissionsList}
          />

          <Forms.TextInput
            field={field + ".responsibility"}
            placeholder={t("pages.projectContributorsAddPage.eGProjectManager")}
            label={t("pages.projectContributorsAddPage.responsibility")}
            onEnter={() => {
              if (last) addMore();
            }}
          />
        </Forms.FieldGroup>

        <RemoveContributorButton index={index} />
      </Paper.Body>
    </div>
  );
}

function AddMoreContributorsButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center" style={{ marginTop: "-18px" }} data-test-id={createTestId("add-more")}>
      <SecondaryButton onClick={onClick}>
        <IconPlus size={16} />
      </SecondaryButton>
    </div>
  );
}

function RemoveContributorButton({ index }) {
  const [value = [], setValue] = Forms.useFieldValue<ContributorFields[]>("contributors");

  const onClick = () => {
    const newValue = value.filter((_, i) => i !== index);
    setValue(newValue);
  };

  if (index === 0) return null;

  return (
    <div className="absolute" style={{ top: "-14px", right: "-14px" }}>
      <div
        className="border border-surface-outline rounded-full p-2 cursor-pointer text-content-subtle hover:text-content-accent bg-surface-base"
        onClick={onClick}
      >
        <IconX size={16} />
      </div>
    </div>
  );
}

function validatePeopleUniqueness(
  contributors: ContributorFields[],
  addError: (field: string, message: string) => void,
) {
  let peopleIds = {} as Record<string, number[]>;

  contributors.forEach((c, i) => {
    if (peopleIds[c.personId]) {
      peopleIds[c.personId]!.push(i);
    } else {
      peopleIds[c.personId] = [i];
    }
  });

  Object.entries(peopleIds).forEach(([_personId, indexes]) => {
    if (indexes.length > 1) {
      indexes.forEach((i) => {
        addError(`contributors[${i}].personId`, "Can't add the same person more than once");
      });
    }
  });
}
