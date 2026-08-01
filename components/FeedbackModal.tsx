"use client";

import { submitFeedback } from "@/app/actions/feedback";
import { useTranslation } from "@/context/LocaleContext";
import type { FeedbackCategory } from "@/lib/types";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Bug, Lightbulb, Loader2, MessageSquare, X } from "lucide-react";
import { useState } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: {
  value: FeedbackCategory;
  labelKey:
    | "feedbackCategoryBug"
    | "feedbackCategoryFeature"
    | "feedbackCategoryOther";
  icon: typeof Bug;
}[] = [
  { value: "bug", labelKey: "feedbackCategoryBug", icon: Bug },
  { value: "feature", labelKey: "feedbackCategoryFeature", icon: Lightbulb },
  { value: "other", labelKey: "feedbackCategoryOther", icon: MessageSquare },
];

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t, locale, uiLocale, localeRevision } = useTranslation();
  const [category, setCategory] = useState<FeedbackCategory>("feature");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleClose() {
    setCategory("feature");
    setMessage("");
    setDone(false);
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitFeedback({
        category,
        message: message.trim(),
        uiLocale,
      });

      if (!result.success) {
        setError(result.error ?? t("feedbackError"));
        return;
      }

      setDone(true);
    } catch {
      setError(t("feedbackError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      key={`feedback-modal-${locale}-${localeRevision}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-ui-locale={uiLocale}
      data-current-locale={locale}
      data-locale-revision={localeRevision}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          aria-label={t("close")}
        >
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
              <FontAwesomeIcon icon={faCheck} className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {t("feedbackThankYou")}
            </p>
            <button onClick={handleClose} className="btn-primary w-full">
              {t("close")}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("feedbackTitle")}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("feedbackDesc")}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("feedbackCategory")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(({ value, labelKey, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCategory(value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition ${
                        category === value
                          ? "border-nectar-500 bg-nectar-50 text-nectar-700 dark:bg-nectar-950 dark:text-nectar-300"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("feedbackMessage")}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("feedbackMessagePlaceholder")}
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !message.trim()}
                className="btn-primary w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("feedbackSubmitting")}
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    {t("feedbackSubmit")}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
