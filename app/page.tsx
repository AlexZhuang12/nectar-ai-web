"use client";

import { getCredits } from "@/app/actions/extract";
import ExtractorPanel from "@/components/ExtractorPanel";
import FeedbackModal from "@/components/FeedbackModal";
import Header from "@/components/Header";
import KnowledgeHistory from "@/components/KnowledgeHistory";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import Providers from "@/components/Providers";
import { useTranslation } from "@/context/LocaleContext";
import type { ExtractResult } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

function Dashboard() {
  const { locale } = useTranslation();
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
      data-ui-locale={locale}
      className="min-h-screen bg-gradient-to-b from-nectar-50/50 to-white dark:from-gray-950 dark:to-gray-900"
    >
      <Header
        credits={credits}
        onUpgradeClick={() => setShowProModal(true)}
        onFeedbackClick={() => setShowFeedbackModal(true)}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <ExtractorPanel
          onExtractComplete={handleExtractComplete}
          onCreditsUpdate={handleCreditsUpdate}
          onUpgradeClick={() => setShowProModal(true)}
        />

        <KnowledgeHistory refreshKey={historyRefreshKey} />
      </main>

      <ProUpgradeModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Providers>
      <Dashboard />
    </Providers>
  );
}
