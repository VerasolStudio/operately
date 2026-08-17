import React from "react";

import { SecondaryButton } from "../Button";
import { t } from "../i18n";

export function NoChangesState() {
  return (
    <div
      className="border-t border-surface-outline bg-surface-dimmed py-4 text-sm text-content-dimmed"
      data-test-id="no-content-changes"
    >
      {t("turboui.documentVersionComparisonPage.noContentChangesBetweenTheseVersions")}
    </div>
  );
}

export function ComparisonLoadingState() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      data-test-id="comparison-loading"
      role="status"
      aria-label={t("turboui.documentVersionComparisonPage.loadingComparison")}
    >
      <span className="sr-only">{t("turboui.documentVersionComparisonPage.loadingComparison2")}</span>
      <LoadingPane position="before" />
      <LoadingPane position="after" />
    </div>
  );
}

function LoadingPane({ position }: { position: "before" | "after" }) {
  return (
    <div
      className={
        position === "before"
          ? "border-b border-stroke-base pb-5 sm:pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8"
          : "pt-5 sm:pt-8 md:pt-0 md:pl-8"
      }
      aria-hidden
    >
      <div className="animate-pulse">
        <div className="h-3 w-20 rounded bg-surface-dimmed" />
        <div className="mt-3 h-3 w-32 rounded bg-surface-dimmed" />
        <div className="mt-7 h-7 w-3/4 rounded bg-surface-dimmed" />
        <div className="mt-8 space-y-3">
          <div className="h-3 w-full rounded bg-surface-dimmed" />
          <div className="h-3 w-11/12 rounded bg-surface-dimmed" />
          <div className="h-3 w-4/5 rounded bg-surface-dimmed" />
        </div>
      </div>
    </div>
  );
}

export function ComparisonErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div data-test-id="comparison-error" role="alert">
      <h2 className="font-medium text-content-error">
        {t("turboui.documentVersionComparisonPage.unableToLoadThisComparison")}
      </h2>
      <p className="mt-1 text-sm text-content-dimmed">
        {t("turboui.documentVersionComparisonPage.oneOfTheSelectedVersionsCould")}
      </p>
      <div className="mt-4">
        <SecondaryButton size="sm" onClick={onRetry} testId="retry-comparison">
          {t("turboui.documentVersionComparisonPage.retry")}
        </SecondaryButton>
      </div>
    </div>
  );
}

export function VersionUnavailableState() {
  return (
    <div data-test-id="version-unavailable" role="alert">
      <h2 className="font-medium text-content-error">
        {t("turboui.documentVersionComparisonPage.versionUnavailable")}
      </h2>
      <p className="mt-1 text-sm text-content-dimmed">
        {t("turboui.documentVersionComparisonPage.thatVersionCouldNotBeFound")}
      </p>
    </div>
  );
}
