import type { SearchResultType } from "../ApiTypes";
import { t } from "../i18n";

/**
 * The three buckets search results are grouped into.
 *
 * A flat, relevance-ordered list mixes a person, a PDF and a goal in the first
 * three rows, and reading it means re-orienting on every line. Grouping by
 * what kind of thing something is lets you jump to the section you meant and
 * skip the rest — while keeping the backend's relevance order inside each
 * section, so the best match is still first where it matters.
 */
export type SearchGroupId = "work" | "content" | "people";

const GROUP_BY_TYPE: Record<SearchResultType, SearchGroupId> = {
  goal: "work",
  project: "work",
  milestone: "work",
  task: "work",
  resource_hub_folder: "content",
  resource_hub_document: "content",
  resource_hub_file: "content",
  resource_hub_link: "content",
  discussion: "content",
  project_check_in: "content",
  goal_check_in: "content",
  project_retrospective: "content",
  person: "people",
};

const GROUP_ORDER: SearchGroupId[] = ["work", "content", "people"];

export function searchGroupOf(type: SearchResultType): SearchGroupId {
  return GROUP_BY_TYPE[type] ?? "content";
}

export function searchGroupLabel(group: SearchGroupId): string {
  return t(`turboui.searchPage.groups.${group}`);
}

export function groupSearchResults<T extends { type: SearchResultType }>(
  results: T[],
): { id: SearchGroupId; label: string; results: T[] }[] {
  const byGroup = new Map<SearchGroupId, T[]>();

  results.forEach((result) => {
    const group = searchGroupOf(result.type);
    const existing = byGroup.get(group);

    if (existing) {
      existing.push(result);
    } else {
      byGroup.set(group, [result]);
    }
  });

  return GROUP_ORDER.filter((group) => (byGroup.get(group) ?? []).length > 0).map((group) => ({
    id: group,
    label: searchGroupLabel(group),
    results: byGroup.get(group)!,
  }));
}
