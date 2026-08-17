import * as React from "react";

import { Forms } from "turboui";
import { useRichEditorHandlers } from "@/hooks/useRichEditorHandlers";
import { FormState } from "./useForm";
import { t } from "@/i18n";

export function Form({ form, children }: { form: FormState; children?: React.ReactNode }) {
  const richTextHandlers = useRichEditorHandlers({ scope: { type: "space", id: form.space.id } });

  return (
    <Forms.Form form={form}>
      <Forms.FieldGroup>
        <div>
          <Forms.TitleInput
            field="title"
            placeholder={t("features.discussionForm.title")}
            autoFocus
            testId="discussion-title"
            errorMessage={t("features.discussionForm.pleaseAddATitle")}
          />
          <Forms.RichTextArea
            field="body"
            richTextHandlers={richTextHandlers}
            placeholder={t("features.discussionForm.writeHere")}
            hideBorder
            height="min-h-[350px]"
            fontSize="text-lg"
            horizontalPadding="px-1"
            verticalPadding="py-2"
          />
        </div>
      </Forms.FieldGroup>

      {children}
    </Forms.Form>
  );
}
