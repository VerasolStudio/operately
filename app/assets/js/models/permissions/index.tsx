import Api from "@/api";
import { t } from "@/i18n";

export type { AccessOptions, AccessOptionsInt, AccessLevels } from "@/api";
export const useGrantResourceAccess = Api.companies.useGrantResourceAccess;

export const PERMISSIONS_LIST_COMPLETE = [
  { value: "full_access", label: t("app.index.fullAccess") },
  { value: "edit_access", label: t("app.index.editAccess") },
  { value: "comment_access", label: t("app.index.commentAccess") },
  { value: "view_access", label: t("app.index.viewAccess") },
];

export const PERMISSIONS_LIST = [
  { value: "edit_access", label: t("app.index.editAccess") },
  { value: "comment_access", label: t("app.index.commentAccess") },
  { value: "view_access", label: t("app.index.viewAccess") },
];
