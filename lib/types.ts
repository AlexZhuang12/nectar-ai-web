export type Locale = "zh-TW" | "en-US" | "ja-JP" | "es-ES";

export type ExtractionMode = "key-info" | "dual-alignment" | "both";

export type FeedbackCategory = "bug" | "feature" | "other";

export interface ExtractRequest {
  input: string;
  /** AI output language — independent from UI locale */
  aiResponseLanguage: Locale;
  mode: ExtractionMode;
}

export interface FeedbackRequest {
  category: FeedbackCategory;
  message: string;
  uiLocale: Locale;
}

export interface FeedbackResult {
  success: boolean;
  error?: string;
}

export interface KeyInfoItem {
  label: string;
  value: string;
}

export interface AlignmentPair {
  source: string;
  target: string;
}

export interface ExtractResult {
  success: boolean;
  keyInfo?: KeyInfoItem[];
  alignment?: AlignmentPair[];
  summary?: string;
  error?: string;
  creditsUsed?: number;
}

export interface KnowledgeRecord {
  id: string;
  user_id?: string;
  input_text: string;
  input_type: "text" | "url";
  target_language: Locale; // stores aiResponseLanguage
  extraction_mode: ExtractionMode;
  key_info: KeyInfoItem[] | null;
  alignment: AlignmentPair[] | null;
  summary: string | null;
  created_at: string;
}

export interface UserCredits {
  balance: number;
  isPro: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  subscription_tier?: string | null;
  updated_at: string | null;
}

export type ChatMessageRole = "user" | "assistant";

export interface ChatMessageRow {
  id: string;
  user_id: string;
  role: ChatMessageRole;
  content: string;
  created_at: string;
}

export interface ChatDisplayMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
}
