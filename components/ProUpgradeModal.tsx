"use client";

import { useTranslation } from "@/context/LocaleContext";
import { faCheck, faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CreditCard, Loader2, X, Zap } from "lucide-react";
import { useState } from "react";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProUpgradeModal({ isOpen, onClose }: ProUpgradeModalProps) {
  const { uiLocale, localeRevision, t } = useTranslation();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  if (!isOpen) return null;

  async function handleCheckout() {
    setCheckingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCheckingOut(false);
    setCheckoutDone(true);
  }

  function handleClose() {
    setCheckoutDone(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-ui-locale={uiLocale}
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

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-nectar-500 text-white shadow-lg">
            <FontAwesomeIcon icon={faCrown} className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("proModalTitle")}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("proModalDesc")}
          </p>
        </div>

        {checkoutDone ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
              <FontAwesomeIcon icon={faCheck} className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {t("checkoutSimulated")}
            </p>
            <button onClick={handleClose} className="btn-primary w-full">
              {t("close")}
            </button>
          </div>
        ) : (
          <>
            <ul className="mb-6 space-y-3">
              {[t("proFeature1"), t("proFeature2"), t("proFeature3")].map(
                (feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                    {feature}
                  </li>
                )
              )}
            </ul>

            <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-nectar-50 p-4 text-center dark:from-amber-950/30 dark:to-nectar-950/30">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("proPrice")}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="btn-primary w-full !bg-gradient-to-r !from-amber-500 !to-nectar-500"
            >
              {checkingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("checkoutProcessing")}
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  {t("checkout")}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
