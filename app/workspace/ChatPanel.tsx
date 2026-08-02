"use client";

import { createClient } from "@/lib/supabase/client";
import type { ChatDisplayMessage } from "@/lib/types";
import { Bot, Loader2, Send, User } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

interface ChatPanelProps {
  userId: string;
  userEmail: string;
  initialMessages: ChatDisplayMessage[];
}

export default function ChatPanel({
  userId,
  userEmail,
  initialMessages,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatDisplayMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    const { data: insertedUserMsg, error: insertError } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        role: "user",
        content: trimmed,
      })
      .select("id, role, content")
      .single();

    if (insertError || !insertedUserMsg) {
      setError(insertError?.message ?? "Failed to save your message.");
      setLoading(false);
      return;
    }

    const userMessage: ChatDisplayMessage = {
      id: insertedUserMsg.id,
      role: "user",
      content: insertedUserMsg.content,
    };

    setMessages((prev) => [
      ...prev.filter((m) => m.id !== "welcome"),
      userMessage,
    ]);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        openRouterResponse?: string;
        status?: number;
      };

      if (res.status === 401) {
        setError("Session expired. Please sign in again.");
        return;
      }

      if (!res.ok) {
        const detail = data.openRouterResponse
          ? `${data.error ?? "Request failed"} (HTTP ${data.status ?? res.status})\n${data.openRouterResponse}`
          : (data.error ?? "Request failed");
        setError(detail);
        if (data.error) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-error-${Date.now()}`,
              role: "assistant",
              content: detail,
            },
          ]);
        }
        return;
      }

      if (!data.reply) {
        setError("Empty response from AI");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply!,
        },
      ]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  return (
    <div className="card flex min-h-[32rem] flex-col">
      <div className="mb-4 border-b border-gray-100 pb-4 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Chat</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Signed in as{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">{userEmail}</span>
        </p>
      </div>

      <div
        ref={listRef}
        className="mb-4 flex-1 space-y-4 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-nectar-100 text-nectar-700 dark:bg-nectar-950 dark:text-nectar-300">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-nectar-500 text-white"
                  : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Nectar AI is thinking…
          </div>
        )}
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Nectar AI something…"
          className="input-field flex-1"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
