import { getSupabaseUrl } from "@/lib/supabase/config";
import { createClient } from "@supabase/supabase-js";

/** Service-role client for trusted server-side writes (webhooks only). */
export function createSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    if (!url) {
      console.error(
        "[supabase admin] NEXT_PUBLIC_SUPABASE_URL is not configured"
      );
    }
    if (!serviceRoleKey) {
      console.error(
        "[supabase admin] SUPABASE_SERVICE_ROLE_KEY is not configured"
      );
    }
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
