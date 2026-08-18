import { useLocation } from "react-router";

import type { UnderlineTab } from "./Controls";
import type { TabsState } from "../Tabs";

/**
 * Turns a `useTabs` state into links for `UnderlineTabs`.
 *
 * Tabs stay in the URL, so a tab is bookmarkable, survives a refresh, and the
 * browser's back button steps between tabs the way people expect it to. The
 * only thing that changes is which query parameter is set — everything else in
 * the URL is preserved.
 */
export function useTabLinks(tabs: TabsState): UnderlineTab[] {
  const location = useLocation();

  return tabs.tabs.map((tab) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("tab", tab.id);

    return {
      id: tab.id,
      label: tab.label,
      count: tab.count,
      to: `${tabs.urlPath || location.pathname}?${searchParams.toString()}`,
    };
  });
}
