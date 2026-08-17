import React from "react";
import { IconCircleKey, SecondaryButton } from "turboui";
import { useEndSupportSession, useHasSupportSessionCookie } from "../../features/SupportSessions";
import { t } from "@/i18n";

export function SupportSessionBanner() {
  const handleEndSession = useEndSupportSession();
  const hasSupportCookie = useHasSupportSessionCookie();

  if (!hasSupportCookie) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-yellow-100 border-t border-yellow-300 px-4 py-2 z-[1000]"
      data-testid="support-session-banner"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <IconCircleKey size={20} className="text-yellow-600" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-yellow-800">{t("layouts.companyLayout.supportModeActive")}</span>
            <span className="text-sm text-yellow-700">{t("layouts.companyLayout.youAreViewingThisAccountAs")}</span>
          </div>
        </div>

        <SecondaryButton onClick={handleEndSession} size="sm" testId="end-support-session-button">
          <span className="hidden sm:inline">{t("layouts.companyLayout.exitSupportMode")}</span>
        </SecondaryButton>
      </div>
    </div>
  );
}
