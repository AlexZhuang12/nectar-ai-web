import type { Locale } from "./types";

/** Full language names used in AI prompts — independent of UI locale */
export const AI_LANGUAGE_NAMES: Record<Locale, string> = {
  "zh-TW": "Traditional Chinese (繁體中文, zh-TW)",
  "en-US": "English (en-US)",
  "ja-JP": "Japanese (日本語, ja-JP)",
  "es-ES": "Spanish (Español, es-ES)",
};

export function buildAiLanguageInstruction(aiResponseLanguage: Locale): string {
  const lang = AI_LANGUAGE_NAMES[aiResponseLanguage];
  return [
    "CRITICAL LANGUAGE REQUIREMENT:",
    `You MUST write ALL output fields EXCLUSIVELY in ${lang}.`,
    "Do NOT mix languages. Do NOT follow the input text language.",
    `Every summary, key point, action item, label, and value must be in ${lang} only.`,
  ].join(" ");
}
