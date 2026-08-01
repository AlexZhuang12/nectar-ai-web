"use client";

import {
  CANONICAL_LOCALES,
  isCanonicalLocale,
  normalizeLocale,
} from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { useLocale, useTranslation } from "@/context/LocaleContext";
import { Globe } from "lucide-react";

/** Canonical UI locale options — values MUST match VALID_LOCALES exactly */
const UI_LANGUAGE_OPTIONS: {
  value: Locale;
  label: string;
  flag: string;
}[] = [
  { value: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
  { value: "en-US", label: "English", flag: "🇺🇸" },
  { value: "ja-JP", label: "日本語", flag: "🇯🇵" },
  { value: "es-ES", label: "Español", flag: "🇪🇸" },
];

/** UI language selector — ONLY calls setLocale. Used in Header. */
export default function UiLanguageSelector() {
  const { setLocale } = useLocale();
  const { uiLocale, localeRevision, t } = useTranslation();

  function handleChange(raw: string) {
    // Prefer direct canonical pass-through (exact option values)
    const newLang: Locale | null = isCanonicalLocale(raw)
      ? raw
      : normalizeLocale(raw);

    if (!newLang || !CANONICAL_LOCALES.includes(newLang)) {
      console.warn("[UiLanguageSelector] Invalid selection:", raw);
      return;
    }

    console.log("UI Language Changed To:", newLang);
    setLocale(newLang);
  }

  return (
    <div
      className="relative inline-flex flex-col gap-1"
      data-selector="ui-language"
      data-value={uiLocale}
      data-locale-revision={localeRevision}
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
          {UI_LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.flag} {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
