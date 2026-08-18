import * as React from "react";

import { WorkMapPage } from "turboui";
import { useLoadedData } from "./loader";

import { usePaths } from "@/routes/paths";
import { useSpaceSearch } from "../../models/spaces";
import { countWorkMapTypes, convertToWorkMapItems, useWorkMapItems } from "../../models/workMap";
import { useFormattedTimePreferences } from "@/hooks/useFormattedTimePreferences";
import { t } from "@/i18n";

export function Page() {
  const paths = usePaths();

  const { workMap, space } = useLoadedData().data;
  const hideCompanyAccessInQuickAdd = Boolean(space.privateSpace);

  const [items, addItem] = useWorkMapItems(workMap);
  const spaceSearch = useSpaceSearch();
  const formattedTimePreferences = useFormattedTimePreferences();
  const counts = countWorkMapTypes(items);

  return (
    <WorkMapPage
      title={t("pages.spaceWorkMapPage.workMap")}
      subtitle={
        t("pages.companyWorkMapPage.goalCount", { count: counts.goals }) +
        " / " +
        t("pages.companyWorkMapPage.projectCount", { count: counts.projects })
      }
      addingEnabled={space.permissions?.canEdit}
      items={convertToWorkMapItems(paths, items)}
      addItem={addItem}
      spaceSearch={spaceSearch}
      columnOptions={{ hideSpace: true, hideProject: true }}
      navigation={[{ to: paths.spacePath(space.id), label: space.name }]}
      hideCompanyAccessInQuickAdd={hideCompanyAccessInQuickAdd}
      formattedTimePreferences={formattedTimePreferences}
      addItemDefaultSpace={{
        id: space.id,
        name: space.name,
        link: paths.spacePath(space.id),
      }}
    />
  );
}
