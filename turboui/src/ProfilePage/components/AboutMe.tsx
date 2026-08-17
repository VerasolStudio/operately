import React from "react";

import RichContent, { parseContent } from "../../RichContent";
import { MentionedPersonLookupFn } from "../../RichEditor/useEditor";
import { t } from "../../i18n";

export function AboutMe({
  content,
  mentionedPersonLookup,
}: {
  content: string | null | undefined;
  mentionedPersonLookup: MentionedPersonLookupFn;
}) {
  const parsedContent = parseContent(content);

  return (
    <div>
      <div className="text-xs mb-2 uppercase font-bold">{t("turboui.profilePage.aboutMe")}</div>
      <RichContent
        content={parsedContent}
        mentionedPersonLookup={mentionedPersonLookup}
        className="text-sm leading-relaxed"
      />
    </div>
  );
}
