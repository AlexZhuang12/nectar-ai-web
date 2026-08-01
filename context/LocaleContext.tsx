"use client";

import {
  isCanonicalLocale,
  normalizeLocale,
  t as tI18n,
} from "@/lib/i18n";
import type { TranslationKeys } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const UI_LOCALE_KEY = "nectar-ui-locale";
const AI_LOCALE_KEY = "nectar-ai-locale";
const DEFAULT_UI_LOCALE: Locale = "zh-TW";
const DEFAULT_AI_LOCALE: Locale = "en-US";

const CANONICAL_UI_LOCALES: Locale[] = ["zh-TW", "en-US", "ja-JP", "es-ES"];

function isCanonicalUiLocale(value: string): value is Locale {
  return CANONICAL_UI_LOCALES.includes(value as Locale);
}

function readLangFromQuery(): Locale | null {
  if (typeof window === "undefined") return null;
  const fromQuery = new URLSearchParams(window.location.search).get("lang");
  if (fromQuery && isCanonicalUiLocale(fromQuery)) {
    return fromQuery;
  }
  return normalizeLocale(fromQuery);
}

function readUiLocaleLazy(): Locale {
  if (typeof window === "undefined") return DEFAULT_UI_LOCALE;

  const fromQuery = readLangFromQuery();
  if (fromQuery) return fromQuery;

  const saved = localStorage.getItem(UI_LOCALE_KEY);
  if (saved && isCanonicalUiLocale(saved)) {
    return saved;
  }

  return DEFAULT_UI_LOCALE;
}

function readAiLocaleLazy(): Locale {
  if (typeof window === "undefined") return DEFAULT_AI_LOCALE;
  const saved = localStorage.getItem(AI_LOCALE_KEY);
  if (saved && isCanonicalLocale(saved.trim())) {
    return saved.trim() as Locale;
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

  // Mount: URL ?lang= takes priority, persist to localStorage, sync document
  useEffect(() => {
    const fromQuery = readLangFromQuery();
    let loaded: Locale = uiLocale;

    if (fromQuery) {
      localStorage.setItem(UI_LOCALE_KEY, fromQuery);
      loaded = fromQuery;
      if (fromQuery !== uiLocale) {
        setUiLocaleState(fromQuery);
        setLocaleRevision((n) => n + 1);
      }
    }

    syncDocumentLang(loaded);
    console.log("Current UI Locale loaded:", loaded);
    console.log("[LocaleContext] AI locale:", aiResponseLanguage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- mount init only

  const t = useCallback(
    (key: TranslationKeys) => tI18n(uiLocale, key),
    [uiLocale]
  );

  const setUiLocale = useCallback((locale: Locale | string) => {
    const normalized =
      normalizeLocale(locale) ??
      (isCanonicalUiLocale(String(locale).trim())
        ? (String(locale).trim() as Locale)
        : null);

    if (!normalized) {
      console.warn("[LocaleContext] Invalid UI locale rejected:", locale);
      return;
    }

    localStorage.setItem(UI_LOCALE_KEY, normalized);
    window.location.href = `${window.location.pathname}?lang=${normalized}`;
  }, []);

  const setAiResponseLanguage = useCallback((locale: Locale) => {
    const normalized = normalizeLocale(locale);
    if (!normalized) return;
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
