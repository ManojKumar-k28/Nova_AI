import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useChat } from "../../hooks/useChat";
import { Sparkles } from "lucide-react";

export default function ChatArea() {
  const { messages, isStreaming, sendMessage } = useChat();
  const feedEndRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll logic on new streaming content / messages
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSuggestionClick = (promptText: string) => {
    sendMessage(promptText);
  };

  const suggestions = [
    {
      icon: "🎨",
      title: "Create an image",
      prompt: "generate an image of "
    },
    {
      icon: "✍️",
      title: "Write or edit",
      prompt: "Help me write or edit a professional document or script on "
    },
    {
      icon: "🔍",
      title: "Look something up",
      prompt: "Explain the core concepts and details of "
    }
  ];

  return (
    <div className="flex-1 h-full flex flex-col pt-4 pb-4 px-6 overflow-hidden relative bg-black">
      
      {/* Scrollable conversation thread container */}
      <div
        ref={feedContainerRef}
        className="flex-1 overflow-y-auto pr-1 space-y-6 scroll-smooth pb-8"
      >
        {messages.length === 0 ? (
          /* Nova AI unique centerpiece — before asking any question */
          <div className="flex-1 h-full flex flex-col items-center justify-center min-h-[70vh] relative w-full select-none">

            {/* Main Centerpiece Layout */}
            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center space-y-5">
              
              {/* Nova AI animated icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px] shadow-lg shadow-purple-500/20 mb-2 flex items-center justify-center">
                <div className="w-full h-full bg-[#080B14] rounded-[15px] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-sans select-none">
                What can I help with?
              </h2>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                Nova Intelligence — your secure, offline-capable AI companion.
              </p>

              {/* Suggestion chips */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
                {suggestions.map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(card.prompt)}
                    className="px-4 py-2.5 glass border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 text-xs font-medium text-slate-300 hover:text-white rounded-2xl transition-all duration-250 focus:outline-none cursor-pointer shadow-sm hover:shadow-cyan-500/5 hover:scale-[1.02] flex items-center gap-2"
                  >
                    <span className="text-base">{card.icon}</span>
                    {card.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation history thread when messages exist */
          <div className="max-w-3xl mx-auto space-y-6 pt-10">
            {messages
              .filter((msg) => msg.content !== "") // Filter out blank streaming messages
              .map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

            {/* Stream Thinking dot indicators */}
            {isStreaming && (messages.length === 0 || messages[messages.length - 1]?.content === "") && (
              <TypingIndicator />
            )}
          </div>
        )}

        <div ref={feedEndRef} />
      </div>
    </div>
  );
}
