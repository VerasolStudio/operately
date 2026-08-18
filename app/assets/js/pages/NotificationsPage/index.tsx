import Api, { type Notification } from "@/api";
import * as Pages from "@/components/Pages";
import * as Notifications from "@/models/notifications";
import * as Signals from "@/signals";
import * as React from "react";
import { DesignKit, IconSparkles, NotificationRow, SecondaryButton } from "turboui";
import { useFormattedTimePreferences } from "@/hooks/useFormattedTimePreferences";
import ActivityHandler from "@/features/activities";
import { PageModule } from "@/routes/types";
import { useNavigateTo } from "@/routes/useNavigateTo";
import { usePaths } from "../../routes/paths";
import { groupNotificationsByDay } from "./groupByDay";
import { optimisticallyMarkNotificationAsRead } from "./optimisticMarkAsRead";
import { t } from "@/i18n";

export default { name: "NotificationsPage", loader, Page } as PageModule;

interface LoaderResult {
  notifications: Notification[];
}

async function loader(): Promise<LoaderResult> {
  const data = await Api.notifications.list({
    page: 1,
    perPage: 100,
  });

  return {
    notifications: data.notifications as Notification[],
  };
}

type Filter = "all" | "unread";

/**
 * The notification inbox, grouped by day.
 *
 * Read and unread used to be two separate sections, which meant a notification
 * moved to a different part of the page the moment you opened it. Grouping by
 * day instead keeps everything where you last saw it and lets the unread tint
 * carry the state.
 *
 * The design also called for "mentions" and "assigned to me" filters. Neither
 * is buildable today — notifications carry an activity action, not a mention
 * flag, and every notification is already yours — so the tabs stop at all and
 * unread rather than shipping filters that quietly return the same list.
 */
function Page() {
  const paths = usePaths();
  const { notifications: loadedNotifications } = Pages.useLoadedData<LoaderResult>();
  const [notifications, setNotifications] = React.useState(loadedNotifications);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [markNotificationAsRead] = Notifications.useMarkNotificationAsRead();

  React.useEffect(() => {
    setNotifications(loadedNotifications);
  }, [loadedNotifications]);

  const onLoad = () => Signals.publish(Signals.LocalSignal.RefreshNotificationCount);

  const handleMarkAsRead = React.useCallback(
    (notification: Notification) =>
      optimisticallyMarkNotificationAsRead(notification, setNotifications, () =>
        markNotificationAsRead({ id: notification.id }),
      ),
    [markNotificationAsRead],
  );

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const visible = filter === "unread" ? notifications.filter((notification) => !notification.read) : notifications;
  const groups = groupNotificationsByDay(visible);

  return (
    <Pages.Page title={t("pages.notificationsPage.notifications")} onLoad={onLoad}>
      <div className="min-h-full bg-surface-base" data-test-id="notifications-page">
        <DesignKit.PageHead
          title={t("pages.notificationsPage.notifications")}
          subtitle={
            <>
              {t("pages.notificationsPage.unreadCount", { count: unreadCount })}
              {" · "}
              {t("pages.notificationsPage.actionableItemsLiveIn")}
              <a href={paths.reviewPath()} className="text-primary hover:underline">
                {t("sidebar.todo")}
              </a>
              {t("pages.notificationsPage.actionableItemsLiveInSuffix")}
            </>
          }
          actions={unreadCount > 0 ? <MarkAllReadButton /> : undefined}
        />

        <DesignKit.PageBody width="medium">
          <DesignKit.UnderlineTabs
            layoutId="notification-tabs"
            activeId={filter}
            onSelect={(id) => setFilter(id as Filter)}
            tabs={[
              { id: "all", label: t("pages.notificationsPage.tabAll") },
              { id: "unread", label: t("pages.notificationsPage.tabUnread"), count: unreadCount },
            ]}
          />

          {groups.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="mt-5 flex flex-col gap-6">
              {groups.map((group) => (
                <section key={group.key}>
                  <DesignKit.MicroLabel className="mb-2">{group.label}</DesignKit.MicroLabel>
                  <DesignKit.Panel>
                    {group.notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        timeFormat={group.isRecent ? "time-only" : "short-date"}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                  </DesignKit.Panel>
                </section>
              ))}
            </div>
          )}
        </DesignKit.PageBody>
      </div>
    </Pages.Page>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-surface-outline px-8 py-14 text-center">
      <IconSparkles size={20} className="text-status-caution" />
      <p className="m-0 text-sm font-medium text-content-strong">
        {filter === "unread"
          ? t("pages.notificationsPage.nothingNewForYou")
          : t("pages.notificationsPage.noNotificationsYet")}
      </p>
    </div>
  );
}

function MarkAllReadButton() {
  const refresh = Pages.useRefresh();
  const [markAllRead, { loading }] = Notifications.useMarkAllNotificationsAsRead();

  const onClick = React.useCallback(async () => {
    await markAllRead({});
    refresh();
  }, [markAllRead, refresh]);

  return (
    <SecondaryButton size="sm" testId="mark-all-read" onClick={onClick} loading={loading}>
      {t("pages.notificationsPage.markAllRead")}
    </SecondaryButton>
  );
}

interface NotificationItemProps {
  notification: Notification;
  timeFormat: "time-only" | "short-date";
  onMarkAsRead: (notification: Notification) => void;
}

function NotificationItem({ notification, timeFormat, onMarkAsRead }: NotificationItemProps) {
  const activity = notification.activity;
  const author = activity?.author;

  if (!activity || !author) return null;

  return (
    <NotificationItemWithActivity
      notification={notification}
      activity={activity}
      author={author}
      timeFormat={timeFormat}
      onMarkAsRead={onMarkAsRead}
    />
  );
}

interface NotificationItemWithActivityProps extends NotificationItemProps {
  activity: NonNullable<Notification["activity"]>;
  author: NonNullable<NonNullable<Notification["activity"]>["author"]>;
}

function NotificationItemWithActivity({
  notification,
  activity,
  author,
  timeFormat,
  onMarkAsRead,
}: NotificationItemWithActivityProps) {
  const paths = usePaths();
  const formattedTimePreferences = useFormattedTimePreferences();
  const testId = `notification-item-${activity.action}`;

  const goToActivity = useNavigateTo(ActivityHandler.pagePath(paths, activity));
  const [mark] = Notifications.useMarkNotificationAsRead();

  const clickHandler = React.useCallback(async () => {
    await mark({ id: notification.id });
    goToActivity();
  }, [goToActivity, mark, notification.id]);

  return (
    <NotificationRow
      author={author}
      title={<ActivityHandler.NotificationTitle activity={activity} />}
      location={<ActivityHandler.NotificationLocation activity={activity} />}
      insertedAt={activity.insertedAt}
      formattedTimePreferences={formattedTimePreferences}
      timeFormat={timeFormat}
      read={notification.read}
      testId={testId}
      onOpen={clickHandler}
      onMarkAsRead={() => onMarkAsRead(notification)}
    />
  );
}
