"use server";

import { saveFeedback } from "@/lib/supabase";
import type { FeedbackRequest, FeedbackResult } from "@/lib/types";

export async function submitFeedback(
  request: FeedbackRequest
): Promise<FeedbackResult> {
  const { category, message, uiLocale } = request;

  if (!message.trim()) {
    return { success: false, error: "Message is required" };
  }

  if (message.trim().length > 2000) {
    return { success: false, error: "Message too long" };
  }

  const record = await saveFeedback({
    category,
    message: message.trim(),
    uiLocale,
  });

  if (!record) {
    // Supabase not configured — log locally and still succeed for demo
    console.info("[Feedback]", { category, message: message.trim(), uiLocale });
    return { success: true };
  }

  return { success: true };
}
