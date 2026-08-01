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

/** Read-only: never writes to localStorage */
function readUiLocaleFromStorage(): Locale {
  if (typeof window === "undefined") return DEFAULT_UI_LOCALE;
  try {
    const raw = localStorage.getItem(UI_LOCALE_KEY);
    if (raw === null || raw.trim() === "") return DEFAULT_UI_LOCALE;

    const normalized = normalizeLocale(raw);
    if (normalized) return normalized;

    const trimmed = raw.trim();
    if (isCanonicalLocale(trimmed)) return trimmed;

    console.warn(
      "[LocaleContext] Unrecognized stored UI locale (storage untouched):",
      raw
    );
    return DEFAULT_UI_LOCALE;
  } catch {
    return DEFAULT_UI_LOCALE;
  }
}

/** Read-only: never writes to localStorage */
function readAiLocaleFromStorage(): Locale {
  if (typeof window === "undefined") return DEFAULT_AI_LOCALE;
  try {
    const raw = localStorage.getItem(AI_LOCALE_KEY);
    if (raw === null || raw.trim() === "") return DEFAULT_AI_LOCALE;

    const normalized = normalizeLocale(raw);
    if (normalized) return normalized;

    const trimmed = raw.trim();
    if (isCanonicalLocale(trimmed)) return trimmed;

    return DEFAULT_AI_LOCALE;
  } catch {
    return DEFAULT_AI_LOCALE;
  }
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
  const [uiLocale, setUiLocaleState] = useState<Locale>(DEFAULT_UI_LOCALE);
  const [aiResponseLanguage, setAiResponseLanguageState] =
    useState<Locale>(DEFAULT_AI_LOCALE);
  const [localeRevision, setLocaleRevision] = useState(0);
  const [ready, setReady] = useState(false);

  // Read-only hydration — never writes nectar-ui-locale on mount
  useEffect(() => {
    const savedUi = readUiLocaleFromStorage();
    const savedAi = readAiLocaleFromStorage();
    setUiLocaleState(savedUi);
    setAiResponseLanguageState(savedAi);
    syncDocumentLang(savedUi);
    console.log(
      "[LocaleContext] Hydrated from storage (read-only) — UI:",
      savedUi,
      "AI:",
      savedAi
    );
    setReady(true);
  }, []);

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
      (isCanonicalLocale(String(locale).trim())
        ? (String(locale).trim() as Locale)
        : null);

    if (!normalized) {
      console.warn("[LocaleContext] Invalid UI locale rejected:", locale);
      return;
    }

    console.log("[LocaleContext] setUiLocale →", normalized);
    try {
      localStorage.setItem(UI_LOCALE_KEY, normalized);
    } catch (err) {
      console.warn("[LocaleContext] Failed to write localStorage:", err);
    }
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
    try {
      localStorage.setItem(AI_LOCALE_KEY, normalized);
    } catch (err) {
      console.warn("[LocaleContext] Failed to write AI locale:", err);
    }
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
        data-locale-ready={ready ? "true" : "false"}
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
