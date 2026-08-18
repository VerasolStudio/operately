import React from "react";
import classNames from "../utils/classnames";
import { NotificationToggle } from "../NotificationToggle";
import { t } from "../i18n";

export function SidebarSection({
  title,
  children,
  testId,
  className = "",
}: {
  title: string | React.ReactNode;
  children: React.ReactNode;
  testId?: string;
  className?: string;
}) {
  return (
    <div className={classNames("space-y-1.5", className)} data-test-id={testId}>
      {/* The 11px uppercase label is the redesign's standard for anything that
          titles a field rather than a section of the page. It keeps a column
          of five or six of them from competing with the content beside it. */}
      <div className="truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-content-label">{title}</div>
      {children}
    </div>
  );
}

export function SidebarNotificationSection(props: SidebarNotificationSection.Props) {
  if (props.hidden) return null;

  return (
    <div className={props.className}>
      <SidebarSection title={t("turboui.sidebarSection.notifications")}>
        <NotificationToggle {...props} />
      </SidebarSection>
    </div>
  );
}

export namespace SidebarNotificationSection {
  export interface SubscriberPerson {
    id?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
  }

  export interface Props extends NotificationToggle.Props {
    hidden: boolean;
    className?: string;
    subscribedPeople?: SubscriberPerson[];
  }
}
