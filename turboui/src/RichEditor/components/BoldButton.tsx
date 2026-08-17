import * as React from "react";
import { IconBold } from "../../icons";

import { ToolbarToggleButton } from "./ToolbarToggleButton";
import { t } from "../../i18n";

export function BoldButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarToggleButton
      onClick={() => editor.chain().focus().toggleBold().run()}
      isActive={editor?.isActive("bold")}
      title={t("turboui.richEditor.bold")}
    >
      <IconBold size={iconSize} strokeWidth={2.2} />
    </ToolbarToggleButton>
  );
}
