import React from "react";

import { GoalPage } from ".";
import { PrimaryButton } from "../Button";
import { InfoCallout } from "../Callouts";
import { DiscussionCard } from "../DiscussionCard";
import { t } from "../i18n";

export function Discussions(props: GoalPage.State) {
  if (props.discussions.length === 0 && !props.permissions.canEdit && props.state !== "closed") return null;

  const showNewDiscussionButton = props.permissions.canEdit && props.state !== "closed";
  const isZeroState = props.discussions.length === 0;

  return (
    <div className="p-4 max-w-3xl mx-auto my-6 overflow-auto">
      <div className="flex items-center gap-2 justify-between">
        <div>
          <h2 className="font-bold text-xl">{t("turboui.goalPage.discussions")}</h2>
        </div>

        {showNewDiscussionButton && (
          <PrimaryButton linkTo={props.newDiscussionLink} size="xs" testId="start-discussion">
            {t("turboui.goalPage.startDiscussion")}
          </PrimaryButton>
        )}
      </div>

      <div className="mt-8">
        {isZeroState && props.state === "closed" && <DiscussionsZeroStateClosed />}
        {isZeroState && props.state !== "closed" && <DiscussionsZeroState />}
        {!isZeroState && <DiscussionsList props={props} />}
      </div>
    </div>
  );
}

function DiscussionsList({ props }: { props: GoalPage.State }) {
  return (
    <div>
      {props.discussions.map((discussion) => (
        <DiscussionCard
          key={discussion.id}
          discussion={discussion}
          mentionedPersonLookup={props.richTextHandlers.mentionedPersonLookup}
          formattedTimePreferences={props.formattedTimePreferences}
        />
      ))}
    </div>
  );
}

function DiscussionsZeroState() {
  return (
    <InfoCallout
      message={t("turboui.goalPage.noDiscussionsYet")}
      description={t("turboui.goalPage.startADiscussionToShareUpdates")}
    />
  );
}

function DiscussionsZeroStateClosed() {
  return (
    <InfoCallout
      message={t("turboui.goalPage.noDiscussions")}
      description={t("turboui.goalPage.thisGoalIsClosedAndHas")}
    />
  );
}
