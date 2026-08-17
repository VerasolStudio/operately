import * as React from "react";
import { IconH2 } from "../../icons";

import { ToolbarToggleButton } from "./ToolbarToggleButton";
import { t } from "../../i18n";

export function H2Button({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarToggleButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      isActive={editor?.isActive("heading", { level: 2 })}
      title={t("turboui.richEditor.heading2")}
    >
      <IconH2 size={iconSize} />
    </ToolbarToggleButton>
  );
}
