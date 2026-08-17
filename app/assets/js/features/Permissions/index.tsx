import { match } from "ts-pattern";
import { t } from "@/i18n";

export { PermissionLevels } from "./PermissionLevels";

import { AccessOptions, AccessOptionsInt } from "@/models/permissions";
import { PermissionLevels } from "./PermissionLevels";

export const VIEW_ACCESS = {
  value: PermissionLevels.VIEW_ACCESS,
  label: t("features.permissions.viewAccess"),
};

export const NO_ACCESS = {
  value: PermissionLevels.NO_ACCESS,
  label: t("features.permissions.noAccess"),
};

export const COMMENT_ACCESS = {
  value: PermissionLevels.COMMENT_ACCESS,
  label: t("features.permissions.commentAccess"),
};

export const EDIT_ACCESS = {
  value: PermissionLevels.EDIT_ACCESS,
  label: t("features.permissions.editAccess"),
};

export const FULL_ACCESS = {
  value: PermissionLevels.FULL_ACCESS,
  label: t("features.permissions.fullAccess"),
};

export const PERMISSIONS_LIST = [
  { value: PermissionLevels.FULL_ACCESS, label: t("features.permissions.fullAccess") },
  { value: PermissionLevels.EDIT_ACCESS, label: t("features.permissions.editAccess") },
  { value: PermissionLevels.COMMENT_ACCESS, label: t("features.permissions.commentAccess") },
  VIEW_ACCESS,
];

export function accessLevelAsString(permission: PermissionLevels) {
  return match(permission)
    .with(PermissionLevels.FULL_ACCESS, () => "Full Access")
    .with(PermissionLevels.EDIT_ACCESS, () => "Edit Access")
    .with(PermissionLevels.COMMENT_ACCESS, () => "Comment Access")
    .with(PermissionLevels.VIEW_ACCESS, () => "View Access")
    .with(PermissionLevels.NO_ACCESS, () => "No Access")
    .run();
}

export function accessLevelAsEnumValue(permission: PermissionLevels | AccessOptionsInt): AccessOptions {
  return match(permission)
    .with(PermissionLevels.FULL_ACCESS, () => "full_access" as const)
    .with(PermissionLevels.EDIT_ACCESS, () => "edit_access" as const)
    .with(PermissionLevels.COMMENT_ACCESS, () => "comment_access" as const)
    .with(PermissionLevels.VIEW_ACCESS, () => "view_access" as const)
    .with(PermissionLevels.NO_ACCESS, () => "no_access" as const)
    .run();
}
