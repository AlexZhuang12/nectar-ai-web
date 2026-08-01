"use client";

import { LOCALES } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { useLocale } from "@/context/LocaleContext";
import { Globe } from "lucide-react";

/** UI language selector — ONLY calls setUiLocale. Used in Header. */
export default function UiLanguageSelector() {
  const { uiLocale, setUiLocale, t } = useLocale();

  function handleChange(next: string) {
    const locale = next as Locale;
    console.log("[UiLanguageSelector] onChange → setUiLocale:", locale);
    setUiLocale(locale);
  }

  return (
    <div
      className="relative inline-flex flex-col gap-1"
      data-selector="ui-language"
      data-value={uiLocale}
    >
      <label
        htmlFor="ui-language-select"
        className="text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        {t("uiLanguage")}
      </label>
      <div className="inline-flex items-center gap-2">
        <Globe className="h-4 w-4 shrink-0 text-gray-500" />
        <select
          id="ui-language-select"
          name="ui-language"
          value={uiLocale}
          onChange={(e) => handleChange(e.target.value)}
          className="select-field cursor-pointer pr-8"
          aria-label={t("uiLanguage")}
        >
          {LOCALES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
