import React from "react";
import axios from "axios";

import { DocumentVersionHistoryPage, showErrorToast, showSuccessToast } from "turboui";

import { useFormattedTimePreferences } from "@/hooks/useFormattedTimePreferences";
import { useRichEditorHandlers } from "@/hooks/useRichEditorHandlers";
import * as Hub from "@/models/resourceHubs";
import { usePaths } from "@/routes/paths";
import { assertPresent } from "@/utils/assertions";
import * as Pages from "@/components/Pages";

import { useLoadedData } from "./loader";
import { buildDocumentVersionsPageNavigation } from "./navigation";
import { t } from "@/i18n";

export function Page() {
  const { document, resourceHub, versions } = useLoadedData();
  const refresh = Pages.useRefresh();
  const paths = usePaths();
  const formattedTimePreferences = useFormattedTimePreferences();
  const { mentionedPersonLookup } = useRichEditorHandlers();

  assertPresent(document.id, "document id must be present");
  assertPresent(document.permissions, "permissions must be present in document");

  const props: DocumentVersionHistoryPage.Props = {
    title: ["History of changes", document.name || "Document"],
    navigation: buildDocumentVersionsPageNavigation(document, resourceHub, paths),
    versions,
    formattedTimePreferences,
    mentionedPersonLookup,
    getComparisonPath: (versionNumber) => paths.resourceHubDocumentVersionPath(document.id!, versionNumber),
    canRestore: Boolean(document.permissions.canEditDocument),
    currentVersionNumber: document.currentVersion ?? null,
    onRestore: async (versionNumber, expectedCurrentVersion) => {
      try {
        await Hub.documents.restoreVersion({
          documentId: document.id!,
          versionNumber,
          expectedCurrentVersion,
        });
        showSuccessToast(
          t("pages.resourceHubDocumentVersionsPage.versionRestored"),
          t("pages.resourceHubDocumentVersionsPage.versionRestoredAsTheCurrentDocument", { v1: versionNumber }),
        );
        refresh();
        return "ok";
      } catch (error) {
        if (isVersionConflict(error)) {
          return "conflict";
        }

        showErrorToast(
          t("pages.resourceHubDocumentVersionsPage.restoreFailed"),
          t("pages.resourceHubDocumentVersionsPage.weCouldnTRestoreThatVersion"),
        );
        return "error";
      }
    },
    onReload: () => {
      refresh();
    },
  };

  return <DocumentVersionHistoryPage {...props} />;
}

function isVersionConflict(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;

  const details = error.response?.data?.details;
  const reason = details?.reason ?? details?.["reason"];
  return reason === "version_conflict";
}
