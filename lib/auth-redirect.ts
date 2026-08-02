/** Safe post-login path — must be same-origin relative */
export function sanitizeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}

/** Absolute callback URL for Supabase email confirmation */
export function buildEmailRedirectUrl(postLoginPath?: string): string | null {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

  if (!origin) {
    return null;
  }

  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", sanitizeRedirectPath(postLoginPath));
  return url.href;
}
