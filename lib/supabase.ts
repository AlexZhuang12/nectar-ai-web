import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./supabase/config";
import type { FeedbackCategory, KnowledgeRecord, Locale } from "./types";

export function createSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }
  return createClient(config.url, config.anonKey);
}

export async function saveKnowledgeRecord(
  record: Omit<KnowledgeRecord, "id" | "created_at">
): Promise<KnowledgeRecord | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("knowledge_history")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Failed to save knowledge record:", error.message);
    return null;
  }

  return data as KnowledgeRecord;
}

export async function fetchKnowledgeHistory(
  limit = 20
): Promise<KnowledgeRecord[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("knowledge_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch knowledge history:", error.message);
    return [];
  }

  return (data ?? []) as KnowledgeRecord[];
}

export async function getCreditBalance(): Promise<number> {
  const supabase = createSupabaseClient();
  if (!supabase) return 100;

  const { data, error } = await supabase
    .from("user_credits")
    .select("balance")
    .limit(1)
    .single();

  if (error || !data) return 100;
  return data.balance as number;
}

export async function deductCredits(amount: number): Promise<boolean> {
  const supabase = createSupabaseClient();
  if (!supabase) return true;

  const { data: current } = await supabase
    .from("user_credits")
    .select("balance")
    .limit(1)
    .single();

  const balance = (current?.balance as number) ?? 100;
  if (balance < amount) return false;

  const { error } = await supabase
    .from("user_credits")
    .update({ balance: balance - amount })
    .eq("id", 1);

  return !error;
}

export interface FeedbackRecord {
  id: string;
  category: FeedbackCategory;
  message: string;
  ui_locale: Locale;
  created_at: string;
}

export async function saveFeedback(input: {
  category: FeedbackCategory;
  message: string;
  uiLocale: Locale;
}): Promise<FeedbackRecord | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_feedback")
    .insert({
      category: input.category,
      message: input.message,
      ui_locale: input.uiLocale,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save feedback:", error.message);
    return null;
  }

  return data as FeedbackRecord;
}
