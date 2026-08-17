// Tests assert on the English copy, so the interface language is pinned here
// instead of being detected from the machine running them.
try {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("operately.language", "en");
  }
} catch {
  // No storage in this environment — detection already falls back to English.
}

export {};
