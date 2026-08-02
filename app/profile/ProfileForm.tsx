"use client";

import { createClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";

interface ProfileFormProps {
  userId: string;
  email: string | undefined;
  initialFullName: string;
  initialUpdatedAt: string | null;
  profileExists: boolean;
}

export default function ProfileForm({
  userId,
  email,
  initialFullName,
  initialUpdatedAt,
  profileExists: initialProfileExists,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [profileExists, setProfileExists] = useState(initialProfileExists);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const trimmed = fullName.trim();
    const supabase = createClient();
    const now = new Date().toISOString();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    if (user.id !== userId) {
      setError("User identity mismatch. Please refresh and try again.");
      setLoading(false);
      return;
    }

    const writePayload = {
      full_name: trimmed || null,
      updated_at: now,
    };

    let saveError: { message: string } | null = null;

    if (profileExists) {
      const { data, error } = await supabase
        .from("profiles")
        .update(writePayload)
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

      saveError = error;

      if (!error && !data) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          ...writePayload,
        });
        saveError = insertError;
        if (!insertError) setProfileExists(true);
      }
    } else {
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        ...writePayload,
      });
      saveError = error;
      if (!error) setProfileExists(true);
    }

    setLoading(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setUpdatedAt(now);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Profile
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your display name shown across Nectar AI.
        </p>
      </div>

      <dl className="grid gap-3 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-800/50 sm:grid-cols-2">
        <div>
          <dt className="text-gray-500 dark:text-gray-400">Email</dt>
          <dd className="font-medium text-gray-900 dark:text-white">{email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-500 dark:text-gray-400">User ID</dt>
          <dd className="break-all font-mono text-xs text-gray-900 dark:text-white">
            {userId}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-gray-500 dark:text-gray-400">Last Updated</dt>
          <dd className="font-medium text-gray-900 dark:text-white">
            {updatedAt ? new Date(updatedAt).toLocaleString() : "Not set yet"}
          </dd>
        </div>
      </dl>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="full_name"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Display Name (Nickname)
          </label>
          <input
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field"
            placeholder="Enter your nickname"
            maxLength={100}
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300"
          >
            Profile updated successfully.
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
