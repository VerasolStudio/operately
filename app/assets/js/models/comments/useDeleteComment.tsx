import React from "react";
import Api, { CommentParentType } from "@/api";
import { showErrorToast } from "turboui";
import { compareIds } from "@/routes/paths";
import { t } from "@/i18n";

export function useDeleteComment<T extends { id?: string | null }>(
  comments: T[],
  setComments: React.Dispatch<React.SetStateAction<T[]>>,
  parentType: CommentParentType,
  invalidateCache: () => void,
) {
  const handleDeleteComment = React.useCallback(
    async (commentId: string) => {
      const comment = comments.find((c) => c.id && compareIds(c.id, commentId));

      try {
        if (comment) {
          // Optimistically remove the comment from the list
          setComments((prev) => prev.filter((c) => !compareIds(c.id, commentId)));
        }

        await Api.comments.delete({
          commentId,
          parentType,
        });

        invalidateCache();
      } catch (error) {
        if (comment) {
          // Rollback: restore the comment
          setComments((prev) => [...prev, comment]);
        }
        showErrorToast(t("app.useDeleteComment.error"), t("app.useDeleteComment.failedToDeleteComment"));
      }
    },
    [comments, parentType, invalidateCache, setComments],
  );

  return {
    handleDeleteComment,
  };
}
