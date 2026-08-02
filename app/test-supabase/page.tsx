"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type ConnectionStatus = "loading" | "connected" | "error";

export default function TestSupabasePage() {
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [profiles, setProfiles] = useState<Record<string, unknown>[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfiles() {
      setStatus("loading");
      setErrorMessage(null);

      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("profiles").select("*");

        if (cancelled) return;

        if (error) {
          setStatus("error");
          setProfiles([]);
          setErrorMessage(error.message);
          return;
        }

        setStatus("connected");
        setProfiles(data ?? []);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setProfiles([]);
        setErrorMessage(
          err instanceof Error ? err.message : "Unknown connection error"
        );
      }
    }

    fetchProfiles();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        Supabase Connection Test
      </h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Querying <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">profiles</code> via{" "}
        <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">lib/supabase/client.ts</code>
      </p>

      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Connection Status
        </h2>
        <StatusBadge status={status} />
        {errorMessage && (
          <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {errorMessage}
          </p>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Profiles ({profiles.length})
        </h2>
        {status === "loading" ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>
        ) : profiles.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No rows returned (empty array).
          </p>
        ) : (
          <pre className="overflow-x-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800 dark:bg-gray-950 dark:text-gray-200">
            {JSON.stringify(profiles, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const styles: Record<ConnectionStatus, string> = {
    loading: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
    connected: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  };

  const labels: Record<ConnectionStatus, string> = {
    loading: "Connecting…",
    connected: "Connected",
    error: "Error",
  };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
