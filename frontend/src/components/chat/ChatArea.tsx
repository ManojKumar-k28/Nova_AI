import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useChat } from "../../hooks/useChat";
import { Sparkles, ChevronDown } from "lucide-react";

export default function ChatArea() {
  const { messages, isStreaming, sendMessage } = useChat();
  const feedEndRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto scroll logic on new streaming content / messages
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleScroll = () => {
    const container = feedContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 300);
  };

  useEffect(() => {
    const container = feedContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

      {/* Floating scroll to bottom button */}
      {showScrollButton && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-6 right-6 p-3 rounded-full bg-[#0f172a]/80 hover:bg-[#1e293b]/90 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center z-50"
          title="Scroll to bottom"
        >
          <ChevronDown className="w-5 h-5 animate-pulse" />
        </button>
      )}
    </div>
  );
}
