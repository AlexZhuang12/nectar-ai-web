"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutSuccessSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;

    const timer = window.setTimeout(() => {
      router.refresh();
      setRefreshed(true);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [searchParams, router]);

  if (searchParams.get("checkout") !== "success") return null;

  return (
    <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
      {refreshed
        ? "Payment received. Your Pro subscription should be active now."
        : "Payment received. Activating your Pro subscription…"}
    </p>
  );
}
