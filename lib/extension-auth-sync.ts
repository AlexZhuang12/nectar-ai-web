import type { Session, SupabaseClient } from "@supabase/supabase-js";

export const NECTAR_AUTH_SYNC_EVENT = "nectar-auth-sync";
export const NECTAR_AUTH_SYNC_MESSAGE_TYPE = "NECTAR_AUTH_SYNC";

export interface NectarAuthSyncMessage {
  type: typeof NECTAR_AUTH_SYNC_MESSAGE_TYPE;
  session: Session | null;
  subscription_tier: string | null;
}

export function broadcastNectarAuthSync(payload: {
  session: Session | null;
  subscription_tier?: string | null;
}): void {
  if (typeof window === "undefined") return;

  const message: NectarAuthSyncMessage = {
    type: NECTAR_AUTH_SYNC_MESSAGE_TYPE,
    session: payload.session,
    subscription_tier: payload.subscription_tier ?? null,
  };

  window.postMessage(message, "*");
  window.dispatchEvent(
    new CustomEvent<NectarAuthSyncMessage>(NECTAR_AUTH_SYNC_EVENT, {
      detail: message,
    })
  );
}

export async function syncExtensionAuth(
  supabase: SupabaseClient,
  subscriptionTier?: string | null
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    broadcastNectarAuthSync({ session: null, subscription_tier: null });
    return;
  }

  let tier = subscriptionTier ?? null;

  if (!tier) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", session.user.id)
      .maybeSingle();

    tier = profile?.subscription_tier ?? "free";
  }

  broadcastNectarAuthSync({
    session,
    subscription_tier: tier,
  });
}
