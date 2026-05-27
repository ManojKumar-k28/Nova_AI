export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): void;
}

export interface Source {
  filename: string;
  content: string;
  score: number;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  used_rag?: boolean;
  sources?: Source[];
  timestamp: string;
}

export interface Session {
  id: string;
  user_id: string;
  title: string;
  model: string;
  created_at: string;
  message_count?: number;
}

export interface ChatState {
  sessions: Session[];
  activeSession: Session | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  fetchSessions(): Promise<void>;
  createSession(title?: string, model?: string): Promise<Session>;
  loadSession(sessionId: string): Promise<void>;
  sendMessage(message: string, model?: string): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  clearMessages(): void;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  chunk_count: number;
  uploaded_at: string;
}
