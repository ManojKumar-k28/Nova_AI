import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { streamTrialChat } from "../../services/api";

interface TrialMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const MODEL_OPTIONS = [
  { value: "llama-3.3-70b", label: "Llama 3.3 70B" },
  { value: "gemma2-9b", label: "Gemma 2 9B" },
  { value: "mixtral-8x7b", label: "Mixtral 8x7B" },
  { value: "llama-3.1-8b", label: "Llama 3.1 8B · Fast" }
];

export default function TrialChat() {
  const [messages, setMessages] = useState<TrialMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm **Nova**, your AI assistant powered by Groq's blazing-fast cloud. Ask me anything — code, research, analysis, or just a chat!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionKey, setSessionKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b");
  const [trialCount, setTrialCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate or fetch trial session key
    let key = localStorage.getItem("nova_trial_key");
    if (!key) {
      key = `trial_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("nova_trial_key", key);
    }
    setSessionKey(key);

    const savedCount = localStorage.getItem("nova_trial_count");
    if (savedCount) {
      setTrialCount(parseInt(savedCount, 10));
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    if (trialCount >= 3) {
      setError("You've used all 3 trial questions. Register for free to unlock unlimited access!");
      return;
    }

    const userMessageContent = input.trim();
    setInput("");
    setError(null);

    const userMessage: TrialMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: userMessageContent
    };

    const assistantTempId = `assistant_${Date.now()}`;
    const assistantMessagePlaceholder: TrialMessage = {
      id: assistantTempId,
      role: "assistant",
      content: ""
    };

    setMessages((prev) => [...prev, userMessage, assistantMessagePlaceholder]);
    setIsStreaming(true);

    try {
      await streamTrialChat(
        userMessageContent,
        sessionKey,
        selectedModel,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantTempId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        () => {
          setIsStreaming(false);
          const nextCount = trialCount + 1;
          setTrialCount(nextCount);
          localStorage.setItem("nova_trial_count", nextCount.toString());
        }
      );
    } catch (err: any) {
      console.error(err);
      setIsStreaming(false);
      setError(err.message || "Failed to fetch response. Check your GROQ_API_KEY in backend/.env");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantTempId
            ? {
                ...msg,
                content: "Error: Could not reach Groq API. Please check the API key or try again later."
              }
            : msg
        )
      );
    }
  };

  return (
    <div className="w-full max-w-2xl lg:max-w-none mx-auto flex flex-col glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 h-[430px] sm:h-[500px] lg:h-[560px]" style={{ overflowAnchor: "none" }}>
      {/* Widget Header */}
      <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          <span className="font-semibold text-white tracking-wide">Instant Interactive Trial</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isStreaming}
            className="max-w-[160px] rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs font-semibold text-slate-300 outline-none transition-colors hover:border-white/20"
            title="Select Ollama agent"
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model.value} value={model.value} className="bg-[#0c101d]">
                {model.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            Questions: {trialCount}/3
          </span>
        </div>
      </div>

      {/* Messages Sandbox */}
      <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-xl px-4 py-3 text-sm leading-relaxed break-words overflow-hidden min-w-0 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-900/20"
                    : "glass text-slate-200 rounded-tl-none border border-white/5"
                }`}
              >
                {msg.content ? (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                ) : (
                  <div className="flex items-center gap-1 py-1 px-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Error / Limit Warning Banner */}
      {error && (
        <div className="mx-6 my-2 px-4 py-3 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Input or Signup prompt */}
      <div className="p-4 bg-white/5 border-t border-white/5">
        {trialCount >= 3 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-4 text-center space-y-3"
          >
            <p className="text-sm text-slate-300 font-medium">
              You've unlocked the full potential of local model pipelines!
            </p>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Register a Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
              placeholder={
                isStreaming
                  ? "Streaming response..."
                  : "Ask a trial question (e.g. Write a quick sort function)..."
              }
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 disabled:text-slate-500 text-white rounded-xl transition-all duration-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
