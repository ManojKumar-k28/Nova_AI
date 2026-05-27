import { create } from "zustand";
import { ChatState, Message } from "../types";
import { chatAPI, streamChat } from "../services/api";

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSession: null,
  messages: [],
  isLoading: false,
  isStreaming: false,

  fetchSessions: async () => {
    try {
      // calls chatAPI.getSessions
      const sessions = await chatAPI.getSessions();
      // sets sessions state
      set({ sessions });
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  },

  createSession: async (title = "New Conversation", model = "llama-3.3-70b") => {
    try {
      // calls chatAPI.createSession
      const newSession = await chatAPI.createSession(title, model);
      
      // adds to sessions, sets as activeSession
      set((state) => ({
        sessions: [newSession, ...state.sessions],
        activeSession: newSession,
        // clears messages
        messages: []
      }));
      
      // returns new session
      return newSession;
    } catch (err) {
      console.error("Failed to create session:", err);
      throw err;
    }
  },

  loadSession: async (sessionId: string) => {
    // sets isLoading true
    set({ isLoading: true });
    try {
      // calls chatAPI.getMessages(sessionId)
      const messages = await chatAPI.getMessages(sessionId);
      
      // finds session in sessions list
      const session = get().sessions.find((s) => s.id === sessionId) || null;
      
      // sets activeSession and messages
      set({
        activeSession: session,
        messages,
        isLoading: false
      });
    } catch (err) {
      console.error("Failed to load session:", err);
      set({ isLoading: false });
    }
  },

  sendMessage: async (message: string, model?: string) => {
    // gets activeSession
    const { activeSession } = get();
    if (!activeSession) return;

    const userTempId = `user_${Date.now()}`;
    const assistantTempId = `assistant_${Date.now()}`;
    const nowStr = new Date().toISOString();

    // creates optimistic user message and adds to messages
    const optimisticUser: Message = {
      id: userTempId,
      session_id: activeSession.id,
      role: "user",
      content: message,
      timestamp: nowStr
    };

    // creates empty assistant message and adds to messages
    const optimisticAssistant: Message = {
      id: assistantTempId,
      session_id: activeSession.id,
      role: "assistant",
      content: "",
      timestamp: nowStr
    };

    set((state) => ({
      messages: [...state.messages, optimisticUser, optimisticAssistant],
      // sets isStreaming true
      isStreaming: true
    }));

    try {
      const activeModel = model || activeSession.model || "llama-3.3-70b";
      
      // calls streamChat with activeSession id
      await streamChat(
        activeSession.id,
        message,
        activeModel,
        // on each chunk: appends to assistant message content
        (chunk) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === assistantTempId
                ? { ...m, content: m.content + chunk }
                : m
            )
          }));
        },
        // on done: sets isStreaming false, refreshes sessions and loads messages to fetch sources
        async () => {
          set({ isStreaming: false });
          await get().fetchSessions();
          // Reload conversation from database to get precise sources and database IDs
          await get().loadSession(activeSession.id);
        }
      );
    } catch (err) {
      console.error("Failed to stream message:", err);
      // on error: sets error message in assistant bubble
      set((state) => ({
        isStreaming: false,
        messages: state.messages.map((m) =>
          m.id === assistantTempId
            ? { ...m, content: "Error: Failed to get a response. Please check your API configuration." }
            : m
        )
      }));
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      // calls chatAPI.deleteSession
      await chatAPI.deleteSession(sessionId);
      
      // removes from sessions list
      set((state) => {
        const updatedSessions = state.sessions.filter((s) => s.id !== sessionId);
        const isActive = state.activeSession?.id === sessionId;
        return {
          sessions: updatedSessions,
          // if was active: clears activeSession and messages
          activeSession: isActive ? null : state.activeSession,
          messages: isActive ? [] : state.messages
        };
      });
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  },

  clearMessages: () => {
    // resets messages and activeSession to null
    set({
      messages: [],
      activeSession: null
    });
  }
}));
