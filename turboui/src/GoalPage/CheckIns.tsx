import React from "react";
import { GoalPage } from ".";
import { PrimaryButton } from "../Button";
import { CheckInCard } from "../CheckInCard";
import { t } from "../i18n";

export function CheckIns(props: GoalPage.State) {
  const showCheckInButton = props.permissions.canEdit && props.state !== "closed";

  return (
    <div className="p-4 max-w-3xl mx-auto my-6 overflow-auto">
      <div className="flex items-center gap-2 justify-between">
        <div>
          <h2 className="font-bold text-lg">{t("turboui.goalPage.checkIns")}</h2>
          <div className="flex items-center gap-2 text-sm">
            {t("turboui.goalPage.championsPostMonthlyUpdatesToDocument")}
          </div>
        </div>

        {showCheckInButton && (
          <PrimaryButton linkTo={props.newCheckInLink} size="xs" testId="check-in-button">
            {t("turboui.goalPage.postCheckIn")}
          </PrimaryButton>
        )}
      </div>

      <div className="mt-8">
        {props.checkIns.map((checkIn) => (
          <CheckInCard
            key={checkIn.id}
            checkIn={checkIn}
            mentionedPersonLookup={props.richTextHandlers.mentionedPersonLookup}
            type="goal"
            formattedTimePreferences={props.formattedTimePreferences}
          />
        ))}
      </div>
    </div>
  );
}
