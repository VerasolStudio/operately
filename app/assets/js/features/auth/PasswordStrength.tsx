import * as React from "react";
import { IconCheck, IconCircleFilled } from "turboui";

import classNames from "classnames";
import { validatePassword } from "./validatePassword";
import { t } from "@/i18n";

export function PasswordStrength({ password }) {
  if (password.length === 0) return null;

  const validation = validatePassword(password);

  if (validation.isValid) return null;

  return (
    <div className="text-sm font-medium flex flex-col gap-1">
      <CheckMark title={t("features.auth.atLeast12Characters")} ok={validation.hasMinLength} />
      <CheckMark title={t("features.auth.atLeast1UppercaseLetter")} ok={validation.hasUpperCase} />
      <CheckMark title={t("features.auth.atLeast1Number")} ok={validation.hasNumber} />
      <CheckMark title={t("features.auth.atLeast1Lowercase")} ok={validation.hasLowerCase} />
    </div>
  );
}

function CheckMark({ title, ok }) {
  const icon = ok ? <IconCheck size={16} className="w-4" /> : <IconCircleFilled size={8} className="w-4" />;

  const className = classNames("flex items-center gap-2", {
    "text-accent-1": ok,
    "text-content-dimmed": !ok,
  });

  return (
    <div className={className}>
      {icon} {title}
    </div>
  );
}
