import * as React from "react";
import { IconStrikethrough } from "../../icons";

import { ToolbarToggleButton } from "./ToolbarToggleButton";
import { t } from "../../i18n";

export function StrikeButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarToggleButton
      onClick={() => editor.chain().focus().toggleStrike().run()}
      isActive={editor?.isActive("strike")}
      title={t("turboui.richEditor.strikethrough")}
    >
      <IconStrikethrough size={iconSize} />
    </ToolbarToggleButton>
  );
}
