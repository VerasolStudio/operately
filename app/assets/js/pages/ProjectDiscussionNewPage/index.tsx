import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";
import * as Projects from "@/models/projects";
import * as React from "react";

import { PageModule } from "@/routes/types";
import { useRichEditorHandlers } from "@/hooks/useRichEditorHandlers";
import { DimmedLink, Forms, SubscribersSelector } from "turboui";
import { useSubscriptionsAdapter } from "@/models/subscriptions";
import { usePaths } from "../../routes/paths";
import { useForm } from "./useForm";
import { t } from "@/i18n";

export default { name: "ProjectDiscussionNewPage", loader, Page } as PageModule;

interface LoaderResult {
  project: Projects.Project;
}

async function loader({ params }): Promise<LoaderResult> {
  return {
    project: await Projects.getProject({
      id: params.projectID,
      includeChampion: true,
      includeReviewer: true,
      includeSpace: true,
      includePotentialSubscribers: true,
    }).then((data) => data.project),
  };
}

function Page() {
  const { project } = Pages.useLoadedData<LoaderResult>();

  return (
    <Pages.Page title={["New Discussion", project.name]}>
      <Paper.Root>
        <Nav />
        <Paper.Body>
          <Form />
        </Paper.Body>
      </Paper.Root>
    </Pages.Page>
  );
}

function Nav() {
  const paths = usePaths();
  const { project } = Pages.useLoadedData<LoaderResult>();
  const items: Paper.NavigationItem[] = [];

  if (project.space) {
    items.push({ to: paths.spacePath(project.space.id), label: project.space.name });
    items.push({
      to: paths.spaceWorkMapPath(project.space.id, "projects"),
      label: t("pages.projectDiscussionNewPage.workMap"),
    });
  } else {
    items.push({ to: paths.workMapPath("projects"), label: t("pages.projectDiscussionNewPage.workMap") });
  }

  items.push({ to: paths.projectPath(project.id, { tab: "overview" }), label: project.name });
  items.push({
    to: paths.projectPath(project.id, { tab: "discussions" }),
    label: t("pages.projectDiscussionNewPage.discussions"),
  });

  return <Paper.Navigation items={items} />;
}

function Form() {
  const { project } = Pages.useLoadedData<LoaderResult>();
  const paths = usePaths();

  const subscriptionsState = useSubscriptionsAdapter(project.potentialSubscribers || [], {
    ignoreMe: true,
    projectName: project.name,
  });

  const form = useForm({ project, subscriptionsState });
  const richTextHandlers = useRichEditorHandlers({ scope: { type: "project", id: project.id } });

  return (
    <Forms.Form form={form}>
      <Forms.FieldGroup>
        <div>
          <Forms.TitleInput
            field="title"
            placeholder={t("pages.projectDiscussionNewPage.title")}
            autoFocus
            testId="discussion-title"
            errorMessage={t("pages.projectDiscussionNewPage.pleaseAddATitle")}
          />
          <div className="mt-2 border-y border-stroke-base text-content-base font-medium">
            <Forms.RichTextArea
              field="message"
              richTextHandlers={richTextHandlers}
              placeholder={t("pages.projectDiscussionNewPage.startANewDiscussion")}
              hideBorder
              height="min-h-[350px]"
              fontSize="text-lg"
              horizontalPadding="px-0"
              verticalPadding="py-2"
            />
          </div>
        </div>
      </Forms.FieldGroup>

      <div className="my-10">
        <SubscribersSelector {...subscriptionsState} />
      </div>

      <Forms.FormError message={t("pages.projectDiscussionNewPage.fillOutAllTheRequiredFields")} className="mt-4" />

      <div className="flex items-center gap-4 mt-4">
        <Forms.Submit
          saveText={t("pages.projectDiscussionNewPage.postDiscussion")}
          buttonSize="base"
          testId="post-discussion"
          containerClassName="mt-0"
        />
        <DimmedLink to={paths.projectPath(project.id)}>{t("pages.projectDiscussionNewPage.cancel")}</DimmedLink>
      </div>
    </Forms.Form>
  );
}
