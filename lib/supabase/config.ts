/**
 * Supabase project URL must be the bare project origin only, e.g.
 * https://xxxx.supabase.co — never include /rest/v1 or /auth/v1.
 */
export function normalizeSupabaseUrl(raw: string): string {
  let url = raw.trim();
  if (!url) return "";

  url = url.replace(/\/+$/, "");
  url = url.replace(/\/rest\/v1$/i, "");
  url = url.replace(/\/auth\/v1$/i, "");

  return url.replace(/\/+$/, "");
}

export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const normalized = normalizeSupabaseUrl(raw);

  if (
    process.env.NODE_ENV === "development" &&
    raw &&
    raw.trim() !== normalized
  ) {
    console.warn(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL contained a path suffix; normalized to:",
      normalized
    );
  }

  return normalized;
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
