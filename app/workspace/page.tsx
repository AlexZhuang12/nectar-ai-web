import ChatPanel from "@/app/workspace/ChatPanel";
import MemberNav from "@/components/MemberNav";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { buildInitialChatMessages } from "@/lib/chat-messages";
import { createClient } from "@/lib/supabase/server";
import type { ChatDisplayMessage } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

export default async function WorkspacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?redirect=/workspace");
  }

  const { data: historyRows } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const history: ChatDisplayMessage[] = (historyRows ?? []).map((row) => ({
    id: row.id,
    role: row.role as ChatDisplayMessage["role"],
    content: row.content,
  }));

  const initialMessages = buildInitialChatMessages(history);
  return (
    <main className="min-h-screen bg-gradient-to-b from-nectar-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nectar-400 to-nectar-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">AI Workspace</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email ?? "Member"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MemberNav current="workspace" />
            <UserAvatarMenu />
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Member Identity
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">User ID</dt>
              <dd className="break-all font-mono text-xs text-gray-900 dark:text-white">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">Authenticated</dd>
            </div>
          </dl>
        </div>

        <ChatPanel
          userId={user.id}
          userEmail={user.email ?? "Member"}
          initialMessages={initialMessages}
        />
      </section>
    </main>
  );
}
