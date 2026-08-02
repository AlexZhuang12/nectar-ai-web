import type { ChatDisplayMessage } from "./types";

export const CHAT_WELCOME_MESSAGE =
  "Hello! I'm Nectar AI. Ask me anything — summaries, translations, or knowledge extraction ideas.";

export function buildInitialChatMessages(
  history: ChatDisplayMessage[]
): ChatDisplayMessage[] {
  if (history.length > 0) {
    return history;
  }
  return [{ id: "welcome", role: "assistant", content: CHAT_WELCOME_MESSAGE }];
}
