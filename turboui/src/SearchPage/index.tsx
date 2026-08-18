import * as React from "react";

import type { SearchResult, SearchResultState, SearchResultType } from "../ApiTypes";
import { Input } from "../Forms/Input";
import { FormattedTime, type FormattedTimePreferences } from "../FormattedTime";
import {
  IconCalendar,
  IconGoal,
  IconHistory,
  IconMilestone,
  IconMessage,
  IconProject,
  IconSearch,
  IconTask,
  IconUser,
} from "../icons";
import { DivLink } from "../Link";
import { MicroLabel, PageBody, PageHead, Panel, Screen } from "../DesignKit/Layout";
import { groupSearchResults } from "./groups";
import { ResourceHubTypeIcon } from "../ResourceHub";
import { StatusBadge } from "../StatusBadge";
import { SEARCH_TIME_FILTER_OPTIONS, SEARCH_TYPE_FILTER_OPTIONS } from "./filterOptions";
import { RefineControls, type RefineControlsProps } from "./RefineControls";
import { t } from "../i18n";

export { SEARCH_TIME_FILTER_OPTIONS, SEARCH_TYPE_FILTER_OPTIONS };

export namespace SearchPage {
  export type Status = "initial" | "loading" | "success" | "error";
  export type Result = SearchResult & { link: string };
  export type Refine = RefineControlsProps;
  export type SortMode = RefineControlsProps["sort"];
  export type RefineFilter = RefineControlsProps["filters"][number];

  export interface Props {
    query: string;
    status: Status;
    results: Result[];
    onQueryChange: (query: string) => void;
    formattedTimePreferences: FormattedTimePreferences;
    refine?: Refine;
  }
}

const RESULT_LIMIT = 30;

export function SearchPage({
  query,
  status,
  results,
  onQueryChange,
  formattedTimePreferences,
  refine,
}: SearchPage.Props) {
  const visibleResults = results.slice(0, RESULT_LIMIT);

  return (
    <Screen title={t("turboui.searchPage.search")} testId="company-search-page">
      <PageHead title={t("turboui.searchPage.search")} />

      <PageBody width="medium">
        <SearchField query={query} onQueryChange={onQueryChange} />
        {refine && <RefineControls {...refine} />}

        <div className="mt-6">
          <SearchContent
            query={query}
            status={status}
            results={visibleResults}
            formattedTimePreferences={formattedTimePreferences}
          />
        </div>
      </PageBody>
    </Screen>
  );
}

function SearchField({ query, onQueryChange }: Pick<SearchPage.Props, "query" | "onQueryChange">) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor="company-search-input">
        {t("turboui.searchPage.searchTitlesAndContent")}
      </label>
      <IconSearch
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-content-subtle"
      />
      <Input
        id="company-search-input"
        testId="company-search-input"
        type="search"
        autoFocus
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t("turboui.searchPage.searchTitlesAndContent")}
        className="py-2.5 pl-10 pr-4 text-[15px]"
      />
    </div>
  );
}

function SearchContent({
  query,
  status,
  results,
  formattedTimePreferences,
}: Pick<SearchPage.Props, "query" | "status" | "results" | "formattedTimePreferences">) {
  if (status === "loading") {
    return <SearchMessage role="status">{t("turboui.searchPage.searching")}</SearchMessage>;
  }

  if (status === "error") {
    return <SearchMessage role="alert">{t("turboui.searchPage.searchIsUnavailableTryAgain")}</SearchMessage>;
  }

  if (status === "initial") {
    return (
      <SearchMessage role="status">
        {t("turboui.searchPage.searchAcrossProjectsGoalsDiscussionsDocuments")}
      </SearchMessage>
    );
  }

  if (results.length === 0) {
    return <SearchMessage role="status">{t("turboui.searchPage.noContentFoundFor", { v1: query })}</SearchMessage>;
  }

  const groups = groupSearchResults(results);

  return (
    <>
      <p role="status" className="sr-only">
        {resultCountLabel(results.length)}
      </p>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.id} aria-label={group.label}>
            <div className="mb-2 flex items-center gap-2">
              <MicroLabel>{group.label}</MicroLabel>
              <span className="text-xs text-content-subtle">
                {t("turboui.searchPage.groupCount", { count: group.results.length })}
              </span>
            </div>

            <Panel>
              <ol aria-label={t("turboui.searchPage.searchResults")}>
                {group.results.map((result) => (
                  <li key={`${result.type}-${result.id}`}>
                    <SearchResultRow
                      query={query}
                      result={result}
                      formattedTimePreferences={formattedTimePreferences}
                    />
                  </li>
                ))}
              </ol>
            </Panel>
          </section>
        ))}
      </div>
    </>
  );
}

function SearchMessage({ role, children }: { role: "status" | "alert"; children: React.ReactNode }) {
  return (
    <p role={role} className="py-16 text-center text-sm text-content-dimmed sm:text-base">
      {children}
    </p>
  );
}

function SearchResultRow({
  query,
  result,
  formattedTimePreferences,
}: {
  query: string;
  result: SearchPage.Result;
  formattedTimePreferences: FormattedTimePreferences;
}) {
  const metadata = RESULT_TYPE_METADATA[result.type];
  const highlightTerms = getHighlightTerms(query);

  return (
    <DivLink
      to={result.link}
      testId="company-search-result"
      className="group flex items-start gap-3 border-b border-line-soft px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-highlight"
    >
      <div
        aria-hidden="true"
        data-testid="search-result-icon"
        className="mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-entity-neutral-bg text-entity-neutral"
      >
        <SearchResultIcon type={result.type} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="m-0 min-w-0 break-words text-sm font-medium text-content-strong">
          <HighlightedText text={result.title} terms={highlightTerms} />
        </h2>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="min-w-0 truncate text-xs text-content-subtle">{result.context}</span>
          <span aria-hidden="true" className="text-xs text-content-faint">
            ·
          </span>
          <span className="text-xs text-content-subtle">{metadata.label}</span>
          {result.state ? (
            <StatusBadge status={result.state} customLabel={STATE_LABELS[result.state]} hideIcon className="shrink-0" />
          ) : null}
        </div>

        {result.snippet ? (
          <p
            data-testid="search-result-snippet"
            className="mt-1 line-clamp-2 break-words text-[13px] leading-relaxed text-content-muted"
          >
            <HighlightedText text={result.snippet} terms={highlightTerms} />
          </p>
        ) : null}
      </div>
      {result.insertedAt ? (
        <span
          data-test-id="search-result-inserted-at"
          className="shrink-0 whitespace-nowrap text-xs text-content-subtle"
        >
          <FormattedTime {...formattedTimePreferences} time={result.insertedAt} format="relative-time-or-date" />
        </span>
      ) : null}
    </DivLink>
  );
}

function SearchResultIcon({ type }: { type: SearchResultType }) {
  switch (type) {
    case "resource_hub_folder":
      return <ResourceHubTypeIcon type="folder" size={16} />;
    case "resource_hub_document":
      return <ResourceHubTypeIcon type="document" size={16} />;
    case "resource_hub_file":
      return <ResourceHubTypeIcon type="file" size={16} />;
    case "resource_hub_link":
      return <ResourceHubTypeIcon type="link" size={16} />;
    case "project":
      return <IconProject size={14} />;
    case "goal":
      return <IconGoal size={14} />;
    case "milestone":
      return <IconMilestone size={14} />;
    case "task":
      return <IconTask size={14} />;
    case "person":
      return <IconUser size={14} />;
    case "discussion":
      return <IconMessage size={14} />;
    case "project_check_in":
    case "goal_check_in":
      return <IconCalendar size={14} />;
    case "project_retrospective":
      return <IconHistory size={14} />;
  }
}

function HighlightedText({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const alternatives = terms.map(escapeRegExp).join("|");
  const segments = text.split(new RegExp(`(${alternatives})`, "giu"));
  const exactMatch = new RegExp(`^(?:${alternatives})$`, "iu");

  return (
    <>
      {segments.map((segment, index) =>
        exactMatch.test(segment) ? (
          <mark
            key={`${segment}-${index}`}
            className="rounded-sm bg-yellow-200/80 px-0.5 text-inherit dark:bg-yellow-700/60"
          >
            {segment}
          </mark>
        ) : (
          segment
        ),
      )}
    </>
  );
}

function getHighlightTerms(query: string) {
  const words = query.split(/[^\p{L}\p{N}]+/u);
  const uniqueWords = new Map<string, string>();

  words.forEach((word) => {
    if (word.length > 1) uniqueWords.set(word.toLowerCase(), word);
  });

  return Array.from(uniqueWords.values()).sort((left, right) => right.length - left.length);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resultCountLabel(count: number) {
  return count === 1 ? "1 result found." : t("turboui.searchPage.resultsFound", { v1: count });
}

const RESULT_TYPE_METADATA: Record<SearchResultType, { label: string }> = {
  resource_hub_folder: { label: t("turboui.searchPage.folder") },
  resource_hub_document: { label: t("turboui.searchPage.document") },
  resource_hub_file: { label: t("turboui.searchPage.file") },
  resource_hub_link: { label: t("turboui.searchPage.link") },
  project: { label: t("turboui.searchPage.project") },
  goal: { label: t("turboui.searchPage.goal") },
  milestone: { label: t("turboui.searchPage.milestone") },
  task: { label: t("turboui.searchPage.task") },
  person: { label: t("turboui.searchPage.person") },
  discussion: { label: t("turboui.searchPage.discussion") },
  project_check_in: { label: t("turboui.searchPage.projectCheckIn") },
  goal_check_in: { label: t("turboui.searchPage.goalCheckIn") },
  project_retrospective: { label: t("turboui.searchPage.projectRetrospective") },
};

const STATE_LABELS: Record<SearchResultState, string> = {
  closed: "Closed",
  completed: "Completed",
  archived: "Archived",
  paused: "Paused",
};
