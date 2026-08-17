import * as React from "react";
import { IconH1 } from "../../icons";

import { ToolbarToggleButton } from "./ToolbarToggleButton";
import { t } from "../../i18n";

export function H1Button({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarToggleButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      isActive={editor?.isActive("heading", { level: 1 })}
      title={t("turboui.richEditor.heading1")}
    >
      <IconH1 size={iconSize} />
    </ToolbarToggleButton>
  );
}
