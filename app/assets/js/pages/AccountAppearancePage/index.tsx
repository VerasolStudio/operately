import * as Pages from "@/components/Pages";
import * as People from "@/models/people";
import * as React from "react";

import { IconSun, IconMoon, IconDeviceLaptop, Forms, showErrorToast, Page as TurboUIPage } from "turboui";

import classnames from "classnames";

import { useSetTheme, useTheme } from "@/contexts/ThemeContext";
import { PageModule } from "@/routes/types";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { SUPPORTED_LANGUAGES, getLanguage, setLanguage } from "@/i18n";

import { usePaths } from "@/routes/paths";
export default { name: "AccountAppearancePage", loader: Pages.emptyLoader, Page } as PageModule;

function Page() {
  const paths = usePaths();
  const { t } = useTranslation();

  return (
    <TurboUIPage
      title={[t("account.appearance.title"), t("account.title")]}
      size="small"
      navigation={[
        { to: paths.homePath(), label: t("nav.home") },
        { to: paths.accountSettingsPath(), label: t("account.settings.title") },
      ]}
    >
      <div className="px-10 py-8">
        <Form />
        <LanguageSection />
      </div>
    </TurboUIPage>
  );
}

function Form() {
  const paths = usePaths();
  const currentTheme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = Forms.useForm({
    fields: {
      theme: currentTheme,
    },
    submit: async () => {
      try {
        await People.updateTheme({ theme: form.values.theme });
        navigate(paths.accountPath());
      } catch {
        showErrorToast(t("errors.error"), t("account.appearance.updateFailed"));
      }
    },
  });

  return (
    <Forms.Form form={form}>
      <h1 className="text-2xl font-bold">{t("account.appearance.title")}</h1>

      <h2 className="font-bold mt-8">{t("account.appearance.colorMode")}</h2>
      <p className="text-sm text-content-dimmed">{t("account.appearance.colorModeDescription")}</p>

      <div className="grid grid-cols-3 gap-4 mt-4 h-32">
        <ColorModeOption icon={IconSun} title={t("account.appearance.alwaysLight")} theme="light" />
        <ColorModeOption icon={IconMoon} title={t("account.appearance.alwaysDark")} theme="dark" />
        <ColorModeOption icon={IconDeviceLaptop} title={t("account.appearance.sameAsSystem")} theme="system" />
      </div>

      <Forms.Submit saveText={t("account.appearance.saveChanges")} />
    </Forms.Form>
  );
}

function ColorModeOption({ theme, icon, title }) {
  const currentTheme = useTheme();
  const setTheme = useSetTheme();

  const className = classnames(
    "rounded",
    "border",
    "flex flex-col items-center justify-center gap-2",
    "p-4",
    "cursor-pointer",
    "hover:bg-surface-accent",
    {
      "bg-surface-dimmed": currentTheme !== theme,
      "border-accent-1": currentTheme === theme,
      "border-surface-outline": currentTheme !== theme,
    },
  );

  const [_, setValue] = Forms.useFieldValue("theme");

  const changeTheme = () => {
    setValue(theme);
    setTheme(theme);
  };

  return (
    <div className={className} onClick={changeTheme} data-test-id={`color-mode-${theme}`}>
      {React.createElement(icon, { size: 32, strokeWidth: 1.5 })}
      <span className="font-semibold">{title}</span>
    </div>
  );
}

/**
 * The language is applied as soon as it is picked and remembered in this
 * browser, so this section deliberately has no save button.
 */
function LanguageSection() {
  const { t } = useTranslation();

  return (
    <div className="mt-12">
      <h2 className="font-bold">{t("account.language.title")}</h2>
      <p className="text-sm text-content-dimmed">{t("account.language.description")}</p>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {SUPPORTED_LANGUAGES.map((language) => (
          <LanguageOption key={language.code} code={language.code} nativeName={language.nativeName} />
        ))}
      </div>
    </div>
  );
}

function LanguageOption({ code, nativeName }: { code: string; nativeName: string }) {
  // Subscribing to the translation function re-renders this option whenever
  // the language changes, so the selected state stays in sync.
  useTranslation();

  const isSelected = getLanguage() === code;

  const className = classnames("rounded", "border", "px-4 py-3", "cursor-pointer", "hover:bg-surface-accent", {
    "bg-surface-dimmed": !isSelected,
    "border-accent-1": isSelected,
    "border-surface-outline": !isSelected,
  });

  return (
    <div className={className} onClick={() => setLanguage(code)} data-test-id={`language-${code}`}>
      <span className="font-semibold">{nativeName}</span>
    </div>
  );
}
