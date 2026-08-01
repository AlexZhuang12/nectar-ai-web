"use client";

import { LOCALES, t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { Globe, Languages } from "lucide-react";

interface LanguageSelectorProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
  /** When true, renders AI response language selector */
  variant?: "ui" | "ai";
}

export default function LanguageSelector({
  locale,
  onChange,
  variant = "ui",
}: LanguageSelectorProps) {
  const label =
    variant === "ui" ? t(locale, "uiLanguage") : t(locale, "aiResponseLanguage");
  const Icon = variant === "ui" ? Globe : Languages;

  return (
    <div className="relative inline-flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <div className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-gray-500" />
        <select
          value={locale}
          onChange={(e) => onChange(e.target.value as Locale)}
          className="select-field cursor-pointer pr-8"
          aria-label={label}
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

export { t };
