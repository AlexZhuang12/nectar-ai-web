import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

async function setUserProTier(userId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    console.error(
      "[stripe webhook] SUPABASE_SERVICE_ROLE_KEY missing — cannot update profile"
    );
    return false;
  }

  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      subscription_tier: "pro",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[stripe webhook] Failed to update profile:", error.message);
    return false;
  }

  console.info("[stripe webhook] User upgraded to pro:", userId);
  return true;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe webhook] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId =
      session.metadata?.user_id ?? session.client_reference_id;

    if (!userId) {
      console.error("[stripe webhook] checkout.session.completed missing user_id");
      return NextResponse.json({ received: true, warning: "no user_id" });
    }

    await setUserProTier(userId);
  }

  return NextResponse.json({ received: true });
}
