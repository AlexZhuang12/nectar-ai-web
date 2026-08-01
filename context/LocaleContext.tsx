"use client";

import { getDictionary, normalizeLocale } from "@/lib/i18n";
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

function readStoredLocale(key: string, fallback: Locale): Locale {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return normalizeLocale(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStoredLocale(key: string, locale: Locale) {
  try {
    localStorage.setItem(key, locale);
  } catch (err) {
    console.warn("[LocaleContext] Failed to write localStorage:", key, err);
  }
}

function syncDocumentLang(locale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

export interface LocaleContextValue {
  /** Current UI locale — reactive */
  locale: Locale;
  uiLocale: Locale;
  setLocale: (locale: Locale | string) => void;
  setUiLocale: (locale: Locale | string) => void;
  aiResponseLanguage: Locale;
  setAiResponseLanguage: (locale: Locale) => void;
  /** Re-created whenever locale changes — triggers consumer re-renders */
  t: (key: TranslationKeys) => string;
  localeRevision: number;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [uiLocale, setUiLocaleState] = useState<Locale>(DEFAULT_UI_LOCALE);
  const [aiResponseLanguage, setAiResponseLanguageState] =
    useState<Locale>(DEFAULT_AI_LOCALE);
  const [localeRevision, setLocaleRevision] = useState(0);

  // Restore persisted locale after mount (avoids SSR/client mismatch)
  useEffect(() => {
    const savedUi = readStoredLocale(UI_LOCALE_KEY, DEFAULT_UI_LOCALE);
    const savedAi = readStoredLocale(AI_LOCALE_KEY, DEFAULT_AI_LOCALE);
    setUiLocaleState(savedUi);
    setAiResponseLanguageState(savedAi);
    syncDocumentLang(savedUi);
    console.log("[LocaleContext] Initialized — UI:", savedUi, "AI:", savedAi);
  }, []);

  // Reactive dictionary — new reference whenever uiLocale changes
  const dictionary = useMemo(() => getDictionary(uiLocale), [uiLocale]);

  // t is re-created when dictionary/uiLocale changes → all consumers re-render
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

  const setUiLocale = useCallback((locale: Locale | string) => {
    const normalized = normalizeLocale(locale);
    if (!normalized) {
      console.warn("[LocaleContext] Invalid UI locale rejected:", locale);
      return;
    }
    console.log("[LocaleContext] setUiLocale →", normalized);
    writeStoredLocale(UI_LOCALE_KEY, normalized);
    syncDocumentLang(normalized);
    setUiLocaleState(normalized);
    setLocaleRevision((n) => n + 1);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const setAiResponseLanguage = useCallback((locale: Locale) => {
    const normalized = normalizeLocale(locale);
    if (!normalized) {
      console.warn("[LocaleContext] Invalid AI locale rejected:", locale);
      return;
    }
    setAiResponseLanguageState(normalized);
    writeStoredLocale(AI_LOCALE_KEY, normalized);
  }, []);

  // Fresh object every render — never memoized, so consumers always see latest locale
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

/**
 * Primary hook for UI strings.
 * Returns the context `t` which is reactively bound to the current locale.
 */
export function useTranslation() {
  const { locale, uiLocale, localeRevision, t } = useLocale();
  return { locale, uiLocale, localeRevision, t };
}
