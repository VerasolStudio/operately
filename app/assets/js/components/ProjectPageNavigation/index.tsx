import * as Paper from "@/components/PaperContainer";
import * as React from "react";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";
export function ProjectPageNavigation({ project }) {
  const paths = usePaths();
  return <Paper.Navigation items={[{ to: paths.projectPath(project.id!), label: project.name }]} />;
}

export function ProjectContribsSubpageNavigation({ project }) {
  const paths = usePaths();
  return (
    <Paper.Navigation
      items={[
        { to: paths.projectPath(project.id!), label: project.name },
        { to: paths.projectContributorsPath(project.id!), label: t("components.projectPageNavigation.teamAccess") },
      ]}
    />
  );
}

export function ProjectRetrospectiveNavigation({ project }) {
  const paths = usePaths();
  return (
    <Paper.Navigation
      items={[
        { to: paths.projectPath(project.id!), label: project.name },
        { to: paths.projectRetrospectivePath(project.id!), label: t("components.projectPageNavigation.retrospective") },
      ]}
    />
  );
}
