import * as React from "react";

import { Link } from "turboui";
import { Trans } from "react-i18next";

export function TosAndPrivacyPolicy() {
  return (
    <div className="text-center font-medium text-sm">
      <Trans
        i18nKey="features.auth.byContinuingYouAgreeToThe"
        components={[
          <Link to="https://operately.com/legal/terms" underline="hover" target="_blank">
            Terms of Service
          </Link>,
          <Link to="https://operately.com/legal/privacy-policy" underline="hover" target="_blank">
            Privacy Policy
          </Link>,
        ]}
      />
    </div>
  );
}
