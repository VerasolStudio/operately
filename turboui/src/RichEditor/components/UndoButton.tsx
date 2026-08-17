import * as React from "react";
import { IconArrowBackUp } from "../../icons";

import { ToolbarButton } from "./ToolbarButton";
import { canExecuteEditorCommand } from "./canExecuteEditorCommand";
import { t } from "../../i18n";

export function UndoButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarButton
      onClick={() => editor.chain().focus().undo().run()}
      disabled={!canExecuteEditorCommand(editor, (can) => can.undo())}
      title={t("turboui.richEditor.undo")}
    >
      <IconArrowBackUp size={iconSize} />
    </ToolbarButton>
  );
}
