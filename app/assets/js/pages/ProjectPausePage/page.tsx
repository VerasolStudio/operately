import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";
import * as React from "react";

import { useLoadedData } from "./loader";

import { Form } from "./Form";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";
export function Page() {
  const paths = usePaths();
  const { project } = useLoadedData();

  return (
    <Pages.Page title={["Pausing", project.name!]}>
      <Paper.Root size="medium">
        <Paper.Navigation items={[{ to: paths.projectPath(project.id!), label: project.name! }]} />

        <Paper.Body minHeight="none">
          <div className="text-content-accent text-3xl font-extrabold">
            {t("pages.projectPausePage.pauseThisProject")}
          </div>
          <div className="text-content text font-medium mt-2">
            Pausing this project will:
            <ul className="list-disc list-inside mt-4">
              <li>{t("pages.projectPausePage.suspendAllAssociatedMilestonesAndTasks")}</li>
              <li>{t("pages.projectPausePage.stopNotificationsForTeamMembers")}</li>
              <li>{t("pages.projectPausePage.moveTheProjectToYourPaused")}</li>
            </ul>
            <p className="mt-4">{t("pages.projectPausePage.noteYouCanResumeTheProject")}</p>
          </div>

          <div className="mt-8">
            <Form project={project} />
          </div>
        </Paper.Body>
      </Paper.Root>
    </Pages.Page>
  );
}
