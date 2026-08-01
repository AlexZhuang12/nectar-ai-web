"use client";

import { normalizeLocale, LOCALES } from "@/lib/i18n";
import { useLocale, useTranslation } from "@/context/LocaleContext";
import { Languages } from "lucide-react";

/** AI language selector — ONLY calls setAiResponseLanguage. Used in ExtractorPanel. */
export default function AiLanguageSelector() {
  const { aiResponseLanguage, setAiResponseLanguage } = useLocale();
  const { uiLocale, localeRevision, t } = useTranslation();

  function handleChange(next: string) {
    const locale = normalizeLocale(next);
    if (!locale) return;
    console.log("[AiLanguageSelector] AI Language Changed To:", locale);
    setAiResponseLanguage(locale);
  }

  return (
    <div
      className="relative inline-flex flex-col gap-1"
      data-selector="ai-language"
      data-value={aiResponseLanguage}
      data-ui-locale={uiLocale}
      data-locale-revision={localeRevision}
    >
      <label
        htmlFor="ai-language-select"
        className="text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        {t("aiResponseLanguage")}
      </label>
      <div className="inline-flex items-center gap-2">
        <Languages className="h-4 w-4 shrink-0 text-gray-500" />
        <select
          id="ai-language-select"
          name="ai-response-language"
          value={aiResponseLanguage}
          onChange={(e) => handleChange(e.target.value)}
          className="select-field cursor-pointer pr-8"
          aria-label={t("aiResponseLanguage")}
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
