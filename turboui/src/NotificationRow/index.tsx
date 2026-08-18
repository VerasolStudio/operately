import React from "react";

import { Avatar, type AvatarPerson } from "../Avatar";
import { FormattedTime, type Format, type FormattedTimePreferences } from "../FormattedTime";
import { IconCheck } from "../icons";
import { SNAP, motion } from "../Motion";
import { t } from "../i18n";
import classNames from "../utils/classnames";

export interface NotificationRowProps {
  author: AvatarPerson;
  title: React.ReactNode;
  location: React.ReactNode;
  insertedAt: string;
  formattedTimePreferences: FormattedTimePreferences;
  read: boolean;
  testId: string;
  onOpen: () => void;
  onMarkAsRead: () => void;
  /**
   * How the timestamp is rendered. Inside a list that is already grouped by
   * day, the time alone is enough; a flat list needs the date too.
   */
  timeFormat?: Format;
}

/**
 * One notification.
 *
 * Unread rows carry a tint and a leading dot rather than bold text: bold is
 * already doing the work of separating who from what, and adding a second
 * weight made a full inbox look like one continuous headline.
 */
export function NotificationRow({
  author,
  title,
  location,
  insertedAt,
  formattedTimePreferences,
  read,
  testId,
  onOpen,
  onMarkAsRead,
  timeFormat = "time-only",
}: NotificationRowProps) {
  const handleMarkAsRead = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onMarkAsRead();
  };

  return (
    <div
      className={classNames(
        "group flex cursor-pointer items-center gap-3 border-b border-line-soft px-4 py-3 transition-colors last:border-b-0",
        read ? "hover:bg-surface-highlight" : "bg-primary-soft-bg hover:bg-primary-soft-bg/70",
      )}
      onClick={onOpen}
      data-test-id={testId}
    >
      <span
        className={classNames("h-1.5 w-1.5 flex-shrink-0 rounded-full", read ? "bg-transparent" : "bg-primary")}
        aria-hidden
      />

      <div className="shrink-0">
        <Avatar person={author} size="small" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-content-strong">{title}</div>
        <div className="mt-0.5 truncate text-xs text-content-subtle">{location}</div>
      </div>

      <span className="flex-shrink-0 whitespace-nowrap text-xs text-content-subtle">
        <FormattedTime {...formattedTimePreferences} time={insertedAt} format={timeFormat} />
      </span>

      {!read && (
        <motion.button
          type="button"
          aria-label={t("turboui.notificationRow.markAsRead")}
          title={t("turboui.notificationRow.markAsRead")}
          className="flex-shrink-0 rounded p-1 text-content-subtle opacity-0 transition-opacity hover:text-content-strong focus:opacity-100 group-hover:opacity-100"
          data-test-id={`${testId}-mark-as-read`}
          onClick={handleMarkAsRead}
          whileTap={{ scale: 0.9 }}
          transition={SNAP}
        >
          <IconCheck size={16} />
        </motion.button>
      )}
    </div>
  );
}
