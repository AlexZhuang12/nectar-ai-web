import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct";

type ChatRole = "user" | "assistant" | "system";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

function getApiKey(): string {
  return process.env.OPENROUTER_API_KEY?.trim() ?? "";
}

function getModel(): string {
  return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
}

function parseOpenRouterError(raw: string): string {
  try {
    const json = JSON.parse(raw) as {
      error?: { message?: string; code?: string | number };
      message?: string;
    };
    const parts = [
      json.error?.message,
      json.error?.code !== undefined ? `code=${json.error.code}` : null,
      json.message,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" | ") : raw;
  } catch {
    return raw || "Unknown OpenRouter error";
  }
}

async function persistAssistantMessage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  content: string
) {
  const { error } = await supabase.from("messages").insert({
    user_id: userId,
    role: "assistant",
    content,
  });
  if (error) {
    console.error("[chat] Failed to persist assistant message:", error.message);
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = getApiKey();
  console.info(
    "[chat] OPENROUTER_API_KEY prefix:",
    apiKey ? apiKey.slice(0, 10) : "(empty — not loaded)"
  );

  if (!apiKey) {
    const errorText =
      "OPENROUTER_API_KEY is missing. Check .env.local and restart dev server.";
    await persistAssistantMessage(supabase, user.id, errorText);
    return NextResponse.json({ error: errorText }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as { message?: string };
  const userText =
    typeof payload.message === "string" ? payload.message.trim() : "";

  if (!userText) {
    return NextResponse.json(
      { error: "A non-empty user message is required" },
      { status: 400 }
    );
  }

  const { data: historyRows, error: historyError } = await supabase
    .from("messages")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(20);

  if (historyError) {
    console.error("[chat] History read error:", historyError.message);
    return NextResponse.json(
      { error: "Failed to load chat history" },
      { status: 500 }
    );
  }

  const llmMessages: ChatMessage[] = (historyRows ?? []).map((row) => ({
    role: row.role as ChatRole,
    content: row.content,
  }));

  const modelId = getModel();
  console.info("[chat] OpenRouter model:", modelId);
  console.info("[chat] OpenRouter endpoint:", OPENROUTER_URL);

  const requestMessages = [
    {
      role: "system" as const,
      content:
        "You are Nectar AI, a helpful bilingual knowledge assistant. Be concise, accurate, and friendly.",
    },
    ...llmMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nectar AI",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: requestMessages,
        temperature: 0.7,
      }),
    });

    const responseText = await res.text();

    if (res.status !== 200) {
      console.error("[chat] OpenRouter Status Code:", res.status);
      console.error("[chat] OpenRouter Status Text:", res.statusText);
      console.error("[chat] OpenRouter Response Body:", responseText);

      const errorDetail = parseOpenRouterError(responseText);
      await persistAssistantMessage(supabase, user.id, errorDetail);

      return NextResponse.json(
        {
          error: errorDetail,
          status: res.status,
          statusText: res.statusText,
          openRouterResponse: responseText,
          model: modelId,
        },
        { status: 502 }
      );
    }

    let data: {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("[chat] Failed to parse OpenRouter JSON:", parseErr);
      console.error("[chat] Raw body:", responseText);
      const errorDetail = `OpenRouter returned non-JSON response: ${responseText.slice(0, 500)}`;
      await persistAssistantMessage(supabase, user.id, errorDetail);
      return NextResponse.json({ error: errorDetail }, { status: 502 });
    }

    if (data.error?.message) {
      console.error("[chat] OpenRouter error in 200 body:", data.error.message);
      await persistAssistantMessage(supabase, user.id, data.error.message);
      return NextResponse.json(
        {
          error: data.error.message,
          openRouterResponse: responseText,
          model: modelId,
        },
        { status: 502 }
      );
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      const errorDetail = `OpenRouter returned empty content. Raw: ${responseText.slice(0, 500)}`;
      console.error("[chat]", errorDetail);
      await persistAssistantMessage(supabase, user.id, errorDetail);
      return NextResponse.json(
        { error: errorDetail, openRouterResponse: responseText },
        { status: 502 }
      );
    }

    const { error: insertError } = await supabase.from("messages").insert({
      user_id: user.id,
      role: "assistant",
      content: reply,
    });

    if (insertError) {
      console.error("[chat] Assistant insert error:", insertError.message);
      return NextResponse.json(
        { error: `Failed to save AI response: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply,
      userId: user.id,
      model: modelId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[chat] fetch exception — error.message:", message);
    if (err instanceof Error && err.cause) {
      console.error("[chat] fetch exception — cause:", err.cause);
    }

    await persistAssistantMessage(supabase, user.id, message);
    return NextResponse.json(
      { error: message, type: "fetch_exception" },
      { status: 502 }
    );
  }
}
