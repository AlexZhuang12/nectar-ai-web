"use client";

import { getCredits } from "@/app/actions/extract";
import ExtractorPanel from "@/components/ExtractorPanel";
import FeedbackModal from "@/components/FeedbackModal";
import Header from "@/components/Header";
import KnowledgeHistory from "@/components/KnowledgeHistory";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import type { ExtractResult, Locale } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export default function Dashboard() {
  const [uiLocale, setUiLocale] = useState<Locale>("zh-TW");
  const [aiResponseLanguage, setAiResponseLanguage] = useState<Locale>("en-US");
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
    <div className="min-h-screen bg-gradient-to-b from-nectar-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <Header
        uiLocale={uiLocale}
        onUiLocaleChange={setUiLocale}
        credits={credits}
        onUpgradeClick={() => setShowProModal(true)}
        onFeedbackClick={() => setShowFeedbackModal(true)}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <ExtractorPanel
          uiLocale={uiLocale}
          aiResponseLanguage={aiResponseLanguage}
          onAiResponseLanguageChange={setAiResponseLanguage}
          onExtractComplete={handleExtractComplete}
          onCreditsUpdate={handleCreditsUpdate}
          onUpgradeClick={() => setShowProModal(true)}
        />

        <KnowledgeHistory locale={uiLocale} refreshKey={historyRefreshKey} />
      </main>

      <ProUpgradeModal
        locale={uiLocale}
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />

      <FeedbackModal
        locale={uiLocale}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}
