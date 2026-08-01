'use client';

import { getCredits } from "@/app/actions/extract";
import ExtractorPanel from "@/components/ExtractorPanel";
import FeedbackModal from "@/components/FeedbackModal";
import Header from "@/components/Header";
import KnowledgeHistory from "@/components/KnowledgeHistory";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import { useTranslation } from "@/context/LocaleContext";
import type { ExtractResult } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

/** Avoid SSR/static HTML snapshot — render dashboard only after client mount */
function DashboardContent() {
  const { locale, uiLocale, localeRevision, t } = useTranslation();
  const [credits, setCredits] = useState(100);
  const [showProModal, setShowProModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  useEffect(() => {
    getCredits().then(setCredits).catch(() => setCredits(100));
  }, []);

  const handleCreditsUpdate = useCallback((delta: number) => {
    setCredits((prev) => Math.max(0, prev + delta));
  }, []);

  const handleExtractComplete = useCallback((_result: ExtractResult) => {
    setHistoryRefreshKey((k) => k + 1);
  }, []);

  return (
    <div
      key={`dashboard-${locale}-${localeRevision}`}
      data-ui-locale={uiLocale}
      data-current-locale={locale}
      data-locale-revision={localeRevision}
      aria-label={t("appSubtitle")}
      className="min-h-screen bg-gradient-to-b from-nectar-50/50 to-white dark:from-gray-950 dark:to-gray-900"
    >
      <Header
        key={`header-${locale}-${localeRevision}`}
        credits={credits}
        onUpgradeClick={() => setShowProModal(true)}
        onFeedbackClick={() => setShowFeedbackModal(true)}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <ExtractorPanel
          key={`extractor-${locale}-${localeRevision}`}
          onExtractComplete={handleExtractComplete}
          onCreditsUpdate={handleCreditsUpdate}
          onUpgradeClick={() => setShowProModal(true)}
        />

        <KnowledgeHistory
          key={`history-${locale}-${localeRevision}`}
          refreshKey={historyRefreshKey}
        />
      </main>

      <ProUpgradeModal
        key={`pro-modal-${locale}-${localeRevision}`}
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />

      <FeedbackModal
        key={`feedback-modal-${locale}-${localeRevision}`}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { locale, localeRevision } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-nectar-50/50 to-white dark:from-gray-950 dark:to-gray-900"
        aria-busy="true"
      />
    );
  }

  return (
    <DashboardContent key={`dashboard-root-${locale}-${localeRevision}`} />
  );
}
