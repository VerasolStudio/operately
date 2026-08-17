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

// This module is also loaded by tests running outside a browser, so every
// browser global it touches is guarded.
const hasWindow = typeof window !== "undefined";
const hasDocument = typeof document !== "undefined";

function readStoredLanguage(): string | null {
  if (!hasWindow) return null;

  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private browsing or blocked storage — fall back to detection.
    return null;
  }
}

function readBrowserLanguage(): string | null {
  // Node exposes a `navigator` carrying the machine's locale. Browser-language
  // detection only makes sense in a real document, and keying off it there
  // would make server-side and test runs depend on the host's locale.
  if (!hasDocument || typeof navigator === "undefined") return null;

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
  if (!hasDocument) return;

  document.documentElement.setAttribute("lang", language);
}

/**
 * Switches the interface language and remembers the choice for next time.
 *
 * The page is reloaded afterwards: label tables that live at module scope are
 * translated when their module is first evaluated, so a reload is what makes
 * every last string switch over, not just the ones inside a live component.
 */
export async function setLanguage(language: string): Promise<void> {
  if (!isSupportedLanguage(language) || language === getLanguage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // The choice just won't survive a reload.
  }

  applyDocumentLanguage(language);
  await i18n.changeLanguage(language);

  if (hasWindow) window.location.reload();
}

/**
 * Translates a key. Safe to call from module scope: importing this module is
 * what initializes i18next, so it always runs first.
 */
export function t(key: string, options?: string | Record<string, unknown>): string {
  return i18n.t(key, options as never) as unknown as string;
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
