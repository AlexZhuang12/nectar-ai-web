import {
  resolveUserIdFromLemonSqueezyWebhook,
  upgradeProfileToPro,
} from "@/lib/subscription";
import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface LemonSqueezyWebhookPayload {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, string | number | null | undefined>;
  };
  data?: {
    type?: string;
    attributes?: {
      user_email?: string;
      status?: string;
    };
  };
}

function verifyLemonSqueezySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("[lemonsqueezy webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing X-Signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  if (!verifyLemonSqueezySignature(rawBody, signature, webhookSecret)) {
    console.error("[lemonsqueezy webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: LemonSqueezyWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventName =
    payload.meta?.event_name ?? request.headers.get("x-event-name") ?? "";

  if (eventName !== "order_created" && eventName !== "subscription_created") {
    return NextResponse.json({ received: true, ignored: eventName });
  }

  const status = payload.data?.attributes?.status?.toLowerCase();
  if (eventName === "order_created" && status && status !== "paid") {
    return NextResponse.json({ received: true, ignored: "order not paid" });
  }

  if (
    eventName === "subscription_created" &&
    status &&
    !["active", "on_trial", "paused"].includes(status)
  ) {
    return NextResponse.json({ received: true, ignored: "subscription inactive" });
  }

  try {
    const userId = await resolveUserIdFromLemonSqueezyWebhook({
      customData: payload.meta?.custom_data,
      email: payload.data?.attributes?.user_email,
    });

    await upgradeProfileToPro(userId);
    console.info("[lemonsqueezy webhook] User upgraded to pro:", userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Profile update failed";
    console.error("[lemonsqueezy webhook] Failed to upgrade profile:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
