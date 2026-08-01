"use client";

import { t as translate, normalizeLocale } from "@/lib/i18n";
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

export interface LocaleContextValue {
  uiLocale: Locale;
  setUiLocale: (locale: Locale) => void;
  aiResponseLanguage: Locale;
  setAiResponseLanguage: (locale: Locale) => void;
  t: (key: TranslationKeys) => string;
  localeRevision: number;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [uiLocale, setUiLocaleState] = useState<Locale>(DEFAULT_UI_LOCALE);
  const [aiResponseLanguage, setAiResponseLanguageState] =
    useState<Locale>(DEFAULT_AI_LOCALE);
  const [localeRevision, setLocaleRevision] = useState(0);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const savedUi = readStoredLocale(UI_LOCALE_KEY, DEFAULT_UI_LOCALE);
    const savedAi = readStoredLocale(AI_LOCALE_KEY, DEFAULT_AI_LOCALE);
    setUiLocaleState(savedUi);
    setAiResponseLanguageState(savedAi);
    document.documentElement.lang = savedUi;
    console.log("[LocaleContext] Initialized — UI:", savedUi, "AI:", savedAi);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = uiLocale;
    writeStoredLocale(UI_LOCALE_KEY, uiLocale);
    console.log("[LocaleContext] currentLocale (UI):", uiLocale);
  }, [uiLocale, ready]);

  useEffect(() => {
    if (!ready) return;
    writeStoredLocale(AI_LOCALE_KEY, aiResponseLanguage);
    console.log("[LocaleContext] currentLocale (AI):", aiResponseLanguage);
  }, [aiResponseLanguage, ready]);

  const setUiLocale = useCallback((locale: Locale) => {
    const normalized = normalizeLocale(locale);
    if (!normalized) {
      console.warn("[LocaleContext] Invalid UI locale rejected:", locale);
      return;
    }
    console.log("[LocaleContext] setUiLocale →", normalized);
    setUiLocaleState(normalized);
    setLocaleRevision((n) => n + 1);
  }, []);

  const setAiResponseLanguage = useCallback((locale: Locale) => {
    const normalized = normalizeLocale(locale);
    if (!normalized) {
      console.warn("[LocaleContext] Invalid AI locale rejected:", locale);
      return;
    }
    console.log("[LocaleContext] setAiResponseLanguage →", normalized);
    setAiResponseLanguageState(normalized);
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
      localeRevision,
    }),
    [
      uiLocale,
      setUiLocale,
      aiResponseLanguage,
      setAiResponseLanguage,
      t,
      localeRevision,
    ]
  );

  return (
    <LocaleContext.Provider value={value}>
      {/* Force full subtree re-render when UI locale changes */}
      <div key={`locale-root-${uiLocale}-${localeRevision}`}>{children}</div>
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
