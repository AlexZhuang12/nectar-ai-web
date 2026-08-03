import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

function getStripeCustomerId(
  customer: Stripe.Checkout.Session["customer"]
): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

export async function resolveUserIdFromCheckoutSession(
  session: Pick<
    Stripe.Checkout.Session,
    "client_reference_id" | "metadata" | "customer_email"
  >
): Promise<string | null> {
  const metadata = session.metadata ?? {};
  const userId =
    session.client_reference_id ||
    metadata.userId ||
    metadata.user_id ||
    null;

  if (userId) return userId;

  const email = session.customer_email;
  if (!email) return null;

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

export async function upgradeProfileToPro(params: {
  userId: string;
  stripeCustomerId?: string | null;
}): Promise<void> {
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  const payload = {
    subscription_tier: "pro",
    stripe_customer_id: params.stripeCustomerId ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("profiles")
    .update(payload)
    .eq("id", params.userId)
    .select("id");

  if (updateError) {
    throw updateError;
  }

  if (!updated?.length) {
    const { error: insertError } = await supabaseAdmin.from("profiles").insert({
      id: params.userId,
      ...payload,
    });

    if (insertError) {
      throw insertError;
    }
  }
}

export async function processCompletedCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<string> {
  const userId = await resolveUserIdFromCheckoutSession(session);

  if (!userId) {
    throw new Error(
      "Could not resolve user id from checkout session (client_reference_id, metadata.userId, or customer_email)"
    );
  }

  await upgradeProfileToPro({
    userId,
    stripeCustomerId: getStripeCustomerId(session.customer),
  });

  return userId;
}

export async function syncCheckoutSessionForUser(
  sessionId: string,
  expectedUserId: string
): Promise<void> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Checkout session is not paid yet");
  }

  const userId = await resolveUserIdFromCheckoutSession(session);

  if (!userId) {
    throw new Error("Could not resolve user from checkout session");
  }

  if (userId !== expectedUserId) {
    throw new Error("Checkout session does not belong to the current user");
  }

  await upgradeProfileToPro({
    userId,
    stripeCustomerId: getStripeCustomerId(session.customer),
  });
}
