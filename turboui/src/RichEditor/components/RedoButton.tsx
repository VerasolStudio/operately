import * as React from "react";
import { IconArrowForwardUp } from "../../icons";

import { ToolbarButton } from "./ToolbarButton";
import { canExecuteEditorCommand } from "./canExecuteEditorCommand";
import { t } from "../../i18n";

export function RedoButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarButton
      onClick={() => editor.chain().focus().redo().run()}
      disabled={!canExecuteEditorCommand(editor, (can) => can.redo())}
      title={t("turboui.richEditor.redo")}
    >
      <IconArrowForwardUp size={iconSize} />
    </ToolbarButton>
  );
}
