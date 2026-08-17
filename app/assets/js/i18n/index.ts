import i18n from "i18next";
import { initReactI18next, setI18n } from "react-i18next";

import en from "./locales/en.json";
import ja from "./locales/ja.json";
import hu from "./locales/hu.json";
import srCyrlRS from "./locales/sr-Cyrl-RS.json";

export interface LanguageDefinition {
  /** BCP 47 / ISO 639-1 code, also the resource bundle key. */
  code: string;

  /** Language name written in its own script, for the language picker. */
  nativeName: string;
}

/**
 * Languages the app ships a translation bundle for. Only languages listed
 * here can be selected; anything else falls back to `DEFAULT_LANGUAGE`.
 */
export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  { code: "en", nativeName: "English" },
  { code: "ja", nativeName: "日本語" },
];

export const DEFAULT_LANGUAGE = "en";

const STORAGE_KEY = "operately.language";

const resources = {
  en: { translation: en },
  ja: { translation: ja },
  hu: { translation: hu },
  "sr-Cyrl-RS": { translation: srCyrlRS },
};

export function isSupportedLanguage(code: string | null | undefined): boolean {
  return !!code && SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}

function readStoredLanguage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private browsing or blocked storage — fall back to detection.
    return null;
  }
}

function readBrowserLanguage(): string | null {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const language of languages) {
    if (!language) continue;
    if (isSupportedLanguage(language)) return language;

    const base = language.split("-")[0]!;
    if (isSupportedLanguage(base)) return base;
  }

  return null;
}

/**
 * The language the app should start in: the one the person picked, otherwise
 * the closest match to their browser settings, otherwise English.
 */
export function detectLanguage(): string {
  const stored = readStoredLanguage();
  if (isSupportedLanguage(stored)) return stored!;

  return readBrowserLanguage() ?? DEFAULT_LANGUAGE;
}

export function getLanguage(): string {
  return isSupportedLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;
}

function applyDocumentLanguage(language: string): void {
  document.documentElement.setAttribute("lang", language);
}

/**
 * Switches the interface language and remembers the choice for next time.
 */
export async function setLanguage(language: string): Promise<void> {
  if (!isSupportedLanguage(language)) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // The choice just won't survive a reload.
  }

  applyDocumentLanguage(language);
  await i18n.changeLanguage(language);
}

const language = detectLanguage();

if (i18n.isInitialized) {
  // turboui initializes the shared i18next instance when one of its
  // components is imported first. Merge our bundles into it instead of
  // re-initializing, so whichever import order wins produces the same result.
  Object.entries(resources).forEach(([code, bundle]) => {
    i18n.addResourceBundle(code, "translation", bundle.translation, true, false);
  });
  i18n.changeLanguage(language);
} else {
  i18n.use(initReactI18next).init({
    resources,
    returnNull: false,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
  });
}

applyDocumentLanguage(language);

setI18n(i18n);

export default i18n;
