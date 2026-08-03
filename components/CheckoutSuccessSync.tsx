"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutSuccessSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">(
    "idle"
  );

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;

    const sessionId = searchParams.get("session_id");

    async function syncSubscription() {
      setStatus("syncing");

      try {
        const res = await fetch("/api/subscription/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok) {
          setStatus("done");
          router.refresh();
          return;
        }

        setStatus("error");
      } catch {
        setStatus("error");
      }
    }

    void syncSubscription();
  }, [searchParams, router]);

  if (searchParams.get("checkout") !== "success") return null;

  if (status === "syncing") {
    return (
      <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
        Activating your Pro subscription…
      </p>
    );
  }

  if (status === "done") {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
        Payment received. Your Pro subscription is now active.
      </p>
    );
  }

  return (
    <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
      Payment received. Your Pro subscription will activate shortly.
    </p>
  );
}
