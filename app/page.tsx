"use client";

import { getCredits } from "@/app/actions/extract";
import ExtractorPanel from "@/components/ExtractorPanel";
import FeedbackModal from "@/components/FeedbackModal";
import Header from "@/components/Header";
import KnowledgeHistory from "@/components/KnowledgeHistory";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import { useTranslation } from "@/context/LocaleContext";
import type { ExtractResult } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export default function DashboardPage() {
  const { uiLocale, localeRevision } = useTranslation();
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
      key={`dashboard-${uiLocale}-${localeRevision}`}
      data-ui-locale={uiLocale}
      data-locale-revision={localeRevision}
      className="min-h-screen bg-gradient-to-b from-nectar-50/50 to-white dark:from-gray-950 dark:to-gray-900"
    >
      <Header
        key={`header-${uiLocale}`}
        credits={credits}
        onUpgradeClick={() => setShowProModal(true)}
        onFeedbackClick={() => setShowFeedbackModal(true)}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <ExtractorPanel
          key={`extractor-${uiLocale}`}
          onExtractComplete={handleExtractComplete}
          onCreditsUpdate={handleCreditsUpdate}
          onUpgradeClick={() => setShowProModal(true)}
        />

        <KnowledgeHistory
          key={`history-${uiLocale}`}
          refreshKey={historyRefreshKey}
        />
      </main>

      <ProUpgradeModal
        key={`pro-modal-${uiLocale}`}
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />

      <FeedbackModal
        key={`feedback-modal-${uiLocale}`}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}
