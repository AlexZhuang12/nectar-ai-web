"use client";

import { useLocale } from "@/context/LocaleContext";
import { Globe } from "lucide-react";

const OPTIONS = [
  { value: "zh-TW", label: "🇹🇼 繁體中文" },
  { value: "en-US", label: "🇺🇸 English" },
  { value: "ja-JP", label: "🇯🇵 日本語" },
  { value: "es-ES", label: "🇪🇸 Español" },
];

export default function UiLanguageSelector() {
  const { uiLocale, setUiLocale } = useLocale();

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1 dark:border-gray-800 dark:bg-gray-900">
      <Globe className="h-4 w-4 text-gray-500" />
      <select
        value={uiLocale || "zh-TW"}
        onChange={(e) => {
          const val = e.target.value;
          console.log("--> Changing UI Locale to:", val);
          setUiLocale(val as any);
          localStorage.setItem("nectar-ui-locale", val);
          window.location.reload();
        }}
        className="cursor-pointer bg-transparent text-xs font-medium text-gray-700 outline-none dark:text-gray-200"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
