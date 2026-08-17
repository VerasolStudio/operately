import React, { useState } from "react";
import { Avatar, AvatarList } from "../Avatar";
import type { AvatarPerson } from "../Avatar";
import { shortName } from "../Avatar/AvatarWithName";
import { PrimaryButton, SecondaryButton } from "../Button";
import { CommentInputProps, CommentNotificationInfo, Person } from "./types";
import { Editor, useEditor } from "../RichEditor";
import { useDraftActivatedInput } from "./useDraftActivatedInput";
import { t } from "../i18n";

interface CommentInputActiveProps extends CommentInputProps {
  currentUser: Person;
  onBlur: () => void;
  onPost: () => void;
}

interface CommentInputInactiveProps {
  currentUser: Person;
  onClick: () => void;
}

export function CommentInput({
  form,
  currentUser,
  richTextHandlers,
  notificationInfo,
}: CommentInputProps & { currentUser: Person }) {
  const { active, activate, deactivate } = useDraftActivatedInput(form.commentDraftKey);

  if (active) {
    return (
      <CommentInputActive
        form={form}
        currentUser={currentUser}
        onBlur={deactivate}
        onPost={deactivate}
        richTextHandlers={richTextHandlers}
        notificationInfo={notificationInfo}
      />
    );
  }

  return <CommentInputInactive currentUser={currentUser} onClick={activate} />;
}

function CommentInputInactive({ currentUser, onClick }: CommentInputInactiveProps) {
  return (
    <div
      className="py-4 sm:py-6 not-first:border-t border-stroke-base cursor-pointer flex items-center gap-3"
      data-test-id="add-comment"
      onClick={onClick}
    >
      <Avatar person={currentUser} size="normal" />
      {t("turboui.commentSection.writeACommentHere")}
    </div>
  );
}

function CommentInputActive({
  form,
  currentUser,
  onBlur,
  onPost,
  richTextHandlers,
  notificationInfo,
}: CommentInputActiveProps) {
  const [uploading] = useState(false);

  const editor = useEditor({
    content: "",
    editable: true,
    placeholder: t("turboui.commentSection.writeACommentHere"),
    handlers: richTextHandlers,
    autoFocus: true,
    className: "min-h-[200px] px-4 py-3",
    localDraft: { key: form.commentDraftKey },
  });

  const handlePost = async () => {
    const content = editor.getJson();
    if (!content || editor.empty) return;
    if (uploading) return;

    // Close the composer before the optimistic comment lands so the new row
    // never appears while the active comment box is still open.
    editor.clearLocalDraft();
    onPost();

    try {
      await form.postComment(content);
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleCancel = () => {
    editor.clearLocalDraft();
    onBlur();
  };

  React.useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleCancel]);

  return (
    <div className="py-6 not-first:border-t border-stroke-base flex items-start gap-3" data-test-id="new-comment-form">
      <Avatar person={currentUser} size="normal" />
      <div className="flex-1">
        <div className="border border-surface-outline rounded-lg overflow-hidden">
          <Editor editor={editor} hideBorder padding="p-0" />

          <div className="flex justify-between items-center m-4">
            <div className="flex items-center gap-2">
              <PrimaryButton
                size="xs"
                onClick={handlePost}
                loading={form.submitting || uploading}
                disabled={editor.empty}
                testId="post-comment"
              >
                {uploading ? "Uploading..." : "Post"}
              </PrimaryButton>

              <SecondaryButton size="xs" onClick={handleCancel}>
                {t("turboui.commentSection.cancel")}
              </SecondaryButton>
            </div>
          </div>

          {notificationInfo && <CommentNotificationSummary info={notificationInfo} />}
        </div>
      </div>
    </div>
  );
}

function CommentNotificationSummary({ info }: { info: CommentNotificationInfo }) {
  const subscribedPeople = (info.subscribedPeople ?? []).filter((person) => person.id !== info.currentUserId);
  const [showAllRecipients, setShowAllRecipients] = useState(false);
  const recipientSummary = buildRecipientSummary(subscribedPeople, info.entityLabel);

  return (
    <div className="border-t border-surface-outline px-4 py-3 bg-surface-dimmed/40">
      <div className="flex items-center gap-3">
        <AvatarList people={subscribedPeople} size="tiny" stacked maxElements={6} wrap={false} />
        <div className="min-w-0">
          <div className="text-xs text-content-base flex flex-wrap items-center gap-x-1 gap-y-1">
            <span>{recipientSummary.message}</span>
            {recipientSummary.hasHiddenRecipients && (
              <button
                type="button"
                className="text-content-link hover:underline"
                onClick={() => setShowAllRecipients((prev) => !prev)}
              >
                {showAllRecipients ? "Hide list" : "View all"}
              </button>
            )}
          </div>
          {showAllRecipients && recipientSummary.allNames.length > 0 && (
            <div className="text-xs text-content-dimmed mt-1">{recipientSummary.allNames.join(", ")}</div>
          )}
          {!info.isCurrentUserSubscribed && subscribedPeople.length > 0 && (
            <div className="text-xs text-content-dimmed mt-1">
              {t("turboui.commentSection.tipSubscribeIfYouWantNotifications")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildRecipientSummary(people: AvatarPerson[], entityLabel: "task" | "milestone") {
  const names = people
    .map((person) => (person.fullName ? shortName(person.fullName) : null))
    .filter(Boolean) as string[];

  if (names.length === 0) {
    return {
      message: t("turboui.commentSection.tipMentionSomeoneToNotifyThem", { v1: entityLabel }),
      allNames: [],
      hasHiddenRecipients: false,
    };
  }

  if (names.length === 1) {
    return {
      message: withSentencePeriod(t("turboui.commentSection.thisCommentWillNotify", { v1: names[0] })),
      allNames: names,
      hasHiddenRecipients: false,
    };
  }

  if (names.length === 2) {
    return {
      message: withSentencePeriod(t("turboui.commentSection.thisCommentWillNotifyAnd", { v1: names[0], v2: names[1] })),
      allNames: names,
      hasHiddenRecipients: false,
    };
  }

  const remainingCount = names.length - 2;
  return {
    message: withSentencePeriod(
      t("turboui.commentSection.thisCommentWillNotifyAndOther", {
        v1: names[0],
        v2: names[1],
        v3: remainingCount,
        v4: remainingCount === 1 ? "" : "s",
      }),
    ),
    allNames: names,
    hasHiddenRecipients: true,
  };
}

function withSentencePeriod(text: string) {
  return text.endsWith(".") ? text : `${text}.`;
}
