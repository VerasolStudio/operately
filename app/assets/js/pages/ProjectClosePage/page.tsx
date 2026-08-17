import * as React from "react";
import * as Paper from "@/components/PaperContainer";
import * as Pages from "@/components/Pages";

import { useLoadedData } from "./loader";
import { Form } from "@/features/ProjectRetrospective";
import { ProjectPageNavigation } from "@/components/ProjectPageNavigation";
import { t } from "@/i18n";

export function Page() {
  const { project } = useLoadedData();

  return (
    <Pages.Page title={t("pages.projectClosePage.closing", { name: project.name })}>
      <Paper.Root>
        <ProjectPageNavigation project={project} />
        <Paper.Body minHeight="none">
          <div className="mb-6 text-content-accent text-2xl font-extrabold">
            {t("pages.projectClosePage.reviewAmpCloseProject")}
          </div>

          <Form mode="create" project={project} />
        </Paper.Body>
      </Paper.Root>
    </Pages.Page>
  );
}
