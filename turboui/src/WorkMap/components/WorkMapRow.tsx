import React from "react";

import { WorkMap } from ".";
import { SecondaryButton } from "../../Button";
import { DateField } from "../../DateField";
import { EntityGlyph } from "../../DesignKit/Entities";
import { Cell, Row, TitleCellContent } from "../../DesignKit/Table";
import { isMutedStatus, statusLabel, StatusLabel, statusStyle } from "../../DesignKit/Status";
import { dueNote, isOverdueDate } from "../../DesignKit/dueDate";
import { IconAlertTriangle, IconArrowNarrowRight, IconChevronDown, IconChevronRight } from "../../icons";
import { BlackLink } from "../../Link";
import { SNAP, motion } from "../../Motion";
import { PrivacyIndicator } from "../../PrivacyIndicator";
import { ProgressBar } from "../../ProgressBar";
import { SpaceField } from "../../SpaceField";
import { createTestId } from "../../TestableElement";
import { Tooltip } from "../../Tooltip";
import { t } from "../../i18n";
import classNames from "../../utils/classnames";
import { useItemStatus } from "../hooks/useItemStatus";
import { AddItemModal } from "./AddItemModal";
import { GoalProgressSummary } from "./TableRow/GoalProgressSummary";
import { ProjectProgressSummary } from "./TableRow/ProjectProgressSummary";

export type IsItemExpandedFn = (id: string) => boolean;
export type SetItemExpandedFn = (id: string, value: boolean | ((prev: boolean) => boolean)) => void;

interface Props {
  item: WorkMap.Item;
  level: number;
  index: number;
  tab: WorkMap.Filter;
  columnOptions: WorkMap.ColumnOptions;
  addItem?: WorkMap.AddNewItemFn;
  addingEnabled?: boolean;
  spaceSearch?: SpaceField.SearchSpaceFn;
  hideCompanyAccessInQuickAdd?: boolean;
  isExpanded: IsItemExpandedFn;
  setItemExpanded: SetItemExpandedFn;
}

/**
 * One line of the work map.
 *
 * The redesign compresses what used to be nine columns into five by folding
 * space and champion into a second line under the name. Those two facts are
 * context for the row rather than things you compare across rows, and giving
 * each its own column pushed the one column that does drive action — the next
 * step — off the right edge of most screens.
 */
export function WorkMapRow(props: Props) {
  const { item, tab, level, columnOptions } = props;
  const expanded = props.isExpanded(item.id);
  const { isCompleted, isFailed } = useItemStatus(item.status);
  const isClosed = isCompleted || isFailed;
  const muted = isMutedStatus(item.status);

  const hasChildren = item.children.length > 0;
  const overdue = !isClosed && isOverdueDate(item.timeframe?.endDate?.date);
  const needsAttention = item.status === "off_track" || overdue;

  const toggleExpanded = React.useCallback(() => {
    props.setItemExpanded(item.id, (previous) => !previous);
  }, [item.id, props.setItemExpanded]);

  return (
    <>
      <Row
        index={props.index}
        tone={needsAttention ? "warning" : "default"}
        testId={createTestId("work-item", item.name)}
      >
        <Cell first className="group/row">
          <TitleCellContent
            indent={level}
            emphasis={level === 0 ? "semibold" : "medium"}
            muted={muted}
            strikethrough={isClosed}
            leading={
              <ExpandToggle
                hasChildren={hasChildren}
                expanded={expanded}
                onToggle={toggleExpanded}
                itemName={item.name}
              />
            }
            glyph={<EntityGlyph kind={item.type === "task" ? "task" : item.type} />}
            title={
              <BlackLink to={item.itemPath || ""} className="hover:underline">
                {item.name}
              </BlackLink>
            }
            adornments={
              <>
                {item.privacy && item.type !== "task" && (
                  <PrivacyIndicator
                    privacyLevel={item.privacy}
                    resourceType={item.type}
                    spaceName={item.space?.name || ""}
                    iconSize={14}
                    testId="privacy-indicator"
                  />
                )}
                <AddChildButton {...props} />
              </>
            }
            subtitle={<ItemContext item={item} columnOptions={columnOptions} />}
          />
        </Cell>

        {!columnOptions.hideStatus && (
          <Cell>
            <StatusLabel status={item.status} label={statusLabel(item.status)} />
          </Cell>
        )}

        {!columnOptions.hideProgress && (
          <Cell hideOnMobile>{tab === "completed" ? null : <ProgressCellContent item={item} />}</Cell>
        )}

        {!columnOptions.hideDueDate && (
          <Cell align="right" numeric>
            <DueCellContent item={item} tab={tab} isClosed={isClosed} muted={muted} />
          </Cell>
        )}

        {!columnOptions.hideNextStep && (
          <Cell last hideOnMobile className="border-l border-line-soft pl-5">
            {tab === "completed" || isClosed ? null : (
              <NextStepContent nextStep={item.nextStep} alert={needsAttention} muted={muted} />
            )}
          </Cell>
        )}
      </Row>

      {hasChildren &&
        expanded &&
        item.children.map((child, childIndex) => (
          <WorkMapRow {...props} key={child.id} item={child} level={level + 1} index={props.index + childIndex + 1} />
        ))}
    </>
  );
}

function ExpandToggle({
  hasChildren,
  expanded,
  onToggle,
  itemName,
}: {
  hasChildren: boolean;
  expanded: boolean;
  onToggle: () => void;
  itemName: string;
}) {
  // The slot is reserved whether or not the row has children, so names in a
  // tree stay aligned instead of shifting left when a branch has no leaves.
  if (!hasChildren) return <span className="w-3.5 flex-shrink-0" />;

  return (
    <motion.button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className="w-3.5 flex-shrink-0 text-content-faint transition-colors hover:text-content-muted"
      aria-expanded={expanded}
      whileTap={{ scale: 0.9 }}
      transition={SNAP}
      data-test-id={createTestId("chevron-icon", itemName)}
    >
      {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
    </motion.button>
  );
}

function ItemContext({ item, columnOptions }: { item: WorkMap.Item; columnOptions: WorkMap.ColumnOptions }) {
  const parts: React.ReactNode[] = [];

  if (!columnOptions.hideSpace && item.space) parts.push(item.space.name);
  if (!columnOptions.hideProject && item.project) parts.push(item.project.name);
  if (!columnOptions.hideOwner && item.owner) parts.push(item.owner.fullName);

  if (parts.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-content-faint">·</span>}
          <span>{part}</span>
        </React.Fragment>
      ))}
    </span>
  );
}

function ProgressCellContent({ item }: { item: WorkMap.Item }) {
  const bar = (
    <div className="flex items-center gap-2">
      <div className="w-14 flex-shrink-0">
        <ProgressBar progress={item.progress ?? 0} status={item.status as never} size="sm" />
      </div>
      <span className="text-xs tabular-nums text-content-dimmed">{Math.round(item.progress ?? 0)}%</span>
    </div>
  );

  // The bar says how far along; the tooltip says which targets or milestones
  // got it there. Keeping the breakdown on hover keeps the row scannable.
  const summary =
    item.type === "goal" ? (
      <GoalProgressSummary targets={item.targets} checklist={item.checklist} />
    ) : item.type === "project" ? (
      <ProjectProgressSummary milestones={item.milestones} />
    ) : null;

  if (!summary) return bar;

  return (
    <Tooltip
      content={summary}
      size="sm"
      className="!font-normal"
      testId={item.type === "goal" ? "goal-progress-summary" : "project-progress-summary"}
    >
      {bar}
    </Tooltip>
  );
}

function DueCellContent({
  item,
  tab,
  isClosed,
  muted,
}: {
  item: WorkMap.Item;
  tab: WorkMap.Filter;
  isClosed: boolean;
  muted: boolean;
}) {
  if (tab === "completed" && item.completedOn) {
    return <span className="text-[13px] text-content-subtle">{formatIsoDate(item.completedOn)}</span>;
  }

  const endDate = item.timeframe?.endDate;
  if (!endDate) return <span className="text-[13px] text-content-faint">—</span>;

  const note = isClosed ? null : dueNote(endDate.date);

  return (
    <div>
      <div
        className={classNames("text-[13px] tabular-nums", {
          "text-status-offtrack-content": note?.overdue,
          "text-content-subtle": !note?.overdue && muted,
          "text-content-strong": !note?.overdue && !muted,
        })}
      >
        <DateField date={endDate} readonly hideCalendarIcon placeholder={t("turboui.workMap.nA")} />
      </div>
      {note && (
        <div
          className={classNames(
            "mt-0.5 text-[11px]",
            note.overdue ? "text-status-offtrack-content" : "text-content-subtle",
          )}
        >
          {note.label}
        </div>
      )}
    </div>
  );
}

function NextStepContent({ nextStep, alert, muted }: { nextStep: string; alert: boolean; muted: boolean }) {
  // Nothing to say is said by saying nothing. A dash beside a dash-shaped icon
  // reads as a rendering bug rather than as "there is no next step".
  if (!nextStep && !alert) return null;

  const Icon = alert ? IconAlertTriangle : IconArrowNarrowRight;

  return (
    <div className="flex items-center gap-2">
      <Icon
        size={14}
        className={classNames("flex-shrink-0", alert ? "text-status-caution-content" : "text-content-faint")}
      />
      <span
        title={nextStep || ""}
        className={classNames("truncate text-[13px]", {
          "text-status-caution-content": alert,
          "text-content-subtle": !alert && muted,
          "text-content-muted": !alert && !muted,
        })}
      >
        {nextStep}
      </span>
    </div>
  );
}

function AddChildButton({ item, addingEnabled, tab, addItem, spaceSearch, hideCompanyAccessInQuickAdd }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!addingEnabled || tab === "completed") return null;
  if (item.type !== "goal" || !item.space || !addItem || !spaceSearch) return null;

  return (
    <span className="opacity-0 transition-opacity group-hover/row:opacity-100">
      <SecondaryButton size="xxs" onClick={() => setIsOpen(true)} testId="add-subitem">
        {t("turboui.workMap.add")}
      </SecondaryButton>

      <AddItemModal
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        parentGoal={item}
        spaceSearch={spaceSearch}
        save={addItem}
        space={item.space}
        hideCompanyAccess={Boolean(hideCompanyAccessInQuickAdd)}
      />
    </span>
  );
}

function formatIsoDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
}

/** Status colour for a row's progress bar, exported for the summary cards. */
export function progressBarClassName(status: string): string {
  return statusStyle(status).dot;
}
