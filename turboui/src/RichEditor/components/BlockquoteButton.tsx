import * as React from "react";
import { IconBlockquote } from "../../icons";

import { ToolbarToggleButton } from "./ToolbarToggleButton";
import { t } from "../../i18n";

export function BlockquoteButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarToggleButton
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      isActive={editor?.isActive("blockquote")}
      title={t("turboui.richEditor.quote")}
    >
      <IconBlockquote size={iconSize} />
    </ToolbarToggleButton>
  );
}
