import * as React from "react";
import { IconList } from "../../icons";

import { ToolbarToggleButton } from "./ToolbarToggleButton";
import { t } from "../../i18n";

export function BulletListButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarToggleButton
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      isActive={editor?.isActive("bulletList")}
      title={t("turboui.richEditor.bulletList")}
    >
      <IconList size={iconSize} />
    </ToolbarToggleButton>
  );
}
