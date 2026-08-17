import * as React from "react";

import { IconCode } from "../../icons";
import { ToolbarToggleButton } from "./ToolbarToggleButton";
import { t } from "../../i18n";

export function CodeBlockButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarToggleButton
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      isActive={editor?.isActive("codeblock")}
      title={t("turboui.richEditor.codeBlock")}
    >
      <IconCode size={iconSize - 2} />
    </ToolbarToggleButton>
  );
}
