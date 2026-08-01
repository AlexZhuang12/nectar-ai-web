import { submitFeedback } from "@/app/actions/feedback";
import type { FeedbackCategory, Locale } from "@/lib/types";
import { NextResponse } from "next/server";

const VALID_CATEGORIES: FeedbackCategory[] = ["bug", "feature", "other"];
const VALID_LOCALES: Locale[] = ["zh-TW", "en-US", "ja-JP", "es-ES"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = body.category as FeedbackCategory;
    const message = typeof body.message === "string" ? body.message : "";
    const uiLocale = (body.uiLocale ?? body.ui_locale ?? "en-US") as Locale;

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      );
    }

    if (!VALID_LOCALES.includes(uiLocale)) {
      return NextResponse.json(
        { success: false, error: "Invalid locale" },
        { status: 400 }
      );
    }

    const result = await submitFeedback({ category, message, uiLocale });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
