import { createClient } from "@/lib/supabase/server";
import { syncCheckoutSessionForUser } from "@/lib/subscription";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionId: string | undefined;
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = body.sessionId?.trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );
  }

  try {
    await syncCheckoutSessionForUser(sessionId, user.id);
    return NextResponse.json({ ok: true, subscription_tier: "pro" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[subscription sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
