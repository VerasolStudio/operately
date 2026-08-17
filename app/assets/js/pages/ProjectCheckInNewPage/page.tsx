import React from "react";

import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";

import { Form } from "./Form";
import { useLoadedData } from "./loader";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";

export function Page() {
  const { project } = useLoadedData();

  return (
    <Pages.Page title={["Check-In", project.name]}>
      <Paper.Root>
        <Navigation />

        <Paper.Body>
          <Form project={project} />
        </Paper.Body>
      </Paper.Root>
    </Pages.Page>
  );
}

function Navigation() {
  const paths = usePaths();
  const { project } = useLoadedData();
  const items: Paper.NavigationItem[] = [];

  if (project.space) {
    items.push({ to: paths.spacePath(project.space.id), label: project.space.name });
    items.push({
      to: paths.spaceWorkMapPath(project.space.id, "projects" as const),
      label: t("pages.projectCheckInNewPage.workMap"),
    });
  } else {
    items.push({ to: paths.workMapPath("projects"), label: t("pages.projectCheckInNewPage.workMap") });
  }

  items.push({ to: paths.projectPath(project.id), label: project.name });
  items.push({ to: paths.projectCheckInsPath(project.id), label: t("pages.projectCheckInNewPage.checkIns") });

  return <Paper.Navigation items={items} />;
}
