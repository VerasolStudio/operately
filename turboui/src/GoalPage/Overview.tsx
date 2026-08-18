import React from "react";

import { DocsAndFilesPreview } from "../DocsAndFiles";
import { GoalPage } from ".";
import { PageColumns } from "../DesignKit/Layout";
import { Checklists } from "./Checklists";
import { Contributors } from "./Contributors";
import { RelatedWork } from "./RelatedWork";
import { Sidebar } from "./Sidebar";
import { Targets } from "./Targets";
import { PageDescription } from "../PageDescription";
import { t } from "../i18n";

export function Overview(props: GoalPage.State) {
  return (
    <PageColumns aside={<Sidebar {...props} />}>
      <MainContent {...props} />
    </PageColumns>
  );
}

function MainContent(props: GoalPage.State) {
  return (
    <div className="space-y-10">
      <PageDescription
        {...props}
        canEdit={props.permissions.canEdit}
        label={t("turboui.goalPage.goalDescription")}
        placeholder={t("turboui.goalPage.describeTheGoal")}
        zeroStatePlaceholder="Describe the goal to provide context and clarity."
        localDraftKey={props.localDraftKeyBase ? `${props.localDraftKeyBase}:description` : undefined}
      />
      <Targets {...props} />
      <Checklists {...props} />
      <RelatedWork {...props} />
      {props.docsAndFiles && (
        <div className="pt-8 mt-8 border-t border-surface-outline">
          <ResourcesSection {...props} />
        </div>
      )}
      <Contributors {...props} />
    </div>
  );
}

function ResourcesSection(props: GoalPage.State) {
  if (!props.docsAndFiles) return null;

  return (
    <DocsAndFilesPreview
      nodes={props.docsAndFiles.previewNodes}
      tabPath={props.docsAndFiles.tabPath}
      getNodePath={props.docsAndFiles.nodesListProps.getNodePath}
    />
  );
}
