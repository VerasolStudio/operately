import React from "react";

import type { Page } from "turboui";
import { IconCopy, IconEdit, IconFileExport, IconHistory, IconTrash } from "turboui";

import { usePaths } from "@/routes/paths";
import { assertPresent } from "@/utils/assertions";
import { downloadMarkdown, exportToMarkdown } from "@/utils/markdown";

import { useLoadedData } from "./loader";
import { t } from "@/i18n";

interface Props {
  showCopyModal: () => void;
  showDeleteModal: () => void;
}

export function useDocumentPageOptions({ showCopyModal, showDeleteModal }: Props): Page.Option[] {
  const paths = usePaths();
  const { document } = useLoadedData();

  assertPresent(document.permissions, "permissions must be present in document");

  return React.useMemo(() => {
    const options: Page.Option[] = [
      {
        type: "link",
        icon: IconEdit,
        label: t("pages.resourceHubDocumentPage.edit"),
        link: paths.resourceHubEditDocumentPath(document.id!),
        hidden: !document.permissions?.canEditDocument,
        keepOutsideOnBigScreen: true,
        testId: "edit-document-link",
      },
      {
        type: "action",
        icon: IconCopy,
        label: t("pages.resourceHubDocumentPage.copy"),
        onClick: showCopyModal,
        hidden: !document.permissions?.canCreateDocument,
        testId: "copy-document-link",
      },
      {
        type: "link",
        icon: IconHistory,
        label: t("pages.resourceHubDocumentPage.historyOfChanges"),
        link: paths.resourceHubDocumentVersionsPath(document.id!),
        hidden: !document.permissions?.canView,
        testId: "version-history-link",
      },
      {
        type: "action",
        icon: IconFileExport,
        label: t("pages.resourceHubDocumentPage.exportAsMarkdown"),
        onClick: () => {
          const content = JSON.parse(document.content!);
          const markdown = exportToMarkdown(content, { removeEmbeds: true });
          downloadMarkdown(markdown, document.name || "document");
        },
        hidden: !document.permissions?.canView,
        testId: "export-markdown",
      },
      {
        type: "action",
        icon: IconTrash,
        label: t("pages.resourceHubDocumentPage.delete"),
        onClick: showDeleteModal,
        hidden: !document.permissions?.canDeleteDocument,
        testId: "delete-resource-link",
      },
    ];

    return options;
  }, [
    document.content,
    document.id,
    document.name,
    document.permissions?.canCreateDocument,
    document.permissions?.canDeleteDocument,
    document.permissions?.canEditDocument,
    document.permissions?.canView,
    paths,
    showCopyModal,
    showDeleteModal,
  ]);
}
