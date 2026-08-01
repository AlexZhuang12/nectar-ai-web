"use client";

import { useLocale } from "@/context/LocaleContext";
import type { Locale } from "@/lib/types";
import { Globe } from "lucide-react";

const LOCALE_BUTTONS: { value: Locale; label: string }[] = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "en-US", label: "English" },
  { value: "ja-JP", label: "日本語" },
  { value: "es-ES", label: "Español" },
];

function switchLocale(locale: Locale) {
  localStorage.setItem("nectar-ui-locale", locale);
  window.location.href = `${window.location.pathname}?lang=${locale}`;
}

export default function UiLanguageSelector() {
  const { uiLocale } = useLocale();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <Globe className="h-3.5 w-3.5" />
        <span>UI</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {LOCALE_BUTTONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              console.log("--> Changing UI Locale to:", value);
              switchLocale(value);
            }}
            className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
              uiLocale === value
                ? "border-nectar-500 bg-nectar-50 text-nectar-700 dark:bg-nectar-950 dark:text-nectar-300"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
