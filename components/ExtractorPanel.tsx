"use client";

import { extractInformation } from "@/app/actions/extract";
import LanguageSelector from "@/components/LanguageSelector";
import { t } from "@/lib/i18n";
import type {
  AlignmentPair,
  ExtractionMode,
  ExtractResult,
  KeyInfoItem,
  Locale,
} from "@/lib/types";
import { faLink, faAlignLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ArrowRightLeft,
  FileText,
  KeyRound,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface ExtractorPanelProps {
  uiLocale: Locale;
  aiResponseLanguage: Locale;
  onAiResponseLanguageChange: (locale: Locale) => void;
  onExtractComplete: (result: ExtractResult) => void;
  onCreditsUpdate: (credits: number) => void;
  onUpgradeClick: () => void;
}

const MODES: {
  value: ExtractionMode;
  labelKey: "modeKeyInfo" | "modeDualAlignment" | "modeBoth";
  icon: typeof KeyRound;
}[] = [
  { value: "key-info", labelKey: "modeKeyInfo", icon: KeyRound },
  {
    value: "dual-alignment",
    labelKey: "modeDualAlignment",
    icon: ArrowRightLeft,
  },
  { value: "both", labelKey: "modeBoth", icon: Sparkles },
];

export default function ExtractorPanel({
  uiLocale,
  aiResponseLanguage,
  onAiResponseLanguageChange,
  onExtractComplete,
  onCreditsUpdate,
  onUpgradeClick,
}: ExtractorPanelProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ExtractionMode>("both");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isUrl = (() => {
    try {
      const u = new URL(input.trim());
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  })();

  async function handleExtract() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await extractInformation({
        input: input.trim(),
        aiResponseLanguage,
        mode,
      });

      if (!res.success) {
        if (res.error === "insufficient_credits") {
          setError(t(uiLocale, "errorInsufficientCredits"));
          onUpgradeClick();
        } else {
          setError(res.error ?? t(uiLocale, "errorGeneric"));
        }
        return;
      }

      setResult(res);
      onExtractComplete(res);
      if (res.creditsUsed) {
        onCreditsUpdate(-res.creditsUsed);
      }
    } catch {
      setError(t(uiLocale, "errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t(uiLocale, "extractorTitle")}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t(uiLocale, "extractorDesc")}
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t(uiLocale, "inputPlaceholder")}
            rows={5}
            className="input-field resize-none pr-16"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <FontAwesomeIcon
              icon={isUrl ? faLink : faAlignLeft}
              className="h-3 w-3"
            />
            {isUrl ? t(uiLocale, "url") : t(uiLocale, "text")}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <LanguageSelector
              locale={aiResponseLanguage}
              onChange={onAiResponseLanguageChange}
              variant="ai"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {t(uiLocale, "aiResponseLanguageHint")}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t(uiLocale, "extractionMode")}
            </label>
            <div className="flex gap-2">
              {MODES.map(({ value, labelKey, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition sm:text-sm ${
                    mode === value
                      ? "border-nectar-500 bg-nectar-50 text-nectar-700 dark:bg-nectar-950 dark:text-nectar-300"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(uiLocale, labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleExtract}
          disabled={loading || !input.trim()}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t(uiLocale, "extracting")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t(uiLocale, "extract")}
            </>
          )}
        </button>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {result?.success && (
          <div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-800">
            {result.summary && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <FileText className="h-4 w-4 text-nectar-500" />
                  {t(uiLocale, "summary")}
                </h3>
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {result.summary}
                </p>
              </div>
            )}

            {result.keyInfo && result.keyInfo.length > 0 && (
              <KeyInfoDisplay items={result.keyInfo} uiLocale={uiLocale} />
            )}

            {result.alignment && result.alignment.length > 0 && (
              <AlignmentDisplay pairs={result.alignment} uiLocale={uiLocale} />
            )}

            <p className="text-xs text-green-600 dark:text-green-400">
              ✓ {t(uiLocale, "saved")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function KeyInfoDisplay({
  items,
  uiLocale,
}: {
  items: KeyInfoItem[];
  uiLocale: Locale;
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
        <KeyRound className="h-4 w-4 text-nectar-500" />
        {t(uiLocale, "keyInfo")}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {item.value}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlignmentDisplay({
  pairs,
  uiLocale,
}: {
  pairs: AlignmentPair[];
  uiLocale: Locale;
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
        <ArrowRightLeft className="h-4 w-4 text-nectar-500" />
        {t(uiLocale, "dualAlignment")}
      </h3>
      <div className="space-y-2">
        {pairs.map((pair, i) => (
          <div
            key={i}
            className="grid gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-2 dark:border-gray-700"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {pair.source}
            </p>
            <p className="text-sm font-medium text-nectar-700 dark:text-nectar-300">
              → {pair.target}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
