import * as Pages from "@/components/Pages";
import * as Goals from "@/models/goals";
import * as React from "react";

import { Form as CheckInForm, useForm } from "@/features/goals/GoalCheckIn";
import { useSubscriptionsAdapter } from "@/models/subscriptions";
import { PageModule } from "@/routes/types";

import { DesignKit, FormattedTime } from "turboui";
import { useFormattedTimePreferences } from "@/hooks/useFormattedTimePreferences";

import { usePaths } from "@/routes/paths";
import { loader, useLoadedData } from "./loader";
import { buildGoalCheckInNewNavigation } from "./navigation";
import { t } from "@/i18n";

export default { name: "GoalCheckInNewPage", loader, Page } as PageModule;

/**
 * Writing a goal check-in.
 *
 * The page tells you up front when the last one was and who finds out when you
 * submit. Both were previously discoverable only by leaving the page, and both
 * change how much detail is worth writing.
 */
function Page() {
  const paths = usePaths();
  const { goal } = useLoadedData();
  const formattedTimePreferences = useFormattedTimePreferences();

  const crumbs = buildGoalCheckInNewNavigation(goal, paths).map((item) => ({ label: item.label!, to: item.to }));

  return (
    <Pages.Page title={["Check-in", goal.name!]} testId="goal-check-in-new-page">
      <div className="min-h-full bg-surface-base">
        <DesignKit.PageHead
          crumbs={[...crumbs, { label: t("pages.goalCheckInNewPage.checkIn") }]}
          title={
            <>
              {t("pages.goalCheckInNewPage.checkInFor")}{" "}
              <FormattedTime {...formattedTimePreferences} time={new Date()} format="long-date" />
            </>
          }
          subtitle={<Subtitle goal={goal} />}
        />

        <DesignKit.PageBody width="medium">
          <Form goal={goal} />
        </DesignKit.PageBody>
      </div>
    </Pages.Page>
  );
}

function Subtitle({ goal }: { goal: Goals.Goal }) {
  const formattedTimePreferences = useFormattedTimePreferences();
  const reviewerCount = (goal.potentialSubscribers ?? []).length;

  return (
    <>
      {goal.lastCheckIn?.insertedAt ? (
        <>
          {t("pages.goalCheckInNewPage.lastCheckInWas")}{" "}
          <FormattedTime {...formattedTimePreferences} time={goal.lastCheckIn.insertedAt} format="long-date" />
        </>
      ) : (
        t("pages.goalCheckInNewPage.firstCheckIn")
      )}
      {reviewerCount > 0 && <> · {t("pages.goalCheckInNewPage.notifiesOnSubmit", { count: reviewerCount })}</>}
    </>
  );
}

function Form({ goal }: { goal: Goals.Goal }) {
  const opts = goal.space ? { spaceName: goal.space.name } : { goalName: goal.name };
  const subscriptionsState = useSubscriptionsAdapter(goal.potentialSubscribers || [], {
    ignoreMe: true,
    notifyPrioritySubscribers: true,
    ...opts,
  });

  const form = useForm({ mode: "new", goal, subscriptionsState });

  return <CheckInForm form={form} goal={goal} mode="new" allowFullEdit subscriptionsState={subscriptionsState} />;
}
