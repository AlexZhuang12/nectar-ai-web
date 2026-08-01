"use client";

import { t as translate } from "@/lib/i18n";
import type { TranslationKeys } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const UI_LOCALE_KEY = "nectar-ui-locale";
const AI_LOCALE_KEY = "nectar-ai-locale";

const VALID_LOCALES: Locale[] = ["zh-TW", "en-US", "ja-JP", "es-ES"];

function isValidLocale(value: string | null): value is Locale {
  return value !== null && VALID_LOCALES.includes(value as Locale);
}

export interface LocaleContextValue {
  uiLocale: Locale;
  setUiLocale: (locale: Locale) => void;
  aiResponseLanguage: Locale;
  setAiResponseLanguage: (locale: Locale) => void;
  t: (key: TranslationKeys) => string;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [uiLocale, setUiLocaleState] = useState<Locale>("zh-TW");
  const [aiResponseLanguage, setAiResponseLanguageState] =
    useState<Locale>("en-US");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedUi = localStorage.getItem(UI_LOCALE_KEY);
    const savedAi = localStorage.getItem(AI_LOCALE_KEY);
    if (isValidLocale(savedUi)) {
      setUiLocaleState(savedUi);
      console.log("[LocaleContext] Restored UI locale:", savedUi);
    }
    if (isValidLocale(savedAi)) {
      setAiResponseLanguageState(savedAi);
      console.log("[LocaleContext] Restored AI locale:", savedAi);
    }
    if (process.env.NODE_ENV === "development") {
      import("@/lib/i18n").then(({ validateTranslations }) => {
        validateTranslations();
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = uiLocale;
    localStorage.setItem(UI_LOCALE_KEY, uiLocale);
    console.log("[LocaleContext] currentLocale (UI):", uiLocale);
  }, [uiLocale, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(AI_LOCALE_KEY, aiResponseLanguage);
    console.log("[LocaleContext] currentLocale (AI):", aiResponseLanguage);
  }, [aiResponseLanguage, hydrated]);

  const setUiLocale = useCallback((locale: Locale) => {
    if (!isValidLocale(locale)) {
      console.warn("[LocaleContext] Invalid UI locale rejected:", locale);
      return;
    }
    console.log("[LocaleContext] setUiLocale called →", locale);
    setUiLocaleState(locale);
  }, []);

  const setAiResponseLanguage = useCallback((locale: Locale) => {
    if (!isValidLocale(locale)) {
      console.warn("[LocaleContext] Invalid AI locale rejected:", locale);
      return;
    }
    console.log("[LocaleContext] setAiResponseLanguage called →", locale);
    setAiResponseLanguageState(locale);
  }, []);

  const t = useCallback(
    (key: TranslationKeys) => translate(uiLocale, key),
    [uiLocale]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      uiLocale,
      setUiLocale,
      aiResponseLanguage,
      setAiResponseLanguage,
      t,
    }),
    [uiLocale, setUiLocale, aiResponseLanguage, setAiResponseLanguage, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
