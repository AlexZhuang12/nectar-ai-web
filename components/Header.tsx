"use client";

import LanguageSelector, { t } from "@/components/LanguageSelector";
import type { Locale } from "@/lib/types";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Coins, MessageSquare, Sparkles } from "lucide-react";

interface HeaderProps {
  uiLocale: Locale;
  onUiLocaleChange: (locale: Locale) => void;
  credits: number;
  onUpgradeClick: () => void;
  onFeedbackClick: () => void;
}

export default function Header({
  uiLocale,
  onUiLocaleChange,
  credits,
  onUpgradeClick,
  onFeedbackClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nectar-400 to-nectar-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              {t(uiLocale, "appTitle")}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t(uiLocale, "appSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-end gap-3 sm:gap-4">
          <LanguageSelector
            locale={uiLocale}
            onChange={onUiLocaleChange}
            variant="ui"
          />

          <button
            onClick={onFeedbackClick}
            className="btn-secondary !py-2 !text-xs sm:!text-sm"
            title={t(uiLocale, "feedback")}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t(uiLocale, "feedback")}</span>
          </button>

          <div className="flex items-center gap-1.5 rounded-lg bg-nectar-50 px-3 py-2 text-sm font-medium text-nectar-700 dark:bg-nectar-950 dark:text-nectar-300">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t(uiLocale, "creditBalance")}:
            </span>
            <span>{credits}</span>
            <span className="text-xs opacity-70">{t(uiLocale, "credits")}</span>
          </div>

          <button
            onClick={onUpgradeClick}
            className="btn-primary !bg-gradient-to-r !from-amber-500 !to-nectar-500 !py-2 !text-xs sm:!text-sm"
          >
            <FontAwesomeIcon icon={faCrown} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t(uiLocale, "upgradePro")}</span>
            <span className="sm:hidden">Pro</span>
          </button>
        </div>
      </div>
    </header>
  );
}
