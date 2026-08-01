"use client";

import type { Locale } from "@/lib/types";
import { useLocale } from "@/context/LocaleContext";
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

/** UI language selector — ONLY calls setUiLocale. Used in Header. */
export default function UiLanguageSelector() {
  const { setUiLocale, uiLocale, t } = useLocale();

  function handleChange(raw: string) {
    console.log("UI Language Changed To:", raw);
    setUiLocale(raw as Locale);
    // 強制將新的語系寫入 localStorage 並刷新頁面，完全杜絕 React/Next.js 的 Context 快取死鎖
    localStorage.setItem("nectar-ui-locale", raw);
    window.location.reload();
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
