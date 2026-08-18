import React from "react";

import { WorkMap } from ".";
import { Column, Table } from "../../DesignKit/Table";
import { IconPlus } from "../../icons";
import { SpaceField } from "../../SpaceField";
import { Tooltip } from "../../Tooltip";
import { IconInfoCircle } from "../../icons";
import { t } from "../../i18n";
import { useStateWithLocalStorage } from "../../utils/useStateWithLocalStorage";
import type { FormattedTimePreferences } from "../../FormattedTime";
import { AddItemModal } from "./AddItemModal";
import { IsItemExpandedFn, SetItemExpandedFn, WorkMapRow } from "./WorkMapRow";
import { ZeroState } from "./ZeroState";

interface Props {
  items: WorkMap.Item[];
  addingEnabled?: boolean;
  tab: WorkMap.Filter;
  columnOptions?: WorkMap.ColumnOptions;
  addItem?: WorkMap.AddNewItemFn;
  spaceSearch?: SpaceField.SearchSpaceFn;
  addItemDefaultSpace?: SpaceField.Space;
  type?: WorkMap.WorkMapType;
  viewer?: WorkMap.Person;
  profileUser?: WorkMap.Person;
  hideCompanyAccessInQuickAdd?: boolean;
  zeroStateMessage?: string;
  emptyStateVariant?: WorkMap.EmptyStateVariant;
  onItemCreated?: WorkMap.ItemCreatedFn;
  formattedTimePreferences: FormattedTimePreferences;
}

export function WorkMapTable({
  items,
  tab,
  columnOptions,
  addItem,
  addingEnabled = false,
  spaceSearch,
  addItemDefaultSpace,
  type = "company",
  hideCompanyAccessInQuickAdd = false,
  zeroStateMessage,
  emptyStateVariant,
  onItemCreated,
}: Props) {
  const resolvedColumnOptions: WorkMap.ColumnOptions = { hideAssignedDate: true, ...columnOptions };
  const isCompletedTab = tab === "completed";

  const storageScope = React.useMemo(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "unknown";
    return `${type}:${path}`;
  }, [type]);

  const [expandedState, setExpandedState] = useStateWithLocalStorage<Record<string, boolean>>(
    "workmap",
    storageScope,
    {},
  );

  const getItemExpanded = React.useCallback<IsItemExpandedFn>((id) => expandedState[id] !== false, [expandedState]);

  const setItemExpanded = React.useCallback<SetItemExpandedFn>(
    (id, valueOrUpdater) => {
      setExpandedState((previousState) => {
        const currentValue = previousState[id] ?? true;
        const nextValue =
          typeof valueOrUpdater === "function"
            ? (valueOrUpdater as (prev: boolean) => boolean)(currentValue)
            : valueOrUpdater;

        // Expanded is the default, so an expanded item is stored by *removing*
        // its key. Otherwise the record grows without bound as people browse.
        if (nextValue === true) {
          if (currentValue === true && !(id in previousState)) return previousState;

          const { [id]: _removed, ...rest } = previousState;
          return rest;
        }

        if (currentValue === nextValue) return previousState;

        return { ...previousState, [id]: nextValue };
      });
    },
    [setExpandedState],
  );

  if (items.length === 0) {
    return (
      <ZeroState
        addingEnabled={addingEnabled}
        spaceSearch={spaceSearch!}
        addItem={addItem!}
        addItemDefaultSpace={addItemDefaultSpace!}
        hideCompanyAccess={hideCompanyAccessInQuickAdd}
        zeroStateMessage={zeroStateMessage}
        variant={emptyStateVariant}
        onItemCreated={onItemCreated}
      />
    );
  }

  const columns = buildColumns(resolvedColumnOptions, isCompletedTab);

  return (
    <div className="overflow-x-auto">
      <Table columns={columns}>
        {items.map((item, index) => (
          <WorkMapRow
            key={item.id}
            item={item}
            level={0}
            index={index}
            tab={tab}
            columnOptions={resolvedColumnOptions}
            addItem={addItem}
            addingEnabled={addingEnabled}
            spaceSearch={spaceSearch}
            hideCompanyAccessInQuickAdd={hideCompanyAccessInQuickAdd}
            isExpanded={getItemExpanded}
            setItemExpanded={setItemExpanded}
          />
        ))}
      </Table>

      {addingEnabled && addItem && spaceSearch && (
        <AddNewRow
          spaceSearch={spaceSearch}
          addItem={addItem}
          addItemDefaultSpace={addItemDefaultSpace!}
          hideCompanyAccess={hideCompanyAccessInQuickAdd}
        />
      )}
    </div>
  );
}

function buildColumns(columnOptions: WorkMap.ColumnOptions, isCompletedTab: boolean): Column[] {
  const columns: Column[] = [{ label: t("turboui.workMap.name"), width: "42%" }];

  if (!columnOptions.hideStatus) {
    columns.push({ label: t("turboui.workMap.status"), width: "13%" });
  }

  if (!columnOptions.hideProgress) {
    columns.push({ label: t("turboui.workMap.progress"), width: "13%", hideOnMobile: true });
  }

  if (!columnOptions.hideDueDate) {
    columns.push({
      label: isCompletedTab ? t("turboui.workMap.completedOn") : t("turboui.workMap.dueDate"),
      width: "12%",
      align: "right",
    });
  }

  if (!columnOptions.hideNextStep) {
    columns.push({ label: <NextStepHeaderLabel />, width: "20%", hideOnMobile: true });
  }

  return columns;
}

function NextStepHeaderLabel() {
  const tooltipContent = (
    <div className="text-xs">
      <p className="mb-2">{t("turboui.workMap.showsWhatNeedsToHappenNext")}</p>
      <p>{t("turboui.workMap.forGoalsTheFirstTargetOr")}</p>
      <p className="mb-2">{t("turboui.workMap.forProjectsTheUpcomingMilestoneBy")}</p>
      <p>{t("turboui.workMap.emptyWhenAllTargetsMilestonesAre")}</p>
    </div>
  );

  return (
    <span className="inline-flex items-center gap-1 pl-5">
      {t("turboui.workMap.nextAction")}
      <Tooltip content={tooltipContent} className="z-50">
        <IconInfoCircle size={12} className="text-content-faint" />
      </Tooltip>
    </span>
  );
}

function AddNewRow({
  spaceSearch,
  addItem,
  addItemDefaultSpace,
  hideCompanyAccess,
}: {
  spaceSearch: SpaceField.SearchSpaceFn;
  addItem: WorkMap.AddNewItemFn;
  addItemDefaultSpace: SpaceField.Space;
  hideCompanyAccess: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="pt-2">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] text-content-dimmed transition-colors hover:bg-surface-highlight hover:text-content-strong"
        aria-label={t("turboui.workMap.addNewItem")}
        onClick={() => setIsOpen(true)}
      >
        <IconPlus size={15} />
        {t("turboui.workMap.addNewItem")}
      </button>

      <AddItemModal
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        parentGoal={null}
        spaceSearch={spaceSearch}
        save={addItem}
        space={addItemDefaultSpace}
        hideCompanyAccess={hideCompanyAccess}
      />
    </div>
  );
}
