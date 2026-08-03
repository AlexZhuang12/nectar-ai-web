import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function resolveUserIdByEmail(email: string): Promise<string | null> {
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) return null;

  let page = 1;
  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error || !data.users.length) break;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match.id;

    if (data.users.length < 1000) break;
    page += 1;
  }

  return null;
}

export async function upgradeProfileToPro(userId: string): Promise<void> {
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  const payload = {
    subscription_tier: "pro",
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("id");

  if (updateError) {
    throw updateError;
  }

  if (!updated?.length) {
    const { error: insertError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      ...payload,
    });

    if (insertError) {
      throw insertError;
    }
  }
}

export async function resolveUserIdFromLemonSqueezyWebhook(params: {
  customData?: Record<string, string | number | null | undefined> | null;
  email?: string | null;
}): Promise<string> {
  const rawUserId = params.customData?.user_id;
  const userId =
    typeof rawUserId === "string"
      ? rawUserId
      : rawUserId != null
        ? String(rawUserId)
        : null;

  if (userId) return userId;

  const email = params.email?.trim();
  if (!email) {
    throw new Error(
      "Could not resolve user id from Lemon Squeezy webhook (custom_data.user_id or email)"
    );
  }

  const resolved = await resolveUserIdByEmail(email);
  if (!resolved) {
    throw new Error(`No Supabase user found for email: ${email}`);
  }

  return resolved;
}
