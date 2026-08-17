import * as React from "react";

import { IconMinus } from "../../icons";

import { ToolbarButton } from "./ToolbarButton";
import { t } from "../../i18n";

export function DividerButton({ editor, iconSize }): JSX.Element {
  return (
    <ToolbarButton
      onClick={() => editor.chain().focus().setHorizontalRule().run()}
      title={t("turboui.richEditor.divider")}
    >
      <IconMinus size={iconSize} />
    </ToolbarButton>
  );
}
