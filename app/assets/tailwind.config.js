const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: "class",
  content: [
    "./js/**/*.js",
    "./js/**/*.tsx",
    "../ee/assets/js/**/*.js",
    "../ee/assets/js/**/*.tsx",
    "../lib/*_web.ex",
    "../lib/*_web/**/*.*ex",
    "../../turboui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-bg": "var(--color-surface-bg)",
        "surface-bg-highlight": "var(--color-surface-bg-highlight)",
        "surface-base": "var(--color-surface-base)",
        "surface-dimmed": "var(--color-surface-dimmed)",
        "surface-outline": "var(--color-surface-outline)",
        "surface-accent": "var(--color-surface-accent)",
        "surface-highlight": "var(--color-surface-highlight)",

        "content-base": "var(--color-content)",
        "content-accent": "var(--color-content-accent)",
        "content-dimmed": "var(--color-content-dimmed)",
        "content-subtle": "var(--color-content-subtle)",
        "content-error": "var(--color-content-error)",

        "stroke-base": "var(--color-stroke-base)",
        "stroke-dimmed": "var(--color-stroke-dimmed)",

        "link-base": "var(--color-link-base)",
        "link-hover": "var(--color-link-hover)",

        "toggle-active": "var(--color-toggle-active)",

        "accent-1": "var(--color-accent-1)",
        "accent-1-light": "var(--color-accent-1-light)",

        "callout-info-bg": "var(--color-callout-info-bg)",
        "callout-info-content": "var(--color-callout-info-content)",

        "callout-warning-bg": "var(--color-callout-warning-bg)",
        "callout-warning-content": "var(--color-callout-warning-content)",

        "callout-error-bg": "var(--color-callout-error-bg)",
        "callout-error-content": "var(--color-callout-error-content)",

        "callout-success-bg": "var(--color-callout-success-bg)",
        "callout-success-content": "var(--color-callout-success-content)",

        // --- Redesign tokens (Operately 改修案) ---

        "sidebar-bg": "var(--color-sidebar-bg)",
        "sidebar-hover": "var(--color-sidebar-hover)",
        "sidebar-active": "var(--color-sidebar-active)",

        "line-strong": "var(--color-line-strong)",
        "line-soft": "var(--color-line-soft)",

        "content-strong": "var(--color-content-strong)",
        "content-muted": "var(--color-content-muted)",
        "content-label": "var(--color-content-label)",
        "content-faint": "var(--color-content-faint)",

        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-content": "var(--color-primary-content)",
        "primary-soft-bg": "var(--color-primary-soft-bg)",
        "primary-soft-border": "var(--color-primary-soft-border)",
        "primary-soft-content": "var(--color-primary-soft-content)",

        "status-ontrack": "var(--color-status-ontrack)",
        "status-ontrack-content": "var(--color-status-ontrack-content)",
        "status-ontrack-bg": "var(--color-status-ontrack-bg)",

        "status-caution": "var(--color-status-caution)",
        "status-caution-content": "var(--color-status-caution-content)",
        "status-caution-bg": "var(--color-status-caution-bg)",

        "status-offtrack": "var(--color-status-offtrack)",
        "status-offtrack-content": "var(--color-status-offtrack-content)",
        "status-offtrack-bg": "var(--color-status-offtrack-bg)",

        "status-pending": "var(--color-status-pending)",
        "status-pending-content": "var(--color-status-pending-content)",
        "status-pending-bg": "var(--color-status-pending-bg)",

        "status-paused": "var(--color-status-paused)",
        "status-paused-content": "var(--color-status-paused-content)",
        "status-paused-bg": "var(--color-status-paused-bg)",

        "entity-goal": "var(--color-entity-goal)",
        "entity-goal-bg": "var(--color-entity-goal-bg)",
        "entity-project": "var(--color-entity-project)",
        "entity-project-bg": "var(--color-entity-project-bg)",
        "entity-neutral": "var(--color-entity-neutral)",
        "entity-neutral-bg": "var(--color-entity-neutral-bg)",

        "banner-info-bg": "var(--color-banner-info-bg)",
        "banner-info-border": "var(--color-banner-info-border)",
        "banner-info-content": "var(--color-banner-info-content)",

        "banner-warning-bg": "var(--color-banner-warning-bg)",
        "banner-warning-border": "var(--color-banner-warning-border)",
        "banner-warning-content": "var(--color-banner-warning-content)",

        "banner-danger-bg": "var(--color-banner-danger-bg)",
        "banner-danger-border": "var(--color-banner-danger-border)",
        "banner-danger-content": "var(--color-banner-danger-content)",

        "avatar-bg": "var(--color-avatar-bg)",
        "avatar-content": "var(--color-avatar-content)",
        track: "var(--color-track)",
        "badge-alert": "var(--color-badge-alert)",

        brand: {
          1: "#3185FF",
          2: "#E3F2FF",
        },

        dark: {
          1: "rgba(30,30,34,1)",
          2: "rgba(35,35,39,1)",
          3: "rgba(43,45,49,1)",
          4: "rgba(49,51,56,1)",
          5: "rgba(60,60,64,1)",
          6: "rgba(65,65,69,1)",
          7: "rgba(73,75,79,1)",
          8: "rgba(79,81,86,1)",
        },

        shade: {
          1: "rgba(255,255,255,0.05)",
          2: "rgba(255,255,255,0.1)",
          3: "rgba(255,255,255,0.2)",
        },

        white: {
          1: "rgba(255,255,255,1.00)",
          2: "rgba(255,255,255,0.50)",
          3: "rgba(255,255,255,0.25)",
        },
      },
      fontSize: {
        xxs: "0.625rem", // 10px
        micro: "0.5rem", // 8px
      },
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      function extractColorVars(colorObj, colorGroup = "") {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];

          const newVars =
            typeof value === "string"
              ? { [`--color${colorGroup}-${colorKey}`]: value }
              : extractColorVars(value, `-${colorKey}`);

          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ":root": extractColorVars(theme("colors")),
      });
    },
    plugin(function ({ addVariant, e }) {
      addVariant("not-first", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`not-first${separator}${className}`)}:not(:first-child)`;
        });
      });
    }),
  ],
  safelist: [
    {
      pattern: /(bg|text)-(green|yellow|red|gray)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
  ],
};
