import * as React from "react";

import { AppShell, MotionProvider } from "turboui";

import { Outlet } from "react-router";

import { useRefresh } from "@/components/Pages";
import { DevBar } from "@/features/DevBar";
import { useScrollToTopOnNavigationChange } from "@/hooks/useScrollToTopOnNavigationChange";
import * as Billing from "@/models/billing";
import { useCompanyLoaderData } from "@/routes/useCompanyLoaderData";
import { BillingDangerBanner } from "./BillingDangerBanner";
import { KeyboardShortcutsModal, useKeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { CompanySidebar } from "./Sidebar";
import { SiteMessageBanner } from "./SiteMessageBanner";
import { SupportSessionBanner } from "./SupportSessionBanner";

/**
 * The frame for every page inside a company.
 *
 * Navigation lives in a persistent left rail rather than a top bar, which is
 * the structural change the rest of the redesign is built on: with the top of
 * the viewport free, every page can open with its own breadcrumb, title and
 * actions instead of competing with global chrome for the same strip.
 */
export default function CompanyLayout() {
  const { company } = useCompanyLoaderData();
  const outletDiv = React.useRef<HTMLDivElement>(null);
  const keyboardShortcutsModal = useKeyboardShortcutsModal();
  const refresh = useRefresh();

  useScrollToTopOnNavigationChange({ outletDiv });
  Billing.useBillingUpdatedSignal(refresh);

  return (
    // Every animation in the app sits under this provider, so reduced-motion
    // preferences are honoured once rather than component by component.
    <MotionProvider>
      <AppShell
        sidebar={<CompanySidebar onOpenKeyboardShortcuts={keyboardShortcutsModal.open} />}
        scrollRef={outletDiv}
        mobileTitle={company.name}
        topBanners={
          <>
            <SiteMessageBanner />
            <SupportSessionBanner />
            <BillingDangerBanner />
          </>
        }
      >
        <Outlet />
      </AppShell>

      <DevBar />
      <KeyboardShortcutsModal isOpen={keyboardShortcutsModal.isOpen} onClose={keyboardShortcutsModal.close} />
    </MotionProvider>
  );
}
