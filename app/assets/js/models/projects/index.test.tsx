import { isOverdue, isMilestoneOverdue, Milestone, Project } from "./index";

import * as Time from "../../utils/time";

function getCustomMilestone(date, status) {
  return {
    status,
    timeframe: {
      contextualEndDate: {
        date,
      },
    },
  } as Pick<Milestone, "status" | "timeframe">;
}

function getCustomProject(date) {
  return {
    timeframe: {
      contextualEndDate: {
        date,
      },
    },
  } as Pick<Project, "timeframe">;
}

describe(".isMilestoneOverdue", () => {
  it("the deadline is today", () => {
    const date = Time.toDateWithoutTime(Time.today());
    const milestone = getCustomMilestone(date, "pending");

    expect(isMilestoneOverdue(milestone)).toBe(false);
  });

  it("the deadline was 10 days ago", () => {
    const date = Time.toDateWithoutTime(Time.daysAgo(10));
    const milestone = getCustomMilestone(date, "pending");

    expect(isMilestoneOverdue(milestone)).toBe(true);
  });

  it("the deadline is in 10 days", () => {
    const date = Time.toDateWithoutTime(Time.daysFromNow(10));
    const milestone = getCustomMilestone(date, "pending");

    expect(isMilestoneOverdue(milestone)).toBe(false);
  });

  it("done milestone", () => {
    const date = Time.toDateWithoutTime(Time.daysAgo(10));
    const milestone = getCustomMilestone(date, "done");

    expect(isMilestoneOverdue(milestone)).toBe(false);
  });

  it("no status", () => {
    const date = Time.toDateWithoutTime(Time.daysAgo(10));
    const milestone = getCustomMilestone(date, undefined);

    expect(isMilestoneOverdue(milestone)).toBe(false);
  });

  it("no timeframe", () => {
    const milestone = getCustomMilestone(undefined, "pending");

    expect(isMilestoneOverdue(milestone)).toBe(false);
  });
});

describe(".isOverdue", () => {
  it("the deadline is today", () => {
    const date = Time.toDateWithoutTime(Time.today());
    const project = getCustomProject(date);

    expect(isOverdue(project)).toBe(false);
  });

  it("the deadline was 10 days ago", () => {
    const date = Time.toDateWithoutTime(Time.daysAgo(10));
    const project = getCustomProject(date);

    expect(isOverdue(project)).toBe(true);
  });

  it("the deadline is in 10 days", () => {
    const date = Time.toDateWithoutTime(Time.daysFromNow(10));
    const project = getCustomProject(date);

    expect(isOverdue(project)).toBe(false);
  });

  it("the deadline was yesterday", () => {
    const date = Time.toDateWithoutTime(Time.daysAgo(1));
    const project = getCustomProject(date);

    expect(isOverdue(project)).toBe(true);
  });

  it("matches isMilestoneOverdue behavior for consistency", () => {
    // Test the same scenarios as isMilestoneOverdue to ensure consistency
    const todayStr = Time.toDateWithoutTime(Time.today());
    const yesterdayStr = Time.toDateWithoutTime(Time.daysAgo(1));
    const futureStr = Time.toDateWithoutTime(Time.daysFromNow(10));

    const todayProject = getCustomProject(todayStr);
    const yesterdayProject = getCustomProject(yesterdayStr);
    const futureProject = getCustomProject(futureStr);

    const todayMilestone = getCustomMilestone(todayStr, "pending");
    const yesterdayMilestone = getCustomMilestone(yesterdayStr, "pending");
    const futureMilestone = getCustomMilestone(futureStr, "pending");

    // Both functions should return the same result for the same dates
    expect(isOverdue(todayProject)).toBe(isMilestoneOverdue(todayMilestone));
    expect(isOverdue(yesterdayProject)).toBe(isMilestoneOverdue(yesterdayMilestone));
    expect(isOverdue(futureProject)).toBe(isMilestoneOverdue(futureMilestone));

    // Specifically, deadline on today should NOT be overdue
    expect(isOverdue(todayProject)).toBe(false);
    expect(isMilestoneOverdue(todayMilestone)).toBe(false);
  });
});
