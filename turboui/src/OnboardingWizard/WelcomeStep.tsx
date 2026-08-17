import React from "react";

import { PrimaryButton } from "../Button";
import { WizardState } from "./WizadState";
import { WizardStep } from "./WizardLayout";
import { t } from "../i18n";

export interface WelcomeStepProps {
  state: WizardState<any>;
  imageUrl: string;
  headingId?: string;
  stepTestId?: string;
  startTestId?: string;
}

export function WelcomeStep({ state, imageUrl, headingId, stepTestId, startTestId }: WelcomeStepProps) {
  const resolvedHeadingId = headingId ?? "company-member-onboarding-heading";

  return (
    <WizardStep
      testId={stepTestId}
      footer={
        <PrimaryButton onClick={state.next} testId={startTestId}>
          {t("turboui.onboardingWizard.letSGetStarted")}
        </PrimaryButton>
      }
    >
      <div className="flex flex-col items-center text-center mx-auto pt-8 pb-4 px-4">
        <img
          src={imageUrl}
          alt={t("turboui.onboardingWizard.markoAnastasovCEOFounderOperately")}
          className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] rounded-full object-cover shadow-lg"
        />
        <div className="mt-6 max-w-lg text-content-base space-y-4 text-left">
          <h1 className="font-semibold text-xl" id={resolvedHeadingId}>
            {t("turboui.onboardingWizard.thanksForSigningUp")}
          </h1>
          <p>{t("turboui.onboardingWizard.operatelyIsWhatIWishedI")}</p>
          <p>{t("turboui.onboardingWizard.ifYouEverNeedAHand")}</p>
          <p>
            Onward,
            <br />
            Marko Anastasov
            <br />
            {t("turboui.onboardingWizard.coFounderAmpCEOOfOperately")}
          </p>
        </div>
      </div>
    </WizardStep>
  );
}
