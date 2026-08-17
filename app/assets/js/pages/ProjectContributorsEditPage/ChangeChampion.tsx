import * as React from "react";
import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";
import * as People from "@/models/people";
import * as ProjectContributors from "@/models/projectContributors";

import { Forms } from "turboui";
import { PageTitle } from "./PageTitle";
import { LoaderResult, useGotoProjectContributors } from "./loader";
import { joinStr } from "@/utils/strings";
import { compareIds } from "@/routes/paths";
import { t } from "@/i18n";

export function ChangeChampion() {
  const { contributor } = Pages.useLoadedData() as LoaderResult;

  const form = useForm(contributor);
  const search = People.usePeopleSearch(People.CompanyWideSearchScope);

  const name = People.firstName(contributor.person!);
  const title = `Edit project champion`;

  const subtitle = joinStr(
    t("pages.projectContributorsEditPage.isCurrentlyTheOnThisProject", { v1: name, v2: contributor.role }),
    t("pages.projectContributorsEditPage.ifYouSelectANewChampion", { v1: name }),
  );

  return (
    <Paper.Body>
      <Forms.Form form={form}>
        <PageTitle title={title} subtitle={subtitle} />

        <Forms.FieldGroup>
          <Forms.SelectPerson
            field={"person"}
            label={t("pages.projectContributorsEditPage.projectChampion")}
            searchFn={search}
            default={contributor.person}
          />
        </Forms.FieldGroup>

        <Forms.Submit saveText={t("pages.projectContributorsEditPage.save")} />
      </Forms.Form>
    </Paper.Body>
  );
}

function useForm(contributor: ProjectContributors.ProjectContributor) {
  const [update] = ProjectContributors.useUpdateContributor();
  const gotoProjectContrib = useGotoProjectContributors();

  const form = Forms.useForm({
    fields: {
      person: contributor.person?.id,
    },
    submit: async () => {
      if (!compareIds(form.values.person, contributor.person?.id)) {
        await update({
          contribId: contributor.id,
          personId: form.values.person,
          role: "champion",
        });
      }

      gotoProjectContrib();
    },
    cancel: gotoProjectContrib,
  });

  return form;
}
