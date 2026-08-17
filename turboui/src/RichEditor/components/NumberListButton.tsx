import * as React from "react";
import { IconListNumbers } from "../../icons";

import { ToolbarToggleButton } from "./ToolbarToggleButton";
import { t } from "../../i18n";

export function NumberListButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarToggleButton
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      isActive={editor?.isActive("orderedList")}
      title={t("turboui.richEditor.numberedList")}
    >
      <IconListNumbers size={iconSize} />
    </ToolbarToggleButton>
  );
}
