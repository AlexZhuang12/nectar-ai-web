"use client";

import {
  getDictionary,
  isCanonicalLocale,
  normalizeLocale,
} from "@/lib/i18n";
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
const DEFAULT_UI_LOCALE: Locale = "zh-TW";
const DEFAULT_AI_LOCALE: Locale = "en-US";

const CANONICAL_UI_LOCALES: Locale[] = ["zh-TW", "en-US", "ja-JP", "es-ES"];

function readUiLocaleLazy(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(UI_LOCALE_KEY);
    if (
      saved &&
      (saved === "en-US" ||
        saved === "ja-JP" ||
        saved === "es-ES" ||
        saved === "zh-TW")
    ) {
      return saved as Locale;
    }
  }
  return DEFAULT_UI_LOCALE;
}

function readAiLocaleLazy(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(AI_LOCALE_KEY);
    if (saved && isCanonicalLocale(saved.trim())) {
      return saved.trim() as Locale;
    }
  }
  return DEFAULT_AI_LOCALE;
}

function syncDocumentLang(locale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

export interface LocaleContextValue {
  locale: Locale;
  uiLocale: Locale;
  setLocale: (locale: Locale | string) => void;
  setUiLocale: (locale: Locale | string) => void;
  aiResponseLanguage: Locale;
  setAiResponseLanguage: (locale: Locale) => void;
  t: (key: TranslationKeys) => string;
  localeRevision: number;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [uiLocale, setUiLocaleState] = useState<Locale>(readUiLocaleLazy);
  const [aiResponseLanguage, setAiResponseLanguageState] =
    useState<Locale>(readAiLocaleLazy);
  const [localeRevision, setLocaleRevision] = useState(0);

  // Mount: sync <html lang> only — never write localStorage, never reset uiLocale
  useEffect(() => {
    syncDocumentLang(uiLocale);
    console.log("[LocaleContext] Initialized — UI:", uiLocale, "AI:", aiResponseLanguage);
  }, [uiLocale, aiResponseLanguage]);

  const dictionary = useMemo(() => getDictionary(uiLocale), [uiLocale]);

  const t = useCallback(
    (key: TranslationKeys) => {
      const value = dictionary[key];
      if (value === undefined) {
        console.warn(`Missing key: ${key} for locale: ${uiLocale}`);
        return getDictionary("en-US")[key] ?? getDictionary("zh-TW")[key] ?? key;
      }
      return value;
    },
    [dictionary, uiLocale]
  );

  /** User-initiated only — sole writer for nectar-ui-locale */
  const setUiLocale = useCallback((locale: Locale | string) => {
    const normalized =
      normalizeLocale(locale) ??
      (CANONICAL_UI_LOCALES.includes(String(locale).trim() as Locale)
        ? (String(locale).trim() as Locale)
        : null);

    if (!normalized) {
      console.warn("[LocaleContext] Invalid UI locale rejected:", locale);
      return;
    }

    console.log("[LocaleContext] setUiLocale →", normalized);
    localStorage.setItem(UI_LOCALE_KEY, normalized);
    syncDocumentLang(normalized);
    setUiLocaleState(normalized);
    setLocaleRevision((n) => n + 1);

    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  /** User-initiated only — sole writer for nectar-ai-locale */
  const setAiResponseLanguage = useCallback((locale: Locale) => {
    const normalized = normalizeLocale(locale);
    if (!normalized) {
      console.warn("[LocaleContext] Invalid AI locale rejected:", locale);
      return;
    }
    setAiResponseLanguageState(normalized);
    localStorage.setItem(AI_LOCALE_KEY, normalized);
  }, []);

  const value: LocaleContextValue = {
    locale: uiLocale,
    uiLocale,
    setLocale: setUiLocale,
    setUiLocale,
    aiResponseLanguage,
    setAiResponseLanguage,
    t,
    localeRevision,
  };

  return (
    <LocaleContext.Provider value={value}>
      <div
        key={`locale-${uiLocale}-${localeRevision}`}
        data-current-locale={uiLocale}
        data-locale-revision={localeRevision}
      >
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useTranslation() {
  const { locale, uiLocale, localeRevision, t } = useLocale();
  return { locale, uiLocale, localeRevision, t };
}
