import { useChatStore } from "../store/chatStore";

export function useChat() {
  const sessions = useChatStore((state) => state.sessions);
  const activeSession = useChatStore((state) => state.activeSession);
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const isStreaming = useChatStore((state) => state.isStreaming);
  
  const fetchSessions = useChatStore((state) => state.fetchSessions);
  const createSession = useChatStore((state) => state.createSession);
  const loadSession = useChatStore((state) => state.loadSession);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const deleteSession = useChatStore((state) => state.deleteSession);
  const clearMessages = useChatStore((state) => state.clearMessages);

  return {
    sessions,
    activeSession,
    messages,
    isLoading,
    isStreaming,
    fetchSessions,
    createSession,
    loadSession,
    sendMessage,
    deleteSession,
    clearMessages
  };
}
