"use client";

import { useTranslation } from "@/context/LocaleContext";
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";

interface UpgradeToProButtonProps {
  className?: string;
}

export default function UpgradeToProButton({
  className = "btn-primary !bg-gradient-to-r !from-amber-500 !to-nectar-500",
}: UpgradeToProButtonProps) {
  const { t } = useTranslation();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setCheckingOut(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/lemonsqueezy", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Failed to start checkout.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={checkingOut}
        className={className}
      >
        {checkingOut ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("checkoutProcessing")}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            {t("upgradePro")}
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
