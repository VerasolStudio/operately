import * as React from "react";

import { ToolbarToggleButton } from "./ToolbarToggleButton";

import { IconLink2 } from "../../icons";
import { useLinkState } from "../EditorContext";
import { t } from "../../i18n";

export function LinkButton({ editor, iconSize }): JSX.Element {
  const [linkEditActive, setLinkEditActive] = useLinkState();

  const toggleLink = React.useCallback(() => {
    if (linkEditActive) {
      setLinkEditActive(false);
    } else {
      setLinkEditActive(true);
    }
  }, [editor]);

  return (
    <ToolbarToggleButton
      onClick={toggleLink}
      isActive={editor?.isActive("link") || linkEditActive}
      title={t("turboui.richEditor.addEditLinks")}
    >
      <IconLink2 size={iconSize - 2} />
    </ToolbarToggleButton>
  );
}
