import i18n from "@/i18n";

export type TimeFormat = "automatic" | "hour_12" | "hour_24";

export function browserLocale(): string {
  if (typeof navigator === "undefined") {
    return "en-US";
  }

  return navigator.languages?.[0] || navigator.language || "en-US";
}

/**
 * The locale dates and numbers are rendered in: the interface language the
 * person picked, falling back to what the browser reports.
 */
export function uiLocale(): string {
  return i18n.language || browserLocale();
}

export function formatNumber(value: number, locale: string = uiLocale(), options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatTime(
  value: Date,
  locale: string = uiLocale(),
  timeFormat: TimeFormat = "automatic",
  options: Intl.DateTimeFormatOptions = { timeStyle: "short" },
): string {
  const hour12 = hour12Option(timeFormat);
  const formatOptions = hour12 === undefined ? options : { ...options, hour12 };
  const formatted = new Intl.DateTimeFormat(locale, formatOptions).format(value);

  if (!locale.toLowerCase().startsWith("en")) {
    return formatted;
  }

  return formatted.replace(" AM", "am").replace(" PM", "pm");
}

function hour12Option(timeFormat: TimeFormat): boolean | undefined {
  switch (timeFormat) {
    case "hour_12":
      return true;
    case "hour_24":
      return false;
    case "automatic":
      return undefined;
  }
}
