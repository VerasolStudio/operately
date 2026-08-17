import * as React from "react";
import { IconItalic } from "../../icons";

import { ToolbarToggleButton } from "./ToolbarToggleButton";
import { t } from "../../i18n";

export function ItalicButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarToggleButton
      onClick={() => editor.chain().focus().toggleItalic().run()}
      isActive={editor?.isActive("italic")}
      title={t("turboui.richEditor.italic")}
    >
      <IconItalic size={iconSize} />
    </ToolbarToggleButton>
  );
}
