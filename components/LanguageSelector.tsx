"use client";

import { LOCALES } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { useLocale } from "@/context/LocaleContext";
import { Globe, Languages } from "lucide-react";

interface LanguageSelectorProps {
  value: Locale;
  onChange: (locale: Locale) => void;
  variant?: "ui" | "ai";
}

export default function LanguageSelector({
  value,
  onChange,
  variant = "ui",
}: LanguageSelectorProps) {
  const { uiLocale, t } = useLocale();

  const label =
    variant === "ui" ? t("uiLanguage") : t("aiResponseLanguage");
  const Icon = variant === "ui" ? Globe : Languages;

  function handleChange(next: string) {
    const locale = next as Locale;
    console.log(
      `[LanguageSelector] ${variant} selected:`,
      locale,
      `(UI display locale: ${uiLocale})`
    );
    onChange(locale);
  }

  return (
    <div
      className="relative inline-flex flex-col gap-1"
      data-variant={variant}
      data-current-value={value}
      data-ui-locale={uiLocale}
    >
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <div className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-gray-500" />
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
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
