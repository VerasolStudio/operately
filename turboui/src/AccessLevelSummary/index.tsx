import React from "react";
import { match } from "ts-pattern";
import { IconBuilding, IconLock, IconLockFilled, IconWorld } from "../icons";
import { t } from "../i18n";

const PERMISSION_LEVELS = {
  FULL_ACCESS: 100,
  EDIT_ACCESS: 70,
  COMMENT_ACCESS: 40,
  VIEW_ACCESS: 10,
  NO_ACCESS: 0,
} as const;

export interface AccessLevelSummaryProps {
  resourceType: "project" | "goal" | "space";
  tense: "present" | "future";
  anonymous: number;
  company: number;
  space?: number;
  hideIcon?: boolean;
}

export function AccessLevelSummary(props: AccessLevelSummaryProps) {
  return (
    <div className="flex items-center">
      {!props.hideIcon && <AccessIcon {...props} />}
      <div>
        <div className="font-semibold">{calcTitle(props)}</div>
        <div className="text-sm">{calcDescription(props)}</div>
      </div>
    </div>
  );
}

function AccessIcon(props: AccessLevelSummaryProps) {
  if (props.anonymous >= PERMISSION_LEVELS.VIEW_ACCESS) {
    return <IconWorld className="text-content-accent ml-1.5 mr-3" size={30} strokeWidth={2} />;
  }

  if (props.company >= PERMISSION_LEVELS.VIEW_ACCESS) {
    return <IconBuilding className="text-content-accent ml-1.5 mr-3" size={30} strokeWidth={2} />;
  }

  if (props.resourceType !== "space" && (props.space ?? 0) >= PERMISSION_LEVELS.VIEW_ACCESS) {
    return <IconLock className="text-content-accent ml-1.5 mr-3" size={30} strokeWidth={2} />;
  }

  return <IconLockFilled className="ml-1.5 mr-3 text-callout-error-content" size={30} strokeWidth={2} />;
}

function calcTitle(props: AccessLevelSummaryProps) {
  if (props.anonymous >= PERMISSION_LEVELS.VIEW_ACCESS) {
    return t("turboui.accessLevelSummary.publicAccess");
  }

  if (props.company >= PERMISSION_LEVELS.VIEW_ACCESS) {
    return t("turboui.accessLevelSummary.companyWideAccess");
  }

  if (props.resourceType !== "space" && (props.space ?? 0) >= PERMISSION_LEVELS.VIEW_ACCESS) {
    return t("turboui.accessLevelSummary.spaceWideAccess");
  }

  return t("turboui.accessLevelSummary.inviteOnlyAccess");
}

export function calcDescription(props: AccessLevelSummaryProps) {
  const can =
    props.tense === "future" ? t("turboui.accessLevelSummary.willBeAbleTo") : t("turboui.accessLevelSummary.can");
  const resource = props.resourceType;
  const spaceLevel = props.space ?? 0;

  if (props.anonymous >= PERMISSION_LEVELS.VIEW_ACCESS) {
    let message = t("turboui.accessLevelSummary.anyoneOnTheInternetViewThis", { v1: can, v2: resource });
    const have =
      props.tense === "future" ? t("turboui.accessLevelSummary.willHave") : t("turboui.accessLevelSummary.have");

    if (props.company > props.anonymous) {
      message += match(props.company)
        .with(PERMISSION_LEVELS.VIEW_ACCESS, () => "")
        .with(PERMISSION_LEVELS.COMMENT_ACCESS, () =>
          t("turboui.accessLevelSummary.companyMembersViewAndComment", { v1: can }),
        )
        .with(PERMISSION_LEVELS.EDIT_ACCESS, () => t("turboui.accessLevelSummary.companyMembersEdit", { v1: can }))
        .with(PERMISSION_LEVELS.FULL_ACCESS, () =>
          t("turboui.accessLevelSummary.companyMembersFullAccess", { v1: have }),
        )
        .otherwise(() => "");
    }

    return message;
  }

  if (props.company >= PERMISSION_LEVELS.VIEW_ACCESS) {
    let message = t("turboui.accessLevelSummary.everyoneInTheCompany");
    const have =
      props.tense === "future" ? t("turboui.accessLevelSummary.willHave") : t("turboui.accessLevelSummary.has");

    message += match(props.company)
      .with(PERMISSION_LEVELS.VIEW_ACCESS, () => t("turboui.accessLevelSummary.viewThis", { v1: can, v2: resource }))
      .with(PERMISSION_LEVELS.COMMENT_ACCESS, () =>
        t("turboui.accessLevelSummary.viewAndCommentOnThis", { v1: can, v2: resource }),
      )
      .with(PERMISSION_LEVELS.EDIT_ACCESS, () =>
        t("turboui.accessLevelSummary.viewAndEditThis", { v1: can, v2: resource }),
      )
      .with(PERMISSION_LEVELS.FULL_ACCESS, () =>
        t("turboui.accessLevelSummary.fullAccessToThis", { v1: have, v2: resource }),
      )
      .otherwise(() => "");

    if (props.resourceType !== "space" && spaceLevel > props.company) {
      const spaceHave =
        props.tense === "future" ? t("turboui.accessLevelSummary.willHave") : t("turboui.accessLevelSummary.have");

      message += match(spaceLevel)
        .with(PERMISSION_LEVELS.VIEW_ACCESS, () => "")
        .with(PERMISSION_LEVELS.COMMENT_ACCESS, () => t("turboui.accessLevelSummary.spaceMembersViewAndComment"))
        .with(PERMISSION_LEVELS.EDIT_ACCESS, () => t("turboui.accessLevelSummary.spaceMembersEdit"))
        .with(PERMISSION_LEVELS.FULL_ACCESS, () =>
          t("turboui.accessLevelSummary.spaceMembersFullAccess", { v1: spaceHave }),
        )
        .otherwise(() => "");
    }

    return message;
  }

  if (props.resourceType !== "space" && spaceLevel >= PERMISSION_LEVELS.VIEW_ACCESS) {
    let message = t("turboui.accessLevelSummary.everyoneInTheSpace", { v1: can });

    message += match(spaceLevel)
      .with(PERMISSION_LEVELS.VIEW_ACCESS, () => t("turboui.accessLevelSummary.viewThis2", { v1: resource }))
      .with(PERMISSION_LEVELS.COMMENT_ACCESS, () =>
        t("turboui.accessLevelSummary.viewAndCommentOnThis2", { v1: resource }),
      )
      .with(PERMISSION_LEVELS.EDIT_ACCESS, () => t("turboui.accessLevelSummary.viewAndEditThis2", { v1: resource }))
      .with(PERMISSION_LEVELS.FULL_ACCESS, () => t("turboui.accessLevelSummary.viewAndEditThis2", { v1: resource }))
      .otherwise(() => "");

    return message;
  }

  return t("turboui.accessLevelSummary.onlyPeopleYouAddToThe", { v1: resource, v2: can });
}
