import React from "react";
import { TaskPage } from ".";
import { Timeline } from "../Timeline";
import { PageDescription } from "../PageDescription";
import { t } from "../i18n";

export function Overview(props: TaskPage.ContentState) {
  return (
    <div className="space-y-10">
      <PageDescription
        {...props}
        label={t("turboui.taskPage.notes")}
        placeholder={t("turboui.taskPage.describeTheTask")}
        zeroStatePlaceholder="Add notes about this task..."
        localDraftKey={props.localDraftKeyBase ? `${props.localDraftKeyBase}:description` : undefined}
      />
      <ActivitySection {...props} />
    </div>
  );
}

function ActivitySection(props: TaskPage.ContentState) {
  if (props.timelineItems && props.currentUser) {
    return (
      <div data-test-id="task-activity-section">
        <h2 className="m-0 mb-4 text-[15px] font-semibold text-content-strong">
          {t("turboui.taskPage.commentsActivity")}
        </h2>
        <Timeline
          items={props.timelineItems}
          currentUser={props.currentUser}
          isLoading={props.timelineIsLoading}
          canComment={props.canComment ?? true}
          commentParentType="task"
          onAddComment={props.onAddComment}
          onEditComment={props.onEditComment}
          onDeleteComment={props.onDeleteComment}
          onAddReaction={props.onAddReaction}
          onRemoveReaction={props.onRemoveReaction}
          richTextHandlers={props.richTextHandlers}
          commentDraftKey={props.localDraftKeyBase ? `${props.localDraftKeyBase}:new-comment` : undefined}
          filters={props.timelineFilters}
          formattedTimePreferences={props.formattedTimePreferences}
          commentNotificationInfo={{
            entityLabel: "task",
            subscribedPeople: props.subscriptions.subscribedPeople ?? [],
            isCurrentUserSubscribed: props.subscriptions.isSubscribed,
            currentUserId: props.currentUser.id,
          }}
        />
      </div>
    );
  }

  // Fallback for when timeline data is not provided
  return (
    <div>
      <h2 className="m-0 mb-4 text-[15px] font-semibold text-content-strong">
        {t("turboui.taskPage.commentsActivity")}
      </h2>
      <div className="text-content-dimmed text-center py-8">{t("turboui.taskPage.timelineDataNotAvailable")}</div>
    </div>
  );
}
