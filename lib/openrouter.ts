import { createOpenAI } from "@ai-sdk/openai";

const PLACEHOLDER_KEYS = new Set([
  "your-openrouter-api-key-here",
  "your-openrouter-api-key",
  "your-openai-api-key",
]);

export const DEFAULT_OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct";

/** Alternate fallback */
export const FALLBACK_OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct";

export function getOpenRouterApiKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key || PLACEHOLDER_KEYS.has(key) || key.startsWith("your-")) {
    return null;
  }
  return key;
}

export function getOpenRouterModel(): string {
  return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
}

export function createOpenRouterClient() {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    return null;
  }

  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Nectar AI Workspace",
    },
  });
}

export function logOpenRouterError(err: unknown, context: { model: string }) {
  console.error("[openrouter] Request failed — model:", context.model);

  if (err instanceof Error) {
    console.error("[openrouter] error.message:", err.message);

    const apiErr = err as Error & {
      statusCode?: number;
      responseBody?: string;
      data?: unknown;
      cause?: unknown;
    };

    if (apiErr.statusCode !== undefined) {
      console.error("[openrouter] statusCode:", apiErr.statusCode);
    }
    if (apiErr.responseBody) {
      console.error("[openrouter] responseBody:", apiErr.responseBody);
    }
    if (apiErr.data !== undefined) {
      console.error("[openrouter] data:", JSON.stringify(apiErr.data, null, 2));
    }
    if (apiErr.cause !== undefined) {
      console.error("[openrouter] cause:", apiErr.cause);
    }
    return;
  }

  console.error("[openrouter] unknown error:", err);
}
