"use client";

import { getHistory } from "@/app/actions/extract";
import { useTranslation } from "@/context/LocaleContext";
import type { KnowledgeRecord } from "@/lib/types";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ArrowRightLeft,
  Clock,
  FileText,
  History,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface KnowledgeHistoryProps {
  refreshKey?: number;
}

export default function KnowledgeHistory({
  refreshKey = 0,
}: KnowledgeHistoryProps) {
  const { t, locale, uiLocale, localeRevision } = useTranslation();
  const [records, setRecords] = useState<KnowledgeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshKey]);

  return (
    <section
      key={`knowledge-history-${locale}-${localeRevision}`}
      data-ui-locale={uiLocale}
      data-current-locale={locale}
      data-locale-revision={localeRevision}
      className="card"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <History className="h-5 w-5 text-nectar-500" />
          {t("historyTitle")}
        </h2>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          aria-label={t("refresh")}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && records.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          {t("loading")}
        </div>
      ) : records.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          {t("historyEmpty")}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <HistoryItem key={record.id} record={record} />
          ))}
        </div>
      )}
    </section>
  );
}

function HistoryItem({ record }: { record: KnowledgeRecord }) {
  const { uiLocale, t } = useTranslation();
  const date = new Date(record.created_at).toLocaleString(uiLocale);

  return (
    <article className="rounded-lg border border-gray-200 p-4 transition hover:border-nectar-200 hover:shadow-sm dark:border-gray-700 dark:hover:border-nectar-800">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          {record.input_type === "url" ? (
            <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
          ) : (
            <FileText className="h-3 w-3" />
          )}
          {record.input_type === "url" ? t("url") : t("text")}
        </span>
        <span>•</span>
        <span>{record.target_language}</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {date}
        </span>
      </div>

      <p className="mb-2 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
        {record.input_text}
      </p>

      {record.summary && (
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {record.summary}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {record.key_info && record.key_info.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <KeyRound className="h-3 w-3" />
            {record.key_info.length} {t("keysCount")}
          </span>
        )}
        {record.alignment && record.alignment.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            <ArrowRightLeft className="h-3 w-3" />
            {record.alignment.length} {t("pairsCount")}
          </span>
        )}
      </div>
    </article>
  );
}
