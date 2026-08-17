import { IconCopy, IconTrash, IconCopy as IconDuplicate, IconArchive } from "../icons";
import { TaskPage } from ".";
import { t } from "../i18n";

export function pageOptions(props: TaskPage.State) {
  return [
    {
      type: "action" as const,
      label: t("turboui.taskPage.copyURL"),
      icon: IconCopy,
    },
    {
      type: "action" as const,
      label: t("turboui.taskPage.duplicate"),
      onClick: props.onDuplicate,
      icon: IconDuplicate,
      hidden: !props.onDuplicate,
    },
    {
      type: "action" as const,
      label: t("turboui.taskPage.archive"),
      onClick: props.onArchive,
      icon: IconArchive,
      hidden: !props.onArchive,
    },
    {
      type: "action" as const,
      label: t("turboui.taskPage.delete"),
      onClick: () => props.onDelete(),
      icon: IconTrash,
      hidden: !props.canEdit,
    },
  ];
}
