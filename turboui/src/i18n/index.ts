import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ja from "./locales/ja.json";

declare module "i18next" {
  interface CustomTypeOptions {
    // The instance is initialized with `returnNull: false`, so `t()` always
    // resolves to a string and can be passed straight into string props.
    returnNull: false;
  }
}

const resources: Record<string, Record<string, unknown>> = { en, ja };

/**
 * turboui ships its own translations so it stays usable on its own (tests,
 * storybook). The host app registers its bundles into the same instance, and
 * whichever side is imported first initializes it — hence the two branches.
 */
function registerBundles(): void {
  Object.entries(resources).forEach(([language, bundle]) => {
    i18n.addResourceBundle(language, "translation", bundle, true, false);
  });
}

if (i18n.isInitialized) {
  registerBundles();
} else {
  i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    returnNull: false,
    resources: Object.fromEntries(
      Object.entries(resources).map(([language, bundle]) => [language, { translation: bundle }]),
    ),
    interpolation: {
      escapeValue: false,
    },
  });
}

/**
 * Translates a key. Safe to call from module scope: importing this module is
 * what initializes i18next, so it always runs first.
 */
export function t(key: string, options?: string | Record<string, unknown>): string {
  return i18n.t(key, options as never) as unknown as string;
}

export default i18n;
