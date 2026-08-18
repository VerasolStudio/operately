import * as Companies from "@/models/companies";
import * as React from "react";

import { encodeUrlParams } from "@/routes/paths";
import { IconBrandDiscordFilled, IconLifebuoy, IconMail, IconMap2, IconQuestionMark, IconSpeakerphone } from "turboui";
import { useTranslation } from "react-i18next";
import { DropdownActionItem, DropdownLinkItem, DropdownMenu, DropdownSeparator } from "./DropdownMenu";

const supportEmail = "support@operately.com";
const newsLink = "https://operately.com/releases";
const roadmap = "https://operately.com/roadmap";

const DiscordIcon = IconBrandDiscordFilled;

export function HelpDropdown({
  company,
  onOpenKeyboardShortcuts,
  triggerClassName,
}: {
  company: Companies.Company;
  onOpenKeyboardShortcuts: () => void;
  triggerClassName?: string;
}) {
  const { t } = useTranslation();

  return (
    <DropdownMenu
      testId="help-dropdown"
      name={t("helpMenu.title")}
      icon={IconLifebuoy}
      align="center"
      minWidth={220}
      triggerClassName={triggerClassName}
    >
      <DropdownActionItem
        icon={IconQuestionMark}
        title={t("helpMenu.keyboardShortcuts")}
        onClick={onOpenKeyboardShortcuts}
        testId="keyboard-shortcuts-menu-item"
      />
      <DropdownSeparator />
      <DropdownLinkItem path={contactUsLink(company)} icon={IconMail} title={t("helpMenu.contactUs")} />
      <DropdownLinkItem
        path={window.appConfig!.discordUrl}
        icon={DiscordIcon}
        title={t("helpMenu.discordChat")}
        target="_blank"
      />
      <DropdownLinkItem path={newsLink} icon={IconSpeakerphone} title={t("helpMenu.whatsNew")} target="_blank" />
      <DropdownLinkItem path={roadmap} icon={IconMap2} title={t("helpMenu.roadmap")} target="_blank" />
    </DropdownMenu>
  );
}

function contactUsLink(company: Companies.Company) {
  const params = encodeUrlParams({
    body: "\n\norg name: " + company.name + "\norg id: " + company.id + "\n\n",
  });

  return `mailto:${supportEmail}` + params;
}
