import { getSupabaseUrl } from "@/lib/supabase/config";
import { createClient } from "@supabase/supabase-js";

/** Service-role client for trusted server-side writes (webhooks only). */
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) {
    return null;
  }

  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
