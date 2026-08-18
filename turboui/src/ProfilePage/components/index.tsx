import React from "react";

import { Avatar } from "../../Avatar";
import { SecondaryButton } from "../../Button";
import { PageHead } from "../../DesignKit/Layout";
import { IconMail } from "../../icons";
import { ProfilePage } from "../index";
import { t } from "../../i18n";

export { AboutMe } from "./AboutMe";
export { Colleagues } from "./Colleagues";

/**
 * The profile header.
 *
 * Title, email and manager used to be scattered between the header and an
 * "about" tab. They collapse into one metadata line here, because they are the
 * facts you look someone up to find — and once they are all visible, the tabs
 * below can be entirely about that person's work.
 */
export function PageHeader(props: ProfilePage.Props) {
  return (
    <PageHead
      align="start"
      crumbs={
        props.peoplePath
          ? [{ label: t("turboui.profilePage.people"), to: props.peoplePath }, { label: props.person.fullName! }]
          : undefined
      }
      glyph={<Avatar person={props.person} size={48} />}
      title={props.person.fullName!}
      meta={
        <>
          {props.person.title && <span className="whitespace-nowrap">{props.person.title}</span>}
          {props.person.email && (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <IconMail size={15} className="text-content-label" />
              {props.person.email}
            </span>
          )}
          {props.manager && (
            <span className="whitespace-nowrap">
              {t("turboui.profilePage.reportsTo", { name: props.manager.fullName })}
            </span>
          )}
        </>
      }
      actions={
        props.canEditProfile && (
          <SecondaryButton size="sm" linkTo={props.editProfilePath}>
            {t("turboui.profilePage.editProfile")}
          </SecondaryButton>
        )
      }
    />
  );
}

export function Contact({ person }: { person: ProfilePage.Person }) {
  return (
    <div>
      <div className="text-xs mb-2 uppercase font-bold">{t("turboui.profilePage.contact")}</div>
      <div className="flex items-center gap-1 font-medium">
        <IconMail size={20} className="text-content-dimmed" />
        {person.email}
      </div>
    </div>
  );
}
