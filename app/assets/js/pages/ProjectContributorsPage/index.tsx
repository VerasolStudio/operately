import React from "react";

import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";
import * as ProjectContributors from "@/models/projectContributors";
import * as Projects from "@/models/projects";
import { PageModule } from "@/routes/types";

import { ProjectContributor } from "@/models/projectContributors";
import {
  AccessLevelSummary,
  BorderedRow,
  ContributorAvatar,
  Menu,
  MenuActionItem,
  MenuLinkItem,
  PlaceholderAvatar,
  PrimaryButton,
  SecondaryButton,
} from "turboui";

import { ProjectAccessLevelBadge } from "@/components/Badges/AccessLevelBadges";
import { createTestId } from "@/utils/testid";
import { match } from "ts-pattern";
import { OtherPeople } from "./OtherPeople";
import { loader, useLoadedData } from "./loader";

import { usePaths } from "@/routes/paths";
import { PermissionLevels } from "@/features/Permissions";
import { t } from "@/i18n";
export default { name: "ProjectContributorsPage", loader, Page } as PageModule;

function Page() {
  const { project } = useLoadedData();

  return (
    <Pages.Page title={["Team & Access", project.name]} testId="project-contributors-page">
      <Paper.Root>
        <Navigation />

        <Paper.Body>
          <Title />
          <GeneralAccess />
          <Champion />
          <Reviewer />
          <Contributors />
          <OtherPeople />
        </Paper.Body>
      </Paper.Root>
    </Pages.Page>
  );
}

function Navigation() {
  const { project } = useLoadedData();
  const paths = usePaths();
  const items: Paper.NavigationItem[] = [];

  if (project.space) {
    items.push({ to: paths.spacePath(project.space.id), label: project.space.name });
    items.push({
      to: paths.spaceWorkMapPath(project.space.id, "projects"),
      label: t("pages.projectContributorsPage.workMap"),
    });
  } else {
    items.push({ to: paths.workMapPath("projects"), label: t("pages.projectContributorsPage.workMap") });
  }
  items.push({ to: paths.projectPath(project.id), label: project.name });

  return <Paper.Navigation items={items} />;
}

function Title() {
  return (
    <div className="rounded-t-[20px] pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold ">{t("pages.projectContributorsPage.teamAmpAccess")}</div>
          <div className="text-medium">{t("pages.projectContributorsPage.manageTheTeamAndAccessTo")}</div>
        </div>

        <AddContribsButton />
      </div>
    </div>
  );
}

function AddContribsButton() {
  const paths = usePaths();
  const { project } = useLoadedData();

  if (!project.permissions?.canEdit) return null;
  const path = paths.projectContributorsAddPath(project.id, { type: "contributor" });

  return (
    <PrimaryButton linkTo={path} testId="add-contributors-button" size="sm">
      {t("pages.projectContributorsPage.addContributors")}
    </PrimaryButton>
  );
}

function GeneralAccess() {
  const paths = usePaths();
  const { project } = useLoadedData();
  const editPath = paths.projectEditPermissionsPath(project.id);

  return (
    <Paper.Section title={t("pages.projectContributorsPage.generalAccess")}>
      <BorderedRow>
        <AccessLevelSummary
          resourceType="project"
          tense="present"
          anonymous={project.accessLevels?.public ?? 0}
          company={project.accessLevels?.company ?? 0}
          space={project.accessLevels?.space ?? 0}
        />

        {project.permissions?.hasFullAccess && (
          <SecondaryButton linkTo={editPath} size="xs">
            {t("pages.projectContributorsPage.edit")}
          </SecondaryButton>
        )}
      </BorderedRow>
    </Paper.Section>
  );
}

function Champion() {
  const { champion } = useLoadedData();

  if (!champion) return <ChampionPlaceholder />;

  return (
    <Paper.Section title={t("pages.projectContributorsPage.champion")}>
      <div className="flex items-center justify-between py-2 border-y border-stroke-dimmed">
        <div className="flex items-center gap-2">
          <ContributorAvatar person={champion.person!} role={champion.role!} />
          <ContributorNameAndResponsibility contributor={champion} />
        </div>

        <div className="flex items-center gap-4">
          <ProjectAccessLevelBadge accessLevel={champion.accessLevel!} />
          <ContributorMenu contributor={champion} />
        </div>
      </div>
    </Paper.Section>
  );
}

function Reviewer() {
  const { reviewer } = useLoadedData();

  if (!reviewer) return <ReviewerPlaceholder />;

  return (
    <Paper.Section title={t("pages.projectContributorsPage.reviewer")}>
      <div className="flex items-center justify-between py-2 border-y border-stroke-dimmed">
        <div className="flex items-center gap-2">
          <ContributorAvatar person={reviewer.person!} role={reviewer.role!} />
          <ContributorNameAndResponsibility contributor={reviewer} />
        </div>

        <div className="flex items-center gap-4">
          <ProjectAccessLevelBadge accessLevel={reviewer.accessLevel!} />
          <ContributorMenu contributor={reviewer} />
        </div>
      </div>
    </Paper.Section>
  );
}

function ContributorNameAndResponsibility({ contributor }: { contributor: ProjectContributor }) {
  const name = contributor.person!.fullName;
  const responsibility = match(contributor.role)
    .with("champion", () => "Responsible for the overall success of the project")
    .with("reviewer", () => "Responsible for reviewing updates and providing feedback")
    .otherwise(() => contributor.responsibility);

  return (
    <div className="flex flex-col flex-1">
      <div className="font-bold flex items-center gap-2">{name}</div>
      <div className="text-sm font-medium flex items-center">{responsibility}</div>
    </div>
  );
}

function ReviewerPlaceholder() {
  const paths = usePaths();
  const { project } = useLoadedData();
  const path = paths.projectContributorsAddPath(project.id!, { type: "reviewer" });
  const canAddReviewer = project.permissions?.hasFullAccess;

  const description = canAddReviewer
    ? "Select a reviewer to get feedback and keep things moving smoothly"
    : "The project doesn't have a reviewer yet";

  return (
    <Paper.Section title={t("pages.projectContributorsPage.reviewer")}>
      <BorderedRow>
        <div className="flex items-center gap-2">
          <PlaceholderAvatar size="lg" />
          <PlaceholderTitleAndDescription
            title={t("pages.projectContributorsPage.noReviewer")}
            description={description}
          />
        </div>

        <div className="flex items-center gap-4">
          {canAddReviewer && (
            <SecondaryButton linkTo={path} testId="add-reviewer-button" size="sm">
              {t("pages.projectContributorsPage.addReviewer")}
            </SecondaryButton>
          )}
        </div>
      </BorderedRow>
    </Paper.Section>
  );
}

function PlaceholderTitleAndDescription({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col flex-1">
      <div className="font-bold flex items-center gap-2">{title}</div>
      <div className="text-sm font-medium flex items-center">{description}</div>
    </div>
  );
}

function ChampionPlaceholder() {
  const paths = usePaths();
  const { project } = useLoadedData();
  const path = paths.projectContributorsAddPath(project.id!, { type: "champion" });
  const canAddChampion = project.permissions?.hasFullAccess;

  const description = canAddChampion
    ? "Select a champion to lead the project"
    : "The project doesn't have a champion yet";

  return (
    <Paper.Section title={t("pages.projectContributorsPage.champion")}>
      <div className="flex items-center justify-between py-2 border-y border-stroke-dimmed">
        <div className="flex items-center gap-2">
          <PlaceholderAvatar size="lg" />
          <PlaceholderTitleAndDescription
            title={t("pages.projectContributorsPage.noChampion")}
            description={description}
          />
        </div>

        <div className="flex items-center gap-4">
          {canAddChampion && (
            <SecondaryButton linkTo={path} testId="add-champion-button" size="sm">
              {t("pages.projectContributorsPage.addChampion")}
            </SecondaryButton>
          )}
        </div>
      </div>
    </Paper.Section>
  );
}

function Contributors() {
  const { contributors } = useLoadedData();

  if (contributors.length === 0) return null;

  return (
    <Paper.Section title={t("pages.projectContributorsPage.contributors")}>
      {contributors.map((contrib) => (
        <Contributor contributor={contrib} key={contrib.id} />
      ))}
    </Paper.Section>
  );
}

function Contributor({ contributor }: { contributor: ProjectContributor }) {
  return (
    <BorderedRow testId={createTestId("contributor-row", contributor.person?.fullName!)}>
      <div className="flex items-center gap-2">
        <ContributorAvatar person={contributor.person!} role={contributor.role!} />
        <ContributotNameAndResponsibility contributor={contributor} />
      </div>
      <div className="flex items-center gap-4">
        <ProjectAccessLevelBadge accessLevel={contributor.accessLevel ?? null} />
        <ContributorMenu contributor={contributor} />
      </div>
    </BorderedRow>
  );
}

function ContributorMenu({ contributor }: { contributor: ProjectContributor }) {
  const { project, champion, reviewer } = useLoadedData();

  const isChampion = contributor.role === "champion";
  const isReviewer = contributor.role === "reviewer";
  const isContributor = contributor.role === "contributor";

  // Determine which items should be visible based on role and permissions
  const showChangeChampion = isChampion && project.permissions?.hasFullAccess;
  const showChangeReviewer = isReviewer && project.permissions?.hasFullAccess;
  const showReassignAsContributor = (isChampion || isReviewer) && project.permissions?.hasFullAccess;
  const showEdit =
    isContributor &&
    ((contributor.accessLevel || PermissionLevels.NO_ACCESS) < PermissionLevels.FULL_ACCESS ||
      project.permissions?.hasFullAccess);
  const showPromoteToChampion = isContributor && champion && project.permissions?.hasFullAccess;
  const showPromoteToReviewer = contributor.role === "contributor" && reviewer && project.permissions?.hasFullAccess;
  const showRemove = project.permissions?.hasFullAccess;

  return (
    <Menu testId={createTestId("contributor-menu", contributor.person?.fullName || "")} size="medium">
      {showChangeChampion && <ChangeProjectChampionMenuItem contributor={contributor} />}
      {showChangeReviewer && <ChangeProjectReviewerMenuItem contributor={contributor} />}
      {showReassignAsContributor && <ReassignAsContributorMenuItem contributor={contributor} />}
      {showEdit && <EditMenuItem contributor={contributor} />}
      {showPromoteToChampion && <PromoteToChampionMenuItem contributor={contributor} />}
      {showPromoteToReviewer && <PromoteToReviewerMenuItem contributor={contributor} />}
      {showRemove && <RemoveContributorMenuItem contributor={contributor} />}
    </Menu>
  );
}

function ContributotNameAndResponsibility({ contributor }: { contributor: ProjectContributor }) {
  return (
    <div className="flex flex-col flex-1">
      <div className="font-bold flex items-center gap-2">{contributor.person?.fullName}</div>
      <div className="text-sm font-medium flex items-center">{contributor.responsibility}</div>
    </div>
  );
}

function ReassignAsContributorMenuItem({ contributor }: { contributor: ProjectContributor }) {
  const paths = usePaths();
  const path = paths.projectContributorsEditPath(contributor.id, { action: "reassign-as-contributor" });

  return (
    <MenuLinkItem to={path} testId="convert-to-contributor">
      {t("pages.projectContributorsPage.reassignAsContributor")}
    </MenuLinkItem>
  );
}

function ChangeProjectChampionMenuItem({ contributor }: { contributor: ProjectContributor }) {
  const paths = usePaths();
  const path = paths.projectContributorsEditPath(contributor.id!, { action: "change-champion" });

  return (
    <MenuLinkItem to={path} testId="choose-new-champion">
      {t("pages.projectContributorsPage.editChampion")}
    </MenuLinkItem>
  );
}

function ChangeProjectReviewerMenuItem({ contributor }: { contributor: ProjectContributor }) {
  const paths = usePaths();
  const path = paths.projectContributorsEditPath(contributor.id!, { action: "change-reviewer" });

  return (
    <MenuLinkItem to={path} testId="choose-new-reviewer">
      {t("pages.projectContributorsPage.editReviewer")}
    </MenuLinkItem>
  );
}

function EditMenuItem({ contributor }: { contributor: ProjectContributor }) {
  const paths = usePaths();
  const path = paths.projectContributorsEditPath(contributor.id!, { action: "edit-contributor" });

  return (
    <MenuLinkItem to={path} testId="edit-contributor">
      {t("pages.projectContributorsPage.editContributor")}
    </MenuLinkItem>
  );
}

function RemoveContributorMenuItem({ contributor }: { contributor: ProjectContributor }) {
  const refresh = Pages.useRefresh();
  const [remove] = Projects.useRemoveProjectContributor();

  const handleClick = async () => {
    await remove({ contribId: contributor.id });
    refresh();
  };

  return (
    <MenuActionItem danger={true} onClick={handleClick} testId="remove-contributor">
      {t("pages.projectContributorsPage.removeFromProject")}
    </MenuActionItem>
  );
}

function PromoteToChampionMenuItem({ contributor }: { contributor: ProjectContributor }) {
  const refresh = Pages.useRefresh();
  const [update] = ProjectContributors.useUpdateContributor();
  const { champion } = useLoadedData();

  const handleClick = async () => {
    await update({ contribId: champion!.id, role: "champion", personId: contributor.person!.id });
    refresh();
  };

  return (
    <MenuActionItem danger={true} onClick={handleClick} testId="promote-to-champion">
      {t("pages.projectContributorsPage.assignAsChampion")}
    </MenuActionItem>
  );
}

function PromoteToReviewerMenuItem({ contributor }: { contributor: ProjectContributor }) {
  const refresh = Pages.useRefresh();
  const [update] = ProjectContributors.useUpdateContributor();
  const { reviewer } = useLoadedData();

  const handleClick = async () => {
    await update({ contribId: reviewer!.id, role: "reviewer", personId: contributor.person!.id });
    refresh();
  };

  return (
    <MenuActionItem danger={true} onClick={handleClick} testId="promote-to-reviewer">
      {t("pages.projectContributorsPage.assignAsReviewer")}
    </MenuActionItem>
  );
}
