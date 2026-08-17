import i18n from "i18next";
import { initReactI18next } from "react-i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    // The instance is initialized with `returnNull: false`, so `t()` always
    // resolves to a string and can be passed straight into string props.
    returnNull: false;
  }
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "en",
    returnNull: false,
    resources: {
      en: {
        translation: {
          intlRelativeDateTime: "{{val, relativetime}}",
          intlRelativeDateTimeJustNow: "just now",
          Today: "Today",
          Yesterday: "Yesterday",
          Tomorrow: "Tomorrow",
        },
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
