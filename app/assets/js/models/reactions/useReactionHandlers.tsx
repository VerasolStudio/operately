import React from "react";
import Api, { CommentParentType } from "@/api";
import { showErrorToast } from "turboui";
import { compareIds } from "@/routes/paths";
import { useMe } from "@/contexts/CurrentCompanyContext";
import { t } from "@/i18n";

export function useReactionHandlers<T extends { id?: string | null; reactions?: any[]; content?: any }>(
  setComments: React.Dispatch<React.SetStateAction<T[]>>,
  parentType: CommentParentType,
  invalidateCache: () => void,
) {
  const currentUser = useMe();

  const updateCommentById = React.useCallback(
    (commentId: string, updater: (comment: T) => T) => {
      setComments((prev) =>
        prev.map((comment) => {
          if ("content" in comment && compareIds(comment.id, commentId)) {
            return updater(comment);
          }
          return comment;
        }),
      );
    },
    [setComments],
  );

  const handleAddReaction = React.useCallback(
    async (commentId: string, emoji: string) => {
      if (!currentUser) {
        showErrorToast(t("app.useReactionHandlers.error"), t("app.useReactionHandlers.failedToAddReaction"));
        return;
      }

      const tempReactionId = `temp-${Date.now()}`;
      const optimisticReaction = {
        id: tempReactionId,
        emoji,
        person: currentUser,
      };

      // Optimistically add reaction
      updateCommentById(commentId, (comment) => ({
        ...comment,
        reactions: [...(comment.reactions ?? []), optimisticReaction],
      }));

      try {
        await Api.reactions.create({
          entityId: commentId,
          entityType: "comment",
          parentType,
          emoji,
        });

        invalidateCache();
      } catch (error) {
        // Rollback on error
        updateCommentById(commentId, (comment) => ({
          ...comment,
          reactions: (comment.reactions ?? []).filter((reaction) => reaction.id !== tempReactionId),
        }));
        showErrorToast(t("app.useReactionHandlers.error"), t("app.useReactionHandlers.failedToAddReaction"));
      }
    },
    [currentUser, updateCommentById, invalidateCache, parentType],
  );

  const handleRemoveReaction = React.useCallback(
    async (commentId: string, reactionId: string) => {
      let removedReaction: any = null;

      // Optimistically remove reaction
      updateCommentById(commentId, (comment) => {
        const reactions = comment.reactions ?? [];
        removedReaction = reactions.find((r) => r.id === reactionId);
        return { ...comment, reactions: reactions.filter((r) => r.id !== reactionId) };
      });

      try {
        await Api.reactions.delete({ reactionId });
        invalidateCache();
      } catch (error) {
        // Rollback on error
        if (removedReaction) {
          updateCommentById(commentId, (comment) => ({
            ...comment,
            reactions: [...(comment.reactions ?? []), removedReaction],
          }));
        }

        showErrorToast(t("app.useReactionHandlers.error"), t("app.useReactionHandlers.failedToRemoveReaction"));
      }
    },
    [updateCommentById, invalidateCache],
  );

  return {
    handleAddReaction,
    handleRemoveReaction,
  };
}
