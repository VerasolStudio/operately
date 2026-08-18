import * as React from "react";

import { IconMenu2, IconX } from "../icons";
import { AnimatePresence, GLIDE, POP, motion } from "../Motion";
import { Sidebar, SidebarCompanyHeader } from "./Sidebar";

export { Sidebar, SidebarCompanyHeader };

/**
 * The frame every signed-in page renders inside: a fixed rail on the left, the
 * page on the right.
 *
 * Below `lg` the rail becomes a drawer. That is a real behavioural change, not
 * just a narrower layout, so it gets a real animation: the panel slides in from
 * the edge it lives on and a scrim fades up behind it, which is what makes it
 * read as "the sidebar came out" rather than "a new screen appeared".
 */
export function AppShell({
  sidebar,
  topBanners,
  children,
  scrollRef,
  mobileTitle,
}: {
  sidebar: React.ReactNode;
  /** Site messages, billing warnings — anything that must sit above everything. */
  topBanners?: React.ReactNode;
  children: React.ReactNode;
  scrollRef?: React.RefObject<HTMLDivElement>;
  mobileTitle?: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className="flex h-screen flex-col">
      {topBanners}

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[248px] flex-shrink-0 border-r border-surface-outline lg:block">{sidebar}</aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileBar title={mobileTitle} onOpen={() => setDrawerOpen(true)} />

          <main className="relative min-h-0 flex-1 overflow-y-auto bg-surface-bg" ref={scrollRef}>
            {children}
          </main>
        </div>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {sidebar}
      </MobileDrawer>
    </div>
  );
}

function MobileBar({ title, onOpen }: { title?: React.ReactNode; onOpen: () => void }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3 border-b border-surface-outline bg-surface-base px-4 py-2 lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open navigation"
        className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-surface-accent"
        data-test-id="open-mobile-nav"
      >
        <IconMenu2 size={20} />
      </button>
      <div className="min-w-0 truncate text-sm font-semibold text-content-strong">{title}</div>
    </div>
  );
}

function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  // Escape closes the drawer; a navigation drawer that can only be dismissed
  // by finding the scrim is a trap on a phone.
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={GLIDE}
            onClick={onClose}
          />

          <motion.div
            className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-surface-outline"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={POP}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="absolute right-2 top-2 z-10 rounded-lg p-1.5 text-content-muted transition-colors hover:bg-sidebar-hover"
            >
              <IconX size={18} />
            </button>
            <div className="h-full" onClick={onClose}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
