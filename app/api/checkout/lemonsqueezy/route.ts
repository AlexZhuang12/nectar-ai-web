import { getRequestOrigin } from "@/lib/app-origin";
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to upgrade." },
      { status: 401 }
    );
  }

  try {
    const origin = getRequestOrigin(request);
    const url = await createLemonSqueezyCheckout({
      userId: user.id,
      email: user.email ?? undefined,
      redirectUrl: `${origin}/dashboard?checkout=success`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[lemonsqueezy checkout] error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
