import React, { ReactNode } from "react";

import { DateField } from "../DateField";
import { UnderlineTabs } from "../DesignKit/Controls";
import { Screen } from "../DesignKit/Layout";
import { useTabLinks } from "../DesignKit/useTabLinks";
import { PrivacyField } from "../PrivacyField";
import { ProjectPermissions } from "../ProjectPage/types";
import { BadgeStatus } from "../StatusBadge/types";
import { TabsState } from "../Tabs";
import { PageHeader } from "./PageHeader";
import { StatusBanner } from "./StatusBanner";

export namespace ProjectPageLayout {
  export interface Space {
    id: string;
    name: string;
    link: string;
  }

  export type SpaceProps =
    | {
        workmapLink: string;
        space: Space;
      }
    | {
        homeLink: string;
      };

  export interface ChildrenCount {
    tasksCount: number;
    discussionsCount: number;
    checkInsCount: number;
    docsAndFilesCount: number;
  }

  export interface TaskCompletionStats {
    completedCount: number;
    totalCount: number;
    percentage: number;
  }

  export type Props = SpaceProps & {
    mode?: "project" | "template";
    title: string[];
    testId?: string;

    projectName: string;
    taskCompletion?: TaskCompletionStats | null;
    status?: BadgeStatus;
    updateProjectName: (name: string) => Promise<boolean>;
    permissions: ProjectPermissions;
    accessLevels?: PrivacyField.AccessLevels;

    /** Shown in the header's metadata line. */
    dueDate?: DateField.ContextualDate | null;
    parentGoal?: { name: string; link: string } | null;

    /** Page-level buttons, rendered on the right of the header. */
    actions?: ReactNode;
    /** The "next up" banner, rendered under the header when there is one. */
    nextAction?: ReactNode;

    state?: "paused" | "closed" | "active";
    closedAt?: Date | null;
    projectTemplatesLink?: string;
    reopenLink?: string;
    retrospectiveLink?: string;

    // Tabs
    tabs: TabsState;

    children: ReactNode;
  };
}

export function ProjectPageLayout(props: ProjectPageLayout.Props) {
  const tabLinks = useTabLinks(props.tabs);

  return (
    <Screen title={props.title} testId={props.testId}>
      <PageHeader {...props} />

      {(props.state === "paused" || props.state === "closed" || props.nextAction) && (
        <div className="px-6 pt-4 sm:px-8">
          {(props.state === "paused" || props.state === "closed") && (
            <StatusBanner
              state={props.state}
              closedAt={props.closedAt}
              reopenLink={props.reopenLink}
              retrospectiveLink={props.retrospectiveLink}
            />
          )}
          {props.nextAction}
        </div>
      )}

      <div className="px-6 pt-5 sm:px-8">
        <UnderlineTabs layoutId="project-tabs" tabs={tabLinks} activeId={props.tabs.active} />
      </div>

      {props.children}
    </Screen>
  );
}
