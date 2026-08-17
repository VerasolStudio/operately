import React from "react";

import { useRichEditorHandlers } from "@/hooks/useRichEditorHandlers";
import { DimmedLink, Forms, SubscribersSelector } from "turboui";
import * as Goals from "@/models/goals";

import { useSubscriptionsAdapter } from "@/models/subscriptions";
import { assertPresent } from "@/utils/assertions";

import { useForm } from "./useForm";
import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";

export function Form({ goal }: { goal: Goals.Goal }) {
  const paths = usePaths();
  assertPresent(goal.potentialSubscribers, "potentialSubscribers must be present in goal");
  assertPresent(goal.id, "goal id must be present in goal");

  const opts = goal.space ? { spaceName: goal.space.name } : { goalName: goal.name };
  const subscriptionsState = useSubscriptionsAdapter(goal.potentialSubscribers, {
    ignoreMe: true,
    notifyPrioritySubscribers: true,
    ...opts,
  });
  const form = useForm({ goal, subscriptionsState });
  const richTextHandlers = useRichEditorHandlers({ scope: { type: "goal", id: goal.id } });

  return (
    <Forms.Form form={form}>
      <Forms.FieldGroup>
        <div>
          <Forms.TitleInput
            field="title"
            placeholder={t("pages.goalDiscussionNewPage.title")}
            autoFocus
            testId="discussion-title"
            errorMessage={t("pages.goalDiscussionNewPage.pleaseAddATitle")}
          />
          <div className="mt-2 border-y border-stroke-base text-content-base font-medium">
            <Forms.RichTextArea
              field="message"
              richTextHandlers={richTextHandlers}
              placeholder={t("pages.goalDiscussionNewPage.startANewDiscussion")}
              hideBorder
              height="min-h-[350px]"
              fontSize="text-lg"
              horizontalPadding="px-0"
              verticalPadding="py-2"
            />
          </div>
        </div>
      </Forms.FieldGroup>

      <div className="my-10">
        <SubscribersSelector {...subscriptionsState} />
      </div>

      <Forms.FormError message={t("pages.goalDiscussionNewPage.fillOutAllTheRequiredFields")} className="mt-4" />

      <div className="flex items-center gap-4 mt-4">
        <Forms.Submit
          saveText={t("pages.goalDiscussionNewPage.postDiscussion")}
          buttonSize="base"
          testId="post-discussion"
          containerClassName="mt-0"
        />
        <DimmedLink to={paths.goalPath(goal.id, { tab: "discussions" })}>
          {t("pages.goalDiscussionNewPage.cancel")}
        </DimmedLink>
      </div>
    </Forms.Form>
  );
}
