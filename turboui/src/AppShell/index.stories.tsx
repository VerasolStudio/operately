import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { AppShell, Sidebar, SidebarCompanyHeader } from ".";
import { PageBody, PageHead } from "../DesignKit/Layout";
import {
  IconBell,
  IconBellCog,
  IconChecklist,
  IconHome2,
  IconInbox,
  IconListCheck,
  IconMap2,
  IconMessages,
  IconSettings,
  IconTarget,
  IconUsers,
} from "../icons";

const LOGO = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="193.04 193.04 613.92 613.92" width="20" height="20">
    <polygon points="602.32 806.96 397.68 806.96 397.68 602.32 602.32 806.96" fill="#024fac" />
    <polygon points="397.68 193.04 602.32 193.04 602.32 397.68 397.68 193.04" fill="#024fac" />
    <polygon
      points="602.32 193.04 602.32 397.68 602.32 602.32 602.32 806.96 806.96 602.32 806.96 397.68 602.32 193.04"
      fill="#3185ff"
    />
    <polygon
      points="193.04 397.68 193.04 602.32 397.68 806.96 397.68 602.32 397.68 397.68 397.68 193.04 193.04 397.68"
      fill="#3185ff"
    />
  </svg>
);

const SPACE_TOOLS = (id: string): Sidebar.NavItem[] => [
  { id: `${id}-goals`, label: "Goals", icon: IconTarget, iconClassName: "text-entity-goal", to: `/${id}/goals` },
  {
    id: `${id}-projects`,
    label: "Projects",
    icon: IconChecklist,
    iconClassName: "text-entity-project",
    to: `/${id}/projects`,
  },
  { id: `${id}-tasks`, label: "Tasks", icon: IconListCheck, to: `/${id}/tasks` },
  { id: `${id}-discussions`, label: "Discussions", icon: IconMessages, to: `/${id}/discussions` },
];

function DemoSidebar({ activePath }: { activePath: string }) {
  return (
    <Sidebar
      activePath={activePath}
      header={<SidebarCompanyHeader logo={LOGO} name="Acme Inc." membersLabel="32 members" />}
      primaryNav={[
        { id: "review", label: "To do", icon: IconInbox, to: "/review", badge: { count: 7, tone: "alert" } },
        {
          id: "notifications",
          label: "Notifications",
          icon: IconBell,
          to: "/notifications",
          badge: { count: 3, tone: "neutral" },
        },
        { id: "home", label: "Home", icon: IconHome2, to: "/" },
        { id: "work-map", label: "Work Map", icon: IconMap2, iconClassName: "text-primary", to: "/work-map" },
        { id: "my-work", label: "My work", to: "/people/me", nested: true },
        { id: "people", label: "People", icon: IconUsers, to: "/people" },
      ]}
      spacesLabel="Spaces"
      spaces={[
        { id: "product", name: "Product", to: "/product", color: "#3185FF", children: SPACE_TOOLS("product") },
        { id: "eng", name: "Engineering", to: "/eng", color: "#8B5CF6", children: SPACE_TOOLS("eng") },
        { id: "marketing", name: "Marketing", to: "/marketing", color: "#059669", children: SPACE_TOOLS("marketing") },
        { id: "cs", name: "Customer Success", to: "/cs", color: "#D97706", children: SPACE_TOOLS("cs") },
      ]}
      addSpace={{ label: "Add a space", to: "/spaces/new" }}
      footerNav={[
        { id: "admin", label: "Company admin", icon: IconSettings, to: "/admin" },
        { id: "notification-settings", label: "Notification settings", icon: IconBellCog, to: "/settings" },
      ]}
      user={{ name: "Hana Tanaka", title: "Head of Product", to: "/people/hana" }}
    />
  );
}

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The rail with the work map selected. The highlight is a shared-element
 * morph — navigating slides it to the new item rather than redrawing it.
 */
export const Default: Story = {
  render: () => (
    <AppShell sidebar={<DemoSidebar activePath="/work-map" />} mobileTitle="Acme Inc.">
      <PageHead
        crumbs={[{ label: "Acme Inc.", to: "/" }, { label: "Work Map" }]}
        title="Company goals and projects"
        subtitle="2026 · 8 goals / 6 projects"
      />
      <PageBody>
        <div className="rounded-xl border border-surface-outline px-4 py-10 text-center text-[13px] text-content-dimmed">
          Page content goes here.
        </div>
      </PageBody>
    </AppShell>
  ),
};

/** A space selected, so its tools are expanded underneath it. */
export const SpaceSelected: Story = {
  render: () => (
    <AppShell sidebar={<DemoSidebar activePath="/product/goals" />} mobileTitle="Acme Inc.">
      <PageHead crumbs={[{ label: "Product", to: "/product" }, { label: "Goals" }]} title="Goals" />
      <PageBody>
        <div className="rounded-xl border border-surface-outline px-4 py-10 text-center text-[13px] text-content-dimmed">
          Page content goes here.
        </div>
      </PageBody>
    </AppShell>
  ),
};
