"use server";

import {
  fetchKnowledgeHistory,
  getCreditBalance,
  saveKnowledgeRecord,
} from "@/lib/supabase";
import { AI_LANGUAGE_NAMES, buildAiLanguageInstruction } from "@/lib/languages";
import type {
  AlignmentPair,
  ExtractRequest,
  ExtractResult,
  KeyInfoItem,
  KnowledgeRecord,
  Locale,
} from "@/lib/types";

export interface ExtractionRequest {
  userId?: string;
  sourceContent?: string;
  targetLanguage?: string;
  aiResponseLanguage?: string;
  extractionMode?: string;
  mode?: string;
  [key: string]: unknown;
}

export interface ExtractionResponse {
  success: boolean;
  data?: {
    summary: string;
    keyPoints: string[];
    key_points?: string[];
    actionItems: string[];
    action_items?: string[];
    reusablePrompt: string;
    reusable_prompt?: string;
    topic?: string;
    language?: string;
    word_count?: number;
    original_text?: string;
    scraped_text_preview?: string;
    alignment?: AlignmentPair[];
  };
  remainingCredits?: number;
  error?: string;
}

async function scrapeUrlContent(
  url: string
): Promise<{ title: string; content: string }> {
  try {
    const cleanUrl = url.trim();
    const jinaEndpoint = `https://r.jina.ai/${cleanUrl}`;

    const response = await fetch(jinaEndpoint, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        "User-Agent": "NectarAI-Web-Extractor/1.0",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      throw new Error(`Scraper HTTP error: ${response.status}`);
    }

    const rawMarkdown = await response.text();
    const titleMatch = rawMarkdown.match(/Title:\s*(.+)/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : cleanUrl;

    const cleanedContent = rawMarkdown
      .replace(/URL Source:.*/g, "")
      .replace(/Markdown Content:.*/g, "")
      .trim();

    return {
      title: pageTitle,
      content: cleanedContent.length > 50 ? cleanedContent : rawMarkdown,
    };
  } catch (err) {
    console.warn("URL Fetch Fallback:", err);
    return {
      title: url,
      content: `Unable to scrape protected page. URL context: ${url}`,
    };
  }
}

async function callLLMExtractor(
  textContent: string,
  aiResponseLanguage: Locale,
  mode: string
) {
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.DEEPSEEK_API_KEY;

  if (!apiKey) return null;

  const langInstruction = buildAiLanguageInstruction(aiResponseLanguage);
  const langName = AI_LANGUAGE_NAMES[aiResponseLanguage];

  let outputSchema = "";
  if (mode === "key-info" || mode === "key-info-only") {
    outputSchema = `{
  "summary": "1-2 sentence core summary (${langName})",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "actionItems": ["actionable step 1", "actionable step 2"],
  "reusablePrompt": "reusable prompt template (${langName})"
}`;
  } else if (mode === "dual-alignment") {
    outputSchema = `{
  "summary": "1-2 sentence core summary (${langName})",
  "keyPoints": ["key point 1", "key point 2"],
  "alignment": [{"source": "original phrase", "target": "translated phrase in ${langName}"}],
  "actionItems": ["actionable step 1"],
  "reusablePrompt": "reusable prompt template (${langName})"
}`;
  } else {
    outputSchema = `{
  "summary": "1-2 sentence core summary (${langName})",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "alignment": [{"source": "original phrase", "target": "translated phrase in ${langName}"}],
  "actionItems": ["actionable step 1", "actionable step 2"],
  "reusablePrompt": "reusable prompt template (${langName})"
}`;
  }

  const prompt = `You are a senior international product architect and bilingual content alignment expert.

${langInstruction}

Target AI response language: ${langName}

Input content:
"""
${textContent.substring(0, 4000)}
"""

Output strict JSON only:
${outputSchema}`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nectar AI Global Web Workspace",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    const data = await res.json();
    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText) return null;
    return JSON.parse(resultText);
  } catch (e) {
    console.error("LLM API Call Error:", e);
    return null;
  }
}

function normalizeMode(mode: string): string {
  if (mode === "key-info") return "key-info";
  if (mode === "dual-alignment") return "dual-alignment";
  if (mode === "both") return "both";
  if (mode === "all") return "both";
  return "both";
}

export async function runNectarExtractor(
  ...args: unknown[]
): Promise<ExtractionResponse> {
  try {
    let rawInput = "";
    let aiResponseLanguage: Locale = "zh-TW";
    let extractionMode = "both";

    if (args.length > 0) {
      const firstArg = args[0];
      if (typeof firstArg === "string") {
        rawInput = firstArg;
        if (typeof args[1] === "string")
          aiResponseLanguage = args[1] as Locale;
        if (typeof args[2] === "string") extractionMode = args[2] as string;
      } else if (firstArg && typeof firstArg === "object") {
        const req = firstArg as ExtractionRequest;
        rawInput =
          req.sourceContent ||
          (req.content as string) ||
          (req.url as string) ||
          (req.source as string) ||
          "";
        aiResponseLanguage = (req.aiResponseLanguage ||
          req.targetLanguage ||
          req.lang ||
          req.language ||
          "zh-TW") as Locale;
        extractionMode = (req.extractionMode ||
          req.mode ||
          "both") as string;
      }
    }

    extractionMode = normalizeMode(extractionMode);

    if (!rawInput.trim()) {
      return { success: false, error: "Input is required" };
    }

    const isUrl = /^https?:\/\//i.test(rawInput.trim());
    let pageTitle = rawInput;
    let actualContent = rawInput;

    if (isUrl) {
      const scraped = await scrapeUrlContent(rawInput.trim());
      pageTitle = scraped.title;
      actualContent = scraped.content;
    }

    const aiResult = await callLLMExtractor(
      actualContent,
      aiResponseLanguage,
      extractionMode
    );

    let finalSummary = "";
    let finalKeyPoints: string[] = [];
    let finalActionItems: string[] = [];
    let finalPrompt = "";
    let finalAlignment: AlignmentPair[] = [];

    const langName = AI_LANGUAGE_NAMES[aiResponseLanguage];

    if (aiResult?.summary) {
      finalSummary = aiResult.summary;
      finalKeyPoints = aiResult.keyPoints || aiResult.key_points || [];
      finalActionItems = aiResult.actionItems || aiResult.action_items || [];
      finalPrompt =
        aiResult.reusablePrompt || aiResult.reusable_prompt || "";
      finalAlignment = aiResult.alignment || [];
    } else {
      const cleanSnippet = actualContent
        .replace(/[#*`\n\r]/g, " ")
        .substring(0, 180);

      finalSummary = `[Nectar Engine] Parsed "${pageTitle.substring(0, 30)}..." — output in ${langName}.`;
      finalKeyPoints = [
        `Core extract: ${cleanSnippet.substring(0, 60)}...`,
        `Source size: ~${actualContent.length} characters processed.`,
        `Language: ${langName}`,
      ];
      finalActionItems = [
        "Copy structured summary to clipboard.",
        "Save to knowledge base.",
      ];
      finalPrompt = `Convert the following into structured ${langName} summary:\n${cleanSnippet.substring(0, 80)}...`;

      if (extractionMode !== "key-info") {
        finalAlignment = [
          {
            source: cleanSnippet.substring(0, 80),
            target: `[${aiResponseLanguage}] ${cleanSnippet.substring(0, 80)}`,
          },
        ];
      }
    }

    const responseData = {
      summary: finalSummary,
      keyPoints: finalKeyPoints,
      key_points: finalKeyPoints,
      actionItems: finalActionItems,
      action_items: finalActionItems,
      reusablePrompt: finalPrompt,
      reusable_prompt: finalPrompt,
      alignment: finalAlignment,
      topic: pageTitle,
      language: aiResponseLanguage,
      word_count: actualContent.length,
      original_text: rawInput,
      scraped_text_preview: actualContent.substring(0, 200),
    };

    const remainingCredits = Math.max(0, (await getCreditBalance()) - 1);

    await saveKnowledgeRecord({
      input_text: rawInput.trim(),
      input_type: isUrl ? "url" : "text",
      target_language: aiResponseLanguage,
      extraction_mode: extractionMode as ExtractRequest["mode"],
      key_info: finalKeyPoints.map((pt, i) => ({
        label: `Point ${i + 1}`,
        value: pt,
      })),
      alignment: finalAlignment.length > 0 ? finalAlignment : null,
      summary: finalSummary,
    });

    return {
      success: true,
      data: responseData,
      remainingCredits,
    };
  } catch (err) {
    console.error("Nectar Complete Engine Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Extraction failed",
    };
  }
}

function mapToExtractResult(res: ExtractionResponse): ExtractResult {
  if (!res.success || !res.data) {
    return { success: false, error: res.error ?? "Extraction failed" };
  }

  const data = res.data;
  const keyInfo: KeyInfoItem[] = (data.keyPoints ?? []).map((pt, i) => ({
    label: `Point ${i + 1}`,
    value: pt,
  }));

  if (data.reusablePrompt) {
    keyInfo.push({ label: "Prompt", value: data.reusablePrompt });
  }

  const alignment: AlignmentPair[] = data.alignment ?? [];

  if (alignment.length === 0 && (data.actionItems?.length ?? 0) > 0) {
    data.actionItems.forEach((item) => {
      alignment.push({ source: "Action", target: item });
    });
  }

  return {
    success: true,
    summary: data.summary,
    keyInfo: keyInfo.length > 0 ? keyInfo : undefined,
    alignment: alignment.length > 0 ? alignment : undefined,
    creditsUsed: 1,
  };
}

/** Bridge for component-based ExtractorPanel */
export async function extractInformation(
  request: ExtractRequest
): Promise<ExtractResult> {
  const res = await runNectarExtractor({
    sourceContent: request.input,
    aiResponseLanguage: request.aiResponseLanguage,
    extractionMode: request.mode,
  });
  return mapToExtractResult(res);
}

export async function getCredits(
  _userId: string = "demo-user"
): Promise<number> {
  return getCreditBalance();
}

export async function getKnowledgeHistory(
  _userId: string = "demo-user"
): Promise<KnowledgeRecord[]> {
  return fetchKnowledgeHistory();
}

/** Alias used by KnowledgeHistory component */
export async function getHistory(): Promise<KnowledgeRecord[]> {
  return fetchKnowledgeHistory();
}
