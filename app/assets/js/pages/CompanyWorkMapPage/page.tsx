import * as React from "react";

import { useMe } from "@/contexts/CurrentCompanyContext";
import { useFormattedTimePreferences } from "@/hooks/useFormattedTimePreferences";
import * as Spaces from "@/models/spaces";
import { useSpaceSearch } from "@/models/spaces";
import { PageCache } from "@/routes/PageCache";
import { includesId } from "@/routes/paths";
import { useCompanyLoaderData } from "@/routes/useCompanyLoaderData";
import { useNavigate } from "react-router";
import { WorkMapPage } from "turboui";
import { convertToWorkMapItems, useWorkMapItems } from "../../models/workMap";
import { usePaths } from "../../routes/paths";
import { finishFirstItemOnboarding } from "./finishFirstItemOnboarding";
import { shouldShowFirstProjectOnboarding } from "./firstProjectOnboarding";
import { companyWorkMapCacheKey, useLoadedData } from "./loader";
import { AddWorkButton } from "@/features/workMap/AddWorkButton";
import { countWorkMapTypes } from "@/models/workMap";
import { t } from "@/i18n";

export function Page() {
  const paths = usePaths();
  const navigate = useNavigate();
  const me = useMe();
  const companyLoaderData = useCompanyLoaderData();
  const { workMap, company, spacesCount } = useLoadedData().data;

  const title = t("pages.companyWorkMapPage.workMap", { v1: company.name });

  const canAddItem = spacesCount > 0;
  const ownerIds = companyLoaderData.company.owners?.map((owner) => owner.id) ?? [];
  const firstProjectStateVisible = shouldShowFirstProjectOnboarding({
    isOwner: includesId(ownerIds, me?.id),
    setupCompleted: company.setupCompleted,
    hasWorkItems: workMap.length > 0,
    canAddItem,
  });
  const [items, addItem] = useWorkMapItems(workMap, {
    projectChampionId: firstProjectStateVisible ? me?.id : undefined,
  });
  const spaceSearch = useSpaceSearch({ accessLevel: "edit_access" });
  const formattedTimePreferences = useFormattedTimePreferences();
  const visibleItems = firstProjectStateVisible ? workMap : items;

  const handleItemCreated = React.useCallback(
    (type: "goal" | "project", id: string) => {
      return finishFirstItemOnboarding({
        invalidateWorkMapCache: () => PageCache.invalidate(companyWorkMapCacheKey(company.id)),
        navigateToItem: () => navigate(type === "project" ? paths.projectPath(id) : paths.goalPath(id)),
      });
    },
    [company.id, navigate, paths],
  );

  const counts = countWorkMapTypes(visibleItems);

  return (
    <WorkMapPage
      title={title}
      subtitle={
        t("pages.companyWorkMapPage.goalCount", { count: counts.goals }) +
        " / " +
        t("pages.companyWorkMapPage.projectCount", { count: counts.projects })
      }
      actions={canAddItem ? <AddWorkButton /> : undefined}
      items={convertToWorkMapItems(paths, visibleItems)}
      addItem={addItem}
      spaceSearch={spaceSearch}
      addingEnabled={canAddItem}
      addItemDefaultSpace={company.generalSpace && Spaces.parseSpaceForTurboUI(paths, company.generalSpace)}
      columnOptions={{ hideProject: true }}
      formattedTimePreferences={formattedTimePreferences}
      emptyStateVariant={firstProjectStateVisible ? "first-project" : "standard"}
      onItemCreated={firstProjectStateVisible ? handleItemCreated : undefined}
    />
  );
}
