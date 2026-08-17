import * as React from "react";

import { Outlet } from "react-router";

import { DevBar } from "@/features/DevBar";
import { useScrollToTopOnNavigationChange } from "@/hooks/useScrollToTopOnNavigationChange";
import { DivLink } from "turboui";
import { OperatelyLogo } from "@/components/OperatelyLogo";
import { SecondaryButton, IconDoorExit } from "turboui";
import { t } from "@/i18n";

export default function SaasAdminLayout() {
  const outletDiv = React.useRef<HTMLDivElement>(null);

  useScrollToTopOnNavigationChange({ outletDiv });

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      <div className="flex-1 overflow-y-auto" ref={outletDiv}>
        <Outlet />
      </div>
      <DevBar />
    </div>
  );
}

function Navigation() {
  return (
    <div className="mt-8 max-w-6xl mx-auto w-full px-8">
      <div className="flex items-center justify-between">
        <DivLink className="flex items-center gap-2 cursor-pointer" to={"/admin"}>
          <OperatelyLogo width="32px" height="32px" />
          <div className="">
            <span className="font-bold leading-snug">{t("layouts.saasAdminLayoutTsx.operately")}</span>
            <div className="text-xs text-content-accent leading-snug">
              {t("layouts.saasAdminLayoutTsx.saasAdminPanel")}
            </div>
          </div>
        </DivLink>

        <div>
          <SecondaryButton linkTo="/" size="sm">
            <IconDoorExit className="inline-block mr-2" size={16} /> {t("layouts.saasAdminLayoutTsx.exitAdminPanel")}
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
